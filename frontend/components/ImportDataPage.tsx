import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, FileText, X, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ImportDataPageProps {
  onBack: () => void;
  titleNo?: string;
}

const systemFields = [
  { key: 'bunken', label: '文献番号', required: true },
  { key: 'shutsugan', label: '出願番号', required: false },
  { key: 'shutsuganDate', label: '出願日', required: false },
  { key: 'kochiDate', label: '公知日', required: false },
  { key: 'hatumei', label: '発明の名称', required: false },
  { key: 'shutsuganNin', label: '出願人/権利者', required: false },
  { key: 'ryo', label: '料', required: false },
  { key: 'kokai', label: '公開番号', required: false },
  { key: 'kokoku', label: '公告番号', required: false },
  { key: 'toroku', label: '登録番号', required: false },
  { key: 'shinpan', label: '審判番号', required: false },
  { key: 'jiken', label: '事件番号', required: false },
  { key: 'sonota', label: 'その他', required: false },
  { key: 'stage', label: 'ステージ', required: false },
  { key: 'event', label: 'イベント種類', required: false },
  { key: 'bunkenUrl', label: '文献URL', required: false },
];

export function ImportDataPage({ onBack, titleNo }: ImportDataPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'result'>('upload');
  const [autoSetOption, setAutoSetOption] = useState<'noFormat' | 'hasFormat'>('noFormat');
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importStats, setImportStats] = useState<{
    total: number;
    saved: number;
    updated: number;
    skipped: number;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Nintendo CSV columns from the actual file
      const mockColumns = [
        '文献番号',
        '出願番号',
        '出願日',
        '公開日',
        '発明の名称/出願人/権利者',
        '公開番号',
        '公告番号',
        '登録番号',
        '審判番号',
        'その他',
        'ステージ',
        'パテント百文図URL',
        '落合#',
        '公報公文<URL>'
      ];
      setCsvColumns(mockColumns);
      
      // Auto-map exact matches
      const autoMapping: Record<string, string> = {};
      systemFields.forEach(field => {
        const exactMatch = mockColumns.find(col => col === field.label);
        if (exactMatch) {
          autoMapping[field.key] = exactMatch;
        }
      });
      setColumnMapping(autoMapping);
    }
  };

  const handleStartMapping = () => {
    if (!selectedFile) return;
    setCurrentStep('mapping');
  };

  const handleMappingChange = (systemField: string, csvColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [systemField]: csvColumn
    }));
  };

  const handleSaveMapping = () => {
    // Mock import statistics
    const stats = {
      total: 774,
      saved: 766,
      updated: 0,
      skipped: 8
    };
    setImportStats(stats);
    setCurrentStep('result');
  };

  const handleFinalSave = () => {
    // Final save logic here
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              戻る
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              データのインポート
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-80 space-y-4">
            {/* Auto Set Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                <h3 className="text-sm">自動設定方法を選択</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setAutoSetOption('noFormat')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    autoSetOption === 'noFormat'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      autoSetOption === 'noFormat'
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {autoSetOption === 'noFormat' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">書式で自動設定したデータなし</p>
                      <p className="text-xs text-gray-500">
                        CSVファイルのヘッダーと完全一致するデータ項目のみ自動設定します
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAutoSetOption('hasFormat')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    autoSetOption === 'hasFormat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      autoSetOption === 'hasFormat'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {autoSetOption === 'hasFormat' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">書式を登録している場合</p>
                      <p className="text-xs text-gray-500">
                        事前に登録した書式を使用してデータを自動設定します
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Import Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                <h3 className="text-sm">インポート設定</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="header-row" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <Label htmlFor="header-row" className="text-sm cursor-pointer">
                    1行目をヘッダーとして扱う
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="skip-duplicates" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <Label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                    重複データをスキップ
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="validate-data" 
                    defaultChecked 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <Label htmlFor="validate-data" className="text-sm cursor-pointer">
                    データの検証を実行
                  </Label>
                </div>
              </div>
            </div>

            {/* CSV Format Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm mb-2 text-blue-900">CSVフォーマットガイド</h4>
              <p className="text-xs text-blue-800 mb-2">
                以下の列を含むCSVファイルを使用してください：
              </p>
              <div className="text-xs text-blue-700 space-y-1 bg-white p-3 rounded border border-blue-200">
                <p>文献番号, 出願番号, 出願日, 公知日, 発明の名称,</p>
                <p>出願人/権利者, 公開番号, 公告番号, 登録番号, 審判番号,</p>
                <p>その他, ステージ, イベント, 文献URL</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Step Indicator */}
              <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-orange-600' : currentStep === 'mapping' || currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-orange-100 border-2 border-orange-600' : currentStep === 'mapping' || currentStep === 'result' ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {currentStep === 'mapping' || currentStep === 'result' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm">1</span>
                      )}
                    </div>
                    <span className="text-sm">ファイル選択</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center gap-2 ${currentStep === 'mapping' ? 'text-orange-600' : currentStep === 'result' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'mapping' ? 'bg-orange-100 border-2 border-orange-600' : currentStep === 'result' ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {currentStep === 'result' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-sm">2</span>
                      )}
                    </div>
                    <span className="text-sm">列のマッピング</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center gap-2 ${currentStep === 'result' ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'result' ? 'bg-orange-100 border-2 border-orange-600' : 'bg-gray-200'}`}>
                      <span className="text-sm">3</span>
                    </div>
                    <span className="text-sm">確認・保存</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {currentStep === 'upload' && (
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-16 bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-lg">
                          <Upload className="w-14 h-14 text-orange-500" />
                        </div>
                        <div className="text-center">
                          <p className="mb-2 text-gray-700 text-lg">
                            CSVファイルをドロップするか、クリックして選択
                          </p>
                          <p className="text-sm text-gray-500 mb-6">
                            対応形式: .csv (最大サイズ: 10MB)
                          </p>
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="csv-upload-main"
                          />
                          <label htmlFor="csv-upload-main">
                            <Button 
                              variant="outline" 
                              className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-6 text-base"
                              asChild
                            >
                              <span className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                ファイルを選択
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Selected File Display */}
                    {selectedFile && (
                      <div className="border-2 border-orange-300 rounded-lg p-6 bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center">
                              <FileText className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-base mb-1">{selectedFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            className="h-10 w-10 p-0 hover:bg-red-100 rounded-full"
                          >
                            <X className="w-6 h-6 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        disabled={!selectedFile}
                        onClick={handleStartMapping}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-6 text-base"
                      >
                        確認開始
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'mapping' && (
                  <div className="space-y-6">
                    {/* Warning Message */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm text-yellow-800">
                            データ項目はヘッダーと完全一致
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>データ項目はヘッダーと完全一致するもののみ自動設定しています。確認にごご注意ください。</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mapping Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            正書式のデータ項目
                            <br />
                            <span className="text-xs text-gray-600">
                              ※このデータ項目はヘッダーと完全一致
                            </span>
                          </div>
                          <div className="text-sm">
                            取込後のデータ項目
                            <br />
                            <span className="text-xs text-gray-600">
                              ※CSVファイルのヘッダー
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {systemFields.map((field) => {
                          const mappedColumn = columnMapping[field.key];
                          const hasMatch = mappedColumn && csvColumns.includes(mappedColumn);
                          
                          return (
                            <div key={field.key} className="grid grid-cols-2 gap-4 px-6 py-3 hover:bg-gray-50">
                              <div className="flex items-center">
                                <Label className="text-sm">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                              </div>
                              <div className="flex items-center">
                                {hasMatch ? (
                                  <div className="px-4 py-2 rounded-md bg-green-100 border border-green-300 text-green-800 text-sm w-full">
                                    {mappedColumn}
                                  </div>
                                ) : (
                                  <div className="px-4 py-2 rounded-md bg-red-100 border border-red-300 text-red-800 text-sm w-full text-center">
                                    -------- 件
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm mb-2 text-blue-900">
                          ◆ THE書類 / JPO・GPOファミリー情報書
                        </h4>
                        <p className="text-xs text-blue-800">
                          書類番号 ⇒
                          <br />
                          発明番号又はこごこの登録
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-xs text-orange-800">
                          発明番号又はこごこの登録
                          <br />
                          PCで保管できる文字
                          <br />
                          （「グラフ」「句切」は登録で文字になります。）
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('upload')}
                      >
                        戻る
                      </Button>
                      <Button
                        onClick={handleSaveMapping}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8"
                      >
                        保存
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 'result' && importStats && (
                  <div className="space-y-6">
                    {/* Success Message */}
                    <div className="bg-green-50 border-l-4 border-green-400 p-6">
                      <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
                        <div>
                          <h3 className="text-lg text-green-900">
                            インポート処理が完了しました
                          </h3>
                          <p className="text-sm text-green-700 mt-1">
                            データの確認を行い、問題がなければ「保存実行」をクリックしてください。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-6 border-2 border-blue-200 text-center">
                        <p className="text-sm text-gray-600 mb-2">保存データ件数</p>
                        <p className="text-4xl text-blue-600">{importStats.total}</p>
                        <p className="text-sm text-gray-500 mt-1">件</p>
                      </div>
                      <div className="bg-white rounded-lg p-6 border-2 border-green-200 text-center">
                        <p className="text-sm text-gray-600 mb-2">新規登録数</p>
                        <p className="text-4xl text-green-600">{importStats.saved}</p>
                        <p className="text-sm text-gray-500 mt-1">件</p>
                      </div>
                      <div className="bg-white rounded-lg p-6 border-2 border-purple-200 text-center">
                        <p className="text-sm text-gray-600 mb-2">更新数</p>
                        <p className="text-4xl text-purple-600">{importStats.updated}</p>
                        <p className="text-sm text-gray-500 mt-1">件</p>
                      </div>
                      <div className="bg-white rounded-lg p-6 border-2 border-red-200 text-center">
                        <p className="text-sm text-gray-600 mb-2">エラー・スキップ件数</p>
                        <p className="text-4xl text-red-600">{importStats.skipped}</p>
                        <p className="text-sm text-gray-500 mt-1">件</p>
                      </div>
                    </div>

                    {/* Import Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm mb-4">インポート詳細</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ファイル名:</span>
                          <span>{selectedFile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ファイルサイズ:</span>
                          <span>{selectedFile ? (selectedFile.size / 1024).toFixed(2) : '0'} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">マッピング済み項目:</span>
                          <span>{Object.keys(columnMapping).filter(k => columnMapping[k]).length} 項目</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('mapping')}
                      >
                        戻る
                      </Button>
                      <Button
                        onClick={handleFinalSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        保存実行
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}