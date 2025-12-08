import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { titleAPI, mergeAPI } from '../services/api';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { notifySuccess, notifyError, notifyWarning } from '../utils/notifications';

interface MergeDataFormProps {
  onBack?: () => void;
}

export function MergeDataForm({ onBack }: MergeDataFormProps) {
  const [mergeTitle, setMergeTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]); // Array of title IDs (no/id)
  const [showExtractionCondition, setShowExtractionCondition] = useState(false);
  const [extractionType, setExtractionType] = useState('evaluation');
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [titleData, setTitleData] = useState<any[]>([]);
  const [evaluationData, setEvaluationData] = useState<any[]>([]);
  const [priorityList, setPriorityList] = useState<any[]>([]); // List of titles for priority
  const [isLoading, setIsLoading] = useState(true);

  // Fetch titles and evaluations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching titles...');
        const result = await titleAPI.getAll();

        if (result.data) {
          console.log('📦 MergeDataForm Raw Result:', result);
          let titles: any[] = [];

          // Try to find the titles array in various locations
          // 1. result.data.data.titles (nested response from some controllers)
          if (result.data.data && Array.isArray(result.data.data.titles)) {
            console.log('Found titles in result.data.data.titles');
            titles = result.data.data.titles;
          }
          // 2. result.data.titles (direct response from titleAPI.getAll)
          else if (result.data.titles && Array.isArray(result.data.titles)) {
            console.log('Found titles in result.data.titles');
            titles = result.data.titles;
          }
          // 3. result.data.data (if data itself is the array)
          else if (result.data.data && Array.isArray(result.data.data)) {
            console.log('Found titles in result.data.data (array)');
            titles = result.data.data;
          }
          // 4. result.data (if result.data is the array)
          else if (Array.isArray(result.data)) {
            console.log('Found titles in result.data (array)');
            titles = result.data;
          } else {
            console.warn('Could not find titles array in response', result);
          }

          console.log('✅ Parsed titles:', titles);

          if (titles.length === 0) {
            console.warn('Titles array is empty!');
          }

          setTitleData(titles.map((t: any, idx: number) => ({
            no: t.no || t.titleNo || `000${idx + 1}`,
            title: t.titleName || t.name || '名称なし',
            id: t.id
          })));
        }

        // Initialize empty evaluations array (will be populated from database when needed)
        setEvaluationData([]);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTitles(titleData.map(t => t.id));
    } else {
      setSelectedTitles([]);
    }
  };

  const handleSelectTitle = (titleNo: string, checked: boolean) => {
    if (checked) {
      setSelectedTitles([...selectedTitles, titleNo]);
    } else {
      setSelectedTitles(selectedTitles.filter(id => id !== titleNo));
    }
  };

  const handleSelectTitles = async () => {
    if (selectedTitles.length === 0) {
      notifyWarning('タイトルを選択してください');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Calling getMergeCandidates with:', selectedTitles);
      const result = await mergeAPI.getMergeCandidates(selectedTitles);
      console.log('📦 getMergeCandidates Result:', result);

      if (result.data) {
        // Check for nested data structure
        const data = result.data.data || result.data;
        console.log('📂 Processed Data:', data);

        if (!data.titles || !data.evaluations) {
          console.error('❌ Missing titles or evaluations in response data');
          throw new Error('Invalid response format');
        }

        setPriorityList(data.titles);
        setEvaluationData(data.evaluations);
        // Default select all evaluations
        if (Array.isArray(data.evaluations)) {
          setSelectedEvaluations(data.evaluations.map((e: any) => e.id));
        }
        setShowExtractionCondition(true);
      } else if (result.error) {
        notifyError('エラー', result.error);
      }
    } catch (error) {
      console.error('Error fetching merge candidates:', error);
      notifyError('マージ候補の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newList = [...priorityList];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setPriorityList(newList);
  };

  const handleSelectAllEvaluations = (checked: boolean) => {
    if (checked) {
      setSelectedEvaluations(evaluationData.map(e => e.id));
    } else {
      setSelectedEvaluations([]);
    }
  };

  const handleSelectEvaluation = (evalId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvaluations([...selectedEvaluations, evalId]);
    } else {
      setSelectedEvaluations(selectedEvaluations.filter(id => id !== evalId));
    }
  };

  const handleMerge = async () => {
    if (!mergeTitle || !department || selectedTitles.length === 0) {
      notifyWarning('データタイトル名、部門、マージタイトルを選択してください');
      return;
    }

    setIsLoading(true);
    try {
      const result = await mergeAPI.mergeTitles({
        newTitleName: mergeTitle,
        department,
        priorityList: priorityList.map(t => t.id),
        selectedEvaluations
      });

      if (result.data) {
        notifySuccess('マージを実行しました');
        if (onBack) onBack();
      } else if (result.error) {
        notifyError('エラー', result.error);
      }
    } catch (error) {
      console.error('Merge failed:', error);
      notifyError('マージに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Button */}
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
      </div>

      {/* Info Text */}
      <div className="text-sm text-gray-700">
        特許タイトルのマージが可能です。
      </div>

      {/* Section 1: マージ */}
      <Card className="border-2 border-orange-200 bg-orange-50/30">
        <div className="p-4">
          <div className="mb-4">
            <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">①マージ</span>
          </div>

          <div className="space-y-4">
            {/* データタイトル名 */}
            <div>
              <Label className="text-sm mb-2 block">
                データタイトル名<span className="text-red-500 ml-1">(必須)</span>
              </Label>
              <Input
                value={mergeTitle}
                onChange={(e) => setMergeTitle(e.target.value)}
                className="bg-white border-2 border-gray-300"
                placeholder="マージ後のタイトル名を入力"
              />
            </div>

            {/* 部門 */}
            <div>
              <Label className="text-sm mb-2 block">
                部門<span className="text-red-500 ml-1">(必須)</span>
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="bg-white border-2 border-gray-300">
                  <SelectValue placeholder="部門選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dept1">開発部</SelectItem>
                  <SelectItem value="dept2">研究部</SelectItem>
                  <SelectItem value="dept3">技術部</SelectItem>
                  <SelectItem value="dept4">企画部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: マージタイトル選択 */}
      <Card className="border-2 border-orange-200 bg-orange-50/30">
        <div className="p-4">
          <div className="mb-4">
            <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">②マージタイトル選択</span>
          </div>

          <div className="text-xs text-gray-600 mb-3">
            (主評価のタイトルはマージ対象外です)
          </div>

          {/* Table */}
          <Card className="border-2 border-gray-300 bg-white overflow-hidden mb-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="w-[100px] border-r text-xs text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Checkbox
                        checked={selectedEvaluations.length === evaluationData.length && evaluationData.length > 0}
                        onCheckedChange={handleSelectAllEvaluations}
                      />
                      <span className="ml-1">全ON／OFF</span>
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] border-r text-xs text-center">No.</TableHead>
                  <TableHead className="text-xs">タイトル名</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {titleData.map((title) => (
                  <TableRow key={title.no} className="hover:bg-gray-50">
                    <TableCell className="border-r text-center">
                      <Checkbox
                        checked={selectedTitles.includes(title.id)}
                        onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectTitle(title.id, typeof checked === 'boolean' ? checked : false)}
                      />
                    </TableCell>
                    <TableCell className="border-r text-xs text-center">{title.no}</TableCell>
                    <TableCell className="text-xs">{title.title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Select Button */}
          <div className="flex justify-start">
            <Button
              onClick={handleSelectTitles}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8"
            >
              チェックしたタイトルを選択
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 3: 抽出条件 */}
      {showExtractionCondition && (
        <Card className="border-2 border-orange-200 bg-blue-50/30">
          <div className="p-4">
            <div className="mb-4">
              <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">③マージデータの抽出条件</span>
            </div>
            <div className="space-y-4">
              {/* Table */}
              <Card className="border-2 border-gray-300 bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[120px] border-r text-xs text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Checkbox
                            checked={selectedEvaluations.length === evaluationData.length && evaluationData.length > 0}
                            onCheckedChange={handleSelectAllEvaluations}
                          />
                          <span className="ml-1">全ON／OFF</span>
                        </div>
                      </TableHead>
                      <TableHead className="border-r text-xs text-center">評価記号</TableHead>
                      <TableHead className="text-xs text-center">項目名</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluationData.map((evaluation) => (
                      <TableRow key={evaluation.id} className="hover:bg-gray-50">
                        <TableCell className="border-r text-center">
                          <Checkbox
                            checked={selectedEvaluations.includes(evaluation.id)}
                            onCheckedChange={(checked: boolean | 'indeterminate') => handleSelectEvaluation(evaluation.id, typeof checked === 'boolean' ? checked : false)}
                          />
                        </TableCell>
                        <TableCell className="border-r text-xs text-center">{evaluation.code}</TableCell>
                        <TableCell className="text-xs">{evaluation.itemName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </Card>
      )}

      {/* Merge Button */}
      {showExtractionCondition && (
        <div className="flex justify-end">
          <Button
            onClick={handleMerge}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8"
          >
            保存データマージの実行
          </Button>
        </div>
      )}
    </div>
  );
}