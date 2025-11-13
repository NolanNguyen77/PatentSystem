# 🎉 Backend API Testing - Complete Package

## 📦 What's Included

Tôi đã tạo một **complete testing package** cho Patent Navi Backend API. Đây là tất cả những gì bạn cần để test API:

### 1. **Postman Collection** 📥
- **File**: `Postman_Collection_Patent_API.json`
- **Content**: 50+ API endpoints được tổ chức thành 8 categories
- **Features**:
  - ✅ Automatic token management
  - ✅ Auto-save environment variables
  - ✅ Pre-configured request examples
  - ✅ Response validation scripts

### 2. **Setup Guide** 🔧
- **File**: `API_TESTING_SETUP_GUIDE.md`
- **Content**: Step-by-step instructions
- **Includes**:
  - SQL Server installation guide
  - .env configuration
  - Database setup
  - Troubleshooting guide
  - Quick start checklist

### 3. **Testing Guide** 📖
- **File**: `POSTMAN_TESTING_GUIDE.md`
- **Content**: How to use Postman Collection
- **Includes**:
  - Environment setup
  - Testing workflow (10 steps)
  - API endpoints summary
  - Variable documentation
  - Tips & best practices

### 4. **Test Script** 🧪
- **File**: `test-api.js`
- **Usage**: `node test-api.js`
- **Purpose**: Quick API connectivity test

### 5. **Interactive Dashboard** 🌐
- **File**: `api-testing-dashboard.html`
- **Usage**: Open in any web browser
- **Features**:
  - Visual setup workflow
  - Endpoint reference
  - System architecture
  - Troubleshooting guide
  - Quick command reference

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup SQL Server
```bash
# Download & install SQL Server Express (FREE)
# https://www.microsoft.com/en-us/sql-server/sql-server-editions-express

# Create database
sqlcmd -U sa -P YOUR_PASSWORD
> CREATE DATABASE patent_navi;
> GO
```

### Step 2: Configure Backend
```bash
cd backend

# Edit .env file with SQL Server connection
DATABASE_URL="sqlserver://localhost:1433;user=sa;password=YOUR_PASSWORD;database=patent_navi;encrypt=false;trustServerCertificate=true"

# Install & setup
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Step 3: Start & Test
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Run test script (optional)
cd ..
node test-api.js
```

Then import Postman collection and start testing!

---

## 📊 API Endpoints Overview

### Authentication (3 endpoints)
- Login, Logout, Get Current User

### Titles (7 endpoints)
- Get all, search, get by ID, create, update, delete, copy

### Patents (7 endpoints)
- Get by title, get by ID, create, update status, delete, get by company

### Evaluations (4 endpoints)
- Create, get by patent, update, delete

### Users (5 endpoints)
- Get all, get by ID, create, update, delete

### Import/Export (3 endpoints)
- Import CSV, export CSV, export Excel

### Classifications (2 endpoints)
- Add classification, get classifications

### Merge (1 endpoint)
- Merge titles

### Attachments (3 endpoints)
- Upload, get by title, delete

---

## 🔐 Default Credentials

```
Username: tan286
Password: 026339229
```

---

## 📋 Testing Checklist

Before testing, ensure:
- [ ] SQL Server installed & running
- [ ] Database `patent_navi` created
- [ ] Backend `.env` configured
- [ ] `npm install` completed
- [ ] `npm run prisma:migrate` completed
- [ ] `npm run dev` shows "Server running on port 4000"
- [ ] Postman collection imported
- [ ] Environment variables set in Postman
- [ ] Health check returns 200
- [ ] Login succeeds with test credentials

---

## 🎯 Testing Workflow

```
1. Run Health Check (/health) → 200 OK
    ↓
2. Login → Get JWT token
    ↓
3. Get Current User (verify token) → User data
    ↓
4. Create Title → Get title_id
    ↓
5. Get All Titles → List of titles
    ↓
6. Create Patent → Get patent_id
    ↓
7. Create Evaluation → Evaluation created
    ↓
8. Update Patent Status → Status updated
    ↓
9. Export to CSV/Excel → File downloaded
    ↓
10. Clean up (delete evaluation, patent, title)
```

---

## 🌍 Browser Dashboard

Open `api-testing-dashboard.html` in your browser to see:
- Visual setup workflow
- Quick reference for all endpoints
- System architecture
- Troubleshooting guide
- Installation commands
- Status indicators

---

## 📁 File Structure

