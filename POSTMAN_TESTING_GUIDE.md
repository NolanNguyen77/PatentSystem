# 📋 Postman API Testing Guide - Patent Navi Backend

## 📥 How to Import Collection

### Method 1: Direct Import
1. Open **Postman**
2. Click **Import** (top left)
3. Select **Upload Files**
4. Choose `Postman_Collection_Patent_API.json` from this directory
5. Click **Import**

### Method 2: Copy-Paste
1. Open `Postman_Collection_Patent_API.json`
2. Copy all content
3. In Postman, click **Import** → **Paste Raw Text**
4. Click **Continue** → **Import**

---

## 🌍 Environment Setup

### Create an Environment Variable
1. In Postman, click **Environments** (left sidebar)
2. Click **Create New** → Name it `Patent_Navi_Dev`
3. Add these variables:
   - `base_url` = `http://localhost:4001/api`
   - `auth_token` = (will be set after login)
   - `title_id` = (will be set after creating/fetching a title)
   - `patent_id` = (will be set after creating/fetching a patent)

### Select Your Environment
1. Top right of Postman, select **Patent_Navi_Dev** from dropdown

---

## 🧪 Testing Workflow

### Step 1️⃣: Health Check
- **Request**: `GET /health`
- **Expected Status**: 200
- **Response**: 
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T10:00:00.000Z"
}
```

### Step 2️⃣: Login
- **Request**: `POST /api/auth/login`
- **Body**:
```json
{
  "username": "tan286",
  "password": "026339229"
}
```
- **Expected Status**: 200
- **Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "userId": "tan286",
    "name": "User Name",
    "email": "user@example.com",
    "permission": "管理者"
  }
}
```
- **⭐ Important**: The `token` will auto-save to `auth_token` variable

### Step 3️⃣: Get Current User
- **Request**: `GET /api/auth/me`
- **Headers**: Authorization: Bearer {{auth_token}}
- **Expected Status**: 200

### Step 4️⃣: Create a Title
- **Request**: `POST /api/titles`
- **Body**:
```json
{
  "titleName": "Nintendo 特許分析 2024",
  "dataType": "特許",
  "markColor": "#dc2626",
  "saveDate": "2025/11",
  "viewPermission": "all",
  "editPermission": "creator",
  "mainEvaluation": true,
  "singlePatentMultipleEvals": false,
  "allowEvaluation": true,
  "users": []
}
```
- **Expected Status**: 201
- **⭐ Important**: `title_id` will auto-save to environment

### Step 5️⃣: Get All Titles
- **Request**: `GET /api/titles?page=1&limit=10`
- **Expected Status**: 200
- **Response**: List of titles with pagination

### Step 6️⃣: Create a Patent
- **Request**: `POST /api/patents`
- **Body**:
```json
{
  "titleId": "{{title_id}}",
  "patentNo": "JP2024001234",
  "applicationNo": "2024-567890",
  "applicationDate": "2024-01-15T00:00:00Z",
  "inventionName": "ゲーム機における映像処理装置",
  "applicant": "任天堂株式会社",
  "inventor": "田中 太郎",
  "stage": "登録",
  "evaluationStatus": "未評価"
}
```
- **Expected Status**: 201
- **⭐ Important**: `patent_id` will auto-save to environment

### Step 7️⃣: Create an Evaluation
- **Request**: `POST /api/evaluations`
- **Body**:
```json
{
  "patentId": "{{patent_id}}",
  "titleId": "{{title_id}}",
  "status": "有望",
  "comment": "This is a promising patent",
  "score": 8,
  "isPublic": true
}
```
- **Expected Status**: 201

### Step 8️⃣: Get Patents by Title
- **Request**: `GET /api/titles/{{title_id}}/patents`
- **Expected Status**: 200

### Step 9️⃣: Update Patent Status
- **Request**: `PUT /api/patents/{{patent_id}}/status`
- **Body**:
```json
{
  "evaluationStatus": "有望"
}
```
- **Expected Status**: 200

### Step 🔟: Export to CSV/Excel
- **Request (CSV)**: `GET /api/export/patents?titleId={{title_id}}&format=csv`
- **Request (Excel)**: `GET /api/export/patents?titleId={{title_id}}&format=excel`
- **Expected Status**: 200
- **Response**: File download

---

