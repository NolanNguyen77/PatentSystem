import { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, Check, Search, ArrowLeft, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ColorSelect } from './ColorSelect';
import { titleAPI } from '../services/api';

interface CreateTitleFormProps {
  onBack?: () => void;
  onSave?: (titleData: any) => void;
}

export function CreateTitleForm({ onBack, onSave }: CreateTitleFormProps) {
  const [permission, setPermission] = useState('');
  const [titleName, setTitleName] = useState('');
  const [dataType, setDataType] = useState(''); // 特許, 論文, etc.
  const [markType, setMarkType] = useState('マークなし');
  const [parentTitle, setParentTitle] = useState('');
  const [saveDate, setSaveDate] = useState('2025/11');
  const [disallowEvaluation, setDisallowEvaluation] = useState(false);
  const [allowEvaluation, setAllowEvaluation] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Fetch all users and departments from API
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [parentTitles, setParentTitles] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching users, departments, and parent titles...');
        const token = localStorage.getItem('authToken');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch users
        const usersRes = await fetch('http://localhost:4001/api/users', { headers });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.data && usersData.data.users) {
            setAllUsers(usersData.data.users);
            setUsers([{ 
              id: 1, 
              name: usersData.data.users[0]?.name || 'User', 
              userId: usersData.data.users[0]?.userId || '', 
              department: '調査力部所', 
              canEvaluate: true 
            }]);
          }
        }
        
        // Fetch departments
        const deptsRes = await fetch('http://localhost:4001/api/departments', { headers });
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          if (deptsData.data && deptsData.data.departments) {
            setDepartments(deptsData.data.departments);
          }
        }

        // Fetch parent titles
        try {
          const titlesResult = await titleAPI.getAll();
          if (titlesResult.data) {
            const titles = titlesResult.data.titles || (Array.isArray(titlesResult.data) ? titlesResult.data : []);
            setParentTitles(titles);
            console.log('✅ Loaded parent titles:', titles.length);
          }
        } catch (err) {
          console.error('❌ Error fetching parent titles:', err);
        }
        
        console.log('✅ Loaded users and departments');
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Mock department users
  const departmentUsers = {
    1: [
      { id: 1, userId: 'Nguyen', name: 'グエン・タイ・タン', dept: 'その他開発', section: '', permission: '管理者', isMain: true, displayOrder: 0, userDisplayOrder: 0, evalEmail: true, confirmEmail: true },
      { id: 2, userId: 'tsuji', name: 'つじま', dept: 'その他開発', section: '', permission: '管理者', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: true, confirmEmail: false },
    ],
    2: [
      { id: 3, userId: 'yamamoto', name: 'やまもと', dept: '個人営業', section: '', permission: '管理者', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
    ],
    3: [
      { id: 4, userId: 'yamamoto1', name: 'やまもと１', dept: '調査力開発', section: '', permission: '管理者', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
      { id: 5, userId: 'maruo', name: 'まるお', dept: '調査力開発', section: '', permission: '管理者', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
      { id: 6, userId: 'm_tym01', name: '一般　０１', dept: '調査力開発', section: '', permission: '一般', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
    ],
    4: [
      { id: 7, userId: 'yamamoto2', name: 'やまもと２', dept: '構佐', section: '', permission: '管理者', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
    ],
    5: [
      { id: 8, userId: 'm_tym02', name: '一般　０２', dept: '法人営業', section: '', permission: '一般', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
      { id: 9, userId: 'm_tym03', name: '一般　０３', dept: '法人営業', section: '', permission: '一般', isMain: false, displayOrder: 0, userDisplayOrder: 0, evalEmail: false, confirmEmail: true },
    ],
  };

  const handleDepartmentSelect = (deptId: number, checked: boolean) => {
    if (checked) {
      setSelectedDepartments([...selectedDepartments, deptId]);
    } else {
      setSelectedDepartments(selectedDepartments.filter(id => id !== deptId));
    }
  };

  const handleExecuteSettings = async () => {
    // Collect all users from selected departments
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const collectedUsers: any[] = [];
      
      for (const deptId of selectedDepartments) {
        try {
          const res = await fetch(`http://localhost:4001/api/departments/${deptId}/users`, { headers });
          if (res.ok) {
            const data = await res.json();
            const deptUsers = data.data?.users || [];
            collectedUsers.push(...deptUsers);
          }
        } catch (err) {
          console.error(`Error fetching users for department ${deptId}:`, err);
        }
      }
      
      // Update the main user list with selected department users
      setSelectedUsers(collectedUsers);
      console.log('✅ Added users from selected departments:', collectedUsers.length);
    } catch (err) {
      console.error('❌ Error executing department settings:', err);
    }
    
    // Close the dialog
    setShowDepartmentDialog(false);
    
    // Reset selections
    setSelectedDepartments([]);
  };

  const handleToggleMain = (userId: number) => {
    setSelectedUsers(selectedUsers.map(user => 
      user.id === userId ? { ...user, isMain: !user.isMain } : user
    ));
  };

  const handleAddEmptyRow = () => {
    const newUser = {
      id: Date.now(),
      userId: '',
      name: '',
      dept: '',
      section: '',
      permission: '一般',
      isMain: false,
      displayOrder: 0,
      userDisplayOrder: 0,
      evalEmail: false,
      confirmEmail: false,
      isEmpty: true
    };
    setSelectedUsers([...selectedUsers, newUser]);
  };

  const handleDeleteUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleOpenUserSearch = (userId: number) => {
    setEditingUserId(userId);
    setShowUserSearchDialog(true);
  };

  const handleSelectUserFromDialog = (selectedUser: any) => {
    if (editingUserId) {
      // Update the row with selected user info
      setSelectedUsers(selectedUsers.map(user => 
        user.id === editingUserId ? {
          ...user,
          userId: selectedUser.userId,
          name: selectedUser.name,
          dept: selectedUser.dept,
          permission: selectedUser.permission,
          isEmpty: false
        } : user
      ));
      
      // Close dialog and reset
      setShowUserSearchDialog(false);
      setEditingUserId(null);
    }
  };

  const handleSubmit = () => {
    if (!titleName) {
      setShowWarning(true);
      return;
    }
    // Handle form submission
    const titleData = {
      titleName,
      dataType,
      markType,
      parentTitle,
      saveDate,
      disallowEvaluation,
      allowEvaluation,
      selectedUsers
    };
    if (onSave) {
      onSave(titleData);
    }
    console.log('Form submitted');
  };

  return (
    <div className="space-y-6">
      {/* Header with title */}
      <div className="flex items-center gap-4 mb-4">
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            一覧に戻る
          </Button>
        )}
        <h2 className="text-2xl bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          新規タイトル作成
        </h2>
      </div>

      {/* Warning message */}
      {showWarning && (
        <Alert className="bg-yellow-50 border-yellow-300">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            タイトルの基本情報を設定します。
          </AlertDescription>
        </Alert>
      )}

      {/* Header with buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-lg">タイトルの基本情報を設定します。</span>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          >
            保存
          </Button>
        </div>
      </div>

      {/* Section 1: Title Name (Required) */}
      <Card className="border-2 border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">必須</span>
            <span>1.保存データタイトル名</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: Data Type and Mark Type */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="dataType">データ種別</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger id="dataType" className="border-2">
                    <SelectValue placeholder="一選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="特許">特許</SelectItem>
                    <SelectItem value="論文">論文</SelectItem>
                    <SelectItem value="意匠">意匠</SelectItem>
                    <SelectItem value="商標">商標</SelectItem>
                    <SelectItem value="フリー">フリー</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="markType">マーク</Label>
                <ColorSelect 
                  id="markType"
                  value={markType} 
                  onValueChange={setMarkType}
                  className="border-2"
                />
              </div>
            </div>

            {/* Row 2: Title Name and Parent Title */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="titleName">タイトル名</Label>
                <Input 
                  id="titleName"
                  value={titleName}
                  onChange={(e) => setTitleName(e.target.value)}
                  placeholder="タイトル名を入力してください"
                  className="border-2"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="parentTitle">上位階層タイトル</Label>
                <Select value={parentTitle} onValueChange={setParentTitle}>
                  <SelectTrigger id="parentTitle" className="border-2">
                    <SelectValue placeholder="一選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentTitles.map((title: any) => (
                      <SelectItem key={title.id || title.no} value={title.no || title.id}>
                        {title.no}：{title.titleName || title.name || title.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Row 3: Save Date */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="saveDate">保存年月</Label>
                <Input 
                  id="saveDate"
                  value={saveDate}
                  onChange={(e) => setSaveDate(e.target.value)}
                  placeholder="（入力形式：YYYY/MM）"
                  className="border-2"
                />
              </div>
              <div className="flex-1">
                {/* Empty space for alignment */}
              </div>
            </div>
            
            {/* Evaluation display permission */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="disallow-eval"
                    checked={disallowEvaluation}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      setDisallowEvaluation(typeof checked === 'boolean' ? checked : false);
                      if (checked) setAllowEvaluation(false);
                    }}
                  />
                  <Label htmlFor="disallow-eval" className="cursor-pointer">
                    他タイトルからの評価の表示を許可しない
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="allow-eval"
                    checked={allowEvaluation}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      setAllowEvaluation(typeof checked === 'boolean' ? checked : false);
                      if (checked) setDisallowEvaluation(false);
                    }}
                  />
                  <Label htmlFor="allow-eval" className="cursor-pointer">
                    許可する
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: User Management Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="font-bold">2.利用者管理設定</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            このタイトルで評価を行える人を設定できます。管理者のユーザーは必須対象です。<br />
            管理者のみ登録できる設定となります。評価済みになった人は削除されても保存されます。<br />
            削除者検定はシステムの中の削除評価・公開評価の登録は削除しません。
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-center text-gray-500 border-2 border-gray-200 rounded p-2">
            書籍が指定されていません
          </div>
          
          {/* Department Settings Button */}
          <div className="mb-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowDepartmentDialog(true)}
              className="border-2"
            >
              部署で設定
            </Button>
          </div>

          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <TableHead>新規</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead>ユーザID</TableHead>
                  <TableHead>権限</TableHead>
                  <TableHead>部署名</TableHead>
                  <TableHead>主担当</TableHead>
                  <TableHead>評価特権</TableHead>
                  <TableHead className="text-center">削除</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Button size="sm" variant="outline" className="h-8">
                        新規
                      </Button>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{user.userId}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-5 w-5 p-0"
                          onClick={() => handleOpenUserSearch(user.id)}
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={user.permission}>
                        <SelectTrigger className="h-8 border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="管理者">管理者</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                          <SelectItem value="関覧">関覧</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{user.dept}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleMain(user.id)}
                          className="focus:outline-none"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 ${user.isMain ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}>
                            {user.isMain && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox defaultChecked={user.evalEmail} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-orange-500 hover:text-orange-700"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button size="sm" variant="outline" className="mt-4" onClick={handleAddEmptyRow}>
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </CardContent>
      </Card>

      {/* Department Dialog */}
      <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1 rounded">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">特許ナビ</span>
              </div>
              <span className="text-gray-400">|</span>
              <DialogTitle className="text-base">部署で設定</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              部署を選択してユーザーを設定します
            </DialogDescription>
            <Button 
              variant="link" 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setShowDepartmentDialog(false)}
            >
              閉じる
            </Button>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <Button 
                size="sm" 
                variant="outline"
                className="border-2"
                onClick={handleExecuteSettings}
              >
                設定を実行する
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="text-blue-500 hover:text-blue-700"
              >
                <span className="mr-2">🔄</span>
                最新に更新
              </Button>
            </div>

            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-20">表示順</TableHead>
                    <TableHead className="w-32">No.</TableHead>
                    <TableHead>部署名</TableHead>
                    <TableHead>部署略称</TableHead>
                    <TableHead className="text-right">ユーザー数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept.id} className="hover:bg-gray-50">
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedDepartments.includes(dept.id)}
                            onCheckedChange={(checked: boolean | 'indeterminate') => handleDepartmentSelect(dept.id, typeof checked === 'boolean' ? checked : false)}
                          />
                        </TableCell>
                        <TableCell>{dept.no}</TableCell>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell className="text-gray-400">{dept.abbr}</TableCell>
                        <TableCell className="text-right">{dept.userCount}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        要望が設定されていません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Search Dialog */}
      <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1 rounded">
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">特許ナビ</span>
              </div>
              <span className="text-gray-400">|</span>
              <DialogTitle className="text-base">ユーザ指定補助</DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              ユーザーを検索して追加します
            </DialogDescription>
            <Button 
              variant="link" 
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setShowUserSearchDialog(false)}
            >
              閉じる
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-40">ユーザID</TableHead>
                    <TableHead>氏名</TableHead>
                    <TableHead className="w-48">部署</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user, index) => (
                    <TableRow 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectUserFromDialog(user)}
                    >
                      <TableCell>{user.userId}</TableCell>
                      <TableCell className="text-blue-600">{user.name}</TableCell>
                      <TableCell>{user.dept}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}