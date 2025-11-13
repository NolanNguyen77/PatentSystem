import prisma from '../config/database';
import { parseExcel, parseCSV, mapColumns, ColumnMapping, exportToExcel, exportToCSV } from '../utils/excel';
import { generateClassifications } from '../utils/classification';
import { AppError } from '../middleware/error.middleware';

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  message: string;
}

export const importCSV = async (
  fileBuffer: Buffer,
  titleId: string,
  mapping: ColumnMapping,
  filename: string
): Promise<ImportResult> => {
  const errors: Array<{ row: number; error: string }> = [];
  let imported = 0;
  let failed = 0;

  // Parse file
  let rows: any[];
  try {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      rows = await parseExcel(fileBuffer);
    } else {
      rows = await parseCSV(fileBuffer);
    }
  } catch (error) {
    throw new AppError('Failed to parse file', 400);
  }

  // Verify title exists
  const title = await prisma.title.findUnique({
    where: { id: titleId },
  });

  if (!title) {
    throw new AppError('Title not found', 404);
  }

  // Process rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because row 1 is header

    try {
      const mappedData = mapColumns(row, mapping);

      // Validate required fields
      if (!mappedData.bunken && !mappedData.patentNo) {
        errors.push({ row: rowNumber, error: 'Missing required field: 文献番号 or 出願番号' });
        failed++;
        continue;
      }

      // Parse dates
      let applicationDate: Date | null = null;
      let publicationDate: Date | null = null;
      let knownDate: Date | null = null;

      if (mappedData.shutsuganDate) {
        applicationDate = parseDate(mappedData.shutsuganDate);
      }
      if (mappedData.publicationDate || mappedData.kochiDate) {
        publicationDate = parseDate(mappedData.publicationDate || mappedData.kochiDate);
      }
      if (mappedData.kochiDate) {
        knownDate = parseDate(mappedData.kochiDate);
      }

      // Create patent
      const patent = await prisma.patent.create({
        data: {
          titleId,
          patentNo: mappedData.bunken || mappedData.patentNo,
          applicationNo: mappedData.shutsugan,
          applicationDate,
          publicationDate,
          publicationNo: mappedData.kokai,
          registrationNo: mappedData.toroku,
          announcementNo: mappedData.kokoku,
          trialNo: mappedData.shinpan,
          caseNo: mappedData.jiken,
          knownDate,
          inventionName: mappedData.hatumei,
          applicant: mappedData.shutsuganNin,
          inventor: mappedData.hatumei?.split('/')[1] || null, // Assuming format: "発明名/発明者"
          ipc: mappedData.ipc,
          abstract: mappedData.abstract,
          stage: mappedData.stage,
          eventType: mappedData.event,
          other: mappedData.sonota,
          documentUrl: mappedData.bunkenUrl,
          evaluationStatus: '未評価',
        },
      });

      // Auto-classify
      const date = applicationDate || publicationDate;
      if (date) {
        const classifications = generateClassifications(date);
        await prisma.patentClassification.createMany({
          data: classifications.map((c) => ({
            patentId: patent.id,
            titleId,
            classificationType: c.type,
            classificationValue: c.value,
          })),
          skipDuplicates: true,
        } as any);
      }

      imported++;
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        error: error.message || 'Unknown error',
      });
      failed++;
    }
  }

  return {
    imported,
    failed,
    errors,
    message: `${imported}件のデータをインポートしました。${failed}件が失敗しました。`,
  };
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Try various date formats
  const formats = [
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{8}$/, // YYYYMMDD
  ];

  let date: Date | null = null;

  if (formats[0].test(dateStr)) {
    // YYYY/MM/DD
    const [year, month, day] = dateStr.split('/');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else if (formats[1].test(dateStr)) {
    // YYYY-MM-DD
    date = new Date(dateStr);
  } else if (formats[2].test(dateStr)) {
    // YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    date = new Date(year, month, day);
  }

  if (date && !isNaN(date.getTime())) {
    return date;
  }

  return null;
};

export interface ExportConfig {
  titleId: string;
  fields: string[];
  format: 'csv' | 'excel';
  filters?: {
    status?: 'evaluated' | 'unevaluated';
    dateRange?: {
      from: string;
      to: string;
    };
  };
}

export const exportData = async (config: ExportConfig): Promise<Buffer | string> => {
  const where: any = {
    titleId: config.titleId,
  };

  if (config.filters?.status === 'evaluated') {
    where.evaluationStatus = { not: '未評価' };
  } else if (config.filters?.status === 'unevaluated') {
    where.evaluationStatus = '未評価';
  }

  if (config.filters?.dateRange) {
    where.applicationDate = {
      gte: new Date(config.filters.dateRange.from),
      lte: new Date(config.filters.dateRange.to),
    };
  }

  const patents = await prisma.patent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Map to export format
  const data = patents.map((patent) => {
    const row: any = {};
    config.fields.forEach((field) => {
      const fieldMap: Record<string, string> = {
        文献番号: 'patentNo',
        出願番号: 'applicationNo',
        出願日: 'applicationDate',
        公開日: 'publicationDate',
        発明の名称: 'inventionName',
        公開番号: 'publicationNo',
        公告番号: 'announcementNo',
        登録番号: 'registrationNo',
        審判番号: 'trialNo',
        出願人: 'applicant',
        発明者: 'inventor',
        IPC: 'ipc',
        要約: 'abstract',
        評価ステータス: 'evaluationStatus',
      };

      const dbField = fieldMap[field] || field;
      row[field] = patent[dbField as keyof typeof patent] || '';
    });
    return row;
  });

  if (config.format === 'excel') {
    return await exportToExcel(data, config.fields, 'patent_export');
  } else {
    return exportToCSV(data, config.fields);
  }
};

export const getExportFields = async () => {
  return {
    allFields: [
      '文献番号',
      '発明の名称',
      '出願番号',
      '出願日',
      '公開番号',
      '公開日',
      '出願人',
      '発明者',
      'IPC',
      '要約',
      '評価ステータス',
      '評価スコア',
    ],
    defaultFields: ['文献番号', '発明の名称', '出願日', '出願人', '評価ステータス'],
  };
};

