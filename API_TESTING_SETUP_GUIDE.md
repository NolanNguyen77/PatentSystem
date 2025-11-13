# 🔬 Patent Navi Backend - Complete Testing Guide

## ⚠️ Prerequisites - Important!

Trước khi có thể test API, bạn cần setup database SQL Server. Đây là yêu cầu bắt buộc.

### System Requirements:
- ✅ Node.js 18+
- ✅ npm/yarn
- ✅ **SQL Server 2019+** hoặc **SQL Server Express** (FREE)
- ✅ Postman (để test API)

---

## 🗄️ Step 1: Setup SQL Server

### Option A: SQL Server Express (Recommended - FREE)

1. **Download SQL Server Express**
   - Link: https://www.microsoft.com/en-us/sql-server/sql-server-editions-express
   - Chọn "Download now"

2. **Install**
   - Chạy installer
   - Choose "Basic" installation
   - Accept defaults

3. **Configure Connection**
   - Server Name: `localhost\SQLEXPRESS`
   - Authentication: SQL Server and Windows Authentication mode
   - Default User: `sa` (System Administrator)

4. **Create Database**
   ```sql
   CREATE DATABASE patent_navi;
   GO
   ```

5. **Verify Connection**
   ```
   Server: localhost\SQLEXPRESS
   User: sa
   Password: (your_sa_password)
   ```

### Option B: Docker (Quick Setup)

```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourPassword@123' `
  -p 1433:1433 `
  -d mcr.microsoft.com/mssql/server:2019-latest
```

---

## 🔧 Step 2: Configure Backend

### Update `.env` file

```bash
cd backend
cp .env.example .env  # nếu có
```

Edit `backend/.env`:

```properties
# =====================================
# Database Connection (SQL Server)
# =====================================
DATABASE_URL="sqlserver://localhost:1433;user=sa;password=YOUR_PASSWORD;database=patent_navi;encrypt=false;trustServerCertificate=true"

# =====================================
# JWT Secret Keys
# =====================================
JWT_SECRET="c8fae8c9f7b942f79a4b6a29a12e78d23a7a94c1432a3f7db7f94bff2a6b1b3a"
JWT_REFRESH_SECRET="98a4de45e9b3470da9fd912b68e4fdd55c91a21d04b5a4aaf20ff97e5b3a94f9"

# =====================================
# Server Config
# =====================================
PORT=4000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

**⚠️ Important**: Replace `YOUR_PASSWORD` với password của `sa` user

---

## 📦 Step 3: Install & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations (create tables)
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

---

## 🚀 Step 4: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
[INFO] 10:00:00 ts-node-dev ver. 2.0.0
info: 🚀 Server running on port 4000
info: 📝 Environment: development
info: 🔗 CORS enabled for: http://localhost:3000
```

✅ Server is ready!

---

## 📥 Step 5: Import Postman Collection

### File Location:
`./Postman_Collection_Patent_API.json`

### Import Steps:

1. **Open Postman**
2. Click **Import** (top-left)
3. Choose **Upload Files**
4. Select `Postman_Collection_Patent_API.json`
5. Click **Import**

### Create Environment:

1. Click **Environments** (left sidebar)
2. Click **+** to create new
3. Name: `Patent_Navi_Dev`
4. Add variables:
   ```
   base_url: http://localhost:4000/api
   auth_token: (empty - will auto-fill)
   title_id: (empty)
   patent_id: (empty)
   ```
5. Click **Save**

---

## 🧪 Step 6: Test API

### Quick Test Sequence:

#### 1️⃣ Health Check
```
GET http://localhost:4000/health
```

Expected: `{"status":"ok", "timestamp":"..."}`

#### 2️⃣ Login
```
POST http://localhost:4000/api/auth/login
Body: {
  "username": "tan286",
  "password": "026339229"
}
```

Expected: `{"success":true, "token":"...", "user":{...}}`

#### 3️⃣ Get Current User
```
GET http://localhost:4000/api/auth/me
Header: Authorization: Bearer {token_from_step_2}
```

#### 4️⃣ Get All Titles
```
GET http://localhost:4000/api/titles
Header: Authorization: Bearer {token}
```

#### 5️⃣ Create Title
```
POST http://localhost:4000/api/titles
Header: Authorization: Bearer {token}
Body: {
  "titleName": "Test Title",
  "dataType": "特許",
  "markColor": "#dc2626",
  "saveDate": "2025/11",
  "viewPermission": "all",
  "editPermission": "creator",
  "mainEvaluation": true,
  "allowEvaluation": true
}
```

---

## 📊 Complete API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | User logout |

### Titles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/titles` | Get all titles |
| GET | `/api/titles/:id` | Get title by ID |
| POST | `/api/titles` | Create title |
| PUT | `/api/titles/:id` | Update title |
| DELETE | `/api/titles/:id` | Delete title |
| POST | `/api/titles/:id/copy` | Copy title |
| GET | `/api/titles/search` | Search titles |

