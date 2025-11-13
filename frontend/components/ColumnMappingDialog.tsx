import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { X, ArrowRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ColumnMappingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (mapping: Record<string, string>) => void;
  csvColumns: string[];
}

const systemFields = [
  { key: 'bunken', label: '文献番号' },
  { key: 'shutsugan', label: '出願番号' },
  { key: 'shutsuganDate', label: '出願日' },
  { key: 'kochiDate', label: '公知日' },
  { key: 'hatumei', label: '発明の名称' },
  { key: 'shutsuganNin', label: '出願人/権利者' },
  { key: 'ryo', label: '料' },
  { key: 'kokai', label: '公開番号' },
  { key: 'kokoku', label: '公告番号' },
  { key: 'toroku', label: '登録番号' },
  { key: 'shinpan', label: '審判番号' },
  { key: 'jiken', label: '事件番号' },
  { key: 'sonota', label: 'その他' },
  { key: 'stage', label: 'ステージ' },
  { key: 'event', label: 'イベント種類' },
  { key: 'bunkenUrl', label: '文献URL' },
];

export function ColumnMappingDialog({ 
  open, 
  onClose, 
  onSave, 
  csvColumns 
}: ColumnMappingDialogProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleMappingChange = (systemField: string, csvColumn: string) => {
    setMapping(prev => ({
      ...prev,
      [systemField]: csvColumn
    }));
  };

  const handleSave = () => {
    onSave(mapping);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                自動設定結果
              </span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            取込後のデータ項目と書式の項目の関連付け（一部データ項目は必須。必ず全て選択して下さい。）
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="mr-1">⚠️</span>
              データ項目はヘッダーと完全一致
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              データ項目はヘッダーと完全一致するもののみ自動設定しています。確認にごご注意ください。
            </p>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
            {/* System Fields Column */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                <h3 className="text-sm text-center">
                  正書式のデータ項目
                  <br />
                  <span className="text-xs text-gray-600">
                    ※このデータ項目はヘッダーと完全一致
                  </span>
                </h3>
              </div>
              <div className="space-y-2">
                {systemFields.map((field) => (
                  <div
                    key={field.key}
                    className="bg-gray-100 p-3 rounded border border-gray-300"
                  >
                    <p className="text-sm">{field.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow Column */}
            <div className="flex flex-col items-center pt-20">
              <ArrowRight className="w-8 h-8 text-gray-400" />
            </div>

            {/* CSV Columns Selection */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                <h3 className="text-sm text-center">
                  取込後のデータ項目
                  <br />
                  <span className="text-xs text-gray-600">
                    ※CSVファイルのヘッダー
                  </span>
                </h3>
              </div>
              <div className="space-y-2">
                {systemFields.map((field) => (
                  <div key={field.key}>
                    <Select
                      value={mapping[field.key] || ''}
                      onValueChange={(value) => handleMappingChange(field.key, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="--------  件" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">--------  件</SelectItem>
                        {csvColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
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
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}