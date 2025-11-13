import { useState } from 'react';
import { 
  Lightbulb, 
  User, 
  LogOut, 
  Search, 
  RefreshCw, 
  Download, 
  Menu, 
  Settings, 
  FileDown, 
  FilePlus, 
  Upload, 
  Search as SearchIcon, 
  Trash2, 
  Paperclip, 
  FileText 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { TitleDetailPage } from './TitleDetailPage';
import { PatentDetailListPage } from './PatentDetailListPage';
import { CreateTitleForm } from './CreateTitleForm';
import { CopyDataForm } from './CopyDataForm';
import { MergeDataForm } from './MergeDataForm';
import { TitleSearchForm } from './TitleSearchForm';
import { SavedDataSearchForm } from './SavedDataSearchForm';
import { ImportDataPage } from './ImportDataPage';
import { SavedTitleManagement } from './SavedTitleManagement';
import { ManualEntryDialog } from './ManualEntryDialog';
import { ExportDataDialog } from './ExportDataDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface TitleListPageProps {
  username: string;
  onLogout: () => void;
}

const titles = [
  {
    no: '000032',
    title: 'ひらかわ',
    department: '調査力部所',
    responsible: 'ひらかわ',
    dataCount: 10,
    evaluated: 5,
    notEvaluated: 5,
    trash: 0,
    progressRate: 50.0,
    date: '2025/10',
    dataType: '特許',
    attachments: 0,
    markColor: ''
  },
  {
    no: '000034',
    title: 'グエン・ダイ・タン',
    department: '調査力部所',
    responsible: 'グエン・タイ・シ・タン',
    dataCount: 34,
    evaluated: 20,
    notEvaluated: 14,
    trash: 0,
    progressRate: 58.8,
    date: '2025/10',
    dataType: '特許',
    attachments: 2,
    markColor: '#dc2626' // レッド (Red)
  },
  {
    no: '000035',
    title: 'コピー ～ グエン・ダイブ・タン',
    department: '調査力部所',
    responsible: 'グエン・ダイブ・タン',
    dataCount: 8,
    evaluated: 3,
    notEvaluated: 5,
    trash: 0,
    progressRate: 37.5,
    date: '2025/11',
    dataType: '論文',
    attachments: 1,
    markColor: '#3b82f6' // ブルー (Blue)
  }
];