## 🔑 Key Variables Used

| Variable | Purpose | Auto-Set By |
|----------|---------|-------------|
| `auth_token` | JWT token for authentication | Login endpoint |
| `refresh_token` | Token for refresh (if needed) | Login endpoint |
| `title_id` | Current title ID | Create/Fetch Title |
| `patent_id` | Current patent ID | Create/Fetch Patent |
| `user_id` | Current user ID | Create/Fetch User |
| `evaluation_id` | Evaluation ID | Create Evaluation |
| `attachment_id` | Attachment ID | Upload Attachment |

---

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Titles
- `GET /api/titles` - Get all titles
- `GET /api/titles/search` - Search titles
- `GET /api/titles/{id}` - Get title by ID
- `POST /api/titles` - Create title
- `PUT /api/titles/{id}` - Update title
- `DELETE /api/titles/{id}` - Delete title
- `POST /api/titles/{id}/copy` - Copy title

### Patents
- `GET /api/patents/{id}` - Get patent
- `GET /api/titles/{titleId}/patents` - Get patents by title
- `POST /api/patents` - Create patent
- `PUT /api/patents/{id}` - Update patent
- `PUT /api/patents/{id}/status` - Update status
- `DELETE /api/patents/{id}` - Delete patent
- `GET /api/patents/companies/{name}/patents` - Get patents by company

### Evaluations
- `POST /api/evaluations` - Create evaluation
- `GET /api/patents/{patentId}/evaluations` - Get evaluations
- `PUT /api/evaluations/{id}` - Update evaluation
- `DELETE /api/evaluations/{id}` - Delete evaluation

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Import/Export
- `POST /api/import/patents` - Import CSV
- `GET /api/export/patents` - Export CSV/Excel

### Classifications
- `POST /api/patents/{patentId}/classifications` - Add classification
- `GET /api/patents/{patentId}/classifications` - Get classifications

### Merge
- `POST /api/merge/titles` - Merge titles

### Attachments
- `POST /api/attachments/upload` - Upload file
- `GET /api/titles/{titleId}/attachments` - Get attachments
- `DELETE /api/attachments/{id}` - Delete attachment

---

## ⚙️ Advanced Features

### 1. Pre-request Scripts
- Auto-sets timestamps
- Validates required fields
- Generate UUIDs

### 2. Tests & Assertions
- Validates status codes
- Checks response format
- Auto-saves IDs to environment

### 3. Dynamic Variables
- `{{$timestamp}}` - Current timestamp
- `{{$uuid}}` - Random UUID
- `{{$randomString}}` - Random string

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized"
- **Solution**: Run Login endpoint first
- Check if `auth_token` is set in environment
- Token may have expired - login again

### Issue: "404 Not Found"
- **Solution**: Ensure title/patent IDs are correct
- Set `{{title_id}}` by running Create Title first
- Check URL parameters

### Issue: "500 Internal Server Error"
- **Solution**: Check server logs in terminal
- Verify database connection
- Ensure all required fields are provided

### Issue: "CORS Error"
- **Solution**: Verify `CORS_ORIGIN` in backend `.env`
- Check frontend URL matches CORS config
- Browser cache may need clearing

---

## 💡 Tips & Best Practices

1. **Run in Order**: Execute tests sequentially to avoid missing IDs
2. **Use Pre-built Scripts**: Click run icon → "Tests" tab to auto-execute
3. **Check Response Tab**: View full response to debug issues
4. **Monitor Logs**: Watch terminal for backend logs
5. **Use Environment**: Keep URLs centralized for easy switching

---

## 🚀 Testing Database Operations

### Full CRUD Test Sequence
```
1. Login (get token)
2. Create Title (get title_id)
3. Create Patent (get patent_id)
4. Create Evaluation (get evaluation_id)
5. Read: Get all titles/patents/evaluations
6. Update: Modify patent/evaluation
7. Delete: Remove evaluation/patent/title
```

---

## 📝 Notes

- Database: SQL Server (configured in `.env`)
- Port: 4000 (or as configured in `.env`)
- Rate Limiting: 100 requests per 15 minutes per IP
- File Upload Limit: 10MB
- Response Format: JSON

---

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Verify `.env` configuration
3. Ensure database is running
4. Check network connectivity
5. Review Postman collection for example payloads

Happy testing! 🎉
