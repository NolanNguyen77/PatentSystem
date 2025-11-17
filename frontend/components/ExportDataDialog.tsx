import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount?: number;
}

// Available fields for export
const allFields = [
  'アイデア番号',
  'アイデア受付日',
  '出願番号(最新正規化前)',
  'GPGファミリー番号',
  '案件グループ番号',
  '公報番号',
  '公報発行日',
  '公報種別コード',
  'ファミリー番号',
  '権利者・出願人名（サフ1）',
  '権利者・出願人名（サフ2）',
  '権利者・出願人名（サフ3）',
  '出願人名'
];

// Default selected fields for output
const defaultOutputFields = [
  '国コード',
  '出願番号',
  '出願日',
  '公開・公表番号',
  '公開・公表日',
  '公告番号',
  '公告日',
  '登録番号',
  '登録日',
  '登録公報発行日',
  '権利者・出願人名',
  'IPC',
  '筆頭IPC'
];

export function ExportDataDialog({ open, onOpenChange, totalCount = 404 }: ExportDataDialogProps) {
  const [availableFields, setAvailableFields] = useState<string[]>(allFields);
  const [outputFields, setOutputFields] = useState<string[]>(defaultOutputFields);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string[]>([]);
  const [exportRepresentative, setExportRepresentative] = useState(false);
  const [exportEvaluation, setExportEvaluation] = useState(true);

  const handleAddFields = () => {
    if (selectedAvailable.length === 0) return;
    
    setOutputFields([...outputFields, ...selectedAvailable]);
    setAvailableFields(availableFields.filter(f => !selectedAvailable.includes(f)));
    setSelectedAvailable([]);
  };

  const handleRemoveFields = () => {
    if (selectedOutput.length === 0) {
      // If nothing is selected, remove the last item from output fields
      if (outputFields.length > 0) {
        const lastField = outputFields[outputFields.length - 1];
        setAvailableFields([...availableFields, lastField]);
        setOutputFields(outputFields.slice(0, -1));
      }
      return;
    }
    
    setAvailableFields([...availableFields, ...selectedOutput]);
    setOutputFields(outputFields.filter(f => !selectedOutput.includes(f)));
    // Don't clear selection so users can keep clicking delete
    // setSelectedOutput([]);
  };

  const handleMoveUp = () => {
    if (selectedOutput.length !== 1) return;
    
    const index = outputFields.indexOf(selectedOutput[0]);
    if (index > 0) {
      const newFields = [...outputFields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setOutputFields(newFields);
    }
  };

  const handleMoveDown = () => {
    if (selectedOutput.length !== 1) return;
    
    const index = outputFields.indexOf(selectedOutput[0]);
    if (index < outputFields.length - 1) {
      const newFields = [...outputFields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setOutputFields(newFields);
    }
  };

  const handleExport = () => {
    console.log('Exporting fields:', outputFields);
    console.log('Export representative:', exportRepresentative);
    console.log('Export evaluation:', exportEvaluation);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="border-b pb-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              保存データExcel出力
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 -mr-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            保存データをExcelファイルとして出力します
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="px-6 py-4 pb-6 space-y-4">
          {/* Count */}
          <div className="text-center">
            <span className="text-sm">出力対象 </span>
            <span className="mx-2">{totalCount}</span>
            <span className="text-sm">件</span>
          </div>

          {/* Two column selector */}
          <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-3 items-start">
            {/* Left column - Available fields */}
            <div>
              <div className="text-center mb-2">全書誌</div>
              <ScrollArea className="h-[320px] border-2 border-gray-300 rounded">
                <div className="p-1">
                  {availableFields.map((field) => (
                    <div
                      key={field}
                      onClick={() => {
                        if (selectedAvailable.includes(field)) {
                          setSelectedAvailable(selectedAvailable.filter(f => f !== field));
                        } else {
                          setSelectedAvailable([...selectedAvailable, field]);
                        }
                      }}
                      className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 ${
                        selectedAvailable.includes(field) ? 'bg-blue-100' : ''
                      }`}
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Middle buttons */}
            <div className="flex flex-col gap-2 justify-center pt-8">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFields}
                disabled={selectedAvailable.length === 0}
                className="whitespace-nowrap"
              >
                追加→
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveFields}
                className="whitespace-nowrap"
              >
                ←削除
              </Button>
            </div>

            {/* Right column - Output fields */}
            <div>
              <div className="text-center mb-2">出力書誌</div>
              <ScrollArea className="h-[320px] border-2 border-gray-300 rounded">
                <div className="p-1">
                  {outputFields.map((field) => (
                    <div
                      key={field}
                      onClick={() => {
                        if (selectedOutput.includes(field)) {
                          setSelectedOutput([]);
                        } else {
                          setSelectedOutput([field]);
                        }
                      }}
                      className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 ${
                        selectedOutput.includes(field) ? 'bg-blue-100' : ''
                      }`}
                    >
                      {field}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right side buttons */}
            <div className="flex flex-col gap-2 justify-center pt-8">
              <Button
                size="sm"
                variant="outline"
                onClick={handleMoveUp}
                disabled={selectedOutput.length !== 1 || outputFields.indexOf(selectedOutput[0]) === 0}
                className="whitespace-nowrap"
              >
                ▲上に移動
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleMoveDown}
                disabled={selectedOutput.length !== 1 || outputFields.indexOf(selectedOutput[0]) === outputFields.length - 1}
                className="whitespace-nowrap"
              >
                ▼下に移動
              </Button>
            </div>
          </div>

          {/* Warning message */}
          <div className="text-xs text-red-600 leading-relaxed">
            出力内容を再取り込みする場合は、
            <br />
            出力書誌に以下を含めてください。
            <br />
            出願番号、 国法、国コード
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="export-representative"
                checked={exportRepresentative}
                onCheckedChange={(checked: boolean | 'indeterminate') => setExportRepresentative(typeof checked === 'boolean' ? checked : false)}
              />
              <label htmlFor="export-representative" className="text-sm cursor-pointer">
                代表図を出力する
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="export-evaluation"
                checked={exportEvaluation}
                onCheckedChange={(checked: boolean | 'indeterminate') => setExportEvaluation(typeof checked === 'boolean' ? checked : false)}
              />
              <label htmlFor="export-evaluation" className="text-sm cursor-pointer">
                評価情報を出力する（履歴は出力しません）
              </label>
            </div>
          </div>

          {/* Export button */}
          <div className="flex justify-center pt-2 pb-2">
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12"
            >
              出力する
            </Button>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
