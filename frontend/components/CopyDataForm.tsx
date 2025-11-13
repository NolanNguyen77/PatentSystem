import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface CopyDataFormProps {
  onClose?: () => void;
}

export function CopyDataForm({ onClose }: CopyDataFormProps) {
  const [sourceTitle, setSourceTitle] = useState('');
  const [copyBasicInfo, setCopyBasicInfo] = useState(true);
  const [copyProjectData, setCopyProjectData] = useState(false);
  const [copyCount, setCopyCount] = useState('1');

  // Mock title data
  const titles = [
    { id: '000032', name: 'ひらかわ' },
    { id: '000034', name: 'グエン・タイン・タン' }
  ];

  const handleCopyExecute = () => {
    console.log('Copy executed:', {
      sourceTitle,
      copyBasicInfo,
      copyProjectData,
      copyCount
    });
  };

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent text-xl">特許ナビ</span>
          </div>
          <span className="text-gray-400">|</span>
          <DialogTitle className="text-base">保存データのコピー</DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          保存データをコピーします
        </DialogDescription>
        <Button 
          variant="link" 
          className="text-blue-500 hover:text-blue-700"
          onClick={onClose}
        >
          閉じる
        </Button>
      </DialogHeader>

      <div className="space-y-6 py-6">
        {/* Source Title Selection */}
        <div className="space-y-2">
          <Label htmlFor="sourceTitle">コピー元タイトル</Label>
          <Select value={sourceTitle} onValueChange={setSourceTitle}>
            <SelectTrigger id="sourceTitle" className="w-full border-2 border-orange-200 focus:border-orange-400">
              <SelectValue placeholder="一選択一" />
            </SelectTrigger>
            <SelectContent>
              {titles.map((title) => (
                <SelectItem key={title.id} value={title.id}>
                  {title.id} {title.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="copyBasicInfo"
              checked={copyBasicInfo}
              onCheckedChange={(checked) => setCopyBasicInfo(!!checked)}
            />
            <Label htmlFor="copyBasicInfo" className="cursor-pointer">
              保存タイトルの基本情報をコピーする
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="copyProjectData"
              checked={copyProjectData}
              onCheckedChange={(checked) => setCopyProjectData(!!checked)}
            />
            <Label htmlFor="copyProjectData" className="cursor-pointer">
              案件データもコピーする
            </Label>
          </div>
        </div>

        {/* Copy Count */}
        <div className="flex items-center gap-2">
          <Label htmlFor="copyCount">コピー数</Label>
          <Select value={copyCount} onValueChange={setCopyCount}>
            <SelectTrigger id="copyCount" className="w-20 border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>個</span>
        </div>

        {/* Execute Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleCopyExecute}
            className="px-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0"
          >
            コピー実行
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}