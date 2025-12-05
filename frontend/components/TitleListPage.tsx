import React, { useState, useEffect } from 'react';
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
    FileText,
    Image as ImageIcon,
    X,
    Loader2
} from 'lucide-react';
import { titleAPI, attachmentAPI, patentAPI } from '../services/api';
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

export function TitleListPage({ username, onLogout }: TitleListPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'copy', 'merge', 'search', 'dataSearch', 'admin', 'import', 'detail', 'company', 'titleManagement', 'patentDetails'
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
    const [isManualEntryDialogOpen, setIsManualEntryDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [selectedTitleForAttachment, setSelectedTitleForAttachment] = useState<string>('');
    const [selectedTitleForDetail, setSelectedTitleForDetail] = useState<{ no: string; name: string; responsible: string; responsibleId: string; id?: string } | null>(null);
    const [selectedTitleForImport, setSelectedTitleForImport] = useState<{ no: string; name: string } | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedCompanyCount, setSelectedCompanyCount] = useState<number>(0);
    const [selectedFilterInfo, setSelectedFilterInfo] = useState<{
        dateFilter: string;
        periodFilter: string;
        dateColumn?: string;
    } | undefined>(undefined);
    const [selectedTitleForManagement, setSelectedTitleForManagement] = useState<any>(null);
    const [savedTitles, setSavedTitles] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [titleToDelete, setTitleToDelete] = useState<any>(null);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
    const [selectedTitleForDataSearch, setSelectedTitleForDataSearch] = useState<any>(null);
    const [selectedTitleForManualEntry, setSelectedTitleForManualEntry] = useState<any>(null);

    // Fetch titles from API
    const fetchTitles = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching titles from API...');
            const result = await titleAPI.getAll();

            console.log('📦 API Result:', result);

            // Handle different response formats
            let apiTitles: any[] = [];

            if (result.data) {
                // Backend returns: { data: { titles: [...], total, page, limit } }
                // apiCall wraps it: { data: { data: { titles: [...], total, page, limit } } }

                // Case 1: result.data.data.titles (nested - expected format)
                if (result.data.data && result.data.data.titles) {
                    apiTitles = result.data.data.titles;
                    console.log('✅ Found titles in result.data.data.titles:', apiTitles.length);
                }
                // Case 2: result.data.titles (direct - if apiCall doesn't wrap)
                else if (result.data.titles && Array.isArray(result.data.titles)) {
                    apiTitles = result.data.titles;
                    console.log('✅ Found titles in result.data.titles:', apiTitles.length);
                }
                // Case 3: result.data is array directly
                else if (Array.isArray(result.data)) {
                    apiTitles = result.data;
                    console.log('✅ Found titles as array in result.data:', apiTitles.length);
                }
                // Case 4: result.data.data exists but no titles (empty or different structure)
                else if (result.data.data) {
                    console.log('⚠️ result.data.data exists but no titles field:', result.data.data);
                    // Try to extract titles if it's in a different format
                    if (result.data.data.titles) {
                        apiTitles = result.data.data.titles;
                    }
                }
            }

            if (apiTitles.length > 0) {
                // Map API response format → Frontend format (add id field)
                const transformedTitles = apiTitles.map((title: any) => ({
                    id: title.id,              // ✅ Add id for edit/delete operations
                    no: title.no,
                    title: title.title,
                    department: title.department || '',
                    responsible: title.responsible || '',
                    responsibleId: title.responsibleId || '',
                    dataCount: title.dataCount || 0,
                    evaluated: title.evaluated || 0,
                    notEvaluated: title.notEvaluated || 0,
                    trash: title.trash || 0,
                    progressRate: title.progressRate || 0,
                    date: title.date,
                    dataType: title.dataType || '特許',
                    attachments: title.attachments || 0,
                    markColor: title.markColor || '',
                    parentTitleId: title.parentTitleId,
                    parentTitle: title.parentTitle,
                }));

                console.log('✅ Transformed titles:', transformedTitles.length);

                // Sort titles: parent titles first, then child titles
                // Sort titles: Group children under their parents
                const organizeTitles = (titles: any[]) => {
                    // 1. Separate roots and potential children
                    const roots = titles.filter(t => !t.parentTitleId);
                    const children = titles.filter(t => t.parentTitleId);

                    // 2. Create a map of parentId -> children[] for faster lookup
                    const childrenMap = new Map<string, any[]>();
                    children.forEach(child => {
                        const pid = child.parentTitleId;
                        if (!childrenMap.has(pid)) {
                            childrenMap.set(pid, []);
                        }
                        childrenMap.get(pid)?.push(child);
                    });

                    // 3. Flatten the list: Root -> Children -> Next Root...
                    const result: any[] = [];

                    // We iterate through roots (which preserve the original sort order from API, e.g. createdAt desc)
                    roots.forEach(root => {
                        result.push(root);

                        // Check if this root has children
                        if (childrenMap.has(root.id)) {
                            const myChildren = childrenMap.get(root.id) || [];
                            // Sort children by No ascending (optional, but good for consistency)
                            myChildren.sort((a, b) => a.no.localeCompare(b.no));
                            result.push(...myChildren);
                        }
                    });

                    // 4. Handle orphans (children whose parent is not in the current list)
                    const processedIds = new Set(result.map(r => r.id));
                    const orphans = titles.filter(t => !processedIds.has(t.id));

                    return [...result, ...orphans];
                };

                const sortedTitles = organizeTitles(transformedTitles);

                console.log('✅ Sorted titles (parents first):', sortedTitles.length);
                setSavedTitles(sortedTitles);
            } else {
                console.warn('⚠️ No titles found in response');
                setSavedTitles([]);
            }

            if (result.error) {
                console.error('❌ API Error:', result.error);
                alert(`タイトルの取得に失敗しました: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error fetching titles:', error);
            alert(`タイトルの取得中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setSavedTitles([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch titles on component mount
    useEffect(() => {
        fetchTitles();
    }, []);

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

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setSearchQuery('');
        await fetchTitles();
        setIsRefreshing(false);
    };

    const handleSaveTitle = async (titleData: any) => {
        try {
            console.log('✅ Title created successfully, refreshing list...');
            await fetchTitles();
            setActiveTab('list');
        } catch (error) {
            console.error('Error refreshing titles:', error);
        }
    };

    const handleUpdateTitle = async (updatedTitleData: any) => {
        try {
            // Call API to update the title
            if (updatedTitleData.id) {
                await titleAPI.update(updatedTitleData.id, updatedTitleData);
                console.log('✅ Title updated in backend');
            }

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
        } catch (error) {
            console.error('Failed to update title:', error);
            // Optionally show an error message to the user
        }
    };

    const fetchAttachments = async (titleId: string) => {
        try {
            const result = await attachmentAPI.getAll(titleId);
            if (result.data) {
                // Handle nested data structure from API wrapper
                if (result.data.data && Array.isArray(result.data.data.attachments)) {
                    setAttachments(result.data.data.attachments);
                } else if (Array.isArray(result.data.attachments)) {
                    setAttachments(result.data.attachments);
                } else {
                    setAttachments([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch attachments:', error);
            setAttachments([]);
        }
    };

    const handleOpenAttachmentDialog = async (titleNo: string) => {
        setSelectedTitleForAttachment(titleNo);
        // Find the title ID from the title number
        const title = savedTitles.find(t => t.no === titleNo);
        if (title && title.id) {
            await fetchAttachments(title.id);
        }
        setIsAttachmentDialogOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const title = savedTitles.find(t => t.no === selectedTitleForAttachment);
        if (!title || !title.id) return;

        try {
            setIsUploading(true);
            const result = await attachmentAPI.upload(title.id, selectedFile);

            if (result.error) {
                throw new Error(result.error);
            }

            await fetchAttachments(title.id);
            // Refresh titles to update attachment count if needed
            fetchTitles();
            setSelectedFile(null); // Clear selection after success
        } catch (error: any) {
            console.error('Failed to upload attachment:', error);
            alert(`ファイルのアップロードに失敗しました: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseAttachmentDialog = () => {
        setIsAttachmentDialogOpen(false);
        setSelectedFile(null);
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        setAttachmentToDelete(attachmentId);
    };

    const confirmDeleteAttachment = async () => {
        if (!attachmentToDelete) return;

        const title = savedTitles.find(t => t.no === selectedTitleForAttachment);
        if (!title || !title.id) return;

        try {
            await attachmentAPI.delete(attachmentToDelete);
            await fetchAttachments(title.id);
            // Refresh titles to update attachment count
            fetchTitles();
            setAttachmentToDelete(null);
        } catch (error) {
            console.error('Failed to delete attachment:', error);
            alert('ファイルの削除に失敗しました');
        }
    };

    const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
        const result = await attachmentAPI.download(attachmentId, filename);
        if (result.error) {
            console.error('Failed to download attachment:', result.error);
            alert('ファイルのダウンロードに失敗しました');
        }
    };

    const handleOpenDetailPage = (no: string, title: string, responsible: string, responsibleId: string, id: string) => {
        setSelectedTitleForDetail({ no, name: title, responsible, responsibleId, id });
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
                selectedTitleForImport ? (
                    <ImportDataPage
                        onBack={() => {
                            setActiveTab('list');
                            setSelectedTitleForImport(null);
                        }}
                        titleNo={selectedTitleForImport.no}
                    />
                ) : (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <p className="text-lg text-gray-600 mb-4">インポートするタイトルを選択してください</p>
                            <Button onClick={() => setActiveTab('list')}>一覧に戻る</Button>
                        </div>
                    </div>
                )
            ) : activeTab === 'detail' && selectedTitleForDetail ? (
                <TitleDetailPage
                    titleNo={selectedTitleForDetail.no}
                    titleName={selectedTitleForDetail.name}
                    titleId={selectedTitleForDetail.id}
                    onBack={() => setActiveTab('list')}
                    onViewPatentDetails={(companyName, totalCount, titleData, filterInfo) => {
                        setSelectedCompany(companyName);
                        setSelectedCompanyCount(totalCount);
                        setSelectedFilterInfo(filterInfo);
                        if (titleData) {
                            setSelectedTitleForDetail({
                                no: titleData.titleNo,
                                name: titleData.titleName,
                                responsible: selectedTitleForDetail.responsible,
                                responsibleId: selectedTitleForDetail.responsibleId,
                                id: selectedTitleForDetail.id
                            });
                        }
                        setActiveTab('patentDetails');
                    }}
                />
            ) : activeTab === 'patentDetails' && selectedTitleForDetail ? (
                <PatentDetailListPage
                    titleNo={selectedTitleForDetail.no}
                    titleName={selectedTitleForDetail.name}
                    titleId={selectedTitleForDetail.id}
                    responsible={selectedTitleForDetail.responsible}
                    responsibleId={selectedTitleForDetail.responsibleId}
                    companyName={selectedCompany}
                    totalCount={selectedCompanyCount}
                    onBack={() => setActiveTab('detail')}
                    filterInfo={selectedFilterInfo}
                    onEvaluationSaved={() => {
                        console.log('Evaluation saved, refreshing titles...');
                        fetchTitles();
                    }}
                />
            ) : (
                <main className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {activeTab === 'create' ? (
                            <CreateTitleForm onBack={() => setActiveTab('list')} onSave={handleSaveTitle} />
                        ) : activeTab === 'copy' ? (
                            <CopyDataForm onClose={() => setActiveTab('list')} />
                        ) : activeTab === 'merge' ? (
                            <MergeDataForm onBack={() => setActiveTab('list')} />
                        ) : activeTab === 'search' ? (
                            <TitleSearchForm onBack={() => setActiveTab('list')} />
                        ) : activeTab === 'dataSearch' ? (
                            <SavedDataSearchForm
                                onBack={() => {
                                    setActiveTab('list');
                                    setSelectedTitleForDataSearch(null);
                                }}
                                selectedTitle={selectedTitleForDataSearch}
                            />
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
                                                <TableHead className="w-[100px]">No</TableHead>
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
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={13} className="text-center py-8">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                                                            <span className="text-gray-500">読み込み中...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredTitles.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={13} className="text-center py-8">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <p className="text-gray-500">タイトルがありません</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleRefresh}
                                                                className="mt-2"
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                                再読み込み
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredTitles.map((item, index) => (
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
                                                                        onClick={() => {
                                                                            setSelectedTitleForManualEntry(item);
                                                                            setIsManualEntryDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <FilePlus className="w-4 h-4 mr-2" />
                                                                        1件ずつ手入力で追加
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer"
                                                                        onClick={() => {
                                                                            setSelectedTitleForImport({ no: item.no, name: item.title });
                                                                            setActiveTab('import');
                                                                        }}
                                                                    >
                                                                        <Upload className="w-4 h-4 mr-2" />
                                                                        データのインポート
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer"
                                                                        onClick={() => {
                                                                            setSelectedTitleForDataSearch(item);
                                                                            setActiveTab('dataSearch');
                                                                        }}
                                                                    >
                                                                        <SearchIcon className="w-4 h-4 mr-2" />
                                                                        保存データの検索
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                                        onClick={() => {
                                                                            setTitleToDelete(item);
                                                                            setShowDeleteDialog(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        このタイトルを削除
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                        <TableCell>{item.no}</TableCell>
                                                        <TableCell>
                                                            <button
                                                                onClick={() => handleOpenDetailPage(item.no, item.title, item.responsible, item.responsibleId, item.id)}
                                                                className="flex items-center gap-1 hover:text-orange-600 transition-colors w-full"
                                                            >
                                                                {/* Indent for child titles */}
                                                                {item.parentTitleId && (
                                                                    <span className="text-gray-400 text-sm mr-1 ml-6">└</span>
                                                                )}
                                                                {item.markColor && (
                                                                    <div
                                                                        className="w-1 h-6 rounded-full flex-shrink-0"
                                                                        style={{ backgroundColor: item.markColor }}
                                                                    />
                                                                )}
                                                                <span className="hover:underline text-left">
                                                                    {item.title}
                                                                </span>
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
                                                            {(item.dataCount > 0 || !item.title.includes('コピー')) && (
                                                                <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                                                                    {item.dataCount}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {(item.dataCount > 0 || !item.title.includes('コピー')) && (
                                                                <Badge className="bg-green-100 text-green-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                                                                    {item.evaluated}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {(item.dataCount > 0 || !item.title.includes('コピー')) && (
                                                                <Badge className="bg-orange-100 text-orange-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                                                                    {item.notEvaluated}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {(item.dataCount > 0 || !item.title.includes('コピー')) && (
                                                                <Badge className="bg-gray-100 text-gray-700 border-0 group-hover:bg-orange-200 group-hover:text-orange-800">
                                                                    {item.trash}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {(item.dataCount > 0 || !item.title.includes('コピー')) && (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-24 bg-gray-200 rounded-full h-2 group-hover:bg-orange-200">
                                                                        <div
                                                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full group-hover:from-orange-600 group-hover:to-yellow-600"
                                                                            style={{ width: `${item.progressRate}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm">{item.progressRate}%</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleOpenAttachmentDialog(item.no)}
                                                                className={`relative hover:bg-gray-100 group-hover:hover:bg-orange-200 ${item.attachments > 0 ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400 hover:text-gray-600'
                                                                    }`}
                                                            >
                                                                {item.attachments > 0 ? (
                                                                    <>
                                                                        <FileText className="w-4 h-4" />
                                                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-white">
                                                                            {item.attachments}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <Paperclip className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="text-center">{item.date}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
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
                </main >
            )
            }

            {/* Copy Data Dialog */}
            <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                <CopyDataForm onClose={() => setIsCopyDialogOpen(false)} />
            </Dialog>

            {/* Attachment Upload Dialog */}
            <Dialog open={isAttachmentDialogOpen} onOpenChange={handleCloseAttachmentDialog}>
                <DialogContent className="max-w-3xl bg-white border-0 shadow-2xl">
                    <DialogHeader className="border-b border-gray-100 pb-4">
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            添付資料の管理
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            タイトルに関連する資料をアップロード・管理します
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        {/* Upload Area */}
                        {/* Upload Area */}
                        <div className="relative bg-gradient-to-br from-orange-50/50 to-white border-2 border-dashed border-orange-200 rounded-xl p-8 transition-all hover:border-orange-400 hover:shadow-md group">
                            {!selectedFile && (
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    style={{ opacity: 0 }}
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            )}
                            <div className="flex flex-col items-center justify-center gap-4">
                                {!selectedFile ? (
                                    <>
                                        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
                                            <Upload className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-base font-medium text-gray-700 mb-1">
                                                ファイルをドラッグ＆ドロップ
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full max-w-md">
                                        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedFile(null)}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        <div className="flex justify-center gap-3">
                                            <Button
                                                onClick={handleUpload}
                                                disabled={isUploading}
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 shadow-lg shadow-orange-200"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        アップロード中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        添付する
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setSelectedFile(null)}
                                                disabled={isUploading}
                                                className="hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                キャンセル
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* File List Area */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                添付ファイル一覧
                                <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {attachments.length}件
                                </span>
                            </h3>

                            <div className="bg-gray-50/50 rounded-xl border border-gray-200 min-h-[150px] p-4">
                                {attachments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-8 text-gray-400">
                                        <FileText className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm">添付ファイルはありません</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {attachments.map((file) => (
                                            <div key={file.id} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${file.mimeType?.startsWith('image/')
                                                        ? 'bg-orange-50 border-orange-100'
                                                        : 'bg-orange-50 border-orange-100'
                                                        }`}>
                                                        {file.mimeType?.startsWith('image/') ? (
                                                            <ImageIcon className="w-5 h-5 text-orange-600" />
                                                        ) : (
                                                            <FileText className="w-5 h-5 text-orange-600" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate mb-0.5">
                                                            {file.originalName}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span>{(parseInt(file.size) / 1024).toFixed(1)} KB</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDownloadAttachment(file.id, file.originalName)}
                                                        className="h-9 w-9 p-0 rounded-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                        title="ダウンロード"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteAttachment(file.id)}
                                                        className="h-9 w-9 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        title="削除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manual Entry Dialog */}
            {/* Manual Entry Dialog */}
            <ManualEntryDialog
                open={isManualEntryDialogOpen}
                onOpenChange={(open) => {
                    setIsManualEntryDialogOpen(open);
                    if (!open) setSelectedTitleForManualEntry(null);
                }}
                onSave={async (data) => {
                    if (!selectedTitleForManualEntry) return;

                    try {
                        const patentData = {
                            ...data,
                            titleId: selectedTitleForManualEntry.id,
                            documentNum: data.documentNo,
                            applicationNum: data.applicationNo,
                            publicationNum: data.publicationNo,
                            registrationNum: data.registrationNo,
                            announcementNum: data.announcementNo,
                            appealNum: data.appealNo,
                            inventionTitle: data.inventionName,
                            applicantName: [data.applicantName, data.applicantName1, data.applicantName2, data.applicantName3].filter(Boolean).join('; '),
                            otherInfo: data.other,
                            statusStage: data.stage,
                            eventDetail: data.event,
                            fiClassification: data.ipc,
                            abstract: data.abstract,
                            claims: data.claims,
                            // Map dates if they are valid strings, otherwise null or leave as string if backend handles it
                            applicationDate: data.applicationDate ? new Date(data.applicationDate) : null,
                            publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
                        };

                        const result = await patentAPI.create(patentData);
                        if (result.error) {
                            alert(`エラー: ${result.error}`);
                        } else {
                            alert('データを保存しました。');
                            fetchTitles(); // Refresh to update counts
                        }
                    } catch (error) {
                        console.error('Save error:', error);
                        alert('保存中にエラーが発生しました。');
                    }
                }}
            />

            {/* Delete Attachment Confirmation Dialog */}
            <Dialog open={!!attachmentToDelete} onOpenChange={(open) => !open && setAttachmentToDelete(null)}>
                <DialogContent className="max-w-sm bg-white border-0 shadow-xl rounded-2xl">
                    <DialogHeader className="pb-2">
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-orange-500" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-gray-900 text-center">
                                添付ファイルの削除
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-center text-gray-500 pt-2">
                            このファイルを削除してもよろしいですか？<br />
                            この操作は取り消せません。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center gap-3 pt-4 pb-2">
                        <Button
                            variant="outline"
                            onClick={() => setAttachmentToDelete(null)}
                            className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            キャンセル
                        </Button>
                        <Button
                            onClick={confirmDeleteAttachment}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 border-0"
                        >
                            削除する
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md border-2 border-orange-200">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-base">タイトルを削除</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-sm text-gray-700 mb-3">
                            以下のタイトルを削除してもよろしいですか？
                        </p>

                        {titleToDelete && (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {titleToDelete.no}：{titleToDelete.titleName || titleToDelete.title}
                                    </p>
                                </div>
                                {titleToDelete.dataType && (
                                    <p className="text-xs text-gray-600 mt-1 ml-6">
                                        {titleToDelete.dataType}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
                            <p className="text-xs text-yellow-800">
                                ⚠️ このタイトルに関連する特許データ、評価、添付ファイルもすべて削除されます。
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setTitleToDelete(null);
                            }}
                            className="border-2"
                        >
                            キャンセル
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!titleToDelete) return;

                                try {
                                    const idOrNo = titleToDelete.id || titleToDelete.no;
                                    console.log('Deleting title:', idOrNo);

                                    const res = await titleAPI.delete(String(idOrNo));

                                    if (res.error) {
                                        console.error('Failed to delete title:', res.error);
                                    } else {
                                        await fetchTitles();
                                        setShowDeleteDialog(false);
                                        setTitleToDelete(null);
                                    }
                                } catch (err) {
                                    console.error('Error deleting title:', err);
                                }
                            }}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            削除する
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div >
    );
}