export function TitleListPage({ username, onLogout }: TitleListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'copy', 'merge', 'search', 'dataSearch', 'admin', 'import', 'detail', 'company', 'titleManagement', 'patentDetails'
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isManualEntryDialogOpen, setIsManualEntryDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedTitleForAttachment, setSelectedTitleForAttachment] = useState<string>('');
  const [selectedTitleForDetail, setSelectedTitleForDetail] = useState<{ no: string; name: string } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCompanyCount, setSelectedCompanyCount] = useState<number>(0);
  const [selectedTitleForManagement, setSelectedTitleForManagement] = useState<any>(null);
  const [savedTitles, setSavedTitles] = useState(titles);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter titles based on search query
  const filteredTitles = savedTitles.filter((title) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      title.title.toLowerCase().includes(query) ||
      title.department.toLowerCase().includes(query) ||
      title.responsible.toLowerCase().includes(query) ||
      title.no.includes(query)
    );
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery('');
    
    // Simulate refresh delay
    setTimeout(() => {
      setSavedTitles([...titles]);
      setIsRefreshing(false);
    }, 600);
  };

  const handleSaveTitle = (titleData: any) => {
    // Generate new title ID
    const newId = String(Number(savedTitles[savedTitles.length - 1].no) + 1).padStart(6, '0');
    
    // Get mark color based on mark type (matching ColorSelect values)
    const markColorMap: { [key: string]: string } = {
      'マークなし': '',
      'レッド': '#dc2626',        // Red 600
      'オレンジ': '#f97316',      // Orange 500
      'イエロー': '#facc15',      // Yellow 400
      'グリーン': '#22c55e',      // Green 500
      'ブルー': '#3b82f6',        // Blue 500
      'パープル': '#9333ea',      // Purple 600
      'ピンク': '#ec4899',        // Pink 500
      'ネオンブルー': '#22d3ee',  // Cyan 400
      'イエローグリーン': '#a3e635', // Lime 400
      'グレー': '#9ca3af',        // Gray 400
    };
    
    // Create new title entry
    const newTitle = {
      no: newId,
      title: titleData.titleName,
      department: '調査力部所',
      responsible: 'グエン・タン・タン',
      dataCount: 0,
      evaluated: 0,
      notEvaluated: 0,
      trash: 0,
      progressRate: 0,
      date: titleData.saveDate || '2025/11',
      dataType: titleData.dataType || '特許',
      attachments: 0,
      markColor: markColorMap[titleData.markType] || ''
    };
    
    // Add to list and go back to list view
    setSavedTitles([...savedTitles, newTitle]);
    setActiveTab('list');
  };

  const handleUpdateTitle = (updatedTitleData: any) => {
    // Get mark color based on mark type
    const markColorMap: { [key: string]: string } = {
      'マークなし': '',
      'レッド': '#dc2626',
      'オレンジ': '#f97316',
      'イエロー': '#facc15',
      'グリーン': '#22c55e',
      'ブルー': '#3b82f6',
      'パープル': '#9333ea',
      'ピンク': '#ec4899',
      'ネオンブルー': '#22d3ee',
      'イエローグリーン': '#a3e635',
      'グレー': '#9ca3af',
    };

    // Update the title in savedTitles
    setSavedTitles(savedTitles.map(title => 
      title.no === updatedTitleData.no ? {
        ...title,
        title: updatedTitleData.title,
        responsible: updatedTitleData.responsible,
        dataType: updatedTitleData.dataType,
        date: updatedTitleData.date,
        markColor: markColorMap[updatedTitleData.markType] || title.markColor
      } : title
    ));
    
    // Go back to list view
    setActiveTab('list');
  };

  const handleOpenAttachmentDialog = (titleNo: string) => {
    setSelectedTitleForAttachment(titleNo);
    setIsAttachmentDialogOpen(true);
  };

  const handleOpenDetailPage = (titleNo: string, titleName: string) => {
    setSelectedTitleForDetail({ no: titleNo, name: titleName });
    setActiveTab('detail');
  };

  // Function to get icon based on data type
  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case '特許':
        return <Lightbulb className="w-5 h-5 text-orange-500" />;
      case '論文':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl">特許ナビ</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <User className="w-4 h-4" />
                <span>{username}さん</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('create')}
              className={`text-white hover:bg-white/20 hover:text-white rounded-lg ${activeTab === 'create' ? 'bg-white/20' : ''}`}
            >
              新規タイトル作成
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsCopyDialogOpen(true)}
              className={`text-white hover:bg-white/20 hover:text-white rounded-lg ${activeTab === 'copy' ? 'bg-white/20' : ''}`}
            >
              保存データのコピー
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('merge')}
              className={`text-white hover:bg-white/20 hover:text-white rounded-lg ${activeTab === 'merge' ? 'bg-white/20' : ''}`}
            >
              保存データのマージ
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('search')}
              className={`text-white hover:bg-white/20 hover:text-white rounded-lg ${activeTab === 'search' ? 'bg-white/20' : ''}`}
            >
              タイトル画面検索
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {activeTab === 'import' ? (
        <ImportDataPage onBack={() => setActiveTab('list')} />
      ) : activeTab === 'detail' && selectedTitleForDetail ? (
        <TitleDetailPage
          titleNo={selectedTitleForDetail.no}
          titleName={selectedTitleForDetail.name}
          onBack={() => setActiveTab('list')}
          onViewPatentDetails={(companyName, totalCount) => {
            setSelectedCompany(companyName);
            setSelectedCompanyCount(totalCount);
            setActiveTab('patentDetails');
          }}
        />
      ) : activeTab === 'patentDetails' && selectedTitleForDetail ? (
        <PatentDetailListPage 
          titleNo={selectedTitleForDetail.no}
          titleName={selectedTitleForDetail.name}
          companyName={selectedCompany}
          totalCount={selectedCompanyCount}
          onBack={() => setActiveTab('detail')}
        />
      ) : (
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {activeTab === 'create' ? (
              <CreateTitleForm onBack={() => setActiveTab('list')} onSave={handleSaveTitle} />
            ) : activeTab === 'copy' ? (
              <CopyDataForm onBack={() => setActiveTab('list')} />
            ) : activeTab === 'merge' ? (
              <MergeDataForm onBack={() => setActiveTab('list')} />
            ) : activeTab === 'search' ? (
              <TitleSearchForm onBack={() => setActiveTab('list')} />
            ) : activeTab === 'dataSearch' ? (
              <SavedDataSearchForm onBack={() => setActiveTab('list')} />
            ) : activeTab === 'titleManagement' ? (
              <SavedTitleManagement 
                onBack={() => setActiveTab('list')} 
                titleData={selectedTitleForManagement}
                onSave={handleUpdateTitle}
              />
            ) : (
            <>
              {/* Page Title & Search */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                    タイトル一覧
                  </h2>
                  <p className="text-gray-500">検索（タイトル・部署等）</p>
                </div>
              </div>

          {/* Search & Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="検索（タイトル・部署等）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-12 border-2"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? '更新中...' : '更新'}
            </Button>
            <Button variant="outline" className="h-12 border-2">
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </Button>
          </div>

          {/* Table */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100">
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead className="w-[100px]">Ｎｏ</TableHead>
                  <TableHead>保存データタイトル</TableHead>
                  <TableHead className="text-center">用途</TableHead>
                  <TableHead>部署名</TableHead>
                  <TableHead>主担当者</TableHead>
                  <TableHead className="text-center">データ件数</TableHead>
                  <TableHead className="text-center">評価済</TableHead>
                  <TableHead className="text-center">未評価</TableHead>
                  <TableHead className="text-center">ゴミ箱</TableHead>
                  <TableHead className="text-center">評価進捗率</TableHead>
                  <TableHead className="text-center">添付</TableHead>
                  <TableHead className="text-center">保存年月</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTitles.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all group">
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                          >
                            <Menu className="w-4 h-4 mr-1" />
                            MENU
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedTitleForManagement(item);
                              setActiveTab('titleManagement');
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            保存タイトル管理
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setIsExportDialogOpen(true)}
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            保存データ全件出力
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setIsManualEntryDialogOpen(true)}
                          >
                            <FilePlus className="w-4 h-4 mr-2" />
                            1件ずつ手入力で追加
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setActiveTab('import')}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            データのインポート
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setActiveTab('dataSearch')}
                          >
                            <SearchIcon className="w-4 h-4 mr-2" />
                            保存データの検索
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            このタイトルを削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleOpenDetailPage(item.no, item.title)}
                        className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                      >
                        {item.markColor && (
                          <div 
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: item.markColor }}
                          />
                        )}
                        <span className="hover:underline">{item.title}</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      {getDataTypeIcon(item.dataType)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700 group-hover:bg-orange-100 group-hover:border-orange-300 group-hover:text-orange-800">
                        {item.department}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.responsible}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                        {item.dataCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                        {item.evaluated}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-orange-100 text-orange-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                        {item.notEvaluated}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gray-100 text-gray-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                        {item.trash}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2 group-hover:bg-orange-200">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full group-hover:from-orange-600 group-hover:to-yellow-600"
                            style={{ width: `${item.progressRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{item.progressRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenAttachmentDialog(item.no)}
                        className="hover:bg-gray-100 group-hover:hover:bg-orange-200"
                      >
                        <Paperclip className="w-4 h-4 text-gray-600 group-hover:text-orange-800" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

              {/* Footer Info */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div>
                  {searchQuery ? (
                    <>
                      検索結果: {filteredTitles.length} 件 / 全 {savedTitles.length} 件
                    </>
                  ) : (
                    <>全 {savedTitles.length} 件</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>ページ 1 / 1</span>
                </div>
              </div>
            </>
          )}
          </div>
        </main>
      )}

      {/* Copy Data Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <CopyDataForm onClose={() => setIsCopyDialogOpen(false)} />
      </Dialog>

      {/* Attachment Upload Dialog */}
      <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-lg">タイトルへの添付資料の編集画面です。</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            ファイルをアップロードして添付資料を追加します
          </DialogDescription>

          <div className="space-y-4 py-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    ここにファイルをドロップするか、クリックして選択してください
                  </p>
                  <Button variant="outline" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    ファイルを選択
                  </Button>
                </div>
              </div>
            </div>

            {/* File List Area */}
            <div className="border border-gray-200 rounded-lg p-4 min-h-[100px]">
              <p className="text-sm text-gray-500 text-center py-8">
                添付データのラベル
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <ManualEntryDialog 
        open={isManualEntryDialogOpen} 
        onOpenChange={setIsManualEntryDialogOpen}
        onSave={(data) => {
          console.log('Manual entry data:', data);
          // Handle save logic here
        }}
      />

      {/* Export Data Dialog */}
      <ExportDataDialog 
        open={isExportDialogOpen} 
        onOpenChange={setIsExportDialogOpen}
        totalCount={404}
      />

    </div>
  );
}