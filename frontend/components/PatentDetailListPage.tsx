import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, FileText, Users, RefreshCw, Save } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { AssignmentDialog } from './AssignmentDialog';
import { DetailDialog } from './DetailDialog';
import { ExportDataDialog } from './ExportDataDialog';
import { patentAPI } from '../services/api';

interface PatentDetailListPageProps {
  titleNo: string;
  titleName: string;
  titleId?: string;
  responsible: string;
  responsibleId: string;
  companyName: string;
  totalCount: number;
  onBack: () => void;
  filterInfo?: {
    dateFilter: string;
    periodFilter: string;
    dateColumn?: string;
  };
}

interface Patent {
  id: string;
  documentNum?: string;
  applicationNum?: string;
  applicationDate?: string;
  publicationDate?: string;
  inventionTitle?: string;
  applicantName?: string;
  fiClassification?: string;
  publicationNum?: string;
  announcementNum?: string;
  registrationNum?: string;
  appealNum?: string;
  abstract?: string;
  claims?: string;
  otherInfo?: string;
  statusStage?: string;
  eventDetail?: string;
  documentUrl?: string;
  evaluationStatus?: string;
}

export function PatentDetailListPage({
  titleNo,
  titleName,
  titleId,
  responsible,
  responsibleId,
  companyName,
  totalCount,
  onBack,
  filterInfo
}: PatentDetailListPageProps) {
  const [patents, setPatents] = useState<Patent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedPatentId, setSelectedPatentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [patentStates, setPatentStates] = useState<{
    [key: string]: {
      topEvaluation: string;
      bottomEvaluation: string;
      abstract: string;
      claims: string;
      reasonInput: string;
      toTrash: boolean;
    }
  }>({});

  const [resolvedTitleId, setResolvedTitleId] = useState<string | undefined>(titleId);

  // Helper function to get date field based on filter
  const getDateField = (patent: Patent): string | null => {
    if (!filterInfo) return null;
    
    // Only application date has actual data
    if (filterInfo.dateFilter === 'application') {
      return patent.applicationDate || null;
    }
    // For all other date types, return null
    return null;
  };

  // Helper function to format date based on period filter
  const formatDateKey = (dateStr: string | null): string => {
    if (!dateStr || !filterInfo) return '日付未設定';
    
    try {
      // Parse date string as local time
      let date: Date;
      if (typeof dateStr === 'string') {
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

      if (filterInfo.periodFilter === 'year') {
        const year = String(date.getFullYear()).slice(-2);
        return `'${year}`;
      } else if (filterInfo.periodFilter === 'month') {
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `'${year}/${month}`;
      } else if (filterInfo.periodFilter === 'week') {
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);
        
        const patentWeekStart = new Date(date);
        patentWeekStart.setDate(date.getDate() - date.getDay());
        patentWeekStart.setHours(0, 0, 0, 0);
        
        const diffTime = currentWeekStart.getTime() - patentWeekStart.getTime();
        const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
        const weekNumber = diffWeeks + 1;
        
        if (weekNumber < 1) {
          return '以前';
        } else if (weekNumber > 20) {
          return '以前';
        }
        
        return String(weekNumber).padStart(2, '0');
      }
    } catch (e) {
      return '日付未設定';
    }
    return '日付未設定';
  };

  // Filter patents based on filterInfo
  const filterPatents = (patentList: Patent[]): Patent[] => {
    if (!filterInfo || !filterInfo.dateColumn) {
      // No filter, return all patents
      return patentList;
    }

    return patentList.filter(patent => {
      const dateValue = getDateField(patent);
      const dateKey = formatDateKey(dateValue);
      return dateKey === filterInfo.dateColumn;
    });
  };

  // Fetch patents from API
  useEffect(() => {
    const fetchPatents = async () => {
      try {
        setIsLoading(true);

        // If companyName is '全件', fetch all patents by title instead
        // Include full text (abstract/claims) for detail page
        const result = companyName === '全件'
          ? await patentAPI.getByTitle(titleNo, { includeFullText: true })
          : await patentAPI.getByCompany(companyName, { search: companyName });

        // Normalize possible response wrappers: apiCall -> { data }, controller -> { data: result }
        const payload = result.data?.data ?? result.data ?? result;

        if (payload) {
          const patentList = Array.isArray(payload.patents) ? payload.patents : (Array.isArray(payload) ? payload : (payload.data ?? []));
          
          // Apply filter if filterInfo is provided
          const filteredPatents = filterPatents(patentList);
          setPatents(filteredPatents);

          // Extract titleId from first patent if available and not already set
          if (patentList.length > 0 && patentList[0].title?.id) {
            setResolvedTitleId(patentList[0].title.id);
          }

          // Initialize patent states
          const initialStates: { [key: string]: any } = {};
          filteredPatents.forEach((patent: Patent) => {
            initialStates[patent.id] = {
              topEvaluation: '未評価',
              bottomEvaluation: patent.evaluationStatus || '未評価',
              reasonInput: patent.otherInfo || '',
              toTrash: false
            };
          });

          setPatentStates(initialStates);
        } else {
          setPatents([]);
        }
      } catch (err) {
        console.error('❌ Error fetching patents:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch patents');
      } finally {
        setIsLoading(false);
      }
    };

    if (companyName && titleNo) {
      fetchPatents();
    }
  }, [companyName, titleNo]);

  // ... (rest of component)

  {/* Assignment Dialog */ }
  <AssignmentDialog
    isOpen={isAssignmentDialogOpen}
    onClose={() => setIsAssignmentDialogOpen(false)}
    titleNo={titleNo}
    titleName={titleName}
    titleId={resolvedTitleId || titleId}
    patents={patents}
    responsible={responsible}
    responsibleId={responsibleId}
  />

  const updatePatentState = (id: string, field: string, value: any) => {
    setPatentStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(patents.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`${selectedIds.size}件の特許を削除してもよろしいですか？`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const idsToDelete = Array.from(selectedIds);
      const result = await patentAPI.deleteBatch(idsToDelete);

      if (result.error) {
        throw new Error(result.error);
      }

      // Remove deleted patents from state
      setPatents(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to delete patents:', err);
      alert('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetailClick = (patentId: string) => {
    setSelectedPatentId(patentId);
    setShowDetailDialog(true);
  };

  const selectedPatent = patents.find(p => p.id === selectedPatentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                タイトル: <span className="font-medium">{titleName}</span> (No: {titleNo})
              </span>
              <span className="text-sm text-gray-600">
                出願人: <span className="font-medium">{companyName}</span>
              </span>
              {filterInfo && filterInfo.dateColumn && (
                <span className="text-sm text-orange-600 font-medium">
                  フィルター: {filterInfo.dateColumn}
                </span>
              )}
              <span className="text-sm text-gray-600">
                全 {patents.length} 件
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                checked={patents.length > 0 && selectedIds.size === patents.length}
                onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer">
                すべて選択
              </label>
            </div>

            <Button
              variant={selectedIds.size > 0 ? "default" : "outline"}
              size="sm"
              className={`text-sm h-8 transition-all duration-200 ${selectedIds.size > 0
                ? "bg-red-600 hover:bg-red-700 hover:shadow-md text-white border-transparent"
                : "text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                }`}
              onClick={handleDelete}
              disabled={selectedIds.size === 0 || isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              削除 {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Button>

            <div className="w-px h-5 bg-gray-300"></div>

            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 transition-all duration-200 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <FileText className="w-4 h-4 mr-1" />
              出力
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
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 hover:shadow-md text-white text-sm h-8 border-0 transition-all duration-200">
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-4">
          {patents.map((patent) => (
            <div key={patent.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Left Panel - Patent Info - Fixed height */}
                <div className="w-[350px] min-w-[350px] max-w-[350px] h-[600px] border border-gray-200 rounded-lg bg-white flex-shrink-0 overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-white text-sm flex items-center gap-2 flex-shrink-0">
                    <Checkbox
                      checked={selectedIds.has(patent.id)}
                      onCheckedChange={(checked: boolean) => handleSelectOne(patent.id, checked)}
                    />
                    特許情報
                  </div>
                  <div className="text-sm overflow-y-auto flex-1 border-t border-gray-200">
                    {[
                      { label: '【文献番号】', value: patent.documentNum, bold: true },
                      { label: '【出願番号】', value: patent.applicationNum },
                      { label: '【出願日】', value: patent.applicationDate },
                      { label: '【公知日】', value: patent.publicationDate },
                      { label: '【出願人/権利者】', value: patent.applicantName },
                      { label: '【公開番号】', value: patent.publicationNum },
                      { label: '【公告番号】', value: patent.announcementNum },
                      { label: '【登録番号】', value: patent.registrationNum },
                      { label: '【審判番号】', value: patent.appealNum },
                      { label: '【請求の範囲】', value: patent.otherInfo },
                      { label: '【ステージ】', value: patent.statusStage },
                      { label: '【イベント詳細】', value: patent.eventDetail },
                    ].map((item, index) => (
                      <div key={index} className="flex border-b border-gray-100 min-h-[32px]">
                        <div className="w-[120px] bg-gray-50 p-2 text-xs text-gray-700 font-bold border-r border-gray-100 flex items-center flex-shrink-0">
                          {item.label}
                        </div>
                        <div className={`p-2 text-gray-900 flex-1 break-all text-xs ${item.bold ? 'font-medium' : ''}`}>
                          {item.value || '-'}
                        </div>
                      </div>
                    ))}

                    <div className="flex border-b border-gray-100">
                      <div className="w-[120px] bg-gray-50 p-2 text-xs text-gray-700 font-bold border-r border-gray-100 flex items-start flex-shrink-0">
                        【発明の名称】
                      </div>
                      <div className="p-2 flex-1">
                        <div
                          className="max-h-[50px] overflow-y-auto text-xs leading-tight"
                          style={{ scrollbarWidth: 'thin' }}
                        >
                          {patent.inventionTitle ? (
                            patent.inventionTitle.split('、').reduce((acc: string[][], word, index) => {
                              const lineIndex = Math.floor(index / 3);
                              if (!acc[lineIndex]) acc[lineIndex] = [];
                              acc[lineIndex].push(word.trim());
                              return acc;
                            }, []).map((line, i) => (
                              <div key={i}>{line.join('、')}</div>
                            ))
                          ) : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex border-b border-gray-100">
                      <div className="w-[120px] bg-gray-50 p-2 text-xs text-gray-700 font-bold border-r border-gray-100 flex items-start flex-shrink-0">
                        【FI】
                      </div>
                      <div className="p-2 flex-1">
                        <div
                          className="max-h-[50px] overflow-y-auto text-xs leading-tight"
                          style={{ scrollbarWidth: 'thin' }}
                        >
                          {patent.fiClassification ? (
                            patent.fiClassification.split(',').reduce((acc: string[][], fi, index) => {
                              const lineIndex = Math.floor(index / 4);
                              if (!acc[lineIndex]) acc[lineIndex] = [];
                              acc[lineIndex].push(fi.trim());
                              return acc;
                            }, []).map((line, i) => (
                              <div key={i}>{line.join(', ')}</div>
                            ))
                          ) : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex min-h-[32px]">
                      <div className="w-[120px] bg-gray-50 p-2 text-xs text-gray-700 font-bold border-r border-gray-100 flex items-center flex-shrink-0">
                        【文献URL】
                      </div>
                      <div className="p-2 text-gray-900 flex-1 flex items-center">
                        {patent.documentUrl ? (
                          <a
                            href={patent.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            J-PlatPat
                          </a>
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </div>


                </div>


                {/* Right Panel - Details - Same height as left panel */}
                <div className="flex-1 space-y-4 flex flex-col h-[600px]">
                  {/* Two Column Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">【出願人/権利者】</div>
                        <div className="text-sm mb-3">{patent.applicantName || '-'}</div>
                        <div className="text-sm text-gray-600 mb-1">【要約】</div>
                        <div 
                          className="text-sm bg-gray-50 p-3 rounded h-[140px] overflow-y-auto border border-gray-200 whitespace-pre-wrap leading-relaxed" 
                          style={{ 
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e0 #f7fafc'
                          }}
                        >
                          {patent.abstract || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">【発明の名称】</div>
                        <div className="text-sm mb-3">{patent.inventionTitle || '-'}</div>
                        <div className="text-sm text-gray-600 mb-1">【請求の範囲】</div>
                        <div 
                          className="text-sm bg-gray-50 p-3 rounded h-[140px] overflow-y-auto border border-gray-200 whitespace-pre-wrap leading-relaxed" 
                          style={{ 
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e0 #f7fafc'
                          }}
                        >
                          {patent.claims || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Section - flex-1 to fill remaining space */}
                  <div className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50/40 flex-1 flex flex-col">
                    <div className="text-sm font-medium">【評価】</div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600"
                      >
                        評価履歴
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600"
                        onClick={() => setIsAssignmentDialogOpen(true)}
                      >
                        担当者
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <Select
                        value={patentStates[patent.id].bottomEvaluation}
                        onValueChange={(value: string) => updatePatentState(patent.id, 'bottomEvaluation', value)}
                      >
                        <SelectTrigger className="w-[240px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="未評価">未評価</SelectItem>
                          <SelectItem value="A">A：評価1</SelectItem>
                          <SelectItem value="B">B：評価2</SelectItem>
                          <SelectItem value="C">C：評価3</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`trash-${patent.id}`}
                          checked={patentStates[patent.id].toTrash}
                          onCheckedChange={(checked: boolean | 'indeterminate') => updatePatentState(patent.id, 'toTrash', typeof checked === 'boolean' ? checked : false)}
                        />
                        <label htmlFor={`trash-${patent.id}`} className="text-sm cursor-pointer">
                          ゴミ箱へ
                        </label>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="text-sm text-gray-600 mb-1">【理由入力】</div>
                      <Textarea
                        value={patentStates[patent.id].reasonInput}
                        onChange={(e) => updatePatentState(patent.id, 'reasonInput', e.target.value)}
                        className="flex-1 min-h-[80px] w-full resize-none text-sm"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>

      {/* Assignment Dialog */}
      <AssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={() => setIsAssignmentDialogOpen(false)}
        titleNo={titleNo}
        titleName={titleName}
        titleId={resolvedTitleId || titleId}
        patents={selectedIds.size > 0 ? patents.filter(p => selectedIds.has(p.id)) : patents}
        responsible={responsible}
        responsibleId={responsibleId}
        hideRangeSelector={selectedIds.size > 0}
      />

      {/* Detail Dialog */}
      <DetailDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        patent={selectedPatent as any}
      />

      {/* Export Dialog */}
      <ExportDataDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        totalCount={patents.length}
        patents={patents}
      />
    </div >
  );
}