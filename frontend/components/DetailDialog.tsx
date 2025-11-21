import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface DetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patent?: {
    id: string;
    documentNum?: string;
    applicationNum?: string;
    applicationDate?: string;
    publicationDate?: string;
    inventionTitle?: string;
    applicantName?: string;
    fiClassification?: string;
    publicationNum?: string;
    announcementNum?: string;
    registrationNum?: string;
    appealNum?: string;
    otherInfo?: string;
    statusStage?: string;
    eventDetail?: string;
    documentUrl?: string;
    abstract?: string;
    claims?: string;
    evaluationStatus?: string;
  } | null;
}

export function DetailDialog({ isOpen, onClose, patent }: DetailDialogProps) {
  if (!patent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                <span className="text-gray-600">文献番号:</span>
                <span className="ml-2">{patent.documentNum}</span>
              </div>
              <div>
                <span className="text-gray-600">公開番号:</span>
                <span className="ml-2 text-blue-600">{patent.publicationNum}</span>
              </div>
              <div>
                <span className="text-gray-600">登録番号:</span>
                <span className="ml-2">{patent.registrationNum}</span>
              </div>
              <div>
                <span className="text-gray-600">出願番号:</span>
                <span className="ml-2">{patent.applicationNum}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">出願人/権利者:</span>
                <span className="ml-2">{patent.applicantName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">発明の名称:</span>
                <span className="ml-2">{patent.inventionTitle}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">出願日:</span>
                <span className="ml-2">{patent.applicationDate}</span>
              </div>
              <div>
                <span className="text-gray-600">公知日:</span>
                <span className="ml-2">{patent.publicationDate || ''}</span>
              </div>
              <div>
                <span className="text-gray-600">ステージ:</span>
                <span className="ml-2">{patent.statusStage}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