```
特許ナビ/
├── Postman_Collection_Patent_API.json       ← Import to Postman
├── API_TESTING_SETUP_GUIDE.md              ← Setup instructions
├── POSTMAN_TESTING_GUIDE.md                ← Testing instructions
├── api-testing-dashboard.html              ← Browser dashboard
├── test-api.js                             ← Node.js test script
├── README_TESTING.md                       ← This file
└── backend/
    ├── .env                                ← Configuration (edit this!)
    ├── package.json
    ├── src/
    │   ├── index.ts                        ← Entry point
    │   ├── routes/                         ← API routes
    │   ├── controllers/                    ← Request handlers
    │   ├── services/                       ← Business logic
    │   └── middleware/                     ← JWT, errors, etc
    └── prisma/
        ├── schema.prisma                   ← Database schema
        └── migrations/                     ← Database migrations
```

---

## 🔗 API Documentation

Each endpoint is documented with:
- Method (GET, POST, PUT, DELETE)
- URL path
- Required headers
- Request body format
- Response format
- Example values

View in:
1. **Postman Collection** - Import and explore
2. **Testing Guide** - Detailed step-by-step
3. **Browser Dashboard** - Visual reference

---

## ⚠️ Important Notes

### Prerequisites (MUST HAVE)
- ✅ SQL Server 2019+ or SQL Server Express (FREE)
- ✅ Node.js 18+
- ✅ npm
- ✅ Postman

### Before Testing
1. Database must be running and connected
2. .env file must be configured correctly
3. Migrations must be run
4. Backend server must be running

### Troubleshooting
- **Connection refused**: Backend not running
- **Database error**: SQL Server not connected
- **401 Unauthorized**: Need to login first
- **CORS error**: Check CORS_ORIGIN in .env

---

## 🎓 Learning Path

1. **Read**: API_TESTING_SETUP_GUIDE.md (5 min)
2. **Setup**: Install SQL Server & configure .env (10 min)
3. **Install**: Run npm commands (5 min)
4. **Start**: `npm run dev` (1 min)
5. **Import**: Postman collection (2 min)
6. **Test**: Follow quick test sequence (10 min)
7. **Explore**: Test all endpoints (30 min)

**Total Time: ~1 hour** ⏱️

---

## 📞 Support

### If Backend Won't Start
1. Check error message in terminal
2. Verify DATABASE_URL in .env
3. Ensure SQL Server is running
4. Check database `patent_navi` exists
5. Run: `npm run prisma:migrate` again

### If Tests Fail
1. Check backend logs
2. Verify token in environment
3. Ensure correct endpoint path
4. Check request body format
5. Review response status & message

### If Database Connection Fails
1. Verify SQL Server is running
2. Check connection string format
3. Test with SQL Server Management Studio
4. Verify user & password
5. Check firewall settings

---

## 🚀 Next Steps

1. **Follow Setup Guide**: API_TESTING_SETUP_GUIDE.md
2. **Install SQL Server**: Download from Microsoft
3. **Configure Backend**: Edit backend/.env
4. **Start Server**: `npm run dev`
5. **Import Collection**: Import to Postman
6. **Run Tests**: Follow testing workflow
7. **Explore Endpoints**: Test all API functionality

---

## 📚 Resources

| Resource | File | Purpose |
|----------|------|---------|
| Complete Setup | API_TESTING_SETUP_GUIDE.md | Step-by-step instructions |
| Testing Guide | POSTMAN_TESTING_GUIDE.md | How to use Postman |
| API Reference | Postman Collection | All endpoints & examples |
| Visual Dashboard | api-testing-dashboard.html | Browser-based reference |
| Quick Test | test-api.js | Node.js test script |

---

## ✅ Verification

Once setup complete, verify:
1. Backend logs show "Server running on port 4000" ✅
2. Health check returns 200 ✅
3. Login with `tan286` / `026339229` works ✅
4. Token is saved to environment ✅
5. GET /titles succeeds ✅

---

## 🎯 Success Criteria

Your setup is **complete** when:
- ✅ SQL Server is running
- ✅ Database `patent_navi` is created
- ✅ Backend starts without errors
- ✅ Health check returns 200
- ✅ Login returns token
- ✅ All 50+ endpoints are available in Postman

---

## 📝 Notes

- **Port**: Backend runs on 4000 (configurable in .env)
- **Database**: SQL Server on port 1433
- **Environment**: Uses .env for configuration
- **Authentication**: JWT tokens (24 hour expiry)
- **Rate Limiting**: 100 requests per 15 minutes
- **File Upload**: Max 10MB

---

## 🎉 You're All Set!

All files and documentation have been prepared. Follow the **API_TESTING_SETUP_GUIDE.md** to get started.

Happy Testing! 🔬🚀

---

**Created**: November 13, 2025  
**Backend Port**: 4000  
**Database**: SQL Server  
**Status**: Ready for testing (after SQL Server setup)

