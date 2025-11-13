import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
    applicationNo: "",
    applicationDate: "",
    publicationNo: "",
    publicationDate: "",
    caseGroupNo: "",
    announcementNo: "",
    announcementDate: "",
    registrationNo: "",
    registrationDate: "",
    examinationGazetteDate: "",
    gazetteNo: "",
    gazetteDate: "",
    gazetteTypeCode: "",
    familyNo: "",
    applicantName: "",
    applicantName1: "",
    applicantName2: "",
    applicantName3: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    // Reset form
    setFormData({
      applicationNo: "",
      applicationDate: "",
      publicationNo: "",
      publicationDate: "",
      caseGroupNo: "",
      announcementNo: "",
      announcementDate: "",
      registrationNo: "",
      registrationDate: "",
      examinationGazetteDate: "",
      gazetteNo: "",
      gazetteDate: "",
      gazetteTypeCode: "",
      familyNo: "",
      applicantName: "",
      applicantName1: "",
      applicantName2: "",
      applicantName3: "",
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
            {/* 出願番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                出願番号
              </Label>
              <Input
                value={formData.applicationNo}
                onChange={(e) =>
                  handleChange("applicationNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 出願日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                出願日
              </Label>
              <Input
                value={formData.applicationDate}
                onChange={(e) =>
                  handleChange(
                    "applicationDate",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 公開・公表番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公開・公表番号
              </Label>
              <Input
                value={formData.publicationNo}
                onChange={(e) =>
                  handleChange("publicationNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公開・公表日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公開・公表日
              </Label>
              <Input
                value={formData.publicationDate}
                onChange={(e) =>
                  handleChange(
                    "publicationDate",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 案件グループ番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                案件グループ番号
              </Label>
              <Input
                value={formData.caseGroupNo}
                onChange={(e) =>
                  handleChange("caseGroupNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公告番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公告番号
              </Label>
              <Input
                value={formData.announcementNo}
                onChange={(e) =>
                  handleChange("announcementNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公告日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公告日
              </Label>
              <Input
                value={formData.announcementDate}
                onChange={(e) =>
                  handleChange(
                    "announcementDate",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 登録番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                登録番号
              </Label>
              <Input
                value={formData.registrationNo}
                onChange={(e) =>
                  handleChange("registrationNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 登録日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                登録日
              </Label>
              <Input
                value={formData.registrationDate}
                onChange={(e) =>
                  handleChange(
                    "registrationDate",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 審査公報発行日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                審査公報発行日
              </Label>
              <Input
                value={formData.examinationGazetteDate}
                onChange={(e) =>
                  handleChange(
                    "examinationGazetteDate",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 公報番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公報番号
              </Label>
              <Input
                value={formData.gazetteNo}
                onChange={(e) =>
                  handleChange("gazetteNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 公報発行日 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公報発行日
              </Label>
              <Input
                value={formData.gazetteDate}
                onChange={(e) =>
                  handleChange("gazetteDate", e.target.value)
                }
                className="bg-white border border-gray-300"
                placeholder="YYYY/MM/DD"
              />
            </div>

            {/* 公報種別コード */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                公報種別コード
              </Label>
              <Input
                value={formData.gazetteTypeCode}
                onChange={(e) =>
                  handleChange(
                    "gazetteTypeCode",
                    e.target.value,
                  )
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* ファミリー番号 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                ファミリー番号
              </Label>
              <Input
                value={formData.familyNo}
                onChange={(e) =>
                  handleChange("familyNo", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 権利者・出願人名 */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                権利者・出願人名
              </Label>
              <Input
                value={formData.applicantName}
                onChange={(e) =>
                  handleChange("applicantName", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 権利者・出願人名（サフ1） */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                権利者・出願人名（サフ1）
              </Label>
              <Input
                value={formData.applicantName1}
                onChange={(e) =>
                  handleChange("applicantName1", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 権利者・出願人名（サフ2） */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                権利者・出願人名（サフ2）
              </Label>
              <Input
                value={formData.applicantName2}
                onChange={(e) =>
                  handleChange("applicantName2", e.target.value)
                }
                className="bg-white border border-gray-300"
              />
            </div>

            {/* 権利者・出願人名（サフ3） */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <Label className="text-sm text-right">
                権利者・出願人名（サフ3）
              </Label>
              <Input
                value={formData.applicantName3}
                onChange={(e) =>
                  handleChange("applicantName3", e.target.value)
                }
                className="bg-white border border-gray-300"
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