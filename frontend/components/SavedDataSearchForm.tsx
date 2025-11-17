import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';

interface SavedDataSearchFormProps {
  onBack?: () => void;
}

export function SavedDataSearchForm({ onBack }: SavedDataSearchFormProps) {
  const [searchMethod, setSearchMethod] = useState('number'); // 'number' or 'condition'
  const [searchOption, setSearchOption] = useState('exact');
  const [patentCount, setPatentCount] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [searchExpression, setSearchExpression] = useState('S2×S1');
  const [patentListData, setPatentListData] = useState<any[]>([]);
  const [patentDetail, setPatentDetail] = useState<any | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([
    { id: 'S1', name: '権利者・出願人名', value: 'アイ・ピー・ファイン株式会社' },
    { id: 'S2', name: '権利者・出願人名', value: '任天堂' }
  ]);

  const handleCountCheck = () => {
    setPatentCount(34);
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryItems(historyItems.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistoryItems([]);
  };

  const handleAddToExpression = (text: string) => {
    setSearchExpression(searchExpression + text);
  };

  const handleHistoryClick = (id: string) => {
    // Add the history ID to the search expression
    if (searchExpression) {
      setSearchExpression(searchExpression + ' ' + id);
    } else {
      setSearchExpression(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Buttons */}
      <div className="flex justify-between items-center">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            タイトル一覧へ戻る
          </Button>
        )}
        <Button 
          variant="outline" 
          className="border-2 border-gray-400 bg-white hover:bg-gray-50 px-6 ml-auto"
        >
          条件をクリア
        </Button>
      </div>

      {/* Section 1: 検索方法 */}
      <Card className="border-2 border-orange-200 bg-orange-50/30">
        <div className="p-4">
          <div className="mb-4">
            <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">検索方法</span>
          </div>
          <RadioGroup value={searchMethod} onValueChange={setSearchMethod} className="flex gap-4">
            <div className="flex items-center space-x-2 p-2 rounded border-2 border-black bg-white">
              <RadioGroupItem value="number" id="number" className="border-2 border-black" />
              <Label htmlFor="number" className="cursor-pointer text-sm">番号を入力して検索</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded border-2 border-black bg-white">
              <RadioGroupItem value="condition" id="condition" className="border-2 border-black" />
              <Label htmlFor="condition" className="cursor-pointer text-sm">条件を入力して検索</Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Conditional Content Based on Search Method */}
      {searchMethod === 'number' ? (
        // 番号を入力して検索 UI
        <div className="space-y-4">
          {/* 番号入力 Section */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="p-4">
              <div className="mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">番号入力</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-[200px]">
                    <Label className="text-sm mb-2 block">番号区分</Label>
                    <Select defaultValue="publication">
                      <SelectTrigger className="bg-white border-2 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publication">公開・公表番号</SelectItem>
                        <SelectItem value="application">出願番号</SelectItem>
                        <SelectItem value="registration">登録番号</SelectItem>
                        <SelectItem value="gazette">広報番号</SelectItem>
                        <SelectItem value="idea">アイデア番号</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <Label className="text-sm mb-2 block invisible">入力</Label>
                    <Textarea 
                      className="min-h-[100px] bg-white border-2 border-gray-300 text-sm"
                      placeholder="特開2025-040365"
                    />
                  </div>

                  <div className="w-[200px]">
                    <Label className="text-sm mb-2 block">検索オプション</Label>
                    <RadioGroup value={searchOption} onValueChange={setSearchOption} className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 rounded border-2 border-black bg-white">
                        <RadioGroupItem value="exact" id="exact" className="border-2 border-black" />
                        <Label htmlFor="exact" className="cursor-pointer text-sm">完全一致</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded border-2 border-black bg-white">
                        <RadioGroupItem value="partial" id="partial" className="border-2 border-black" />
                        <Label htmlFor="partial" className="cursor-pointer text-sm">部分一致</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Count Check Section */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleCountCheck}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-6"
                  >
                    件数チェック
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      value={patentCount > 0 ? patentCount : ''}
                      readOnly
                      className="w-24 text-center border-2 border-gray-300"
                      placeholder="0"
                    />
                    <span className="text-sm">件</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        // 条件を入力して検索 UI
        <div className="space-y-4">
          {/* 名称かリスト Section */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="p-4">
              <div className="mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">名称かリスト</span>
              </div>

              {/* Input Row */}
              <div className="flex items-end gap-2 mb-4">
                <div className="flex-1">
                  <Label className="text-xs mb-1 block">検索名称</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="applicant">
                      <SelectTrigger className="bg-white border border-gray-300 h-8 w-[180px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">文献番号</SelectItem>
                        <SelectItem value="application">出願番号</SelectItem>
                        <SelectItem value="applicationDate">出願日</SelectItem>
                        <SelectItem value="publicationDate">公知日</SelectItem>
                        <SelectItem value="inventionName">発明の名称</SelectItem>
                        <SelectItem value="applicant">出願人/権利者</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="bg-white border border-gray-300 h-8 text-xs flex-1" />
                    <Button 
                      size="sm"
                      className="h-8 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                    >
                      追
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                ※履歴かリストでクリックして編集元に履歴を追加してください。
              </div>

              {/* History Table */}
              <div className="border-2 border-gray-300 bg-white rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="w-[80px] border-r text-xs text-center">選択</TableHead>
                      <TableHead className="w-[150px] border-r text-xs">項目</TableHead>
                      <TableHead className="border-r text-xs">条件</TableHead>
                      <TableHead className="w-[80px] text-xs text-center">
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-blue-600"
                          onClick={handleClearAllHistory}
                        >
                          全削除
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="border-r text-xs text-center">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600 hover:underline"
                            onClick={() => handleHistoryClick(item.id)}
                          >
                            {item.id}
                          </Button>
                        </TableCell>
                        <TableCell className="border-r text-xs">{item.name}</TableCell>
                        <TableCell className="border-r text-xs">{item.value}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-blue-600"
                            onClick={() => handleDeleteHistory(item.id)}
                          >
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* 検索式 Section */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="p-4">
              <div className="mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">検索式</span>
              </div>

              <div className="space-y-3">
                <Input 
                  value={searchExpression}
                  onChange={(e) => setSearchExpression(e.target.value)}
                  className="bg-white border border-gray-300 h-8 text-xs"
                />

                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => setSearchExpression('')}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => handleAddToExpression('[')}
                  >
                    [
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => handleAddToExpression(']')}
                  >
                    ]
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => handleAddToExpression('*')}
                  >
                    *
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => handleAddToExpression('+')}
                  >
                    +
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 border-gray-300 text-xs"
                    onClick={() => handleAddToExpression('Not')}
                  >
                    Not
                  </Button>
                </div>

                {/* Count Check at bottom of 検索式 */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleCountCheck}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-6"
                  >
                    件数チェック
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      value={patentCount > 0 ? patentCount : ''}
                      readOnly
                      className="w-24 text-center border-2 border-gray-300"
                      placeholder="0"
                    />
                    <span className="text-sm">件</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex gap-3 justify-center pt-4 border-t-2 border-gray-200">
        <Button 
          variant="outline" 
          onClick={() => setShowDetailDialog(true)}
          className="border-2 border-orange-400 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 px-12 h-10 text-sm min-w-[150px]"
        >
          案件詳細
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowListDialog(true)}
          className="border-2 border-orange-400 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 px-12 h-10 text-sm min-w-[150px]"
        >
          案件一覧
        </Button>
        <Button 
          variant="outline" 
          className="border-2 border-orange-400 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 px-12 h-10 text-sm min-w-[150px]"
        >
          出力
        </Button>
      </div>

      {/* Patent Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded text-sm">
                案件詳細
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              特許情報の詳細を表示します
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">タイトルコード:</span>
                  <span className="ml-2">{patentDetail.titleCode}</span>
                </div>
                <div>
                  <span className="text-gray-600">タイトル名:</span>
                  <span className="ml-2">{patentDetail.titleName}</span>
                </div>
                <div>
                  <span className="text-gray-600">公開番号:</span>
                  <span className="ml-2 text-blue-600">{patentDetail.publicationNo}</span>
                </div>
                <div>
                  <span className="text-gray-600">登録番号:</span>
                  <span className="ml-2">{patentDetail.registrationNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">出願人:</span>
                  <span className="ml-2">{patentDetail.applicant}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">発明の名称:</span>
                  <span className="ml-2">{patentDetail.inventionName}</span>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <div className="bg-gray-100 px-3 py-1 mb-2 rounded text-sm">要約</div>
                <div className="bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap border">
                  {patentDetail.abstract}
                </div>
              </div>

              {/* Claims */}
              <div>
                <div className="bg-gray-100 px-3 py-1 mb-2 rounded text-sm">特許請求の範囲</div>
                <div className="bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap border">
                  {patentDetail.claims}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">発明者:</span>
                  <span className="ml-2">{patentDetail.inventor}</span>
                </div>
                <div>
                  <span className="text-gray-600">IPC:</span>
                  <span className="ml-2">{patentDetail.ipc}</span>
                </div>
                <div>
                  <span className="text-gray-600">出願番号:</span>
                  <span className="ml-2">{patentDetail.applicationNo}</span>
                </div>
                <div>
                  <span className="text-gray-600">出願日:</span>
                  <span className="ml-2">{patentDetail.applicationDate}</span>
                </div>
                <div>
                  <span className="text-gray-600">公開日:</span>
                  <span className="ml-2">{patentDetail.publicationDate}</span>
                </div>
                <div>
                  <span className="text-gray-600">登録日:</span>
                  <span className="ml-2">{patentDetail.registrationDate}</span>
                </div>
                <div>
                  <span className="text-gray-600">FI:</span>
                  <span className="ml-2">{patentDetail.fi}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fターム:</span>
                  <span className="ml-2">{patentDetail.fTerm}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Patent List Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0">
          <DialogHeader className="border-b pb-3 px-4 pt-4">
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                案件一覧
              </span>
              <span className="text-sm text-gray-500">({patentListData.length}件)</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              検索結果の特許案件一覧を表示します
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto px-4 pb-4">
            <Table className="border border-gray-300">
              <TableHeader>
                <TableRow className="bg-orange-100 hover:bg-orange-100">
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">文献番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">出願番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">出願日</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">公知日</TableHead>
                  <TableHead className="border-r text-xs px-3 py-2">発明の名称</TableHead>
                  <TableHead className="border-r text-xs px-3 py-2">出願人/権利者</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">公開番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">公告番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">登録番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">審判番号</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">その他</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">ステージ</TableHead>
                  <TableHead className="border-r text-xs whitespace-nowrap px-3 py-2">イベント</TableHead>
                  <TableHead className="text-xs px-3 py-2">文献URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patentListData.map((patent, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.documentNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.applicationNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.applicationDate}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.publicationDate}</TableCell>
                    <TableCell className="border-r text-xs px-3 py-2">{patent.inventionName}</TableCell>
                    <TableCell className="border-r text-xs px-3 py-2">{patent.applicant}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.publicationNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.announcementNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.registrationNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.trialNo}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.other}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.stage}</TableCell>
                    <TableCell className="border-r text-xs whitespace-nowrap px-3 py-2">{patent.event}</TableCell>
                    <TableCell className="text-xs px-3 py-2">
                      <a 
                        href={patent.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        リンク
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}