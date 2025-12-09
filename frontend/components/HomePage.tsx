import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Lightbulb, ArrowRight, BarChart3, Database, Layers, ShieldCheck } from 'lucide-react';

interface HomePageProps {
    onNavigateToLogin: () => void;
}

export function HomePage({ onNavigateToLogin }: HomePageProps) {
    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Navigation Bar */}
            <div className="container mx-auto px-4 py-8 relative z-50">
                <nav className="flex items-center justify-between bg-white rounded-lg px-8 py-5 shadow-xl border-b-4 border-orange-500 sticky top-6 transition-all duration-300">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                            <Lightbulb className="w-7 h-7" />
                        </div>
                        <span className="text-2xl font-black text-orange-600 tracking-tight">
                            特許ナビ
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10 text-base font-bold text-gray-500">
                        <a href="#features" className="hover:text-orange-500 transition-colors hover:bg-orange-50 px-4 py-2 rounded-lg">機能</a>
                        <a href="#about" className="hover:text-orange-500 transition-colors hover:bg-orange-50 px-4 py-2 rounded-lg">特許ナビとは</a>
                        <a href="#pricing" className="hover:text-orange-500 transition-colors hover:bg-orange-50 px-4 py-2 rounded-lg">料金プラン</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white rounded-md px-6 py-2 text-base font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            閲覧
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onNavigateToLogin}
                            className="text-gray-600 hover:text-orange-600 font-bold text-base hidden sm:flex hover:bg-orange-50 rounded-md"
                        >
                            ログイン
                        </Button>
                        <Button
                            onClick={onNavigateToLogin}
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-md px-8 py-6 text-base font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-1 active:scale-95 duration-300"
                        >
                            始める
                        </Button>
                    </div>
                </nav>
            </div>

            {/* Hero Section */}
            <main className="container mx-auto px-4 pt-12 pb-24 text-center relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-200/30 via-pink-200/30 to-blue-200/30 rounded-full blur-3xl -z-10 animate-blob"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-6">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        AI-Powered Patent Analysis
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
                        特許データを
                        <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                            価値ある洞察へ
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        膨大な特許情報を瞬時に分析・可視化。
                        <br className="hidden md:block" />
                        ビジネスの意思決定を加速させる、次世代の知財管理プラットフォーム。
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Button
                            onClick={onNavigateToLogin}
                            className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
                        >
                            無料で試す
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 px-8 text-lg rounded-full border-2 border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-gray-300 transition-all"
                        >
                            デモを見る
                        </Button>
                    </div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ scale: 1.02, rotateX: 2 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="relative mx-auto max-w-6xl mt-12 perspective-1000"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-[2rem] opacity-20 blur-2xl -z-10 animate-pulse"></div>
                        <div className="rounded-[2rem] border-4 border-white/50 bg-white/80 backdrop-blur-2xl p-3 shadow-2xl ring-1 ring-gray-950/5 transform transition-transform duration-500">
                            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-inner">
                                {/* Mock UI Header */}
                                <div className="h-16 border-b bg-gray-50/50 flex items-center px-6 gap-4 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/20"></div>
                                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500/20"></div>
                                            <div className="w-3.5 h-3.5 rounded-full bg-green-400 border border-green-500/20"></div>
                                        </div>
                                        <div className="h-2 w-8 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="h-8 w-96 bg-gray-100 rounded-lg border border-gray-200"></div>
                                    <div className="h-8 w-24 bg-orange-500 rounded-lg opacity-90"></div>
                                </div>
                                {/* Mock UI Body */}
                                <div className="p-8 grid grid-cols-12 gap-8 bg-slate-50/50 min-h-[600px]">
                                    {/* Sidebar Mock */}
                                    <div className="col-span-2 space-y-4 hidden md:block">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`h-10 w-full rounded-xl ${i === 1 ? 'bg-orange-100' : 'bg-white'} border border-gray-100`}></div>
                                        ))}
                                    </div>

                                    {/* Main Content Mock */}
                                    <div className="col-span-12 md:col-span-10 grid grid-cols-3 gap-6">
                                        <div className="col-span-1 h-48 bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
                                            <div>
                                                <div className="h-10 w-10 bg-blue-100 rounded-xl mb-4"></div>
                                                <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                                            </div>
                                            <div className="h-10 w-20 bg-blue-500 rounded-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                        </div>
                                        <div className="col-span-1 h-48 bg-white rounded-2xl border border-green-100 p-6 shadow-sm flex flex-col justify-between group hover:border-green-300 transition-colors">
                                            <div>
                                                <div className="h-10 w-10 bg-green-100 rounded-xl mb-4"></div>
                                                <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                                            </div>
                                            <div className="h-10 w-20 bg-green-500 rounded-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                        </div>
                                        <div className="col-span-1 h-48 bg-white rounded-2xl border border-purple-100 p-6 shadow-sm flex flex-col justify-between group hover:border-purple-300 transition-colors">
                                            <div>
                                                <div className="h-10 w-10 bg-purple-100 rounded-xl mb-4"></div>
                                                <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                                            </div>
                                            <div className="h-10 w-20 bg-purple-500 rounded-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                        </div>
                                        <div className="col-span-3 h-80 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-end gap-3 px-12 pb-0 pt-12 overflow-hidden relative">
                                            <div className="absolute top-6 left-6 right-6 flex justify-between">
                                                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                <div className="h-8 w-24 bg-gray-50 rounded border border-gray-100"></div>
                                            </div>
                                            {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85].map((h, i) => (
                                                <div key={i} className="w-full rounded-t-lg transition-all duration-1000 hover:opacity-80 cursor-pointer"
                                                    style={{
                                                        height: `${h}%`,
                                                        backgroundColor: `hsl(${30 + i * 5}, 90%, 60%)`
                                                    }}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Features Strip */}
            <div className="border-t border-gray-200 bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600">
                                <BarChart3 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">高度な分析</h3>
                            <p className="text-gray-600">特許データを多角的に分析し、競合他社の動向や技術トレンドを可視化します。</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-600">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">知財保護</h3>
                            <p className="text-gray-600">自社の知的財産を保護し、侵害リスクを早期に発見するための監視機能を提供。</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600">
                                <Layers className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">一元管理</h3>
                            <p className="text-gray-600">散在する特許データを一元管理し、チーム全体での共有とコラボレーションを促進。</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2025 Patent Navigation System. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
