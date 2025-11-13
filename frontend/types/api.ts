// ==================== Common Types ====================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== Auth Types ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  name: string;
  department: string;
  role: 'admin' | 'user' | 'viewer';
}

// ==================== Title Types ====================

export interface Title {
  id: string;
  no: string;
  titleName: string;
  department: string;
  updateDate: string;
  creator: string;
  patentCount: number;
  status: string;
  permissions: {
    viewPermission: string;
    editPermission: string;
  };
  options: {
    mainEvaluation: boolean;
    singlePatentMultipleEvaluations: boolean;
  };
  users: string[];
}

export interface CreateTitleRequest {
  titleName: string;
  department: string;
  permissions: {
    viewPermission: string;
    editPermission: string;
  };
  options: {
    mainEvaluation: boolean;
    singlePatentMultipleEvaluations: boolean;
  };
  users: string[];
}

export interface UpdateTitleRequest {
  titleName?: string;
  department?: string;
  permissions?: {
    viewPermission?: string;
    editPermission?: string;
  };
  options?: {
    mainEvaluation?: boolean;
    singlePatentMultipleEvaluations?: boolean;
  };
  users?: string[];
}

export interface CopyTitleRequest {
  newTitleName: string;
}

// ==================== Patent Types ====================

export interface Patent {
  id: string;
  patentNumber: string;
  title: string;
  applicant: string;
  inventor: string;
  applicationDate: string;
  publicationDate: string;
  status: 'evaluated' | 'unevaluated';
  evaluationData?: any;
  // Additional fields from CSV import
  [key: string]: any;
}

export interface PatentListResponse {
  patents: Patent[];
  total: number;
  evaluatedCount: number;
  unevaluatedCount: number;
  progressRate: number;
}

export interface UpdatePatentStatusRequest {
  status: 'evaluated' | 'unevaluated';
}

export interface CreateManualPatentRequest {
  titleId: string;
  patentData: {
    patentNumber: string;
    title: string;
    applicant: string;
    inventor: string;
    applicationDate: string;
    publicationDate: string;
    ipcClassification: string;
    abstract: string;
    claims: string;
  };
}

// ==================== Import/Export Types ====================

export interface ColumnMapping {
  [csvColumn: string]: string | null; // Maps CSV column to system field
}

export interface ImportCSVRequest {
  file: File;
  mapping: ColumnMapping;
}

export interface ImportCSVResponse {
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
  message: string;
}

export interface ExportDataRequest {
  titleId: string;
  fields: string[];
  format: 'csv' | 'excel';
  filters?: {
    status?: 'evaluated' | 'unevaluated';
    dateRange?: {
      from: string;
      to: string;
    };
  };
}

export interface ExportDataResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

export interface ExportField {
  id: string;
  label: string;
  category: 'bibliography' | 'evaluation' | 'other';
}

// ==================== Merge Types ====================

export interface MergeTitlesRequest {
  newTitleName: string;
  department: string;
  sourceTitleIds: string[];
  extractionCondition: {
    type: 'evaluation' | 'monitoring';
    selectedEvaluations: string[];
  };
}

export interface MergeTitlesResponse {
  newTitleId: string;
  mergedCount: number;
  message: string;
}

// ==================== Attachment Types ====================

export interface Attachment {
  id: string;
  titleId: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface UploadAttachmentResponse {
  id: string;
  filename: string;
  url: string;
}

// ==================== Department/User Types ====================

export interface Department {
  id: string;
  name: string;
  code: string;
  userCount: number;
}

export interface UserListItem {
  id: string;
  username: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

// ==================== Company Types ====================

export interface CompanyPatentsResponse {
  companyName: string;
  patents: Patent[];
  total: number;
  evaluatedCount: number;
  unevaluatedCount: number;
  progressRate: number;
}

// ==================== Search Types ====================

export interface SearchFilters {
  department?: string;
  status?: 'evaluated' | 'unevaluated';
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
  page?: number;
  limit?: number;
}
