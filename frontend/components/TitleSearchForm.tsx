import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { titleAPI, patentAPI } from '../services/api';

interface TitleSearchFormProps {
  onBack?: () => void;
}

interface SearchResult {
  no: string;
  title: string;
  dataCount: number;
  department: string;
  responsible: string;
}

interface PatentListItem {
  documentNo: string;
  applicationNo: string;
  applicationDate: string;
  publicationDate: string;
  inventionName: string;
  applicant: string;
  publicationNo: string;
  announcementNo: string;
  registrationNo: string;
  trialNo: string;
  other: string;
  stage: string;
  event: string;
  documentUrl: string;
}

interface HistoryItem {
  id: string;
  name: string;
  value: string;
}

interface PatentDetail {
  titleCode: string;
  titleName: string;
  publicationNo: string;
  registrationNo: string;
  applicant: string;
  inventionName: string;
  abstract: string;
  claims: string;
  inventor: string;
  ipc: string;
  applicationNo: string;
  applicationDate: string;
  publicationDate: string;
  registrationDate: string;
  fi: string;
  fTerm: string;
  publicationType: string;
}

export function TitleSearchForm({ onBack }: TitleSearchFormProps) {
  const [searchMethod, setSearchMethod] = useState<'number' | 'condition'>('number');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [searchOption, setSearchOption] = useState<'exact' | 'partial'>('exact');
  const [patentCount, setPatentCount] = useState(0);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [searchExpression, setSearchExpression] = useState('S2×S1');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [patentListData, setPatentListData] = useState<PatentListItem[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(true);
  const [isLoadingPatents, setIsLoadingPatents] = useState(false);
  const [patentDetail, setPatentDetail] = useState<PatentDetail>({
    titleCode: '',
    titleName: '',
    publicationNo: '',
    registrationNo: '',
    applicant: '',
    inventionName: '',
    abstract: '',
    claims: '',
    inventor: '',
    ipc: '',
    applicationNo: '',
    applicationDate: '',
    publicationDate: '',
    registrationDate: '',
    fi: '',
    fTerm: '',
    publicationType: ''
  });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: 'S1', name: '権利者・出願人名', value: '' },
    { id: 'S2', name: '権利者・出願人名', value: '' }
  ]);

  // Fetch titles from API
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        console.log('🔄 Fetching titles for search...');
        const result = await titleAPI.getAll();
        
        if (result.data) {
          const titles = result.data.titles || (Array.isArray(result.data) ? result.data : []);
          setSearchResults(titles.map((t: any, idx: number) => ({
            no: t.no || `000${idx + 1}`,
            title: t.titleName || t.name,
            dataCount: t.patentCount || 0,
            department: t.department || '',
            responsible: t.creator || ''
          })));
        }
      } catch (err) {
        console.error('❌ Error fetching titles:', err);
      } finally {
        setIsLoadingTitles(false);
      }
    };
    fetchTitles();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTitles(searchResults.map((r: SearchResult) => r.no));
    } else {
      setSelectedTitles([]);
    }
  };

  const handleSelectTitle = (titleNo: string, checked: boolean) => {
    if (checked) {
      setSelectedTitles([...selectedTitles, titleNo]);
    } else {
      setSelectedTitles(selectedTitles.filter((no: string) => no !== titleNo));
    }
  };

  const handleCountCheck = () => {
    setPatentCount(34);
  };

  const handleDeleteHistory = (id: string) => {
    setHistoryItems(historyItems.filter((item: HistoryItem) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistoryItems([]);
  };

  const handleAddToExpression = (text: string) => {
    setSearchExpression(searchExpression + text);
  };

  const handleHistoryClick = (id: string) => {
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
        // 番号を入力して検索 UI - Same format as 条件を入力して検索
        <div className="space-y-4">
          {/* タイトル指定 Section */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="p-4">
              <div className="mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">タイトル指定</span>
              </div>
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs">用途:</span>
                  <Select defaultValue="patent">
                    <SelectTrigger className="bg-white border border-gray-300 h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patent">特許</SelectItem>
                      <SelectItem value="design">意匠</SelectItem>
                      <SelectItem value="trademark">商標</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">検索済み件数：405 件</span>
                  <Button size="sm" className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-700">
                    確認
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                ※確認した範囲をまず確定してください。からのタイトルから選んでください。
              </div>

              {/* Table */}
              <Card className="border-2 border-gray-300 bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="w-[60px] border-r text-xs text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox 
                            checked={selectedTitles.length === searchResults.length && searchResults.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-[9px]">全ON/OFF</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px] border-r text-xs text-center">No.</TableHead>
                      <TableHead className="border-r text-xs">保存データタイトル</TableHead>
                      <TableHead className="w-[130px] border-r text-xs">データ件数</TableHead>
                      <TableHead className="w-[120px] border-r text-xs">部署名</TableHead>
                      <TableHead className="w-[130px] text-xs">主担当者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.no} className="hover:bg-gray-50">
                        <TableCell className="border-r text-center">
                          <Checkbox 
                            checked={selectedTitles.includes(result.no)}
                            onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectTitle(result.no, typeof checked === 'boolean' ? checked : false)}
                          />
                        </TableCell>
                        <TableCell className="border-r text-xs text-center">{result.no}</TableCell>
                        <TableCell className="border-r text-xs">{result.title}</TableCell>
                        <TableCell className="border-r text-xs">{result.dataCount}</TableCell>
                        <TableCell className="border-r text-xs">{result.department}</TableCell>
                        <TableCell className="text-xs">{result.responsible}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </Card>

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
          {/* タイトル指定 Section */}
          <Card className="border-2 border-orange-200 bg-orange-50/30">
            <div className="p-4">
              <div className="mb-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">タイトル指定</span>
              </div>
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs">用途:</span>
                  <Select defaultValue="patent">
                    <SelectTrigger className="bg-white border border-gray-300 h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patent">特許</SelectItem>
                      <SelectItem value="design">意匠</SelectItem>
                      <SelectItem value="trademark">商標</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">検索済み件数：405 件</span>
                  <Button size="sm" className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-700">
                    確認
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                ※確認した範囲をまず確定してください。からのタイトルから選んでください。
              </div>

              {/* Table */}
              <Card className="border-2 border-gray-300 bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="w-[60px] border-r text-xs text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox 
                            checked={selectedTitles.length === searchResults.length && searchResults.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-[9px]">全ON/OFF</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[80px] border-r text-xs text-center">No.</TableHead>
                      <TableHead className="border-r text-xs">保存データタイトル</TableHead>
                      <TableHead className="w-[130px] border-r text-xs">データ件数</TableHead>
                      <TableHead className="w-[120px] border-r text-xs">部署名</TableHead>
                      <TableHead className="w-[130px] text-xs">主担当者</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result) => (
                      <TableRow key={result.no} className="hover:bg-gray-50">
                        <TableCell className="border-r text-center">
                          <Checkbox 
                            checked={selectedTitles.includes(result.no)}
                            onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectTitle(result.no, typeof checked === 'boolean' ? checked : false)}
                          />
                        </TableCell>
                        <TableCell className="border-r text-xs text-center">{result.no}</TableCell>
                        <TableCell className="border-r text-xs">{result.title}</TableCell>
                        <TableCell className="border-r text-xs">{result.dataCount}</TableCell>
                        <TableCell className="border-r text-xs">{result.department}</TableCell>
                        <TableCell className="text-xs">{result.responsible}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </Card>

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

              {/* History Table - Updated with new column names */}
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
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                書誌・明細書
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              特許案件の詳細情報を表示します
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-4">
              {/* Basic Info Section */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50/30 rounded border border-orange-200">
                <div>
                  <Label className="text-xs text-gray-600">タイトルコード</Label>
                  <p className="text-sm mt-1">{patentDetail.titleCode}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">タイトル名</Label>
                  <p className="text-sm mt-1">{patentDetail.titleName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">公開・公表番号</Label>
                  <p className="text-sm mt-1">{patentDetail.publicationNo}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">登録番号</Label>
                  <p className="text-sm mt-1">{patentDetail.registrationNo}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">権利者･出願人名</Label>
                  <p className="text-sm mt-1">{patentDetail.applicant}</p>
                </div>
              </div>

              {/* Invention Name */}
              <div className="p-4 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">送信</Button>
                  <Label className="text-sm">発明の名称</Label>
                </div>
                <p className="text-sm">{patentDetail.inventionName}</p>
              </div>

              {/* Abstract */}
              <div className="p-4 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">送信</Button>
                  <Label className="text-sm">要約</Label>
                </div>
                <div className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {patentDetail.abstract}
                </div>
              </div>

              {/* Claims */}
              <div className="p-4 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">送信</Button>
                  <Label className="text-sm">請求の範囲</Label>
                </div>
                <div className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                  {patentDetail.claims}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50/30 rounded border border-orange-200">
                <div>
                  <Label className="text-xs text-gray-600">発明者名</Label>
                  <p className="text-xs mt-1">{patentDetail.inventor}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">IPC</Label>
                  <p className="text-xs mt-1">{patentDetail.ipc}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">出願番号</Label>
                  <p className="text-xs mt-1">{patentDetail.applicationNo}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">出願日</Label>
                  <p className="text-xs mt-1">{patentDetail.applicationDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">公開・公表日</Label>
                  <p className="text-xs mt-1">{patentDetail.publicationDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">登録日</Label>
                  <p className="text-xs mt-1">{patentDetail.registrationDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">FI</Label>
                  <p className="text-xs mt-1">{patentDetail.fi}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Fターム</Label>
                  <p className="text-xs mt-1">{patentDetail.fTerm}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">公報種別</Label>
                  <p className="text-xs mt-1">{patentDetail.publicationType}</p>
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
                      <a href={patent.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {patent.documentUrl}
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
