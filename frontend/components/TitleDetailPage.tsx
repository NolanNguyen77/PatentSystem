import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Download, FileText, Search, ChevronDown, RefreshCw, Settings, Lightbulb, Users, BarChart3, CheckCircle2 } from 'lucide-react';
import { AssignmentDialog } from './AssignmentDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { patentAPI } from '../services/api';
import { notifyWarning } from '../utils/notifications';

interface TitleDetailPageProps {
  titleNo: string;
  titleName: string;
  titleId?: string;
  onBack: () => void;
  onViewPatentDetails?: (
    companyName: string,
    totalCount: number,
    titleData?: any,
    filterInfo?: {
      dateFilter: string;
      periodFilter: string;
      dateColumn?: string;
    }
  ) => void;
}

const years = ['20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'];

export function TitleDetailPage({ titleNo, titleName, titleId, onBack, onViewPatentDetails }: TitleDetailPageProps) {
  const [patentData, setPatentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('applicant');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('application');
  const [periodFilter, setPeriodFilter] = useState('year');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [allPatents, setAllPatents] = useState<any[]>([]);
  const [resolvedTitleId, setResolvedTitleId] = useState<string | undefined>(titleId);

  // Helper function to get date field based on filter
  const getDateField = (patent: any): string | null => {
    const dateFieldMap: { [key: string]: string } = {
      'application': 'applicationDate',
      'publication': 'publicationDate',
      'registration': 'registrationDate',
      'registration-gazette': 'registrationBulletinDate',
      'announcement': 'announcementDate',
      'gazette': 'gazetteBulletinDate'
    };
    const field = dateFieldMap[dateFilter];
    // Return the actual value from patent data (could be null/undefined if not set)
    return patent[field] || null;
  };

  // Helper function to format date based on period filter
  const formatDateKey = (dateStr: string | null): string => {
    if (!dateStr) return '日付未設定';

    try {
      // Handle both ISO string and Date object
      let date: Date;
      if (typeof dateStr === 'string') {
        // Parse date string as local time (not UTC)
        // If format is YYYY-MM-DD, parse as local date
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
          const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = dateStr;
      }
      if (!date || isNaN(date.getTime())) return '日付未設定';

      if (periodFilter === 'year') {
        const year = String(date.getFullYear()).slice(-2);
        return `'${year}`; // '24
      } else if (periodFilter === 'month') {
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `'${year}/${month}`; // '24/11
      } else if (periodFilter === 'week') {
        // Calculate weeks backwards from current week
        // Week starts on Sunday (0) and ends on Saturday (6)
        const now = new Date();

        // Get the start of current week (Sunday)
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);

        // Get the start of the week for the patent date
        const patentWeekStart = new Date(date);
        patentWeekStart.setDate(date.getDate() - date.getDay());
        patentWeekStart.setHours(0, 0, 0, 0);

        // Calculate difference in weeks
        const diffTime = currentWeekStart.getTime() - patentWeekStart.getTime();
        const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));

        // Week 01 is current week, Week 02 is last week, etc.
        const weekNumber = diffWeeks + 1;



        if (weekNumber < 1) {
          // Future dates go to "以前"
          return '以前';
        } else if (weekNumber > 20) {
          // More than 20 weeks ago
          return '以前';
        }

        return String(weekNumber).padStart(2, '0'); // 01-20
      }
    } catch (e) {
      console.error('Error formatting date:', e, dateStr);
      return '日付未設定';
    }
    return '日付未設定';
  };

  // Transform patent data for matrix view
  const transformPatentData = (patents: any[]) => {
    const patentsByCompany = new Map<string, {
      id: number;
      company: string;
      total: number;
      unEvaluated: number;
      counts: { [key: string]: { count: number; evaluated: number } };
    }>();

    const dateColumns = getDateColumns();

    patents.forEach(patent => {
      let company = patent.applicantName;
      // If company is empty/null, group under "Unknown"
      if (!company || company.trim() === '') {
        company = '（出願人未設定）';
      }

      const dateValue = getDateField(patent);
      const dateKey = formatDateKey(dateValue);

      if (!patentsByCompany.has(company)) {
        const counts: { [key: string]: { count: number; evaluated: number } } = {};
        dateColumns.forEach(col => counts[col] = { count: 0, evaluated: 0 });
        counts['日付未設定'] = { count: 0, evaluated: 0 };
        counts['以前'] = { count: 0, evaluated: 0 };

        patentsByCompany.set(company, {
          id: patentsByCompany.size + 1,
          company: company,
          total: 0,
          unEvaluated: 0,
          counts: counts
        });
      }

      const companyData = patentsByCompany.get(company)!;
      companyData.total += 1;

      // Determine if patent is evaluated
      // Consider evaluated if:
      // 1. Global status is set (not '未評価')
      // 2. OR User has explicitly set a status (checked via evaluations array)
      // 3. OR User has provided a comment (even if status is '未評価')
      const isEvaluated = (patent.evaluationStatus && patent.evaluationStatus !== '未評価') ||
        (patent.evaluations && patent.evaluations.length > 0 &&
          (patent.evaluations[0].status !== '未評価' || !!patent.evaluations[0].comment));

      if (!isEvaluated) {
        companyData.unEvaluated += 1;
      }

      // Helper to increment counts
      const incrementCount = (key: string) => {
        if (companyData.counts[key]) {
          companyData.counts[key].count += 1;
          if (isEvaluated) {
            companyData.counts[key].evaluated += 1;
          }
        }
      };

      // Increment count for this date key
      if (dateKey === '日付未設定') {
        incrementCount('日付未設定');
      } else if (dateKey === '以前') {
        incrementCount('以前');
      } else if (companyData.counts[dateKey] !== undefined) {
        incrementCount(dateKey);
      } else {
        // Handle out of range dates based on period filter
        if (periodFilter === 'year') {
          const year = parseInt(dateKey.replace("'", ""));
          const minYear = parseInt(dateColumns[dateColumns.length - 1].replace("'", ""));
          const maxYear = parseInt(dateColumns[0].replace("'", ""));

          if (year < minYear) incrementCount('以前');
          // Future dates are ignored or could be added to a "Future" column if needed
        } else {
          // For other filters, if it doesn't match a column, put in "以前" if it's old, or ignore
          // Simple fallback: check if date is older than the last column
          incrementCount('以前');
        }
      }
    });

    return Array.from(patentsByCompany.values());
  };

  const fetchPatents = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching patents for title:', titleNo);
      // Don't include full text (abstract/claims) for performance
      const result = await patentAPI.getByTitle(titleNo, { includeFullText: false });

      const payload = result.data?.data ?? result.data ?? result;

      if (payload) {
        if (payload.titleId) {
          setResolvedTitleId(payload.titleId);
        }

        if (payload.patents) {
          const patentsArray = Array.isArray(payload.patents) ? payload.patents : (Array.isArray(payload) ? payload : []);
          setAllPatents(patentsArray);

          // Transform data based on current filters
          const transformed = transformPatentData(patentsArray);
          setPatentData(transformed);
        }
      } else {
        console.warn('⚠️ No patents found', payload);
        setPatentData([]);
      }
    } catch (err) {
      console.error('❌ Error fetching patents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patents');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patents from API on component mount
  useEffect(() => {
    if (titleNo) {
      fetchPatents();
    }
  }, [titleNo]);

  // Re-transform data when filters change
  useEffect(() => {
    if (allPatents.length > 0) {
      const transformed = transformPatentData(allPatents);
      setPatentData(transformed);
    }
  }, [dateFilter, periodFilter]);



  // Generate columns based on period filter
  const getDateColumns = () => {
    if (periodFilter === 'year') {
      // Show years from '06 to '25 (2006 to 2025)
      return ["'06", "'07", "'08", "'09", "'10", "'11", "'12", "'13", "'14", "'15", "'16", "'17", "'18", "'19", "'20", "'21", "'22", "'23", "'24", "'25"];
    } else if (periodFilter === 'month') {
      // Show months from '24/04 to '25/11 (April 2024 to November 2025)
      return ["'24/04", "'24/05", "'24/06", "'24/07", "'24/08", "'24/09", "'24/10", "'24/11", "'24/12", "'25/01", "'25/02", "'25/03", "'25/04", "'25/05", "'25/06", "'25/07", "'25/08", "'25/09", "'25/10", "'25/11"];
    } else if (periodFilter === 'week') {
      // Show weeks from 20 to 01 (first 20 weeks of the year)
      return ['20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'];
    }
    return [];
  };

  const dateColumns = getDateColumns();

  const handleRowSelect = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === patentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(patentData.map(item => item.id));
    }
  };

  const handleExportCSV = () => {
    if (allPatents.length === 0) {
      notifyWarning('出力するデータがありません');
      return;
    }

    // Define CSV headers based on systemFields from ImportDataPage + Evaluation fields
    const headers = [
      'No',
      '文献番号',
      '出願番号',
      '出願日',
      '公知日',
      '発明の名称',
      '出願人/権利者',
      'FI',
      '公開番号',
      '公告番号',
      '登録番号',
      '審判番号',
      '要約',
      '請求の範囲',
      'その他',
      'ステージ',
      'イベント詳細',
      '文献URL',
      'ステータス', // Evaluation Status
      '評価結果',   // Evaluation Result (same as status for now, or specific field if available)
      '評価コメント' // Evaluation Comment
    ];

    // Map data to CSV rows
    const rows = allPatents.map((patent, index) => {
      // Helper to escape CSV fields (handle quotes, commas, newlines)
      const escape = (value: any) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Get evaluation info
      const evaluation = patent.evaluations && patent.evaluations.length > 0 ? patent.evaluations[0] : null;
      const status = patent.evaluationStatus || (evaluation ? evaluation.status : '未評価');
      const comment = evaluation ? evaluation.comment : '';

      return [
        index + 1,
        escape(patent.documentNum),            // 文献番号 (Corrected from documentNumber)
        escape(patent.applicationNum),         // 出願番号 (Corrected from applicationNumber)
        escape(patent.applicationDate),        // 出願日
        escape(patent.publicationDate),        // 公知日
        escape(patent.inventionTitle),         // 発明の名称 (Corrected from title)
        escape(patent.applicantName),          // 出願人/権利者
        escape(patent.fiClassification),       // FI (Corrected from fi)
        escape(patent.publicationNum),         // 公開番号 (Corrected from publicationNumber)
        escape(patent.announcementNum),        // 公告番号 (Corrected from gazetteNumber)
        escape(patent.registrationNum),        // 登録番号 (Corrected from registrationNumber)
        escape(patent.appealNum),              // 審判番号 (Corrected from appealNumber)
        escape(patent.abstract),               // 要約
        escape(patent.claims),                 // 請求の範囲 (Corrected from claimText)
        escape(patent.otherInfo),              // その他
        escape(patent.statusStage),            // ステージ (Corrected from stage)
        escape(patent.eventDetail),            // イベント詳細 (Corrected from eventDetails)
        escape(patent.documentUrl),            // 文献URL
        escape(status),                        // ステータス
        escape(status),                        // 評価結果
        escape(comment)                        // 評価コメント
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // Add BOM for Excel support

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${titleName}_特許一覧_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50 overflow-x-hidden">


      {/* Dashboard Stats Section */}
      <div className="max-w-full px-6 py-6 font-sans">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Lightbulb className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 block mb-0.5">保存タイトル No.{titleNo}</span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{titleName}</h1>
          </div>
        </div>


      </div>

      {/* Filters Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full px-6 py-4 space-y-4">
          {/* Row 1: Search and Settings */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="出願人・権利者名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Row 2: Filter Buttons */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Group 1: Filter Type */}
              <Button
                size="sm"
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                全件
              </Button>
              <Button
                size="sm"
                variant={filterType === 'progress' ? 'default' : 'outline'}
                onClick={() => setFilterType('progress')}
                className={filterType === 'progress' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                進捗率(％)
              </Button>
              <Button
                size="sm"
                variant={filterType === 'unevaluated' ? 'default' : 'outline'}
                onClick={() => setFilterType('unevaluated')}
                className={filterType === 'unevaluated' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                未評価(件)
              </Button>

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {/* Group 2: Date Filter */}
              <Button
                size="sm"
                variant={dateFilter === 'application' ? 'default' : 'outline'}
                onClick={() => setDateFilter('application')}
                className={dateFilter === 'application' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                出願日
              </Button>
              <Button
                size="sm"
                variant={dateFilter === 'publication' ? 'default' : 'outline'}
                onClick={() => setDateFilter('publication')}
                className={dateFilter === 'publication' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                公開日
              </Button>
              <Button
                size="sm"
                variant={dateFilter === 'registration' ? 'default' : 'outline'}
                onClick={() => setDateFilter('registration')}
                className={dateFilter === 'registration' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                登録日
              </Button>
              <Button
                size="sm"
                variant={dateFilter === 'registration-gazette' ? 'default' : 'outline'}
                onClick={() => setDateFilter('registration-gazette')}
                className={dateFilter === 'registration-gazette' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                登録公報発行日
              </Button>
              <Button
                size="sm"
                variant={dateFilter === 'announcement' ? 'default' : 'outline'}
                onClick={() => setDateFilter('announcement')}
                className={dateFilter === 'announcement' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                公告日
              </Button>
              <Button
                size="sm"
                variant={dateFilter === 'gazette' ? 'default' : 'outline'}
                onClick={() => setDateFilter('gazette')}
                className={dateFilter === 'gazette' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                公報発行日
              </Button>

              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {/* Group 3: Period Filter */}
              <Button
                size="sm"
                variant={periodFilter === 'year' ? 'default' : 'outline'}
                onClick={() => setPeriodFilter('year')}
                className={periodFilter === 'year' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                年別
              </Button>
              <Button
                size="sm"
                variant={periodFilter === 'month' ? 'default' : 'outline'}
                onClick={() => setPeriodFilter('month')}
                className={periodFilter === 'month' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                月別
              </Button>
              <Button
                size="sm"
                variant={periodFilter === 'week' ? 'default' : 'outline'}
                onClick={() => setPeriodFilter('week')}
                className={periodFilter === 'week' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white' : ''}
              >
                週別
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="text-sm h-8 transition-all duration-200 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                タイトル一覧へ戻る
              </Button>
              <div className="w-px h-5 bg-gray-300"></div>
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-8 transition-all duration-200 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV出力
              </Button>
              <div className="w-px h-5 bg-gray-300"></div>
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-8 transition-all duration-200 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                更新
              </Button>
              <div className="w-px h-5 bg-gray-300"></div>
              <Button
                variant="outline"
                size="sm"
                className="text-sm h-8 transition-all duration-200 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300"
                onClick={() => setIsAssignmentDialogOpen(true)}
              >
                <Users className="w-4 h-4 mr-1" />
                担当者分担
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full px-6 py-6">
        {/* Main Table Area */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Matrix Table - Horizontal Scroll Only */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-center w-12 sticky left-0 bg-gray-100 z-10 border-r">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={selectedRows.length === patentData.length}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[300px] bg-gray-100" style={{ position: 'sticky', left: '48px', zIndex: 10, borderRight: '4px solid #6b7280' }}>
                    出願人・権利者名
                  </TableHead>
                  <TableHead className="text-center w-20 bg-gray-100 border-r">
                    <span className="text-sm">全件</span>
                  </TableHead>
                  <TableHead className="text-center w-16 bg-gray-100 border-r">
                    <span className="text-sm">未評価</span>
                  </TableHead>
                  <TableHead className="text-center w-16 bg-gray-100 border-r">
                    <span className="text-xs">日付未設定</span>
                  </TableHead>
                  <TableHead className="text-center w-16 bg-gray-100 border-r">
                    <span className="text-xs">以前</span>
                  </TableHead>
                  {dateColumns.map((year) => (
                    <TableHead key={year} className="text-center w-12 bg-gray-100 border-r text-xs">
                      {year}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Summary Row - 全件 */}
                <TableRow className="bg-blue-50">
                  <TableCell className="sticky left-0 bg-blue-50 text-center border-r">
                    <input type="checkbox" className="w-4 h-4" disabled />
                  </TableCell>
                  <TableCell className="bg-blue-50" style={{ position: 'sticky', left: '48px', borderRight: '4px solid #6b7280' }}>
                    <span className="text-sm font-semibold">全件</span>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <button
                      className="text-blue-600 hover:underline text-sm font-semibold"
                      onClick={() => onViewPatentDetails?.('全件', allPatents.length, { titleNo, titleName })}
                    >
                      {allPatents.length}
                    </button>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <span className="text-sm font-semibold">{allPatents.filter(p => p.evaluationStatus === '未評価').length}</span>
                  </TableCell>
                  <TableCell className={`text-center border-r ${(() => {
                    const count = patentData.reduce((sum, item) => sum + (item.counts?.['日付未設定']?.count || 0), 0);
                    const evaluated = patentData.reduce((sum, item) => sum + (item.counts?.['日付未設定']?.evaluated || 0), 0);
                    if (count > 0 && count === evaluated) return 'bg-orange-300 group-hover:bg-orange-300 font-bold';
                    return 'bg-blue-50';
                  })()}`}
                    style={(() => {
                      const count = patentData.reduce((sum, item) => sum + (item.counts?.['日付未設定']?.count || 0), 0);
                      const evaluated = patentData.reduce((sum, item) => sum + (item.counts?.['日付未設定']?.evaluated || 0), 0);
                      if (count > 0 && count === evaluated) return { backgroundColor: '#fed7aa' }; // orange-200
                      return undefined;
                    })()}>
                    {(() => {
                      const count = patentData.reduce((sum, item) => sum + (item.counts?.['日付未設定']?.count || 0), 0);
                      return count > 0 ? (
                        <button
                          className="text-blue-600 hover:underline text-xs font-semibold"
                          onClick={() => onViewPatentDetails?.(
                            '全件',
                            count,
                            { titleNo, titleName },
                            { dateFilter, periodFilter, dateColumn: '日付未設定' }
                          )}
                        >
                          {count}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">-</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className={`text-center border-r ${(() => {
                    const count = patentData.reduce((sum, item) => sum + (item.counts?.['以前']?.count || 0), 0);
                    const evaluated = patentData.reduce((sum, item) => sum + (item.counts?.['以前']?.evaluated || 0), 0);
                    if (count > 0 && count === evaluated) return 'bg-orange-300 group-hover:bg-orange-300 font-bold';
                    return 'bg-blue-50';
                  })()}`}
                    style={(() => {
                      const count = patentData.reduce((sum, item) => sum + (item.counts?.['以前']?.count || 0), 0);
                      const evaluated = patentData.reduce((sum, item) => sum + (item.counts?.['以前']?.evaluated || 0), 0);
                      if (count > 0 && count === evaluated) return { backgroundColor: '#fed7aa' }; // orange-200
                      return undefined;
                    })()}>
                    {(() => {
                      const count = patentData.reduce((sum, item) => sum + (item.counts?.['以前']?.count || 0), 0);
                      return count > 0 ? (
                        <button
                          className="text-blue-600 hover:underline text-xs font-semibold"
                          onClick={() => onViewPatentDetails?.(
                            '全件',
                            count,
                            { titleNo, titleName },
                            { dateFilter, periodFilter, dateColumn: '以前' }
                          )}
                        >
                          {count}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">-</span>
                      );
                    })()}
                  </TableCell>
                  {dateColumns.map((col) => {
                    const total = patentData.reduce((sum, item) => sum + (item.counts?.[col]?.count || 0), 0);
                    const totalEvaluated = patentData.reduce((sum, item) => sum + (item.counts?.[col]?.evaluated || 0), 0);
                    const isFullyEvaluated = total > 0 && total === totalEvaluated;
                    const isPartiallyEvaluated = total > 0 && totalEvaluated > 0;

                    let cellClass = "text-center border-r";
                    if (isFullyEvaluated) {
                      cellClass += " bg-orange-300 group-hover:bg-orange-300 font-bold";
                    } else {
                      cellClass += " bg-blue-50";
                    }

                    const style = isFullyEvaluated ? { backgroundColor: '#fed7aa' } : // orange-200
                      undefined;

                    return (
                      <TableCell key={col} className={cellClass} style={style}>
                        {total > 0 ? (
                          <button
                            className="text-blue-600 hover:underline text-xs font-semibold"
                            onClick={() => onViewPatentDetails?.(
                              '全件',
                              total,
                              { titleNo, titleName },
                              { dateFilter, periodFilter, dateColumn: col }
                            )}
                          >
                            {total}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {patentData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`group hover:bg-orange-50 transition-colors ${selectedRows.includes(item.id) ? 'bg-blue-50' : ''
                      }`}
                  >
                    <TableCell className="sticky left-0 group-hover:bg-orange-50 text-center border-r transition-colors" style={{ backgroundColor: selectedRows.includes(item.id) ? '#dbeafe' : 'white' }}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleRowSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell
                      className="group-hover:bg-orange-50 transition-colors"
                      style={{
                        position: 'sticky',
                        left: '48px',
                        backgroundColor: selectedRows.includes(item.id) ? '#dbeafe' : 'white',
                        borderRight: '4px solid #6b7280'
                      }}
                    >
                      <span className="text-sm">{item.company}</span>
                    </TableCell>
                    <TableCell className="group-hover:bg-orange-50 text-center border-r transition-colors">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => onViewPatentDetails?.(item.company, item.total, { titleNo, titleName })}
                      >
                        {item.total}
                      </button>
                    </TableCell>
                    <TableCell className="group-hover:bg-orange-50 text-center border-r transition-colors">
                      <span className="text-sm">{item.unEvaluated || 0}</span>
                    </TableCell>
                    <TableCell className={`group-hover:bg-orange-50 text-center border-r transition-colors ${(() => {
                      const count = item.counts?.['日付未設定']?.count || 0;
                      const evaluated = item.counts?.['日付未設定']?.evaluated || 0;
                      if (count > 0 && count === evaluated) return 'bg-orange-300 group-hover:bg-orange-300 font-bold';
                      return '';
                    })()}`}
                      style={(() => {
                        const count = item.counts?.['日付未設定']?.count || 0;
                        const evaluated = item.counts?.['日付未設定']?.evaluated || 0;
                        if (count > 0 && count === evaluated) return { backgroundColor: '#fed7aa' }; // orange-200
                        return undefined;
                      })()}>
                      {item.counts?.['日付未設定']?.count > 0 ? (
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => onViewPatentDetails?.(
                            item.company,
                            item.counts?.['日付未設定']?.count,
                            { titleNo, titleName },
                            { dateFilter, periodFilter, dateColumn: '日付未設定' }
                          )}
                        >
                          {item.counts?.['日付未設定']?.count}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className={`group-hover:bg-orange-50 text-center border-r transition-colors ${(() => {
                      const count = item.counts?.['以前']?.count || 0;
                      const evaluated = item.counts?.['以前']?.evaluated || 0;
                      if (count > 0 && count === evaluated) return 'bg-orange-300 group-hover:bg-orange-300 font-bold';
                      return '';
                    })()}`}
                      style={(() => {
                        const count = item.counts?.['以前']?.count || 0;
                        const evaluated = item.counts?.['以前']?.evaluated || 0;
                        if (count > 0 && count === evaluated) return { backgroundColor: '#fed7aa' }; // orange-200
                        return undefined;
                      })()}>
                      {item.counts?.['以前']?.count > 0 ? (
                        <button
                          className="text-blue-600 hover:underline text-xs"
                          onClick={() => onViewPatentDetails?.(
                            item.company,
                            item.counts?.['以前']?.count,
                            { titleNo, titleName },
                            { dateFilter, periodFilter, dateColumn: '以前' }
                          )}
                        >
                          {item.counts?.['以前']?.count}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    {dateColumns.map((col) => {
                      const cellData = item.counts?.[col];
                      const count = cellData?.count || 0;
                      const evaluated = cellData?.evaluated || 0;
                      const isPartiallyEvaluated = count > 0 && evaluated > 0;
                      const isFullyEvaluated = count > 0 && evaluated === count;

                      let cellClass = "group-hover:bg-orange-50 text-center border-r transition-colors";
                      if (isFullyEvaluated) {
                        cellClass += " bg-orange-300 group-hover:bg-orange-300 font-bold";
                      }

                      const style = isFullyEvaluated ? { backgroundColor: '#fed7aa' } : // orange-200
                        undefined;

                      return (
                        <TableCell
                          key={col}
                          className={cellClass}
                          style={style}
                        >
                          {count > 0 ? (
                            <button
                              className="text-blue-600 hover:underline text-xs"
                              onClick={() => onViewPatentDetails?.(
                                item.company,
                                count,
                                { titleNo, titleName },
                                { dateFilter, periodFilter, dateColumn: col }
                              )}
                            >
                              {count}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer */}
          <div className="border-t px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>表示: {patentData.length} 件 / 全 {allPatents.length} 件</div>
              <div className="flex items-center gap-2">
                <span>ページ 1 / {Math.ceil(patentData.length / 20)}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                    «
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                    ‹
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                    ›
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                    »
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AssignmentDialog */}
      <AssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={() => setIsAssignmentDialogOpen(false)}
        titleNo={titleNo}
        titleName={titleName}
        titleId={resolvedTitleId || titleId}
        patents={allPatents}
        hideRangeSelector={true}
        onAssignmentComplete={fetchPatents}
      />
    </div>
  );
}