import { Lightbulb, Search, FileText, TrendingUp, Users, Shield, Zap, ArrowRight, Check, Menu, X, Database, Lock, Globe, BarChart3, Sparkles, Rocket, Building, Copy, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigateToLogin: () => void;
  onNavigateToViewOnly?: () => void;
}

export function HomePage({ onNavigateToLogin, onNavigateToViewOnly }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'タイトル管理',
      description: '保存タイトルの作成・コピー・マージが可能。親子関係でタイトルを整理し、年月週別に分類できます。',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      icon: Database,
      title: '案件データ管理',
      description: '特許・実用新案・意匠・商標・論文など多様なデータタイプに対応。出願日、公開日、登録日で自動分類。',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: TrendingUp,
      title: 'CSV入出力',
      description: '既存の特許データをCSVから簡単にインポート。評価結果やリストをCSV/Excelで出力可能。',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: '担当者分担',
      description: '主担当・タイトル管理者・担当者の役割分担が可能。権限に応じた閲覧・編集・評価の制御。',
      gradient: 'from-orange-400 to-yellow-500'
    },
    {
      icon: Check,
      title: '評価管理',
      description: '特許案件ごとに評価ステータスを管理。複数評価者による評価と進捗率の可視化。',
      gradient: 'from-slate-600 to-slate-800'
    },
    {
      icon: Search,
      title: '検索・マージ',
      description: '番号検索・条件検索に対応。複数タイトルから評価済み案件を選択してマージ可能。',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const benefits = [
    {
      icon: Database,
      title: '一元管理',
      description: '分散した案件データを一箇所で管理',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: '進捗可視化',
      description: '評価状況と進捗率をリアルタイム表示',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Users,
      title: '権限管理',
      description: '役割に応じたアクセス権限の設定',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      icon: FileText,
      title: 'データ分類',
      description: '年月週・データタイプ別に自動分類',
      color: 'text-slate-700',
      bg: 'bg-slate-50'
    }
  ];

  // Plans array - Chưa công bố giá chính thức
  const plans: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50">
      {/* Header - Same style as TitleListPage */}
      <div className="sticky top-4 z-50 w-full px-4 mb-8">
        <header className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-b-4 border-orange-500 relative flex items-center justify-between px-8 py-6 transition-all duration-300">

            {/* Left: Brand */}
            <div className="flex items-center gap-4 cursor-pointer group hover:opacity-90 transition-opacity">
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

            {/* Center: Navigation Menu */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="#features"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>作成</span>
              </a>
              <a
                href="#copy"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium"
              >
                <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>コピー</span>
              </a>
              <a
                href="#merge"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium"
              >
                <Layers className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>マージ</span>
              </a>
              <a
                href="#search"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-[15px] font-medium"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>検索</span>
              </a>
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onNavigateToLogin}
                variant="ghost"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-1 transition-all duration-300 hidden md:flex font-semibold"
              >
                ログイン
              </Button>
              <Button
                onClick={onNavigateToViewOnly}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 font-semibold group"
              >
                <span className="relative z-10">閲覧</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Hero Section - 2 Columns */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Column - Text Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 border border-slate-200 mb-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <Sparkles className="w-5 h-5 text-slate-600" />
                <span className="text-base text-slate-700 font-semibold">特許・知的財産データ管理システム</span>
              </div>

              {/* Main Title with Highlight */}
              <h1 className="text-6xl lg:text-7xl font-bold mb-8 text-slate-900 leading-tight tracking-tight">
                特許データを
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  スマートに管理
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                保存タイトルの作成・コピー・マージ、担当者の分担管理、評価ステータスの追跡など、特許データ管理に必要な機能を一元化。
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-16 px-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 text-lg group hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-2 transition-all duration-300 rounded-xl font-semibold flex items-center justify-center relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    サービス
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-16 px-10 !border-2 !border-slate-900 text-slate-700 hover:bg-slate-50 hover:!border-slate-900 hover:-translate-y-2 hover:shadow-lg text-lg transition-all duration-300 rounded-xl font-semibold group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    デモを見る
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
            </div>

            {/* Right Column - Dashboard Mockup */}
            <div className="relative">
              {/* Floating Cards Stack */}
              <div className="relative group">
                {/* Main Dashboard Card */}
                <div className="bg-amber-50/60 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-100/50 p-6 relative z-10 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 cursor-pointer">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-600 font-medium">J-PlatPat連携</span>
                      </div>
                      <h3 className="text-lg text-slate-900 font-bold">特許分析ダッシュボード</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-bold mb-1">リアルタイム</div>
                      <div className="text-xs text-slate-500">データ同期中</div>
                    </div>
                  </div>

                  {/* Mini Chart - 年別出願件数 */}
                  <div className="mb-6">
                    <div className="text-xs text-slate-500 mb-2">年別特許出願件数トレンド</div>
                    <div className="h-32 flex items-end gap-2">
                      {[45, 52, 68, 75, 82, 70, 88, 95, 78, 92, 85, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Grid - マクロデータ */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-semibold">検索件数</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">50K+</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 hover:shadow-md hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-700 font-semibold">評価済み</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900">12.5K</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 hover:shadow-md hover:-translate-y-1 hover:border-green-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-semibold">分析精度</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">98.5%</div>
                    </div>
                  </div>

                  {/* Notification Badge */}
                  <div className="mt-4 bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-orange-900 font-semibold mb-1">大量データ処理対応</div>
                      <div className="text-xs text-orange-700">1回のインポートで最大10,000件</div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge - Top Right */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-200 z-20 hover:shadow-xl hover:-translate-y-1 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">対応国</div>
                      <div className="text-sm text-slate-900 font-bold">日本・国際PCT</div>
                    </div>
                  </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-4">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-800 font-semibold">機能一覧</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              すべての機能が<span className="text-slate-900">揃っています</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              特許管理に必要なすべての機能を、直感的なインターフェースでご提供します
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white border-2 border-slate-100 rounded-2xl p-6 hover:border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-md`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-slate-900 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-semibold">選ばれる理由</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              なぜ<span className="text-slate-900">特許ナビ</span>なのか
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              企業の知的財産管理を次のレベルへ導く、信頼のプラットフォーム
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`relative group cursor-pointer`}>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/30 to-slate-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className={`relative bg-white rounded-2xl p-6 border-2 ${benefit.bg.replace('bg-', 'border-').replace('-50', '-200')} group-hover:border-opacity-100 border-opacity-50 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 h-full flex flex-col`}>
                  <div className={`w-14 h-14 rounded-xl ${benefit.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${benefit.color}`}>{benefit.title}</h4>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* パワフルな機能 Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
                <Rocket className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800 font-semibold">パワフルな機能</span>
              </div>
              <h3 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">
                特許データを<br />
                <span className="text-slate-900">
                  効率的に管理
                </span>
              </h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                保存タイトルの作成からデータのインポート、評価管理まで、特許管理業務に必要な機能をワンストップで提供します。
              </p>

              {/* Check List */}
              <div className="space-y-4">
                {[
                  { text: 'タイトルの作成・コピー・マージ', icon: FileText },
                  { text: 'CSVデータのインポート・エクスポート', icon: TrendingUp },
                  { text: '担当者の分担と権限管理', icon: Users },
                  { text: '評価ステータスの追跡と進捗管理', icon: Check }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors duration-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <img
                src="/patent_analysis.jpg"
                alt="特許分析"
                className="relative rounded-3xl shadow-2xl w-full h-[400px] object-cover border-4 border-white group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* デモを見る Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-semibold">デモを見る</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              実際の<span className="text-slate-900">画面イメージ</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              特許ナビのダッシュボード画面をご覧ください
            </p>
          </div>

          {/* Demo Image */}
          <div className="relative group max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-3xl blur-3xl group-hover:blur-[40px] transition-all duration-500"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-100 group-hover:border-orange-200 transition-all duration-300">
              <img
                src="/demo.png"
                alt="特許ナビ デモ画面"
                className="w-full object-contain"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold">
              <Check className="w-5 h-5" />
              <span>タイトル一覧画面</span>
            </div>
          </div>
        </div>
      </section>

      {/* システムの特長 Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800 font-semibold">システムの特長</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              特許ナビの<span className="text-slate-900">独自機能</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              知的財産データ管理に特化した機能を搭載
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: 'タイトルの親子関係',
                description: 'メインタイトルから派生タイトルを作成し、階層構造で整理。関連データを一括管理できます。',
              },
              {
                icon: Copy,
                title: 'コピー＆マージ',
                description: '既存タイトルのコピー作成、複数タイトルから評価済み案件を選択してマージ可能。',
              },
              {
                icon: Users,
                title: '権限ベースの管理',
                description: '主担当・タイトル管理者・担当者の3段階権限。役割に応じた閲覧・編集・評価の制御。',
              }
            ].map((feature, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed flex-grow">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* データ対応種別 Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-semibold">対応データタイプ</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              多様な<span className="text-slate-900">知的財産データ</span>に対応
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              特許だけでなく、様々な知的財産関連データを一元管理できます
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { badge: '特許', description: '発明・技術を保護', color: 'from-blue-500 to-cyan-600' },
              { badge: '実用新案', description: '実用的な考案を保護', color: 'from-green-500 to-emerald-600' },
              { badge: '意匠', description: 'デザインを保護', color: 'from-orange-500 to-amber-600' },
              { badge: '商標', description: 'ブランドを保護', color: 'from-pink-500 to-rose-600' },
              { badge: '論文', description: '学術研究データ', color: 'from-slate-600 to-slate-800' }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1">{item.badge}</div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        {/* Pricing section removed */}
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-12 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-2 hover:scale-105 transition-all duration-500">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              特許データ管理を始めましょう
            </h2>
            <p className="text-xl text-white/90 mb-8">
              ログインして特許ナビの機能をご利用ください
            </p>
            <Button
              size="lg"
              onClick={onNavigateToLogin}
              className="h-14 px-8 bg-white text-orange-600 hover:bg-orange-50 hover:-translate-y-1 shadow-xl hover:shadow-2xl text-lg font-bold transition-all duration-300 group"
            >
              ログイン
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg hover:scale-110 hover:-rotate-6 transition-all duration-300 cursor-pointer">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">特許ナビ</span>
                <p className="text-sm text-slate-400">知的財産データ管理システム</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400">開発・運営</p>
              <p className="text-white font-semibold">I-Fine Corporation</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-sm text-center">
            <p>Copyright(C) I-Fine Corporation All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}