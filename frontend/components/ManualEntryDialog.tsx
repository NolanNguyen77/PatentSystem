import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: any) => void;
}

export function ManualEntryDialog({
  open,
  onOpenChange,
  onSave,
}: ManualEntryDialogProps) {
  const [formData, setFormData] = useState({
    documentNo: "",
    applicationNo: "",
    applicationDate: "",
    publicationDate: "",
    inventionName: "",
    applicantName: "",
    publicationNo: "",
    announcementNo: "",
    registrationNo: "",
    appealNo: "",
    other: "",
    stage: "",
    event: "",
    documentUrl: "",
    abstract: "",
    claims: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validation
    const requiredFields = [
      { key: "documentNo", label: "文献番号" },
      { key: "applicationNo", label: "出願番号" },
      { key: "applicationDate", label: "出願日", isDate: true },
      { key: "publicationDate", label: "公知日", isDate: true },
      { key: "inventionName", label: "発明の名称" },
      { key: "applicantName", label: "出願人/権利者" },
      { key: "publicationNo", label: "公開番号" },
      // announcementNo is no longer a required field
      // registrationNo is no longer a required field
      // appealNo is no longer a required field
      // other is no longer a required field
      { key: "stage", label: "ステージ" },
      { key: "event", label: "イベント" },
      { key: "documentUrl", label: "文献URL" },
    ];

    const dateRegex = /^\d{4}\/\d{1,2}\/\d{1,2}$/;

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value) {
        setError(`${field.label}は必須です。`);
        return;
      }
      if (field.isDate && !dateRegex.test(value)) {
        setError(`${field.label}はYYYY/MM/DD形式で入力してください。`);
        return;
      }
    }

    setError(null);
    if (onSave) {
      onSave(formData);
    }
    // Reset form
    setFormData({
      documentNo: "",
      applicationNo: "",
      applicationDate: "",
      publicationDate: "",
      inventionName: "",
      applicantName: "",
      publicationNo: "",
      announcementNo: "",
      registrationNo: "",
      appealNo: "",
      other: "",
      stage: "",
      event: "",
      documentUrl: "",
      abstract: "",
      claims: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="border-b pb-3 px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              1件ずつ手入力で追加
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            特許データを手動で入力します
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-4 py-4 pb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                {error}
              </div>
            )}
            {/* 文献番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">文献番号</Label>
              <Input
                value={formData.documentNo}
                onChange={(e) => handleChange("documentNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 出願番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">出願番号</Label>
              <Input
                value={formData.applicationNo}
                onChange={(e) => handleChange("applicationNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 出願日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">出願日</Label>
              <Input
                value={formData.applicationDate}
                onChange={(e) => handleChange("applicationDate", e.target.value)}
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 公知日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">公知日</Label>
              <Input
                value={formData.publicationDate}
                onChange={(e) => handleChange("publicationDate", e.target.value)}
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 発明の名称 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">発明の名称</Label>
              <Input
                value={formData.inventionName}
                onChange={(e) => handleChange("inventionName", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 出願人/権利者 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">出願人/権利者</Label>
              <Input
                value={formData.applicantName}
                onChange={(e) => handleChange("applicantName", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公開番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">公開番号</Label>
              <Input
                value={formData.publicationNo}
                onChange={(e) => handleChange("publicationNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公告番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">公告番号</Label>
              <Input
                value={formData.announcementNo}
                onChange={(e) => handleChange("announcementNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 登録番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">登録番号</Label>
              <Input
                value={formData.registrationNo}
                onChange={(e) => handleChange("registrationNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 審判番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">審判番号</Label>
              <Input
                value={formData.appealNo}
                onChange={(e) => handleChange("appealNo", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* その他 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">その他</Label>
              <Input
                value={formData.other}
                onChange={(e) => handleChange("other", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* ステージ */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">ステージ</Label>
              <Input
                value={formData.stage}
                onChange={(e) => handleChange("stage", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* イベント */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">イベント</Label>
              <Input
                value={formData.event}
                onChange={(e) => handleChange("event", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 文献URL */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">文献URL</Label>
              <Input
                value={formData.documentUrl}
                onChange={(e) => handleChange("documentUrl", e.target.value)}
                className="bg-white border border-gray-300"
              />
            </div>



            {/* 要約 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
              <Label className="text-sm text-right pt-2">要約</Label>
              <Textarea
                value={formData.abstract}
                onChange={(e) => handleChange("abstract", e.target.value)}
                className="bg-white border border-gray-300 min-h-[100px]"
              />
            </div>
            {/* 請求の範囲 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start">
              <Label className="text-sm text-right pt-2">請求の範囲</Label>
              <Textarea
                value={formData.claims}
                onChange={(e) => handleChange("claims", e.target.value)}
                className="bg-white border border-gray-300 min-h-[100px]"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 flex justify-center">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-12 -mt-2"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}