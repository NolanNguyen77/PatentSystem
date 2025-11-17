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
    id: number;
    code: string;
    patentNumber: string;
    documentType: string;
    applicationDate: string;
    publicationNumber: string;
    publicationDate: string;
    documentSubmission: string;
    trialDate: string;
    gazettePubDate: string;
    documentPC: string;
    applicantName: string;
    inventionName: string;
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
                <span className="ml-2">{patent.code || patent.documentType || ''}</span>
              </div>
              <div>
                <span className="text-gray-600">公開番号:</span>
                <span className="ml-2 text-blue-600">{patent.publicationNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">登録番号:</span>
                <span className="ml-2">{patent.patentNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">出願番号:</span>
                <span className="ml-2">{(patent as any)?.applicationNo || patent.code || ''}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">出願人:</span>
                <span className="ml-2">{patent.applicantName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">発明の名称:</span>
                <span className="ml-2">{patent.inventionName}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600">出願日:</span>
                <span className="ml-2">{patent.applicationDate}</span>
              </div>
              <div>
                <span className="text-gray-600">公開日:</span>
                <span className="ml-2">{patent.publicationDate || ''}</span>
              </div>
              <div>
                <span className="text-gray-600">登録日:</span>
                <span className="ml-2">{(patent as any)?.registrationDate || ''}</span>
              </div>
              <div>
                <span className="text-gray-600">書類種別:</span>
                <span className="ml-2">{patent.documentType}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
