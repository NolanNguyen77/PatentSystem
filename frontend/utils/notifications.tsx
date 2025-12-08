import { toast } from 'sonner';
import { ShieldX, ShieldCheck, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

// Access Denied notification
export const notifyAccessDenied = (message?: string) => {
    toast.error(
        <div className="flex items-center gap-3">
            <ShieldX className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">アクセス拒否</div>
                <div className="text-sm text-gray-500">{message || 'この操作を実行する権限がありません'}</div>
            </div>
        </div>,
        {
            duration: 5000,
            style: {
                borderLeft: '4px solid #ef4444',
            },
        }
    );
};

// Success notification
export const notifySuccess = (title: string, description?: string) => {
    toast.success(
        <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">{title}</div>
                {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
        </div>,
        {
            duration: 4000,
            style: {
                borderLeft: '4px solid #22c55e',
            },
        }
    );
};

// Error notification
export const notifyError = (title: string, description?: string) => {
    toast.error(
        <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">{title}</div>
                {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
        </div>,
        {
            duration: 5000,
            style: {
                borderLeft: '4px solid #ef4444',
            },
        }
    );
};

// Warning notification
export const notifyWarning = (title: string, description?: string) => {
    toast.warning(
        <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">{title}</div>
                {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
        </div>,
        {
            duration: 5000,
            style: {
                borderLeft: '4px solid #f59e0b',
            },
        }
    );
};

// Info notification
export const notifyInfo = (title: string, description?: string) => {
    toast.info(
        <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">{title}</div>
                {description && <div className="text-sm text-gray-500">{description}</div>}
            </div>
        </div>,
        {
            duration: 4000,
            style: {
                borderLeft: '4px solid #3b82f6',
            },
        }
    );
};

// Permission denied notification (for 403 errors)
export const notifyPermissionDenied = (action?: string) => {
    const message = action
        ? `「${action}」を実行する権限がありません`
        : 'この操作を実行する権限がありません';

    toast.error(
        <div className="flex items-center gap-3">
            <ShieldX className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">権限エラー</div>
                <div className="text-sm text-gray-500">{message}</div>
            </div>
        </div>,
        {
            duration: 6000,
            style: {
                borderLeft: '4px solid #ef4444',
            },
        }
    );
};

// Login required notification
export const notifyLoginRequired = () => {
    toast.error(
        <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
                <div className="font-medium text-gray-900">ログインが必要です</div>
                <div className="text-sm text-gray-500">この操作にはログインが必要です</div>
            </div>
        </div>,
        {
            duration: 5000,
            style: {
                borderLeft: '4px solid #f97316',
            },
        }
    );
};
