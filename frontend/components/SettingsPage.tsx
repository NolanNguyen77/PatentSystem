import { useState, useEffect } from 'react';
import { ArrowLeft, User, Shield, Palette, Languages, Save, Check, Mail, Building, Phone, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { userAPI } from '../services/api';

interface SettingsPageProps {
  onBack: () => void;
  username: string;
  initialTab?: string;
  savedTitles: any[];
}

export function SettingsPage({ onBack, username, initialTab = 'profile', savedTitles = [] }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    id: '',
    username: username,
    email: '',
    fullName: '',
    department: '',
    phone: '',
    role: 'User',
    lastLogin: '',
    createdAt: ''
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await userAPI.getAll();
        console.log('🔍 Raw API result:', result);

        // API returns: { data: { data: { users: [...] } } }
        // because backend sends { data: { users } } and apiCall wraps response in { data: response }
        const users = result.data?.data?.users || result.data?.users || [];
        console.log('👥 Extracted users:', users, 'Looking for:', username);

        if (users.length > 0) {
          // Find current user - API returns 'userId' property for login ID
          const currentUser = users.find((u: any) =>
            u.userId === username || u.name === username
          );

          if (currentUser) {
            console.log('✅ Found user profile:', currentUser);
            setProfileData({
              id: currentUser.id || '',
              username: currentUser.userId || username,
              email: currentUser.email || '',
              fullName: currentUser.name || '',
              department: currentUser.department || '',
              phone: currentUser.phone || '',
              role: currentUser.role || '一般',
              lastLogin: '今',
              createdAt: ''
            });
          } else {
            console.warn('⚠️ User not found. Available userIds:', users.map((u: any) => u.userId));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [username]);

  // Calculate stats from savedTitles
  const myTitlesCount = savedTitles.filter(t => t.responsible === username).length;
  const totalDataCount = savedTitles.reduce((acc, curr) => acc + (curr.dataCount || 0), 0);

  const [appearanceData, setAppearanceData] = useState({
    theme: 'light',
  });

  const [languageData, setLanguageData] = useState({
    language: 'ja',
    dateFormat: 'YYYY/MM/DD',
    timeZone: 'Asia/Tokyo',
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'プロフィール', icon: User, color: 'blue' },
    { id: 'permissions', label: '権限', icon: Shield, color: 'yellow' },
    { id: 'appearance', label: '外観', icon: Palette, color: 'pink' },
    { id: 'language', label: '言語', icon: Languages, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50">
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div className="flex-1">
                <h1 className="text-xl text-white">設定</h1>
                <p className="text-xs text-orange-100">アカウントとシステム設定を管理</p>
              </div>
              <Button
                onClick={handleSave}
                className="bg-white text-orange-600 hover:bg-orange-50 hover:-translate-y-1 transition-all duration-300"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    保存済み
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-0">
            {/* Sidebar */}
            <div className="col-span-3 bg-slate-50 border-r border-slate-200 p-4">
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const bgColors = {
                    blue: 'bg-blue-50 hover:bg-blue-100',
                    beta: 'bg-purple-50 hover:bg-purple-100', // Keep for compatibility if needed, but not used by tabs
                    yellow: 'bg-yellow-50 hover:bg-yellow-100',
                    pink: 'bg-pink-50 hover:bg-pink-100',
                    green: 'bg-green-50 hover:bg-green-100',
                  };
                  const textColors = {
                    blue: 'text-blue-600',
                    beta: 'text-purple-600',
                    yellow: 'text-yellow-600',
                    pink: 'text-pink-600',
                    green: 'text-green-600',
                  };
                  const activeBgColors = {
                    blue: 'bg-blue-100',
                    beta: 'bg-purple-100',
                    yellow: 'bg-yellow-100',
                    pink: 'bg-pink-100',
                    green: 'bg-green-100',
                  };

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 group ${isActive
                        ? `${activeBgColors[tab.color as keyof typeof activeBgColors]} shadow-sm -translate-y-0.5`
                        : `hover:bg-slate-100 hover:-translate-y-0.5`
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg ${bgColors[tab.color as keyof typeof bgColors]} flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                        <Icon className={`w-4 h-4 ${textColors[tab.color as keyof typeof textColors]}`} />
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="col-span-9 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl text-slate-900 mb-1">プロフィール設定</h2>
                    <p className="text-sm text-slate-500">個人情報とアカウント詳細を管理</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-sm">ユーザー名</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="username"
                          value={profileData.username}
                          readOnly
                          className="pl-9 h-10 bg-slate-50 border-slate-200 text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm">メールアドレス</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-9 h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          placeholder="未設定"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm">フルネーム</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="pl-9 h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          placeholder="未設定"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="department" className="text-sm">部署</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                          className="pl-9 h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          placeholder="未設定"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="phone" className="text-sm">電話番号</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="pl-9 h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                          placeholder="未設定"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-blue-100 rounded-lg p-3 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-blue-600 mb-0.5">作成タイトル</p>
                        <p className="text-2xl text-blue-700 font-bold">{myTitlesCount}</p>
                      </div>
                    </div>
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-green-100 rounded-lg p-3 group-hover:border-green-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-green-600 mb-0.5">総データ件数</p>
                        <p className="text-2xl text-green-700 font-bold">{totalDataCount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-purple-100 rounded-lg p-3 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-purple-600 mb-0.5">最終ログイン</p>
                        <p className="text-2xl text-purple-700 font-bold">{profileData.lastLogin || '今'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl text-slate-900 mb-1">権限設定</h2>
                    <p className="text-sm text-slate-500">アクセス権限とセキュリティオプション</p>
                  </div>

                  {/* 1. Global Permission Card */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-yellow-800">システム権限: {profileData.role === '管理者' ? '管理者 (Admin)' : '一般ユーザー (User)'}</h3>
                        <p className="text-xs text-yellow-700 mt-1">
                          現在のログインアカウント（{profileData.username}）に割り当てられている基本権限です。
                          {profileData.role === '管理者' ? ' すべての機能にアクセス可能です。' : ' 標準的な機能のみ利用可能です。'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Permission Per Title Table */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      タイトル別アクセス権限
                    </h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="w-[100px]">No</TableHead>
                            <TableHead>タイトル名</TableHead>
                            <TableHead className="w-[100px] text-center">主担当</TableHead>
                            <TableHead className="w-[150px] text-center">権限</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {savedTitles.map((title) => {
                            // Find user permission in titleUsers
                            const userPermission = title.titleUsers?.find((tu: any) => tu.userId === profileData.id);

                            // Check if user is 主担当
                            const isMainResponsible = userPermission?.isMainResponsible || false;

                            // Determine permission role (only 3 options + 未指定)
                            let roleName = '未指定';
                            let badgeClass = 'bg-gray-50 text-gray-500 border-gray-200';

                            if (userPermission) {
                              if (userPermission.isAdmin) {
                                roleName = '管理者';
                                badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';
                              } else if (userPermission.isGeneral) {
                                roleName = '一般';
                                badgeClass = 'bg-green-50 text-green-700 border-green-200';
                              } else if (userPermission.isViewer) {
                                roleName = '閲覧';
                                badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                              }
                            }

                            return (
                              <TableRow key={title.id || title.no}>
                                <TableCell className="font-medium">{title.no}</TableCell>
                                <TableCell>{title.titleName || title.title}</TableCell>
                                <TableCell className="text-center">
                                  {isMainResponsible ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-300 font-semibold">True</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">False</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant="outline"
                                    className={`${badgeClass} whitespace-nowrap`}
                                  >
                                    {roleName}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {savedTitles.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                タイトルがありません
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl text-slate-900 mb-1">外観設定</h2>
                    <p className="text-sm text-slate-500">テーマモードの選択</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="theme" className="text-sm">テーマ</Label>
                      <Select value={appearanceData.theme} onValueChange={(value) => setAppearanceData({ ...appearanceData, theme: value })}>
                        <SelectTrigger className="h-10 border-2 hover:border-pink-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">ライトモード</SelectItem>
                          <SelectItem value="dark">ダークモード</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Theme Preview */}
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 mb-3">プレビュー</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAppearanceData({ theme: 'light' })}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${appearanceData.theme === 'light' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200'
                            }`}
                        >
                          <div className="aspect-video bg-white p-4">
                            <div className="space-y-2">
                              <div className="h-2 w-3/4 bg-slate-300 rounded"></div>
                              <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium text-slate-700">
                            ライト
                          </div>
                        </button>

                        <button
                          onClick={() => setAppearanceData({ theme: 'dark' })}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${appearanceData.theme === 'dark' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200'
                            }`}
                        >
                          <div className="aspect-video bg-slate-900 p-4">
                            <div className="space-y-2">
                              <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
                              <div className="h-2 w-1/2 bg-slate-800 rounded"></div>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-slate-900 px-2 py-1 rounded text-xs font-medium text-white">
                            ダーク
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl text-slate-900 mb-1">言語設定</h2>
                    <p className="text-sm text-slate-500">言語、地域、フォーマット設定</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="language" className="text-sm">表示言語</Label>
                      <Select value={languageData.language} onValueChange={(value) => setLanguageData({ ...languageData, language: value })}>
                        <SelectTrigger className="h-10 border-2 hover:border-green-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dateFormat" className="text-sm">日付形式</Label>
                      <Select value={languageData.dateFormat} onValueChange={(value) => setLanguageData({ ...languageData, dateFormat: value })}>
                        <SelectTrigger className="h-10 border-2 hover:border-green-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="timeZone" className="text-sm">タイムゾーン</Label>
                      <Select value={languageData.timeZone} onValueChange={(value) => setLanguageData({ ...languageData, timeZone: value })}>
                        <SelectTrigger className="h-10 border-2 hover:border-green-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language Info */}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Languages className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900 mb-1">現在の設定</p>
                            <p className="text-xs text-green-700">言語: 日本語 • タイムゾーン: JST • 日付: {new Date().toLocaleDateString('ja-JP')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}