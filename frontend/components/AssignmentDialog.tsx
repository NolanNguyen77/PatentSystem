import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface User {
  id: string;
  userId: string;
  userName: string;
  assignedCount: number;
  isChecked: boolean;
}

interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titleNo?: string;
  titleName?: string;
}

export function AssignmentDialog({ isOpen, onClose, titleNo, titleName }: AssignmentDialogProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      userId: 'Nguyen',
      userName: 'グエン・ダイン・タン',
      assignedCount: 6,
      isChecked: false
    }
  ]);

  const [allChecked, setAllChecked] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('add');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const unassignedCount = 36;
  const totalCount = 42;
  const maxNo = 8;

  const handleToggleAll = () => {
    const newChecked = !allChecked;
    setAllChecked(newChecked);
    setUsers(users.map(u => ({ ...u, isChecked: newChecked })));
  };

  const handleUserToggle = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isChecked: !u.isChecked } : u
    ));
  };

  const handleAssignment = () => {
    console.log('Assignment mode:', assignmentMode);
    console.log('Range:', rangeFrom, '-', rangeTo);
    console.log('Selected users:', users.filter(u => u.isChecked));
    // Handle assignment logic here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                特許ナビ
              </span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-700">担当者設定</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              閉じる
            </Button>
          </div>
          <DialogDescription className="sr-only">
            担当者を一括で設定・管理するためのダイアログです。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* User Table */}
          <div className="border-2 border-orange-300 rounded-lg overflow-hidden bg-orange-50/30">
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 flex items-center justify-between border-b-2 border-orange-300">
              <div className="flex items-center gap-3">
                <span className="text-sm">CK</span>
                <span className="text-sm">全</span>
                <button
                  onClick={handleToggleAll}
                  className={`text-sm px-2 py-0.5 rounded ${
                    allChecked 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  ON
                </button>
                <span className="text-sm text-gray-400">/</span>
                <button
                  onClick={handleToggleAll}
                  className={`text-sm px-2 py-0.5 rounded ${
                    !allChecked 
                      ? 'bg-gray-300 text-gray-700' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  OFF
                </button>
              </div>
              <div className="text-sm text-gray-700">
                未分担件数 <span className="text-orange-600">{unassignedCount}</span> 件 / 
                全件数 <span className="text-blue-600">{totalCount}</span> 件
              </div>
            </div>

            <table className="w-full bg-white">
              <thead className="bg-orange-50 border-b border-orange-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm w-16">CK</th>
                  <th className="px-4 py-2 text-left text-sm">ユーザID</th>
                  <th className="px-4 py-2 text-left text-sm">ユーザ名</th>
                  <th className="px-4 py-2 text-left text-sm w-24">分担件数</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={user.isChecked}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">{user.userId}</td>
                    <td className="px-4 py-2 text-sm">{user.userName}</td>
                    <td className="px-4 py-2 text-sm text-center">{user.assignedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assignment Options */}
          <div className="border-2 border-orange-300 rounded-lg p-4 space-y-3 bg-orange-50/30">
            <RadioGroup value={assignmentMode} onValueChange={setAssignmentMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="text-sm cursor-pointer">
                  指定したユーザを担当者として追加する
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="text-sm cursor-pointer">
                  担当者を指定したユーザに置き換える
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="text-sm cursor-pointer">
                  全担当者を外す
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm">No</span>
              <Input
                type="text"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="w-24 h-8 text-sm"
                placeholder=""
              />
              <span className="text-sm">〜</span>
              <Input
                type="text"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                className="w-24 h-8 text-sm"
                placeholder=""
              />
              <span className="text-sm">まで</span>
              <span className="text-sm text-gray-500 ml-4">最終No:{maxNo}</span>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleAssignment}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6"
              >
                一括分担実行
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}