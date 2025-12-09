import { Lightbulb, Search, FileText, TrendingUp, Users, Shield, Zap, ArrowRight, Check, Menu, X, Database, Lock, Globe, BarChart3, Sparkles, Rocket, Building, Copy, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

export function HomePage({ onNavigateToLogin }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: '高度な検索機能',
      description: '強力な検索エンジンで、必要な特許情報を素早く見つけ出します。複数の条件を組み合わせた詳細検索も可能です。',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: FileText,
      title: 'データ管理',
      description: '特許データを効率的に整理・管理。カテゴリー別、年月別、週別など、様々な視点でデータを分類できます。',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      title: '分析レポート',
      description: '特許トレンドを視覚化し、業界の動向を把握。データに基づいた戦略的な意思決定をサポートします。',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'チーム協働',
      description: 'チームメンバー間でデータを共有し、効率的に協働作業が可能。担当者の割り当てや進捗管理も簡単です。',
      gradient: 'from-indigo-500 to-violet-600'
    },
    {
      icon: Shield,
      title: 'セキュリティ',
      description: '企業グレードのセキュリティで、重要な特許情報を安全に保護。アクセス制御と暗号化を標準装備。',
      gradient: 'from-slate-600 to-slate-800'
    },
    {
      icon: Zap,
      title: '高速処理',
      description: '大量のデータでも高速に処理。エクスポート、インポート、マージなどの操作もストレスなく実行できます。',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const benefits = [
    {
      icon: Database,
      title: '一元管理',
      description: '散在する特許データを一箇所に集約',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: 'データ分析',
      description: 'AI powered analytics for insights',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Globe,
      title: 'グローバル対応',
      description: '多言語・多地域の特許に対応',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Lock,
      title: '安全性',
      description: 'エンタープライズ級のセキュリティ',
      color: 'text-slate-700',
      bg: 'bg-slate-50'
    }
  ];

  const plans = [
    {
      name: 'スターター',
      price: '¥9,800',
      period: '/月',
      description: '小規模チームや個人利用に最適',
      features: [
        '最大100件の特許データ保存',
        '基本的な検索機能',
        'Excel出力機能',
        '1ユーザー',
        'メールサポート'
      ],
      highlighted: false
    },
    {
      name: 'プロフェッショナル',
      price: '¥29,800',
      period: '/月',
      description: '中規模企業向けの充実プラン',
      features: [
        '無制限の特許データ保存',
        '高度な検索・分析機能',
        'データマージ機能',
        '最大10ユーザー',
        '優先サポート',
        'カスタムレポート'
      ],
      highlighted: true
    },
    {
      name: 'エンタープライズ',
      price: 'お問い合わせ',
      period: '',
      description: '大企業向けカスタマイズプラン',
      features: [
        'すべてのプロ機能',
        '無制限ユーザー',
        'API統合',
        '専任サポート担当',
        'カスタム開発対応',
        'SLA保証'
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-110 hover:-rotate-6 transition-all duration-300 cursor-pointer">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">特許ナビ</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
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
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-1 transition-all duration-300 hidden md:block font-semibold"
              >
                ログイン
              </Button>
              <Button 
                onClick={onNavigateToLogin}
                className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 font-semibold group"
              >
                <span className="relative z-10">閲覧</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - 2 Columns */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800 font-semibold">特許管理のリーディングプラットフォーム</span>
              </div>
              
              {/* Main Title with Highlight */}
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight tracking-tight">
                特許データを
                <br />
                <span className="text-orange-600">
                  スマートに管理
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                強力な分析ダッシュボードで、ビジネスメトリクスの理解、KPIの追跡、データに基づいた意思決定をリアルタイムで実現します。
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a 
                  href="#features"
                  className="h-14 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 text-base group hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-2 transition-all duration-300 rounded-xl font-semibold flex items-center justify-center relative overflow-hidden"
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
                  className="h-14 px-8 !border-2 !border-slate-900 text-slate-700 hover:bg-slate-50 hover:!border-slate-900 hover:-translate-y-2 hover:shadow-lg text-base transition-all duration-300 rounded-xl font-semibold group relative overflow-hidden"
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

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-slate-900">10K+</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">アクティブユーザー</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-slate-900">99.9%</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">稼働時間</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-slate-900">50M+</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">データポイント</p>
                </div>
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
                        <span className="text-sm text-slate-600 font-medium">Live Sync</span>
                      </div>
                      <h3 className="text-lg text-slate-900 font-bold">特許データ＆進捗</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-bold mb-1">+24.5%</div>
                      <div className="text-xs text-slate-500">Active now: 1,247</div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mb-6">
                    <div className="h-32 flex items-end gap-2">
                      {[40, 60, 45, 70, 55, 80, 65, 85, 75, 90, 95, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-semibold">ユーザー</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">8.5K</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 hover:shadow-md hover:-translate-y-1 hover:border-purple-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-purple-700 font-semibold">成功率</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900">80%</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 hover:shadow-md hover:-translate-y-1 hover:border-green-200 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-semibold">成長</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">+32%</div>
                    </div>
                  </div>

                  {/* Notification Badge */}
                  <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-900 font-semibold mb-1">New milestone!</div>
                      <div className="text-xs text-blue-700">10K users reached</div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge - Top Right */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-200 z-20 hover:shadow-xl hover:-translate-y-1 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-xs text-slate-500 font-medium">ライブデータ</div>
                      <div className="text-sm text-slate-900 font-bold">リアルタイム同期</div>
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
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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

      {/* Showcase Section with Large Image */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-300/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY1MTgwMjMwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern Workspace"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-white group-hover:scale-105 transition-transform duration-500"
              />
              {/* Floating Stats Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 border-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">+156%</div>
                    <div className="text-sm text-slate-600 font-medium">効率向上</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-4">
                <Rocket className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800 font-semibold">パワフルな機能</span>
              </div>
              <h3 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">
                データを活用して<br />
                <span className="text-slate-900">
                  より良い意思決定を
                </span>
              </h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                リアルタイムのダッシュボードで、特許ポートフォリオを可視化。AI搭載の分析ツールで、競合動向を把握し、戦略的な意思決定をサポートします。
              </p>
              
              {/* Check List */}
              <div className="space-y-4">
                {[
                  { text: '直感的なダッシュボードで一目で状況把握', icon: Check },
                  { text: 'AIによる自動分類とタグ付け機能', icon: Zap },
                  { text: 'カスタマイズ可能なレポート出力', icon: FileText },
                  { text: 'リアルタイムでのチーム共同作業', icon: Users }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors duration-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-semibold">お客様の声</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              導入企業の<span className="text-slate-900">成功事例</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              実際に特許ナビを導入された企業様からの声をご紹介します
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: '特許ナビの導入により、特許管理業務の効率が大幅に向上しました。検索機能が非常に優れており、必要な情報に素早くアクセスできます。',
                author: '田中 太郎',
                position: '知的財産部 部長',
                company: 'テクノロジー株式会社',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
              },
              {
                rating: 5,
                text: 'チーム全体でのデータ共有が簡単になり、コミュニケーションコストが削減されました。UIも直感的で、新しいメンバーでもすぐに使いこなせます。',
                author: '佐藤 花子',
                position: 'プロジェクトマネージャー',
                company: 'イノベーション研究所',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
              },
              {
                rating: 5,
                text: 'データ分析機能が素晴らしく、特許トレンドの把握が容易になりました。経営層への報告資料作成時間も大幅に短縮されています。',
                author: '鈴木 一郎',
                position: 'データアナリスト',
                company: 'グローバル製造株式会社',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
              }
            ].map((testimonial, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Text */}
                  <p className="text-slate-700 mb-6 leading-relaxed flex-grow">{testimonial.text}</p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all duration-300">
                      <ImageWithFallback 
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold">{testimonial.author}</div>
                      <div className="text-sm text-slate-600">{testimonial.position}</div>
                      <div className="text-xs text-slate-500">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 mb-4">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-semibold">信頼の証</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              <span className="text-slate-900">セキュリティ</span>と信頼性
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              業界標準の認証を取得し、お客様の大切なデータを確実に保護します
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                badge: 'ISO 27001',
                title: '情報セキュリティ認証',
                description: '国際標準の情報セキュリティマネジメントシステム認証を取得',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: Lock,
                badge: 'SOC 2 Type II',
                title: 'セキュリティ監査',
                description: '独立監査機関による厳格なセキュリティ評価をクリア',
                color: 'from-blue-500 to-indigo-600'
              },
              {
                icon: Check,
                badge: 'GDPR対応',
                title: 'プライバシー保護',
                description: 'EU一般データ保護規則に完全準拠したデータ管理',
                color: 'from-purple-500 to-pink-600'
              }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-3">
                    {item.badge}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        {/* Pricing section removed */}
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-12 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-2 hover:scale-105 transition-all duration-500">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              今すぐ特許管理を効率化しましょう
            </h2>
            <p className="text-xl text-white/90 mb-8">
              14日間の無料トライアルで、特許ナビのすべての機能をお試しください
            </p>
            <Button 
              size="lg"
              onClick={onNavigateToLogin}
              className="h-14 px-8 bg-white text-purple-600 hover:bg-purple-50 hover:-translate-y-1 shadow-xl hover:shadow-2xl text-lg font-bold transition-all duration-300 group"
            >
              無料で始める
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg hover:scale-110 hover:-rotate-6 transition-all duration-300 cursor-pointer">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">特許ナビ</span>
              </div>
              <p className="text-sm">
                特許データ管理の
                <br />
                新しいスタンダード
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">製品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">機能</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">料金プラン</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">導入事例</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">セキュリティ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">ヘルプセンター</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">よくある質問</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">API ドキュメント</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">会社</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">会社概要</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">採用情報</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-purple-400 hover:translate-x-1 inline-block transition-all duration-300">利用規約</a></li>
              </ul>
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