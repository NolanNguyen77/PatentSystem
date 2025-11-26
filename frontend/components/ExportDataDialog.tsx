import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';


interface Patent {
  id: string;
  documentNum?: string;
  applicationNum?: string;
  applicationDate?: string;
  publicationDate?: string;
  inventionTitle?: string;
  applicantName?: string;
  fiClassification?: string;
  publicationNum?: string;
  announcementNum?: string;
  registrationNum?: string;
  appealNum?: string;
  otherInfo?: string;
  statusStage?: string;
  eventDetail?: string;
  documentUrl?: string;
  evaluationStatus?: string;
}

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount?: number;
  patents?: Patent[];
}

// Available fields for export
const allFields = [
  '文献番号',
  '出願番号',
  '出願日',
  '公知日',
  '発明の名称',
  '出願人/権利者',
  'FI',
  '公開番号',
  '公告番号',
  '登録番号',
  '審判番号',
  'その他',
  'ステージ',
  'イベント詳細',
  '文献URL'
];

// Default selected fields for output
const defaultOutputFields = [
  '文献番号',
  '出願番号',
  '出願日',
  '発明の名称',
  '出願人/権利者',
  '公開番号',
  '登録番号',
  'ステージ'
];

// Field mapping from Japanese to English keys
const fieldMapping: Record<string, keyof Patent> = {
  '文献番号': 'documentNum',
  '出願番号': 'applicationNum',
  '出願日': 'applicationDate',
  '公知日': 'publicationDate',
  '発明の名称': 'inventionTitle',
  '出願人/権利者': 'applicantName',
  'FI': 'fiClassification',
  '公開番号': 'publicationNum',
  '公告番号': 'announcementNum',
  '登録番号': 'registrationNum',
  '審判番号': 'appealNum',
  'その他': 'otherInfo',
  'ステージ': 'statusStage',
  'イベント詳細': 'eventDetail',
  '文献URL': 'documentUrl',
};

export function ExportDataDialog({ open, onOpenChange, totalCount = 0, patents = [] }: ExportDataDialogProps) {
  // 全書誌: fields not yet added to output
  // 出力書誌: fields to be exported
  const [availableFields, setAvailableFields] = useState<string[]>(
    allFields.filter(f => !defaultOutputFields.includes(f))
  );
  const [outputFields, setOutputFields] = useState<string[]>(defaultOutputFields);
  const [selectedAvailableField, setSelectedAvailableField] = useState<string | null>(null);
  const [selectedOutputField, setSelectedOutputField] = useState<string | null>(null);
  const [exportRepresentative, setExportRepresentative] = useState(false);
  const [exportEvaluation, setExportEvaluation] = useState(true);

  // Select item in 全書誌
  const handleSelectAvailableField = (field: string) => {
    setSelectedAvailableField(prev => prev === field ? null : field);
  };

  // Select item in 出力書誌
  const handleSelectOutputField = (field: string) => {
    setSelectedOutputField(prev => prev === field ? null : field);
  };

  // Button 追加→: move selected from 全書誌 to 出力書誌
  const handleAddField = () => {
    if (!selectedAvailableField) return;
    setOutputFields(prev => [...prev, selectedAvailableField]);
    setAvailableFields(prev => prev.filter(f => f !== selectedAvailableField));
    setSelectedAvailableField(null);
  };

  // Button ←削除: move selected from 出力書誌 back to 全書誌
  const handleRemoveField = () => {
    if (!selectedOutputField) return;
    setAvailableFields(prev => [...prev, selectedOutputField]);
    setOutputFields(prev => prev.filter(f => f !== selectedOutputField));
    setSelectedOutputField(null);
  };

  const handleMoveUp = () => {
    if (!selectedOutputField) return;
    const index = outputFields.indexOf(selectedOutputField);
    if (index > 0) {
      const newFields = [...outputFields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setOutputFields(newFields);
    }
  };

  const handleMoveDown = () => {
    if (!selectedOutputField) return;
    const index = outputFields.indexOf(selectedOutputField);
    if (index < outputFields.length - 1) {
      const newFields = [...outputFields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setOutputFields(newFields);
    }
  };

  const handleExport = () => {
    if (patents.length === 0) {
      alert('出力するデータがありません');
      return;
    }

    // Create CSV content with BOM for Excel compatibility
    const BOM = '\uFEFF';
    
    // Header row
    const headers = outputFields.join(',');
    
    // Data rows
    const rows = patents.map(patent => {
      return outputFields.map(field => {
        const key = fieldMapping[field];
        let value = key ? (patent[key] || '') : '';
        // Escape quotes and wrap in quotes if contains comma or newline
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
        }
        return value;
      }).join(',');
    });
    
    const csvContent = BOM + headers + '\n' + rows.join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patent_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported', patents.length, 'patents with fields:', outputFields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="border-b pb-4 px-6 pt-6">
          <DialogTitle className="text-xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            保存データExcel出力
          </DialogTitle>
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

            {/* Two column selector - Original layout */}
            <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-3 items-start">
              {/* Left column - Available fields (全書誌) */}
              <div>
                <div className="text-center mb-2">全書誌</div>
                <ScrollArea className="h-[320px] border-2 border-gray-300 rounded bg-white">
                  <div className="p-1">
                    {availableFields.map((field) => (
                      <div
                        key={field}
                        onClick={() => handleSelectAvailableField(field)}
                        className={`px-2 py-1.5 text-sm cursor-pointer rounded select-none ${
                          selectedAvailableField === field 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-blue-50'
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
                  onClick={handleAddField}
                  disabled={!selectedAvailableField}
                  className="whitespace-nowrap"
                >
                  追加→
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveField}
                  disabled={!selectedOutputField}
                  className="whitespace-nowrap"
                >
                  ←削除
                </Button>
              </div>

              {/* Right column - Output fields (出力書誌) */}
              <div>
                <div className="text-center mb-2">出力書誌</div>
                <ScrollArea className="h-[320px] border-2 border-gray-300 rounded bg-white">
                  <div className="p-1">
                    {outputFields.map((field) => (
                      <div
                        key={field}
                        onClick={() => handleSelectOutputField(field)}
                        className={`px-2 py-1.5 text-sm cursor-pointer rounded select-none ${
                          selectedOutputField === field 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right side buttons - Move order */}
              <div className="flex flex-col gap-2 justify-center pt-8">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMoveUp}
                  disabled={!selectedOutputField || outputFields.indexOf(selectedOutputField) === 0}
                  className="whitespace-nowrap"
                >
                  ▲上に移動
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMoveDown}
                  disabled={!selectedOutputField || outputFields.indexOf(selectedOutputField) === outputFields.length - 1}
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
