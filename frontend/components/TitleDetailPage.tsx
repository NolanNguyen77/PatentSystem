import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Download, FileText, Search, ChevronDown, RefreshCw, Settings, Lightbulb, Users } from 'lucide-react';
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

interface TitleDetailPageProps {
  titleNo: string;
  titleName: string;
  titleId?: string;
  onBack: () => void;
  onViewPatentDetails?: (companyName: string, totalCount: number, titleData?: any) => void;
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
    return patent[field] || null;
  };

  // Helper function to format date based on period filter
  const formatDateKey = (dateStr: string | null): string => {
    if (!dateStr) return '日付未設定';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '日付未設定';

      if (periodFilter === 'year') {
        return `'${String(date.getFullYear()).slice(-2)}`; // '24
      } else if (periodFilter === 'month') {
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `'${year}/${month}`; // '24/11
      } else if (periodFilter === 'week') {
        // ISO week calculation
        const onejan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        return String(week).padStart(2, '0'); // 01-52
      }
    } catch (e) {
      return '日付未設定';
    }
    return '日付未設定';
  };

  // Transform patents data based on filters
  const transformPatentData = (patents: any[]) => {
    const patentsByCompany = new Map<string, any>();
    const dateColumns = getDateColumns();

    patents.forEach((patent: any) => {
      const company = patent.applicant ?? patent.applicantName ?? patent.assignee ?? patent.owner ?? '不明';
      const dateValue = getDateField(patent);
      const dateKey = formatDateKey(dateValue);

      if (!patentsByCompany.has(company)) {
        const counts: { [key: string]: number } = {};
        dateColumns.forEach(col => counts[col] = 0);
        counts['日付未設定'] = 0;

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
      
      if (patent.evaluationStatus === '未評価') {
        companyData.unEvaluated += 1;
      }

      // Increment count for this date key
      if (companyData.counts[dateKey] !== undefined) {
        companyData.counts[dateKey] += 1;
      } else if (dateKey === '日付未設定') {
        companyData.counts['日付未設定'] += 1;
      }
    });

    return Array.from(patentsByCompany.values());
  };

  // Fetch patents from API on component mount
  useEffect(() => {
    const fetchPatentsByTitle = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching patents for title:', titleNo);
        const result = await patentAPI.getByTitle(titleNo);

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
            
            console.log('✅ Loaded patents:', transformed.length, 'companies');
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

    if (titleNo) {
      fetchPatentsByTitle();
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
      // Show weeks from 20 to 01
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

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header with Actions */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full px-6 py-3">
          <div className="flex items-center justify-end gap-3">
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
            >
              <FileText className="w-4 h-4 mr-1" />
              出力
            </Button>
            <div className="w-px h-5 bg-gray-300"></div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 transition-all duration-200 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
            >
              <Search className="w-4 h-4 mr-1" />
              案件の検索
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

      {/* Title Info Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Lightbulb className="w-6 h-6 text-orange-500" />
              <div>
                <span className="text-sm text-gray-500">保存タイトル No.{titleNo}</span>
                <h2 className="text-lg">{titleName}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full px-6 py-3 space-y-3">
          {/* Row 1: View Mode and Data Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm">表示モード:</span>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applicant-header" disabled className="bg-gray-200">出願人別</SelectItem>
                  <SelectItem value="applicant">出願人別</SelectItem>
                  <SelectItem value="applicant-normalized">出願人別（名寄せ）</SelectItem>
                  <SelectItem value="ipc">IPC分類別</SelectItem>
                  <SelectItem value="evaluation">評価別</SelectItem>
                  <SelectItem value="assignee" className="text-red-600">担当者別</SelectItem>
                  <SelectItem value="inventor">発明者別</SelectItem>
                  <SelectItem value="primary-inventor">筆頭発明者別</SelectItem>
                  <SelectItem value="sdi">SDI別</SelectItem>
                  <SelectItem value="country">国コード別</SelectItem>
                  <SelectItem value="status">ステータス別</SelectItem>
                  <SelectItem value="status-normalized">ステータス（名寄せ）別</SelectItem>
                  <SelectItem value="ai-patent">AI判定結果別(数値特許)</SelectItem>
                  <SelectItem value="ai-natural">AI判定結果別(自然文)</SelectItem>
                  <SelectItem value="company" className="pl-8">株式会社インテリジェント...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
              <span className="text-sm">データ:</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのデータ</SelectItem>
                  <SelectItem value="evaluated">評価済のみ</SelectItem>
                  <SelectItem value="not-evaluated">未評価のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">ファミリー:</span>
              <Select defaultValue="all-family">
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-family">全てのファミリー</SelectItem>
                  <SelectItem value="japan">日本のみ</SelectItem>
                  <SelectItem value="foreign">外国のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Filter Buttons */}
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
                  <TableHead className="min-w-[300px] bg-gray-100 border-r-4 border-r-gray-500" style={{ position: 'sticky', left: '48px', zIndex: 10 }}>
                    出願人・権利者名
                  </TableHead>
                  <TableHead className="text-center w-20 bg-gray-100 border-r">
                    <span className="text-sm">全件</span>
                  </TableHead>
                  <TableHead className="text-center w-16 bg-gray-100 border-r">
                    <span className="text-sm">未評価</span>
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
                  <TableCell className="bg-blue-50 border-r-4 border-r-gray-500" style={{ position: 'sticky', left: '48px' }}>
                    <span className="text-sm font-semibold">全件</span>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <span className="text-sm font-semibold text-blue-600">
                      {allPatents.length}
                    </span>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <span className="text-sm font-semibold">{allPatents.filter(p => p.evaluationStatus === '未評価').length}</span>
                  </TableCell>
                  {dateColumns.map((col) => {
                    const total = patentData.reduce((sum, item) => sum + (item.counts?.[col] || 0), 0);
                    return (
                      <TableCell key={col} className="bg-blue-50 text-center border-r">
                        <span className={`text-xs font-semibold ${total > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {total > 0 ? total : '-'}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {patentData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-orange-50 ${selectedRows.includes(item.id) ? 'bg-blue-50' : ''
                      }`}
                  >
                    <TableCell className="sticky left-0 bg-white text-center border-r">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleRowSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell className="bg-white border-r-4 border-r-gray-500" style={{ position: 'sticky', left: '48px' }}>
                      <span className="text-sm">{item.company}</span>
                    </TableCell>
                    <TableCell className="bg-white text-center border-r">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => onViewPatentDetails?.(item.company, item.total, { titleNo, titleName })}
                      >
                        {item.total}
                      </button>
                    </TableCell>
                    <TableCell className="bg-white text-center border-r">
                      <span className="text-sm">{item.unEvaluated || 0}</span>
                    </TableCell>
                    {dateColumns.map((col) => {
                      const count = item.counts?.[col] || 0;
                      return (
                        <TableCell key={col} className="text-center border-r">
                          <span className={`text-xs ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            {count > 0 ? count : '-'}
                          </span>
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
      />
    </div>
  );
}