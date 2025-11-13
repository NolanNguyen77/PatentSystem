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

  // Mock data for additional details
  const patentDetail = {
    titleCode: '000034',
    titleName: 'グエン・ダイ・タン',
    publicationNo: patent.publicationNumber,
    registrationNo: patent.patentNumber,
    applicant: patent.applicantName,
    inventionName: patent.inventionName,
    abstract: '本発明は、吸収性物品の個包装体とそのパッケージに関し、特に使用者にとって開封しやすく、かつ衛生的に保管できる構造を提供する。個包装体は、吸収性物品を密封する包装材と、開封用の切り込み線を備える。パッケージは、複数の個包装体を収納する外装と、取り出し口を有する。',
    claims: '【請求項1】吸収体と、該吸収体を覆う表面シートと裏面シートとを備える吸収性物品を、包装材で密封してなる個包装体であって、前記包装材は、開封用の切り込み線を有することを特徴とする吸収性物品個包装体。\n【請求項2】前記切り込み線は、前記包装材の一端から他端に向かって延びる直線状であることを特徴とする請求項1に記載の吸収性物品個包装体。',
    inventor: '山田 太郎、鈴木 花子',
    ipc: 'A61F 13/15',
    applicationNo: 'JP2024-053740',
    applicationDate: patent.applicationDate,
    publicationDate: '2024/10/20',
    registrationDate: '2025/01/15',
    fi: 'A61F 13/15 350',
    fTerm: '4C005 AA01, BB02, CC03'
  };

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
  );
}
