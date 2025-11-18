import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateClassifications } from '../src/utils/classification';

const prisma = new PrismaClient();

type Permission = '管理者' | '一般' | '閲覧';

interface DepartmentSeed {
  no: string;
  name: string;
  abbreviation: string;
  displayOrder: number;
}

interface UserSeed {
  userId: string;
  name: string;
  email: string;
  password: string;
  departmentName?: string;
  permission: Permission;
}

interface TitleSeed {
  titleNo: string;
  titleName: string;
  dataType: string;
  markColor?: string;
  saveDate: string;
  createdByUserId: string;
  responsibles: Array<{
    userId: string;
    permission: Permission;
    isMain?: boolean;
    evalEmail?: boolean;
    confirmEmail?: boolean;
  }>;
}

// Helper to map permission string to bit flags
const getPermissionFlags = (permission: Permission) => {
  switch (permission) {
    case '管理者':
      return { isAdmin: true, isGeneral: false, isViewer: false };
    case '一般':
      return { isAdmin: false, isGeneral: true, isViewer: false };
    case '閲覧':
      return { isAdmin: false, isGeneral: false, isViewer: true };
    default:
      return { isAdmin: false, isGeneral: true, isViewer: false };
  }
};

interface PatentSeedInput {
  titleNo: string;
  patentNo?: string;
  applicationNo?: string;
  applicationDate?: string;
  publicationNo?: string;
  publicationDate?: string;
  applicant: string;
  inventionName: string;
  stage?: string;
  eventType?: string;
  documentUrl?: string;
  evaluationStatus?: '評価済' | '未評価';
}

const departmentSeeds: DepartmentSeed[] = [
  { no: '000001', name: '調査力部所', abbreviation: 'R1', displayOrder: 1 },
  { no: '000002', name: 'その他開発', abbreviation: 'DEV-ETC', displayOrder: 2 },
  { no: '000003', name: '個人営業', abbreviation: 'SALES-IND', displayOrder: 3 },
  { no: '000004', name: '法人営業', abbreviation: 'SALES-CORP', displayOrder: 4 },
  { no: '000005', name: '構佐', abbreviation: 'STRUCT', displayOrder: 5 },
  { no: '000006', name: '調査力開発', abbreviation: 'R&D', displayOrder: 6 },
];

