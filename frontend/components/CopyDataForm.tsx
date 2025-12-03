import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { titleAPI } from '../services/api';

interface CopyDataFormProps {
  onClose?: () => void;
}

export function CopyDataForm({ onClose }: CopyDataFormProps) {
  const [sourceTitle, setSourceTitle] = useState('');
  const [copyBasicInfo, setCopyBasicInfo] = useState(true);
  const [copyProjectData, setCopyProjectData] = useState(false);
  const [copyCount, setCopyCount] = useState('1');
  const [titles, setTitles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch titles from API
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        console.log('🔄 Fetching titles for copy...');
        const result = await titleAPI.getAll();

        if (result.data) {
          let titleList: any[] = [];

          // Handle various response structures similar to TitleListPage
          // Case 1: result.data.data.titles (nested)
          if ((result.data as any).data && (result.data as any).data.titles) {
            titleList = (result.data as any).data.titles;
          }
          // Case 2: result.data.titles (direct object)
          else if ((result.data as any).titles) {
            titleList = (result.data as any).titles;
          }
          // Case 3: result.data is array
          else if (Array.isArray(result.data)) {
            titleList = result.data;
          }

          console.log('📋 Fetched titles count:', titleList.length);

          setTitles(titleList.map((t: any) => ({
            id: t.id,
            name: t.titleName || t.name || '名称なし',
            no: t.titleNo
          })));
        }
      } catch (err) {
        console.error('❌ Error fetching titles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTitles();
  }, []);

  const handleCopyExecute = async () => {
    if (!sourceTitle) {
      alert('コピー元タイトルを選択してください。');
      return;
    }

    setIsLoading(true);
    try {
      const count = parseInt(copyCount);
      const selectedTitleObj = titles.find(t => t.id === sourceTitle);
      const baseName = selectedTitleObj ? selectedTitleObj.name : 'Copy';

      // Execute copy 'count' times
      for (let i = 0; i < count; i++) {
        // Calculate next copy number
        // Filter titles that start with the base name and contain " - コピー "
        // Use a more flexible regex to catch variations
        const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const copyRegex = new RegExp(`^${escapedBaseName}\\s*-\\s*コピー\\s*(\\d+)$`);
        let maxCopyNum = 0;

        titles.forEach(t => {
          // Check if the title matches the pattern
          const match = t.name.match(copyRegex);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxCopyNum) maxCopyNum = num;
          }
        });

        // If this is the first iteration in the loop, start from maxCopyNum + 1
        // Subsequent iterations in the same batch will increment from there
        const currentCopyNum = maxCopyNum + 1 + i;
        const newName = `${baseName} - コピー ${currentCopyNum}`;

        // Pass copyProjectData (which maps to copyPatents in backend)
        await titleAPI.copy(sourceTitle, newName, copyProjectData);
      }

      alert(`${count}件のコピーが完了しました。`);
      if (onClose) onClose();
      // Optionally trigger a refresh of the title list if there was a callback for it
    } catch (error) {
      console.error('Copy failed:', error);
      alert('コピーに失敗しました。');
    } finally {
      setIsLoading(false);
    }
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
                  {title.no ? `No.${title.no} ` : ''}{title.name}
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
              disabled={true} // Always checked and disabled
              onCheckedChange={(checked: boolean | 'indeterminate') => setCopyBasicInfo(typeof checked === 'boolean' ? checked : false)}
            />
            <Label htmlFor="copyBasicInfo" className="cursor-pointer">
              保存タイトルの基本情報をコピーする
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="copyProjectData"
              checked={copyProjectData}
              onCheckedChange={(checked: boolean | 'indeterminate') => setCopyProjectData(typeof checked === 'boolean' ? checked : false)}
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
            {isLoading ? '処理中...' : 'コピー実行'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}