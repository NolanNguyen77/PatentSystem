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
  companyName: string;
  totalCount: number;
  onBack: () => void;
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
  otherInfo?: string;
  statusStage?: string;
  eventDetail?: string;
  documentUrl?: string;
  evaluationStatus?: string;
}

export function PatentDetailListPage({
  titleNo,
  titleName,
  companyName,
  totalCount,
  onBack
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

  // Fetch patents from API
  useEffect(() => {
    const fetchPatents = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching patents for company:', companyName);

        const result = await patentAPI.getByCompany(companyName, {
          search: companyName
        });

        // Normalize possible response wrappers: apiCall -> { data }, controller -> { data: result }
        const payload = result.data?.data ?? result.data ?? result;
        console.debug('PatentDetailListPage - payload sample:', payload?.patents ? payload.patents.slice(0, 3) : payload);

        if (payload) {
          const patentList = Array.isArray(payload.patents) ? payload.patents : (Array.isArray(payload) ? payload : (payload.data ?? []));
          setPatents(patentList);

          // Initialize patent states
          const initialStates: { [key: string]: any } = {};
          patentList.forEach((patent: Patent) => {
            initialStates[patent.id] = {
              topEvaluation: '未評価',
              bottomEvaluation: patent.evaluationStatus || '未評価',
              abstract: patent.abstract || '',
              claims: patent.claims || '',
              reasonInput: patent.otherInfo || '',
              toTrash: false
            };
          });

          setPatentStates(initialStates);
          console.log('✅ Loaded patents:', patentList.length);
        } else {
          console.warn('⚠️ No patents found', payload);
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
      console.log('Deleted patents:', result.data?.count);
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
              className={`text-sm h-8 ${selectedIds.size > 0
                ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                : "text-red-600 border-red-200 hover:bg-red-50"
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
              className="text-sm h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <FileText className="w-4 h-4 mr-1" />
              出力
            </Button>
            <div className="w-px h-5 bg-gray-300"></div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700"
              onClick={() => setIsAssignmentDialogOpen(true)}
            >
              <Users className="w-4 h-4 mr-1" />
              担当者分担
            </Button>
            <div className="w-px h-5 bg-gray-300"></div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              筆新に更新
            </Button>
            <div className="w-px h-5 bg-gray-300"></div>
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm h-8 border-0">
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
                {/* Left Panel - Patent Info */}
                <div className="w-[280px] border border-gray-200 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2 text-white text-sm flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.has(patent.id)}
                      onCheckedChange={(checked: boolean) => handleSelectOne(patent.id, checked)}
                    />
                    特許情報
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">【文献番号】</div>
                      <div className="text-gray-800">{patent.documentNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【出願番号】</div>
                      <div className="text-gray-800">{patent.applicationNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【出願日】</div>
                      <div className="text-gray-800">{patent.applicationDate || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【公知日】</div>
                      <div className="text-gray-800">{patent.publicationDate || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【発明の名称】</div>
                      <div className="text-gray-800">{patent.inventionTitle || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【出願人/権利者】</div>
                      <div className="text-gray-800">{patent.applicantName || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【FI】</div>
                      <div className="text-gray-800">{patent.fiClassification || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【公開番号】</div>
                      <div className="text-gray-800">{patent.publicationNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【公告番号】</div>
                      <div className="text-gray-800">{patent.announcementNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【登録番号】</div>
                      <div className="text-gray-800">{patent.registrationNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【審判番号】</div>
                      <div className="text-gray-800">{patent.appealNum || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【その他】</div>
                      <div className="text-gray-800">{patent.otherInfo || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【ステージ】</div>
                      <div className="text-gray-800">{patent.statusStage || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【イベント詳細】</div>
                      <div className="text-gray-800">{patent.eventDetail || '-'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">【文献URL】</div>
                      <div className="text-gray-800">
                        {patent.documentUrl ? (
                          <a 
                            href={patent.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {patent.documentUrl}
                          </a>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>

                    {/* Detail Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                        onClick={() => handleDetailClick(patent.id)}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Details */}
                <div className="flex-1 space-y-4">
                  {/* Two Column Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">【出願人/権利者】</div>
                        <div className="text-sm mb-3">{patent.applicantName || '-'}</div>
                        <div className="text-sm text-gray-600 mb-1">【FI】</div>
                        <div className="text-sm bg-gray-50 p-2 rounded min-h-[120px] overflow-auto">
                          {patent.fiClassification || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">【発明の名称】</div>
                        <div className="text-sm mb-3">{patent.inventionTitle || '-'}</div>
                        <div className="text-sm text-gray-600 mb-1">【その他】</div>
                        <Textarea
                          value={patentStates[patent.id].reasonInput}
                          onChange={(e) => updatePatentState(patent.id, 'reasonInput', e.target.value)}
                          className="min-h-[120px] w-full resize-none text-sm bg-white"
                          placeholder=""
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Section */}
                  <div className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50/40">
                    <div className="text-sm">【評価】</div>

                    <div className="flex items-center gap-2">
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

                    <div className="flex items-center gap-3">
                      <Select
                        value={patentStates[patent.id].bottomEvaluation}
                        onValueChange={(value: string) => updatePatentState(patent.id, 'bottomEvaluation', value)}
                      >
                        <SelectTrigger className="w-[180px]">
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

                    <div>
                      <div className="text-sm text-gray-600 mb-1">【理由入力ー】</div>
                      <Textarea
                        value={patentStates[patent.id].reasonInput}
                        onChange={(e) => updatePatentState(patent.id, 'reasonInput', e.target.value)}
                        className="min-h-[100px] w-full resize-none text-sm"
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
      />
    </div>
  );
}