const userSeeds: UserSeed[] = [
  { userId: 'asakawa', name: 'あさかわ', email: 'asakawa@ipfine.jp', password: '1', departmentName: '法人営業', permission: '管理者' },
  { userId: 'hirakawa', name: 'ひらかわ', email: 'hirakawa@ipfine.jp', password: '1', departmentName: '調査力部所', permission: '管理者' },
  { userId: 'Nguyen', name: 'グエン・タイ・タン', email: 'nguyen@ipfine.jp', password: '1', departmentName: '調査力部所', permission: '管理者' },
  { userId: 'm_fmn01', name: '部門責任者 01', email: 'm_fmn01@ipfine.jp', password: '1', departmentName: 'その他開発', permission: '管理者' },
  { userId: 'm_fmn02', name: '部門責任者 02', email: 'm_fmn02@ipfine.jp', password: '1', departmentName: 'その他開発', permission: '管理者' },
  { userId: 'm_lpm01', name: '一般 01', email: 'm_lpm01@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '一般' },
  { userId: 'm_lpm02', name: '一般 02', email: 'm_lpm02@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '一般' },
  { userId: 'm_lpm03', name: '一般 03', email: 'm_lpm03@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '一般' },
  { userId: 'm_tym01', name: '一般（調査) 01', email: 'm_tym01@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '一般' },
  { userId: 'm_tym02', name: '一般（法人) 02', email: 'm_tym02@ipfine.jp', password: '1', departmentName: '法人営業', permission: '一般' },
  { userId: 'm_tym03', name: '一般（法人) 03', email: 'm_tym03@ipfine.jp', password: '1', departmentName: '法人営業', permission: '一般' },
  { userId: 'maruo', name: 'まるお', email: 'maruo@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '管理者' },
  { userId: 'shimizu', name: 'しみず', email: 'shimizu@ipfine.jp', password: '1', departmentName: '個人営業', permission: '管理者' },
  { userId: 'shimizu1', name: 'しみず１', email: 'shimizu1@ipfine.jp', password: '1', departmentName: 'その他開発', permission: '管理者' },
  { userId: 'shimizu2', name: 'しみず２', email: 'shimizu2@ipfine.jp', password: '1', departmentName: '構佐', permission: '管理者' },
  { userId: 'shimizu3', name: 'しみず３', email: 'shimizu3@ipfine.jp', password: '1', departmentName: 'その他開発', permission: '管理者' },
  { userId: 'tsuji', name: 'つじま', email: 'tsuji@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '管理者' },
  { userId: 'yamamoto', name: 'やまもと', email: 'yamamoto@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '管理者' },
  { userId: 'yamamoto1', name: 'やまもと１', email: 'yamamoto1@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '管理者' },
  { userId: 'yamamoto2', name: 'やまもと２', email: 'yamamoto2@ipfine.jp', password: '1', departmentName: '調査力開発', permission: '管理者' },
  { userId: 'tan286', name: 'Tan Nguyen', email: 'Nguyen_TT@ipfine.jp', password: '026339229', departmentName: '調査力部所', permission: '管理者' },
];

const titleSeeds: TitleSeed[] = [
  {
    titleNo: '000032',
    titleName: 'ひらかわ',
    dataType: '特許',
    saveDate: '2025/10',
    createdByUserId: 'hirakawa',
    responsibles: [
      { userId: 'hirakawa', permission: '管理者', isMain: true, evalEmail: true, confirmEmail: true },
    ],
  },
  {
    titleNo: '000034',
    titleName: 'グエン・ダイ・タン',
    dataType: '特許',
    markColor: '#dc2626',
    saveDate: '2025/10',
    createdByUserId: 'Nguyen',
    responsibles: [
      { userId: 'Nguyen', permission: '管理者', isMain: true, evalEmail: true, confirmEmail: true },
    ],
  },
  {
    titleNo: '000035',
    titleName: '自動生成タイトル000035',
    dataType: '特許',
    saveDate: '2025/10',
    createdByUserId: 'Nguyen',
    responsibles: [
      { userId: 'Nguyen', permission: '管理者', isMain: true, evalEmail: true, confirmEmail: true },
    ],
  },
];

const titleTargets: Record<string, { total: number; evaluated: number }> = {
  '000032': { total: 10, evaluated: 5 },
  '000034': { total: 34, evaluated: 20 },
  '000035': { total: 8, evaluated: 3 },
};

const patentSeeds: PatentSeedInput[] = [];
const countsByTitle = new Map<string, number>();
const evaluationTracker = new Map<string, { evaluated: number; total: number }>();
let globalPatentSeq = 1;

const nextSequence = () => {
  const current = globalPatentSeq;
  globalPatentSeq += 1;
  return current;
};

const createDateString = (year: number, sequence: number): string => {
  const month = ((sequence - 1) % 12) + 1;
  const day = ((sequence - 1) % 27) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const addPatentSeed = (seed: PatentSeedInput) => {
  const tracker = evaluationTracker.get(seed.titleNo) ?? { evaluated: 0, total: 0 };
  const target = titleTargets[seed.titleNo];
  if (!target) {
    throw new Error(`Missing target configuration for title ${seed.titleNo}`);
  }

  let evaluationStatus = seed.evaluationStatus;
  if (!evaluationStatus) {
    if (tracker.evaluated < target.evaluated) {
      evaluationStatus = '評価済';
      tracker.evaluated += 1;
    } else {
      evaluationStatus = '未評価';
    }
  } else if (evaluationStatus !== '未評価') {
    tracker.evaluated += 1;
  }

  tracker.total += 1;
  evaluationTracker.set(seed.titleNo, tracker);

  countsByTitle.set(seed.titleNo, (countsByTitle.get(seed.titleNo) ?? 0) + 1);

  const sequence = nextSequence();
  patentSeeds.push({
    ...seed,
    evaluationStatus,
    patentNo: seed.patentNo ?? `PN-${seed.titleNo}-${String(sequence).padStart(4, '0')}`,
    applicationNo: seed.applicationNo ?? `${seed.titleNo}-${String(sequence).padStart(5, '0')}`,
  });
};

// Manual patents from PatentDetailListPage mock
addPatentSeed({
  titleNo: '000032',
  patentNo: 'HI2024-053740',
  applicationNo: '2024-053740',
  applicationDate: '2024-04-19',
  publicationNo: '登録2025-164123',
  publicationDate: '2025-04-19',
  applicant: '末×グループ株式会社',
  inventionName: '[発明の名称] 吸収性物品個包装体パッケージ',
  documentUrl: 'https://patents.local/HI2024-053740',
  evaluationStatus: '評価済',
});

addPatentSeed({
  titleNo: '000032',
  patentNo: 'HI2024-053741',
  applicationNo: '2024-053741',
  applicationDate: '2024-05-20',
  publicationNo: '登録2025-164124',
  publicationDate: '2025-05-20',
  applicant: '末×グループ株式会社',
  inventionName: '[発明の名称] 洗浄剤組成物',
  documentUrl: 'https://patents.local/HI2024-053741',
  evaluationStatus: '評価済',
});

addPatentSeed({
  titleNo: '000032',
  patentNo: 'HI2024-053742',
  applicationNo: '2024-053742',
  applicationDate: '2024-06-15',
  publicationNo: '登録2025-164125',
  publicationDate: '2025-06-15',
  applicant: '末×グループ株式会社',
  inventionName: '[発明の名称] 洗浄剤組成物',
  documentUrl: 'https://patents.local/HI2024-053742',
  evaluationStatus: '未評価',
});

const generateSequentialPatents = (
  titleNo: string,
  segments: Array<{ applicant: string; count: number; baseName: string; baseYear: number }>
) => {
  segments.forEach((segment) => {
    for (let i = 0; i < segment.count; i += 1) {
      const sequence = (countsByTitle.get(titleNo) ?? 0) + 1;
      const applicationDate = createDateString(segment.baseYear, sequence);
      const publicationDate = createDateString(segment.baseYear + 1, sequence);

      addPatentSeed({
        titleNo,
        patentNo: `AUTO-${titleNo}-${String(sequence).padStart(3, '0')}`,
        applicationNo: `${titleNo}-${segment.baseYear}${String(sequence).padStart(4, '0')}`,
        applicationDate,
        publicationNo: `公開${segment.baseYear + 1}-${String(sequence).padStart(6, '0')}`,
        publicationDate,
        applicant: segment.applicant,
        inventionName: `${segment.baseName} 第${sequence}案`,
        stage: '評価中',
        eventType: '登録',
        documentUrl: `https://patents.local/${titleNo}/${sequence}`,
      });
    }
  });
};

// Fill remaining patents for each title based on mock totals
generateSequentialPatents('000032', [
  { applicant: '末×グループ株式会社', count: titleTargets['000032'].total - (countsByTitle.get('000032') ?? 0), baseName: '包装技術', baseYear: 2024 },
]);

generateSequentialPatents('000034', [
  { applicant: '任天堂株式会社', count: 10, baseName: 'ゲーム入力装置', baseYear: 2023 },
  { applicant: '株式会社ソニー・インタラクティブエンタテインメント', count: 8, baseName: 'インタラクティブ処理', baseYear: 2023 },
  { applicant: 'アイ・ピー・ビー株式会社', count: 5, baseName: '映像処理', baseYear: 2024 },
  { applicant: '楽天グループ株式会社', count: 4, baseName: 'コマース制御', baseYear: 2024 },
  { applicant: '市金株式会社', count: 3, baseName: '金融プラットフォーム', baseYear: 2024 },
  { applicant: 'シー・ブル一株式会社', count: 2, baseName: 'クラウド同期', baseYear: 2024 },
  { applicant: '株式会社コナミデジタルエンタテインメント', count: 1, baseName: 'エンタメAI', baseYear: 2025 },
  { applicant: 'アルファスアルバイト・オートメーション株式会社', count: 1, baseName: '自動化制御', baseYear: 2025 },
]);

generateSequentialPatents('000035', [
  { applicant: 'コピー技研株式会社', count: 4, baseName: '複写技術', baseYear: 2024 },
  { applicant: 'ベトテクノロジー株式会社', count: 4, baseName: 'AIレポート', baseYear: 2025 },
]);

Object.entries(titleTargets).forEach(([titleNo, target]) => {
  const count = countsByTitle.get(titleNo) ?? 0;
  if (count !== target.total) {
    throw new Error(`Title ${titleNo} expected ${target.total} patents but prepared ${count}`);
  }
  const tracker = evaluationTracker.get(titleNo);
  if (!tracker || tracker.evaluated !== target.evaluated) {
    throw new Error(`Title ${titleNo} expected ${target.evaluated} evaluated patents but prepared ${tracker?.evaluated ?? 0}`);
  }
});

const toDate = (value?: string | null) => {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`);
};

async function main() {
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.attachment.deleteMany(),
    prisma.patentClassification.deleteMany(),
    prisma.evaluation.deleteMany(),
    prisma.patent.deleteMany(),
    prisma.titleUser.deleteMany(),
    prisma.title.deleteMany(),
    prisma.user.deleteMany(),
    prisma.department.deleteMany(),
  ]);

  console.log('🏢 Seeding departments...');
  const departmentMap = new Map<string, string>();
  for (const dept of departmentSeeds) {
    const created = await prisma.department.create({
      data: {
        no: dept.no,
        name: dept.name,
        abbreviation: dept.abbreviation,
        displayOrder: dept.displayOrder,
      },
    });
    departmentMap.set(dept.name, created.id);
  }

  console.log('👥 Seeding users...');
  const userMap = new Map<string, { id: string; userId: string }>();
  for (const user of userSeeds) {
    const hashed = await bcrypt.hash(user.password, 10);
    const created = await prisma.user.create({
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        password: hashed,
        permission: user.permission,
        departmentId: user.departmentName ? departmentMap.get(user.departmentName) ?? null : null,
      },
    });
    userMap.set(user.userId, created);
  }

  console.log('📁 Seeding titles...');
  const titleMap = new Map<string, string>();
  for (const title of titleSeeds) {
    const createdTitle = await prisma.title.create({
      data: {
        titleNo: title.titleNo,
        titleName: title.titleName,
        dataType: title.dataType,
        markColor: title.markColor,
        saveDate: title.saveDate,
        createdBy: title.createdByUserId,
        disallowEvaluation: false,
        allowEvaluation: true,
        viewPermission: 'all',
        editPermission: 'creator',
        titleUsers: {
          create: title.responsibles.map((responsible, index) => {
            const user = userMap.get(responsible.userId);
            if (!user) {
              throw new Error(`User ${responsible.userId} not found for title ${title.titleNo}`);
            }
            const permissionFlags = getPermissionFlags(responsible.permission);
            return {
              userId: user.id,
              isMainResponsible: responsible.isMain ?? index === 0,
              ...permissionFlags,
              evalEmail: responsible.evalEmail ?? false,
              confirmEmail: responsible.confirmEmail ?? false,
              displayOrder: index,
            };
          }),
        },
      },
    });

    titleMap.set(title.titleNo, createdTitle.id);
  }

  console.log('🧾 Seeding patents and classifications...');
  for (const seed of patentSeeds) {
    const titleId = titleMap.get(seed.titleNo);
    if (!titleId) {
      throw new Error(`Missing title for patent seed ${seed.patentNo}`);
    }

    const applicationDate = toDate(seed.applicationDate);
    const publicationDate = toDate(seed.publicationDate);

    const patent = await prisma.patent.create({
      data: {
        titleId,
        patentNo: seed.patentNo,
        applicationNo: seed.applicationNo,
        applicationDate,
        publicationNo: seed.publicationNo,
        publicationDate,
        applicant: seed.applicant,
        inventionName: seed.inventionName,
        stage: seed.stage ?? '確認中',
        eventType: seed.eventType ?? '登録',
        documentUrl: seed.documentUrl,
        evaluationStatus: seed.evaluationStatus ?? '未評価',
      },
    });

    const classificationDate = applicationDate ?? publicationDate;
    if (classificationDate) {
      const classifications = generateClassifications(classificationDate);
      for (const classification of classifications) {
        await prisma.patentClassification.create({
          data: {
            patentId: patent.id,
            titleId: patent.titleId,
            classificationType: classification.type,
            classificationValue: classification.value,
          },
        });
      }
    }
  }

  console.log('✅ Seeding completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
