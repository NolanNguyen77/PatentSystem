import { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, Search, ArrowLeft, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ColorSelect } from './ColorSelect';
import { AssignmentDialog } from './AssignmentDialog';
import { titleAPI } from '../services/api';

interface SavedTitleManagementProps {
  onBack?: () => void;
  onSave?: (titleData: any) => void;
  titleData?: any; // Pre-populated data for existing title
}

export function SavedTitleManagement({ onBack, onSave, titleData }: SavedTitleManagementProps) {
  // Pre-populate with existing title data
  const [titleName, setTitleName] = useState('');
  const [dataType, setDataType] = useState('');
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);
  const [permissionWarningMessage, setPermissionWarningMessage] = useState('');

  // Update state when titleData changes
  // Update state when titleData changes
  useEffect(() => {
    const loadTitleData = async () => {
      if (titleData) {
        setTitleName(titleData.title || '');
        setDataType(titleData.dataType || '特許');
        setSaveDate(titleData.date || '2025/11');

        // Set parent title if exists
        if (titleData.parentTitleId) {
          setParentTitle(String(titleData.parentTitleId));
          console.log('✅ Set parent title ID:', titleData.parentTitleId);
        } else if (titleData.parentTitle) {
          // parentTitle might be an object { id, no, name }
          const parentId = typeof titleData.parentTitle === 'object'
            ? String(titleData.parentTitle.id || titleData.parentTitle.no)
            : String(titleData.parentTitle);
          setParentTitle(parentId);
          console.log('✅ Set parent title from object:', parentId, titleData.parentTitle);
        }

        // Convert markColor to markType
        const colorToMarkMap: { [key: string]: string } = {
          '': 'マークなし',
          '#dc2626': 'レッド',
          '#f97316': 'オレンジ',
          '#facc15': 'イエロー',
          '#22c55e': 'グリーン',
          '#3b82f6': 'ブルー',
          '#9333ea': 'パープル',
          '#ec4899': 'ピンク',
          '#22d3ee': 'ネオンブルー',
          '#a3e635': 'イエローグリーン',
          '#9ca3af': 'グレー',
        };
        setMarkType(colorToMarkMap[titleData.markColor || ''] || 'マークなし');

        // Load users
        if (titleData.users && Array.isArray(titleData.users) && titleData.users.length > 0) {
          console.log('✅ Using provided users from titleData');
          setSelectedUsers(titleData.users.map((u: any) => ({
            ...u,
            isExisting: true
          })));
        } else if (titleData.id) {
          try {
            console.log('🔄 Fetching full title details for users...', titleData.id);
            const res = await titleAPI.getById(String(titleData.id));
            console.log('📦 Full API response:', res);
            console.log('📦 res.data:', res.data);
            console.log('📦 res.data.data:', res.data?.data);

            // Backend returns nested structure: { data: { data: { titleUsers: [...] } } }
            const titleDetails = res.data?.data || res.data;
            const usersList = titleDetails?.users || titleDetails?.titleUsers;
            console.log('📦 titleDetails:', titleDetails);
            console.log('📦 usersList:', usersList);

            if (usersList && Array.isArray(usersList)) {
              console.log('✅ Fetched users:', usersList);
              console.log('📋 First user in list:', usersList[0]);
              const mappedUsers = usersList.map((u: any) => {
                // Handle nested user object (from titleUsers relation) or flat user object
                const userInfo = u.user || u;
                console.log('🔍 Mapping user - raw u:', u);
                console.log('🔍 Mapping user - userInfo:', userInfo);
                console.log('🔍 userInfo.id:', userInfo.id, 'userInfo.userId:', userInfo.userId);

                // Determine permission
                let permission = u.permission || '一般';
                if (u.isAdmin) permission = '管理者';
                else if (u.isViewer) permission = '閲覧';
                else if (u.isGeneral) permission = '一般';

                const mapped = {
                  id: userInfo.id || Date.now() + Math.random(),
                  userId: userInfo.userId,
                  name: userInfo.name || userInfo.userId,
                  dept: userInfo.department?.name || userInfo.department || '',
                  permission: permission,
                  isMain: u.isMainResponsible || false,
                  evalEmail: u.evalEmail || false,
                  isExisting: true
                };
                console.log('✅ Mapped user result:', mapped);
                return mapped;
              });
              setSelectedUsers(mappedUsers);
            } else {
              console.warn('⚠️ No users found in API response, falling back to default');
              // Fallback
              setSelectedUsers([{
                id: Date.now(),
                name: titleData.responsible || '',
                userId: titleData.responsibleId || '',
                dept: titleData.department || '',
                permission: '管理者',
                isMain: true,
                evalEmail: true,
                isExisting: true
              }]);
            }
          } catch (err) {
            console.error('❌ Failed to fetch title details:', err);
          }
        }
      }
    };

    loadTitleData();
  }, [titleData]);

  // Fetch all users and departments from API
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
          console.log('📦 Raw users API response:', usersData);
          console.log('📦 usersData.data:', usersData.data);
          console.log('📦 usersData.data.users:', usersData.data?.users);

          if (usersData.data && usersData.data.users) {
            console.log('👤 First user sample:', usersData.data.users[0]);
            console.log('👤 First user keys:', Object.keys(usersData.data.users[0]));

            const mappedUsers = usersData.data.users.map((u: any) => {
              const deptName = typeof u.department === 'string'
                ? u.department
                : (u.department?.name || u.departmentName || '');
              console.log(`Mapping user - id: ${u.id}, userId: ${u.userId}, name: ${u.name}`);
              return {
                id: u.id,
                userId: u.userId, // This is the login username
                name: u.name,
                dept: deptName,
                permission: u.permission || '一般'
              };
            });

            console.log('✅ Mapped users:', mappedUsers);
            setAllUsers(mappedUsers);

            // Check if current user is admin
            const currentUsername = localStorage.getItem('username');
            const currentUser = usersData.data.users.find((u: any) => u.userId === currentUsername);
            if (currentUser && (currentUser.permission === '管理者' || currentUser.role === '管理者' || currentUser.isAdmin)) {
              setIsAdmin(true);
              console.log('✅ Current user is admin');
            }
          }
        }

        // Fetch departments
        const deptsRes = await fetch('http://localhost:4001/api/users/departments', { headers });
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          if (deptsData.data && deptsData.data.departments) {
            setDepartments(deptsData.data.departments);
          }
        } else {
          console.error('❌ Failed to fetch departments:', deptsRes.status, deptsRes.statusText);
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
            // Normalize users
            const normalized = deptUsers.map((u: any) => ({
              ...u,
              dept: u.dept || (u.department && (u.department.name || u.department.title || u.department.no)) || u.departmentName || '',
              isMain: u.isMainResponsible || false,
            }));
            collectedUsers.push(...normalized);
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
    const targetUser = selectedUsers.find(u => u.id === userId);
    if (!targetUser) return;

    // Check permission: only '管理者' can be main responsible
    if (targetUser.permission !== '管理者') {
      setPermissionWarningMessage('主担当は管理者のみ設定可能です。');
      setShowPermissionWarning(true);
      return;
    }

    // Toggle logic:
    // If clicking on current main -> toggle off (no main responsible) or keep on?
    // Requirement: "only 1 user as main". Usually implies radio behavior.
    // If we allow 0 main, then toggle is fine. If we require 1 main, we shouldn't allow toggling off the only main.
    // Assuming we allow toggling off for now, but if turning ON, we must turn OFF others.

    setSelectedUsers(prevUsers => {
      const isCurrentlyMain = targetUser.isMain;
      const willBeMain = !isCurrentlyMain;

      if (willBeMain) {
        // Set target to true, all others to false
        return prevUsers.map(u => ({
          ...u,
          isMain: u.id === userId
        }));
      } else {
        // Set target to false, others remain false
        return prevUsers.map(u => u.id === userId ? { ...u, isMain: false } : u);
      }
    });
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

  const handleSubmit = async () => {
    if (!titleName) {
      setShowWarning(true);
      return;
    }

    try {
      // Filter out users without userId
      const validUsers = selectedUsers.filter(u => u.userId && u.userId.trim() !== '');

      const updateData = {
        users: validUsers.map((u, index) => ({
          userId: u.userId,
          isMainResponsible: u.isMain || false,
          permission: u.permission || '一般',
          evalEmail: u.evalEmail || false,
          confirmEmail: u.confirmEmail || false,
          displayOrder: index
        }))
      };

      console.log('📤 Updating title users:', updateData);
      console.log('📤 Valid users count:', validUsers.length);

      const result = await titleAPI.update(titleData.id, updateData);

      console.log('📦 API Result:', result);

      if (result.error) {
        console.error('❌ Failed to update title:', result.error);
        alert(`タイトル更新に失敗しました\n\n${result.error}`);
        return;
      }

      console.log('✅ Title updated successfully:', result.data);
      alert('タイトルを更新しました');

      // Call onSave callback
      if (onSave) {
        onSave({ success: true });
      }
    } catch (error) {
      console.error('❌ Error updating title:', error);
      alert(`タイトル更新中にエラーが発生しました\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
          保存タイトル管理
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
          <span className="text-lg">保存されたタイトルの基本情報を編集します。</span>
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
                <Select value={dataType} onValueChange={setDataType} disabled={!!titleData}>
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
                  disabled={!!titleData}
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
                  disabled={!!titleData}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="parentTitle">上位階層タイトル</Label>
                {titleData ? (
                  <Input
                    value={(() => {
                      // Case 1: We have the full object from props
                      if (titleData.parentTitle && typeof titleData.parentTitle === 'object') {
                        const no = titleData.parentTitle.no || titleData.parentTitle.titleNo || '';
                        const name = titleData.parentTitle.name || titleData.parentTitle.titleName || '';
                        return `${no}：${name}`;
                      }

                      // Case 2: We only have ID, try to find in loaded parentTitles
                      if (parentTitle && parentTitles.length > 0) {
                        const found = parentTitles.find((t: any) => String(t.id) === String(parentTitle) || String(t.no) === String(parentTitle));
                        if (found) {
                          return `${found.no}：${found.titleName || found.name || found.title}`;
                        }
                      }

                      // Case 3: Only ID available or nothing
                      return parentTitle ? String(parentTitle) : 'なし';
                    })()}
                    disabled
                    className="border-2 bg-gray-100 text-gray-500"
                  />
                ) : (
                  <Select
                    value={String(parentTitle)}
                    onValueChange={(value) => {
                      console.log('📝 Parent title changed to:', value);
                      setParentTitle(value);
                    }}
                  >
                    <SelectTrigger id="parentTitle" className="border-2">
                      <SelectValue placeholder="一選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentTitles.map((title: any) => {
                        const itemValue = String(title.id || title.no);
                        console.log('📋 Parent title option:', { id: title.id, no: title.no, value: itemValue, name: title.titleName || title.name || title.title });
                        return (
                          <SelectItem key={itemValue} value={itemValue}>
                            {title.no}：{title.titleName || title.name || title.title}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
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
                  disabled={!!titleData}
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

      {/* Section 2: User Management Settings */}
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
                      <Select
                        value={user.permission}
                        onValueChange={(value: string) => {
                          setSelectedUsers(selectedUsers.map(u => {
                            if (u.id === user.id) {
                              // If permission changes to something other than Admin, remove main responsible status
                              const isMain = value === '管理者' ? u.isMain : false;
                              return { ...u, permission: value, isMain };
                            }
                            return u;
                          }));
                        }}
                      >
                        <SelectTrigger className="h-8 border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="管理者">管理者</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                          <SelectItem value="閲覧">閲覧</SelectItem>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-orange-500 hover:text-orange-700"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.isExisting && !isAdmin} // Disable delete for existing users unless admin
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

      {/* Permission Warning Dialog */}
      <Dialog open={showPermissionWarning} onOpenChange={setShowPermissionWarning}>
        <DialogContent className="max-w-md border-2 border-orange-200">
          <DialogHeader className="flex flex-row items-center gap-2 border-b border-orange-100 pb-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <DialogTitle className="text-lg text-orange-600">エラー</DialogTitle>
            <DialogDescription className="sr-only">
              権限エラー
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{permissionWarningMessage}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowPermissionWarning(false)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}