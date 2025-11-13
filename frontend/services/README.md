# API Services Structure

## Overview
Cấu trúc API được thiết kế sẵn để dễ dàng tích hợp backend sau này. Hiện tại tất cả các API calls đều trả về mock data, nhưng structure đã sẵn sàng để kết nối với backend thực.

## Files

### `/services/api.ts`
Chứa tất cả API endpoint definitions, được tổ chức theo modules:
- **authAPI**: Login, logout
- **titleAPI**: CRUD operations cho titles
- **patentAPI**: Quản lý patents
- **importExportAPI**: Import CSV, export data
- **mergeAPI**: Merge titles
- **attachmentAPI**: Upload/manage attachments
- **userAPI**: User và department management
- **companyAPI**: Company-related data

### `/types/api.ts`
TypeScript type definitions cho:
- Request/Response objects
- Data models (Title, Patent, User, etc.)
- API parameters và filters

### `/hooks/useAPI.ts`
Custom React hooks để xử lý API calls:
- **useAPI**: Hook cho single API call với loading/error states
- **useAPIState**: Hook cho multiple API calls

## Usage Examples

### Example 1: Create Title
```typescript
import { titleAPI } from '@/services/api';
import { useAPI } from '@/hooks/useAPI';

function CreateTitleForm() {
  const { execute, loading, error } = useAPI(titleAPI.create, {
    onSuccess: (data) => {
      console.log('Title created:', data.id);
    },
    onError: (error) => {
      alert('Error: ' + error);
    }
  });

  const handleSubmit = async () => {
    const result = await execute({
      titleName: 'New Title',
      department: 'dept1',
      permissions: { viewPermission: 'all', editPermission: 'creator' },
      options: { mainEvaluation: false, singlePatentMultipleEvaluations: true },
      users: []
    });
    
    if (result.data) {
      // Success
    }
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Creating...' : 'Create Title'}
    </button>
  );
}
```

### Example 2: Fetch Titles with Filters
```typescript
import { titleAPI } from '@/services/api';
import { useEffect, useState } from 'react';

function TitleList() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      const result = await titleAPI.getAll({
        department: 'dept1',
        page: 1,
        limit: 20
      });
      
      if (result.data) {
        setTitles(result.data.titles);
      }
      setLoading(false);
    };

    fetchTitles();
  }, []);

  return <div>{/* Render titles */}</div>;
}
```

### Example 3: Update Patent Status
```typescript
import { patentAPI } from '@/services/api';

const handleToggleStatus = async (patentId: string, newStatus: 'evaluated' | 'unevaluated') => {
  const result = await patentAPI.updateStatus(patentId, newStatus);
  
  if (result.data) {
    console.log('Status updated successfully');
  } else if (result.error) {
    alert('Error: ' + result.error);
  }
};
```

### Example 4: Import CSV
```typescript
import { importExportAPI } from '@/services/api';

const handleImportCSV = async (file: File, mapping: any) => {
  const result = await importExportAPI.importCSV(file, mapping);
  
  if (result.data) {
    console.log(`Imported ${result.data.imported} records`);
    console.log(`Failed ${result.data.failed} records`);
  }
};
```

### Example 5: Merge Titles
```typescript
import { mergeAPI } from '@/services/api';

const handleMerge = async () => {
  const result = await mergeAPI.mergeTitles({
    newTitleName: 'Merged Title',
    department: 'dept1',
    sourceTitleIds: ['000032', '000034', '000040'],
    extractionCondition: {
      type: 'evaluation',
      selectedEvaluations: ['000032_B', '000041_A']
    }
  });
  
  if (result.data) {
    console.log('Merged successfully:', result.data.newTitleId);
  }
};
```

## Backend Integration Checklist

Khi backend đã sẵn sàng, bạn chỉ cần:

### 1. Update API Base URL
```typescript
// In /services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-backend.com/api';
```

### 2. Environment Variables
Tạo file `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com/api
```

### 3. Update Components
Components đã sử dụng mock data cần update để call API thực:

**Before (Mock):**
```typescript
const handleCreate = () => {
  console.log('Creating...');
  alert('Created!');
};
```

**After (Real API):**
```typescript
import { titleAPI } from '@/services/api';

const handleCreate = async () => {
  const result = await titleAPI.create(formData);
  if (result.data) {
    alert('Created successfully!');
  }
};
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Titles
- `GET /api/titles` - Get all titles
- `GET /api/titles/:id` - Get title by ID
- `POST /api/titles` - Create title
- `PUT /api/titles/:id` - Update title
- `DELETE /api/titles/:id` - Delete title
- `POST /api/titles/:id/copy` - Copy title
- `GET /api/titles/search` - Search titles
- `POST /api/titles/merge` - Merge titles

### Patents
- `GET /api/titles/:titleId/patents` - Get patents by title
- `GET /api/patents/:id` - Get patent details
- `PUT /api/patents/:id` - Update patent
- `PUT /api/patents/:id/status` - Update status
- `POST /api/patents/manual` - Create manual entry

### Import/Export
- `POST /api/import/csv` - Import CSV
- `POST /api/export/data` - Export data
- `GET /api/export/fields` - Get export fields

### Attachments
- `POST /api/titles/:titleId/attachments` - Upload attachment
- `GET /api/titles/:titleId/attachments` - Get attachments
- `DELETE /api/attachments/:id` - Delete attachment

### Users/Departments
- `GET /api/users` - Get users
- `GET /api/departments` - Get departments
- `GET /api/departments/:id/users` - Get users by department

### Companies
- `GET /api/companies/:name/patents` - Get company patents

## Notes

- Tất cả APIs đều hỗ trợ JWT authentication qua Bearer token
- Error handling đã được implement ở level service
- TypeScript types giúp đảm bảo type safety
- Custom hooks giúp quản lý loading/error states dễ dàng
