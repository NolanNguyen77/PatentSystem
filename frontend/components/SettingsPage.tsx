import { useState } from 'react';
import { ArrowLeft, User, Shield, Palette, Languages, Save, Check } from 'lucide-react';
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

interface SettingsPageProps {
  onBack: () => void;
  username: string;
}

export function SettingsPage({ onBack, username }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    username: username,
    email: 'nguyen@example.com',
    fullName: 'グエン・タン',
    department: '調査力部所',
    phone: '+81 90-1234-5678',
  });

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
    { id: 'permissions', label: '権限', icon: Shield, color: 'purple' },
    { id: 'appearance', label: '外観', icon: Palette, color: 'pink' },
    { id: 'language', label: '言語', icon: Languages, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20">
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
                    purple: 'bg-purple-50 hover:bg-purple-100',
                    pink: 'bg-pink-50 hover:bg-pink-100',
                    green: 'bg-green-50 hover:bg-green-100',
                  };
                  const textColors = {
                    blue: 'text-blue-600',
                    purple: 'text-purple-600',
                    pink: 'text-pink-600',
                    green: 'text-green-600',
                  };
                  const activeBgColors = {
                    blue: 'bg-blue-100',
                    purple: 'bg-purple-100',
                    pink: 'bg-pink-100',
                    green: 'bg-green-100',
                  };

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 group ${
                        isActive 
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
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm">フルネーム</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="department" className="text-sm">部署</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="phone" className="text-sm">電話番号</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="h-10 border-2 hover:border-orange-300 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-blue-100 rounded-lg p-3 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-blue-600 mb-0.5">作成タイトル</p>
                        <p className="text-2xl text-blue-700">12</p>
                      </div>
                    </div>
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-green-100 rounded-lg p-3 group-hover:border-green-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-green-600 mb-0.5">登録データ</p>
                        <p className="text-2xl text-green-700">245</p>
                      </div>
                    </div>
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white border-2 border-purple-100 rounded-lg p-3 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-300">
                        <p className="text-xs text-purple-600 mb-0.5">最終ログイン</p>
                        <p className="text-base text-purple-700">2時間前</p>
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

                  <div className="space-y-3">
                    {[
                      { label: 'タイトル作成', description: '新しいタイトルを作成する権限', enabled: true },
                      { label: 'データ編集', description: '既存データを編集する権限', enabled: true },
                      { label: 'データ削除', description: 'データを削除する権限', enabled: false },
                      { label: 'エクスポート', description: 'データをエクスポートする権限', enabled: true },
                      { label: '管理者機能', description: 'システム管理者の機能にアクセス', enabled: false },
                    ].map((permission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-300 group">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-purple-700 transition-colors">{permission.label}</p>
                          <p className="text-xs text-slate-500">{permission.description}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          permission.enabled 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {permission.enabled ? '有効' : '無効'}
                        </div>
                      </div>
                    ))}
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
                      <Select value={appearanceData.theme} onValueChange={(value) => setAppearanceData({...appearanceData, theme: value})}>
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
                          onClick={() => setAppearanceData({theme: 'light'})}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            appearanceData.theme === 'light' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200'
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
                          onClick={() => setAppearanceData({theme: 'dark'})}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            appearanceData.theme === 'dark' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200'
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
                      <Select value={languageData.language} onValueChange={(value) => setLanguageData({...languageData, language: value})}>
                        <SelectTrigger className="h-10 border-2 hover:border-green-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dateFormat" className="text-sm">日付形式</Label>
                      <Select value={languageData.dateFormat} onValueChange={(value) => setLanguageData({...languageData, dateFormat: value})}>
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
                      <Select value={languageData.timeZone} onValueChange={(value) => setLanguageData({...languageData, timeZone: value})}>
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