### Patents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/titles/:titleId/patents` | Get patents by title |
| GET | `/api/patents/:id` | Get patent by ID |
| POST | `/api/patents` | Create patent |
| PUT | `/api/patents/:id` | Update patent |
| PUT | `/api/patents/:id/status` | Update patent status |
| DELETE | `/api/patents/:id` | Delete patent |
| GET | `/api/patents/companies/:name/patents` | Get by company |

### Evaluations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evaluations` | Create evaluation |
| GET | `/api/patents/:patentId/evaluations` | Get evaluations |
| PUT | `/api/evaluations/:id` | Update evaluation |
| DELETE | `/api/evaluations/:id` | Delete evaluation |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Import/Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/import/patents` | Import CSV |
| GET | `/api/export/patents` | Export CSV/Excel |

### Classifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patents/:patentId/classifications` | Add classification |
| GET | `/api/patents/:patentId/classifications` | Get classifications |

### Merge
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/merge/titles` | Merge titles |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attachments/upload` | Upload file |
| GET | `/api/titles/:titleId/attachments` | Get attachments |
| DELETE | `/api/attachments/:id` | Delete attachment |

---

## 🔑 Database User Account

Default user created by system:
```
Username: tan286
Password: 026339229
```

**How to change:**
Edit `backend/scripts/createUser.ts` and run:
```bash
npm run prisma:seed
```

---

## 📝 Sample Request/Response

### Create Title
```
POST /api/titles
Authorization: Bearer eyJ...

REQUEST:
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

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "titleNo": "000001",
    "titleName": "Nintendo 特許分析 2024",
    "dataType": "特許",
    "markColor": "#dc2626",
    "saveDate": "2025/11",
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
}
```

### Create Patent
```
POST /api/patents
Authorization: Bearer eyJ...

REQUEST:
{
  "titleId": "550e8400-e29b-41d4-a716-446655440000",
  "patentNo": "JP2024001234",
  "applicationNo": "2024-567890",
  "applicationDate": "2024-01-15T00:00:00Z",
  "inventionName": "ゲーム機における映像処理装置",
  "applicant": "任天堂株式会社",
  "inventor": "田中 太郎",
  "stage": "登録",
  "evaluationStatus": "未評価"
}

RESPONSE (201):
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "titleId": "550e8400-e29b-41d4-a716-446655440000",
    "patentNo": "JP2024001234",
    "inventionName": "ゲーム機における映像処理装置",
    "evaluationStatus": "未評価",
    "createdAt": "2025-11-13T10:00:00.000Z"
  }
}
```

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED"
- ❌ Backend not running
- ✅ Solution: `npm run dev` in backend folder

### Error: "DATABASE_URL must be provided"
- ❌ .env file not configured
- ✅ Solution: Create `.env` with DATABASE_URL

### Error: "Cannot connect to database"
- ❌ SQL Server not running or connection string wrong
- ✅ Solution: 
  - Verify SQL Server is running
  - Check connection string in .env
  - Test: `sqlserver://localhost:1433;user=sa;password=...`

### Error: "Authentication failed"
- ❌ Wrong username/password
- ✅ Solution: Use credentials from .env or create new user via seed

### Error: "401 Unauthorized"
- ❌ Missing or invalid JWT token
- ✅ Solution: Login first to get token

### Error: "CORS error"
- ❌ Frontend URL not in CORS_ORIGIN
- ✅ Solution: Update CORS_ORIGIN in .env

---

## 🔐 Security Notes

⚠️ **For Development Only**:
- Use secure passwords in production
- Change JWT secrets regularly
- Never commit `.env` file
- Use environment variables for sensitive data
- Enable HTTPS in production

---

## 📚 Additional Resources

- **Postman Collection**: `./Postman_Collection_Patent_API.json`
- **Testing Guide**: `./POSTMAN_TESTING_GUIDE.md`
- **Backend README**: `./backend/README.md`
- **Prisma Docs**: https://www.prisma.io/docs/
- **Express Docs**: https://expressjs.com/

---

## ✅ Verification Checklist

Before testing, ensure:

- [ ] SQL Server installed and running
- [ ] Database `patent_navi` created
- [ ] `.env` file configured correctly
- [ ] `npm install` completed in backend
- [ ] `npm run prisma:migrate` completed
- [ ] `npm run dev` shows "Server running on port 4000"
- [ ] Health check responds with status 200
- [ ] Login works with `tan286` / `026339229`
- [ ] Postman collection imported
- [ ] Environment variables set in Postman

---

## 🚀 Next Steps

1. **Test Authentication**: Login and verify token generation
2. **Test CRUD Operations**: Create, read, update, delete titles/patents
3. **Test Relations**: Create titles with patents and evaluations
4. **Test Export**: Export data to CSV/Excel
5. **Test Import**: Import data from CSV
6. **Test Merging**: Merge multiple titles
7. **Test Permissions**: Test different user roles

---

## 📞 Support

If you encounter issues:
1. Check backend console for error messages
2. Verify `.env` configuration
3. Ensure database connectivity
4. Check Postman collection syntax
5. Review backend logs for detailed errors

Happy Testing! 🎉
