import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Download, FileText, Search, ChevronDown, RefreshCw, Settings, Lightbulb } from 'lucide-react';
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
  onBack: () => void;
  onViewPatentDetails?: (companyName: string, totalCount: number, titleData?: any) => void;
}

const years = ['20', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '09', '08', '07', '06', '05', '04', '03', '02', '01'];

export function TitleDetailPage({ titleNo, titleName, onBack, onViewPatentDetails }: TitleDetailPageProps) {
  const [patentData, setPatentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('applicant');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('application');
  const [periodFilter, setPeriodFilter] = useState('year');

  // Fetch patents from API on component mount
  useEffect(() => {
    const fetchPatentsByTitle = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching patents for title:', titleNo);
        const result = await patentAPI.getByTitle(titleNo);

        // Support different response wrappers: apiCall returns { data: ... }
        // Backend controllers often return { data: result }, so payload may be nested.
        const payload = result.data?.data ?? result.data ?? result;

        if (payload && payload.patents) {
          // Transform patents to patent matrix grouped by company
          const patentsByCompany = new Map<string, any>();
          
          const patentsArray = Array.isArray(payload.patents) ? payload.patents : (Array.isArray(payload) ? payload : []);
          console.debug('TitleDetailPage - patentsArray sample:', patentsArray.slice(0,3));

          patentsArray.forEach((patent: any) => {
            // Support multiple possible applicant fields from backend
            const company = patent.applicant ?? patent.applicantName ?? patent.assignee ?? patent.owner ?? 'Unknown';
            if (!patentsByCompany.has(company)) {
              patentsByCompany.set(company, {
                id: patentsByCompany.size + 1,
                company: company,
                total: 0,
                y20: 0, y19: 0, y18: 0, y17: 0, y16: 0, y15: 0, y14: 0,
                selected: false
              });
            }
            patentsByCompany.get(company)!.total += 1;
          });
          
          setPatentData(Array.from(patentsByCompany.values()));
          console.log('✅ Loaded patents:', patentsByCompany.size, 'companies');
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
              onClick={onBack}
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              タイトル一覧へ戻る
            </Button>
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              出力
            </Button>
            <Button
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Search className="w-4 h-4 mr-2" />
              案件の検索
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
                  <TableHead className="min-w-[300px] bg-gray-100 border-r-4 border-r-gray-500" style={{position: 'sticky', left: '48px', zIndex: 10}}>
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
                  <TableCell className="bg-blue-50 border-r-4 border-r-gray-500" style={{position: 'sticky', left: '48px'}}>
                    <span className="text-sm">全件</span>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <button className="text-blue-600 hover:underline text-sm">
                      405
                    </button>
                  </TableCell>
                  <TableCell className="bg-blue-50 text-center border-r">
                    <span className="text-sm">171</span>
                  </TableCell>
                  {dateColumns.map((year) => (
                    <TableCell key={year} className="bg-blue-50 text-center border-r">
                      <span className="text-xs">-</span>
                    </TableCell>
                  ))}
                </TableRow>

                {patentData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-orange-50 ${
                      selectedRows.includes(item.id) ? 'bg-blue-50' : ''
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
                    <TableCell className="bg-white border-r-4 border-r-gray-500" style={{position: 'sticky', left: '48px'}}>
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
                      <span className="text-sm">0</span>
                    </TableCell>
                    {dateColumns.map((year, index) => (
                      <TableCell key={year} className="text-center border-r">
                        <span className="text-xs text-gray-400">-</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer */}
          <div className="border-t px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>表示: {patentData.length} 件 / 全 405 件</div>
              <div className="flex items-center gap-2">
                <span>ページ 1 / 21</span>
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
    </div>
  );
}