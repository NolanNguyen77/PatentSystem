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
    Loader2,
    BarChart3,
    FileDigit,
    Percent,
    Layers,
    Database,
    Copy,
    Search as MagnifyingGlass,
    ChevronDown,
    ShieldCheck,
    Languages,
    Palette,
    Eye,
    LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { titleAPI, attachmentAPI, patentAPI } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
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
import { SettingsPage } from './SettingsPage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { notifySuccess, notifyError, notifyWarning, notifyInfo } from '../utils/notifications';
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
    isViewOnly?: boolean;
}



const MotionTableRow = motion(TableRow);

export function TitleListPage({ username, onLogout, isViewOnly = false }: TitleListPageProps) {
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
    const [settingsInitialTab, setSettingsInitialTab] = useState('profile');
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
    const [selectedTitleForExport, setSelectedTitleForExport] = useState<any>(null);
    const [exportPatents, setExportPatents] = useState<any[]>([]);
    const [isLoadingExportPatents, setIsLoadingExportPatents] = useState(false);

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
                    mainOwnerId: title.mainOwnerId || title.main_owner_id, // Added for permissions check
                    titleUsers: title.titleUsers || [],
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
                notifyError('タイトル取得エラー', result.error);
            }
        } catch (error) {
            console.error('❌ Error fetching titles:', error);
            notifyError('タイトル取得エラー', error instanceof Error ? error.message : '不明なエラー');
            setSavedTitles([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch titles on component mount
    useEffect(() => {
        // If view-only mode, load sample data instead of calling API
        if (isViewOnly) {
            console.log('👁️ View-Only Mode: Loading sample data...');
            const sampleData = [
                {
                    id: 'sample-1',
                    no: 'T2025-001',
                    title: '【サンプル】次世代バッテリー技術特許',
                    department: '研究開発部',
                    responsible: '山田太郎',
                    responsibleId: 'yamada',
                    dataCount: 156,
                    evaluated: 89,
                    notEvaluated: 67,
                    trash: 0,
                    progressRate: 57,
                    date: '2025/12',
                    dataType: '特許',
                    attachments: 3,
                    markColor: '#3b82f6',
                    parentTitleId: null,
                    titleUsers: []
                },
                {
                    id: 'sample-2',
                    no: 'T2025-002',
                    title: '【サンプル】AI画像認識システム特許',
                    department: 'AI研究室',
                    responsible: '鈴木花子',
                    responsibleId: 'suzuki',
                    dataCount: 234,
                    evaluated: 198,
                    notEvaluated: 36,
                    trash: 0,
                    progressRate: 85,
                    date: '2025/11',
                    dataType: '特許',
                    attachments: 5,
                    markColor: '#22c55e',
                    parentTitleId: null,
                    titleUsers: []
                },
                {
                    id: 'sample-3',
                    no: 'T2025-003',
                    title: '【サンプル】量子コンピューティング基礎研究',
                    department: '先端技術部',
                    responsible: '佐藤次郎',
                    responsibleId: 'sato',
                    dataCount: 78,
                    evaluated: 45,
                    notEvaluated: 33,
                    trash: 0,
                    progressRate: 58,
                    date: '2025/10',
                    dataType: '論文',
                    attachments: 2,
                    markColor: '#9333ea',
                    parentTitleId: null,
                    titleUsers: []
                },
                {
                    id: 'sample-4',
                    no: 'T2025-004',
                    title: '【サンプル】自動運転車センサー技術',
                    department: 'モビリティ開発',
                    responsible: '田中美咲',
                    responsibleId: 'tanaka',
                    dataCount: 312,
                    evaluated: 312,
                    notEvaluated: 0,
                    trash: 0,
                    progressRate: 100,
                    date: '2025/09',
                    dataType: '特許',
                    attachments: 8,
                    markColor: '#f97316',
                    parentTitleId: null,
                    titleUsers: []
                },
                {
                    id: 'sample-5',
                    no: 'T2025-005',
                    title: '【サンプル】再生可能エネルギー変換装置',
                    department: '環境技術部',
                    responsible: '高橋健一',
                    responsibleId: 'takahashi',
                    dataCount: 145,
                    evaluated: 72,
                    notEvaluated: 73,
                    trash: 0,
                    progressRate: 50,
                    date: '2025/08',
                    dataType: '特許',
                    attachments: 4,
                    markColor: '#ec4899',
                    parentTitleId: null,
                    titleUsers: []
                }
            ];
            setSavedTitles(sampleData);
            setIsLoading(false);
            console.log('✅ Sample data loaded:', sampleData.length, 'titles');
        } else {
            fetchTitles();
        }
        console.log('🍊 Orange Dashboard Loaded');
    }, [isViewOnly]);

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

    // Export タイトル一覧 to CSV
    const handleExportTitleList = () => {
        if (filteredTitles.length === 0) {
            notifyWarning('出力するデータがありません');
            return;
        }

        // Create CSV content with BOM for Excel compatibility
        const BOM = '\uFEFF';

        // Header row matching the image layout
        const headers = [
            'タイトルNo',
            'タイトル名',
            '部署名',
            '主担当者',
            '対象件数',
            '評価済',
            '未評価',
            'ゴミ箱',
            '調査進捗率',
            '作成年月'
        ].join(',');

        // Data rows
        const rows = filteredTitles.map(item => {
            const progressPercent = item.progressRate || 0;

            // Format date (YYYY/MM)
            const formattedDate = item.date ? item.date.slice(0, 7).replace('-', '/') : '';

            const rowData = [
                item.no || '',
                item.title || '',
                item.department || '',
                item.responsible || '',
                item.dataCount || 0,
                item.evaluated || 0,
                item.notEvaluated || 0,
                item.trash || 0,
                `${progressPercent}%`,
                formattedDate
            ];

            // Escape and format each value
            return rowData.map(value => {
                const strValue = String(value);
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',');
        });

        const csvContent = BOM + 'タイトル一覧表\n\n' + headers + '\n' + rows.join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `タイトル一覧_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Exported', filteredTitles.length, 'titles to CSV');
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
            notifyError('アップロード失敗', error.message || '不明なエラー');
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
            notifyError('ファイルの削除に失敗しました');
        }
    };

    const handleDownloadAttachment = async (attachmentId: string, filename: string) => {
        const result = await attachmentAPI.download(attachmentId, filename);
        if (result.error) {
            console.error('Failed to download attachment:', result.error);
            notifyError('ファイルのダウンロードに失敗しました');
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

    const totalTitles = filteredTitles.length;
    const totalPatents = filteredTitles.reduce((acc, curr) => acc + (curr.dataCount || 0), 0);
    const avgProgress = totalTitles > 0
        ? Math.round(filteredTitles.reduce((acc, curr) => acc + (curr.progressRate || 0), 0) / totalTitles)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            {/* Floating Header */}
            {/* Dashboard Header - Clean White Style */}
            <div className="sticky top-4 z-50 w-full px-4 mb-8">
                <header className="container mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border-b-4 border-orange-500 relative flex items-center justify-between px-8 py-6 transition-all duration-300">

                        {/* Left: Brand */}
                        <div className="flex items-center gap-4 cursor-pointer group hover:opacity-90 transition-opacity" onClick={() => setActiveTab('list')}>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform z-10">
                                <Lightbulb className="w-8 h-8 text-white stroke-[2.5]" />
                            </div>
                            <span
                                className="text-3xl tracking-tight text-slate-800 drop-shadow-sm"
                                style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif', fontWeight: 800 }}
                            >
                                特許ナビ
                            </span>
                        </div>

                        {/* Center: Action Navigation - Forced Visible */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('create')}
                                disabled={isViewOnly}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium ${isViewOnly ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                            >
                                <FilePlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                作成
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCopyDialogOpen(true)}
                                disabled={isViewOnly}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium ${isViewOnly ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                            >
                                <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                コピー
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('merge')}
                                disabled={isViewOnly}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium ${isViewOnly ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                            >
                                <Layers className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                マージ
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab('search')}
                                disabled={isViewOnly}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium ${isViewOnly ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
                            >
                                <MagnifyingGlass className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                検索
                            </Button>
                        </div>

                        {/* Right: User Profile & Dropdown */}
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 bg-white hover:bg-green-50 px-4 py-2 rounded-full border border-gray-200 hover:border-green-200 transition-all cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-green-100">
                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center border border-green-200 group-hover:bg-green-200 transition-colors">
                                            <User className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="font-bold text-sm text-gray-800">{username}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8} className="w-52 p-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 !z-[9999]">
                                    <div className="space-y-1">
                                        <DropdownMenuItem
                                            className="w-full p-1.5 cursor-pointer group hover:bg-slate-50 focus:bg-slate-50 mb-0.5 transition-all duration-200 rounded-md outline-none"
                                            onClick={() => {
                                                setSettingsInitialTab('profile');
                                                setActiveTab('settings');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center transition-all duration-200 group-hover:bg-blue-100">
                                                    <User className="w-3.5 h-3.5 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">プロフィール</span>
                                            </div>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="w-full p-1.5 cursor-pointer group hover:bg-slate-50 focus:bg-slate-50 mb-0.5 transition-all duration-200 rounded-md outline-none"
                                            onClick={() => {
                                                setSettingsInitialTab('permissions');
                                                setActiveTab('settings');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-7 h-7 rounded-md bg-yellow-50 flex items-center justify-center transition-all duration-200 group-hover:bg-yellow-100">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">権限</span>
                                            </div>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="w-full p-1.5 cursor-pointer group hover:bg-slate-50 focus:bg-slate-50 mb-0.5 transition-all duration-200 rounded-md outline-none"
                                            onClick={() => {
                                                setSettingsInitialTab('appearance');
                                                setActiveTab('settings');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-7 h-7 rounded-md bg-pink-50 flex items-center justify-center transition-all duration-200 group-hover:bg-pink-100">
                                                    <Palette className="w-3.5 h-3.5 text-pink-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">外観</span>
                                            </div>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="w-full p-1.5 cursor-pointer group hover:bg-slate-50 focus:bg-slate-50 mb-0.5 transition-all duration-200 rounded-md outline-none"
                                            onClick={() => {
                                                setSettingsInitialTab('language');
                                                setActiveTab('settings');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center transition-all duration-200 group-hover:bg-green-100">
                                                    <Languages className="w-3.5 h-3.5 text-green-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">言語</span>
                                            </div>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="w-full p-1.5 cursor-pointer group hover:bg-slate-50 focus:bg-slate-50 mb-0.5 transition-all duration-200 rounded-md outline-none"
                                            onClick={() => {
                                                setSettingsInitialTab('profile');
                                                setActiveTab('settings');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:bg-slate-200">
                                                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">設定</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </div>
                                    <DropdownMenuSeparator className="my-1 bg-gray-100" />
                                    <DropdownMenuItem
                                        className="w-full p-1.5 cursor-pointer group hover:bg-red-50 focus:bg-red-50 transition-all duration-200 rounded-md outline-none"
                                        onClick={onLogout}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center transition-all duration-200 group-hover:bg-red-100">
                                                <LogOut className="w-3.5 h-3.5 text-red-600" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-red-700">ログアウト</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>
            </div>

            {/* View-Only Mode Banner */}
            {isViewOnly && (
                <div className="container mx-auto px-4 mb-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Eye className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-amber-800">閲覧モード</p>
                                    <p className="text-sm text-amber-600">現在、閲覧専用モードです。編集や操作を行うにはログインしてください。</p>
                                </div>
                            </div>
                            <Button
                                onClick={onLogout}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                ログイン
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation is removed, replaced by Dashboard Actions */}

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
                    {/* Dashboard Summary & Actions */}
                    {activeTab === 'list' && (
                        <div className="mb-8 space-y-6">
                            {/* Stats Cards */}
                            {/* Stats Cards - Flex Layout Force 3 Columns */}
                            {/* Stats Cards - Modern Grid Layout with Glow Effects */}
                            {/* Stats Cards - Flex Layout Force 3 Columns */}
                            {/* Stats Cards - Forced Separation and Rounding */}
                            <div className="flex flex-row w-full gap-6">
                                {/* Card 1: Saved Titles - Blue Theme */}
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="relative h-full bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50 border border-blue-50 group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-60 -z-10"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform duration-300">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-[10px] font-bold text-green-700">アクティブ</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-400 tracking-wide">保存タイトル数</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{totalTitles}</h3>
                                                <span className="text-sm font-semibold text-gray-400">タイトル</span>
                                            </div>
                                        </div>


                                    </div>
                                </motion.div>

                                {/* Card 2: Total Data - Green Theme */}
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="relative h-full bg-white rounded-2xl p-6 shadow-lg shadow-emerald-100/50 border border-emerald-50 group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-60 -z-10"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-300">
                                                <Database className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-emerald-700">合計</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-400 tracking-wide">総データ件数</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{totalPatents.toLocaleString()}</h3>
                                                <span className="text-sm font-semibold text-gray-400">アイテム</span>
                                            </div>
                                        </div>


                                    </div>
                                </motion.div>

                                {/* Card 3: Avg Progress - Purple Theme */}
                                <motion.div
                                    className="flex-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="relative h-full bg-white rounded-2xl p-6 shadow-lg shadow-purple-100/50 border border-purple-50 group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full opacity-60 -z-10"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform duration-300">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] font-bold text-purple-700">平均</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-400 tracking-wide">平均進捗率</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{avgProgress}<span className="text-2xl ml-0.5">%</span></h3>
                                            </div>
                                        </div>


                                    </div>
                                </motion.div>
                            </div>


                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
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
                        ) : activeTab === 'settings' ? (
                            <SettingsPage
                                username={username}
                                onBack={() => setActiveTab('list')}
                                initialTab={settingsInitialTab}
                                savedTitles={savedTitles}
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
                                    <Button variant="outline" className="h-12 border-2" onClick={handleExportTitleList}>
                                        <Download className="w-4 h-4 mr-2" />
                                        エクスポート
                                    </Button>
                                </div>

                                {/* Table Container with Sticky Header */}
                                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white ring-1 ring-gray-50">
                                    <div className="max-h-[70vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur shadow-sm">
                                                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                                    <TableHead className="w-[50px] text-center"></TableHead>
                                                    <TableHead className="w-[80px] text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">No</TableHead>
                                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">保存データタイトル</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">用途</TableHead>
                                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">部署名</TableHead>
                                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">主担当者</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">データ件数</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">評価済</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">未評価</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">ゴミ箱</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">評価進捗率</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">添付</TableHead>
                                                    <TableHead className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">保存年月</TableHead>
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
                                                        <MotionTableRow
                                                            key={item.id || index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all group"
                                                        >
                                                            <TableCell className="text-center">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            size="icon"
                                                                            disabled={isViewOnly}
                                                                            className={`h-8 w-8 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-md hover:shadow-lg transition-all duration-200 ${isViewOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            <Menu className="w-4 h-4" />
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
                                                                            onClick={async () => {
                                                                                setSelectedTitleForExport(item);
                                                                                setIsLoadingExportPatents(true);
                                                                                setIsExportDialogOpen(true);
                                                                                try {
                                                                                    const result = await patentAPI.getByTitle(item.id, { includeFullText: false });
                                                                                    const payload = result.data?.data ?? result.data ?? result;
                                                                                    const patentList = Array.isArray(payload?.patents) ? payload.patents : [];
                                                                                    setExportPatents(patentList);
                                                                                } catch (error) {
                                                                                    console.error('Failed to fetch patents for export:', error);
                                                                                    setExportPatents([]);
                                                                                } finally {
                                                                                    setIsLoadingExportPatents(false);
                                                                                }
                                                                            }}
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
                                                                        <span className="text-sm w-12 text-right tabular-nums">
                                                                            {Number.isInteger(item.progressRate) ? item.progressRate : item.progressRate?.toFixed(1)}%
                                                                        </span>
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
                                                        </MotionTableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
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
                            notifyError('エラー', result.error);
                        } else {
                            notifySuccess('データを保存しました');
                            fetchTitles(); // Refresh to update counts
                        }
                    } catch (error) {
                        console.error('Save error:', error);
                        notifyError('保存中にエラーが発生しました');
                    }
                }}
            />

            {/* Delete Attachment Confirmation Dialog */}
            <Dialog open={!!attachmentToDelete} onOpenChange={(open: boolean) => !open && setAttachmentToDelete(null)}>
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

            {/* Export Data Dialog */}
            <ExportDataDialog
                open={isExportDialogOpen}
                onOpenChange={(open) => {
                    setIsExportDialogOpen(open);
                    if (!open) {
                        setSelectedTitleForExport(null);
                        setExportPatents([]);
                    }
                }}
                totalCount={exportPatents.length}
                patents={exportPatents}
                isLoading={isLoadingExportPatents}
                titleName={selectedTitleForExport?.title || ''}
            />

        </div >
    );
}
