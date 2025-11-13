# 🔬 Patent Navi Backend API - Testing Package Index

## 🎯 START HERE

Welcome! This is the complete API testing package for Patent Navi Backend.

**First time?** Start with: 👉 **`API_TESTING_SETUP_GUIDE.md`**

---

## 📂 File Directory

### 📚 Documentation Files (Read These First)

| File | Purpose | Time | Status |
|------|---------|------|--------|
| **TESTING_PACKAGE_SUMMARY.md** | Overview of all files | 5 min | 📖 START HERE |
| **API_TESTING_SETUP_GUIDE.md** | Setup instructions | 30 min | ⚙️ SETUP FIRST |
| **POSTMAN_TESTING_GUIDE.md** | How to use Postman | 10 min | 📝 READ NEXT |
| **README_TESTING.md** | Complete package info | 10 min | 📋 REFERENCE |

### 🛠️ Configuration & Tools

| File | Purpose | Type | Usage |
|------|---------|------|-------|
| **Postman_Collection_Patent_API.json** | API endpoints (50+) | JSON | Import to Postman |
| **test-api.js** | Quick test script | JS | `node test-api.js` |
| **api-testing-dashboard.html** | Visual reference | HTML | Open in browser |

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install & Setup (one-time)
cd backend
npm install
npm run prisma:migrate

# 2. Start Backend
npm run dev

# 3. Test (in another terminal)
cd ..
node test-api.js
```

Then import `Postman_Collection_Patent_API.json` to Postman!

---

## 📖 Reading Guide

### If You're New to This Project
1. Read: `TESTING_PACKAGE_SUMMARY.md` (10 min)
2. Read: `API_TESTING_SETUP_GUIDE.md` (30 min)
3. Follow: Setup instructions
4. Test: With `test-api.js`

### If You're Ready to Test
1. Import: `Postman_Collection_Patent_API.json` to Postman
2. Read: `POSTMAN_TESTING_GUIDE.md` (10 min)
3. Follow: 10-step testing workflow
4. Use: Postman collection to test endpoints

### If You Need Quick Reference
1. Open: `api-testing-dashboard.html` in browser
2. Bookmark it for future reference
3. Share with team members

### If You Need Troubleshooting
1. Check: Relevant guide's troubleshooting section
2. Run: `test-api.js` to verify connectivity
3. Check: Backend logs in terminal
4. Verify: `.env` configuration

---

## 🎯 Choose Your Path

### Path 1: First Time Setup
```
↓
Read: TESTING_PACKAGE_SUMMARY.md
↓
Read: API_TESTING_SETUP_GUIDE.md
↓
Install SQL Server
↓
Configure .env
↓
Run: npm run prisma:migrate
↓
Start: npm run dev
↓
Run: node test-api.js
↓
Continue to Path 2
```

### Path 2: Import & Test
```
↓
Import: Postman_Collection_Patent_API.json
↓
Read: POSTMAN_TESTING_GUIDE.md
↓
Follow: 10-step testing workflow
↓
Test: All 50+ endpoints
↓
✅ Done!
```

### Path 3: Quick Reference
```
↓
Open: api-testing-dashboard.html
↓
Use: For quick endpoint lookup
↓
Copy: Commands from guide
↓
✅ Done!
```

---

## 📋 File Descriptions

### 1. TESTING_PACKAGE_SUMMARY.md
**What**: Overview of all testing files  
**For**: Understanding what you have  
**Read Time**: 5 minutes  
**Contains**:
- File descriptions
- Statistics
- Next steps
- Quick reference
- Learning resources

### 2. API_TESTING_SETUP_GUIDE.md
**What**: Complete setup instructions  
**For**: Getting backend running  
**Read Time**: 30 minutes  
**Contains**:
- SQL Server installation (2 options)
- .env configuration
- Backend setup steps
- Database migration
- Testing the API
- Troubleshooting (7 issues)

### 3. POSTMAN_TESTING_GUIDE.md
**What**: How to use Postman collection  
**For**: Testing API endpoints  
**Read Time**: 10 minutes  
**Contains**:
- Import instructions
- Environment setup
- 10-step workflow
- Endpoint reference
- Variable documentation
- Tips & best practices

### 4. README_TESTING.md
**What**: Complete package overview  
**For**: Understanding the full picture  
**Read Time**: 10 minutes  
**Contains**:
- Package overview
- Quick start (3 steps)
- API summary
- Testing checklist
- File structure
- Learning path

### 5. Postman_Collection_Patent_API.json
**What**: All API endpoints ready to test  
**For**: Running tests in Postman  
**Size**: ~50KB  
**Contains**:
- 50+ endpoints organized in 8 categories
- Automatic token management
- Auto-save variables
- Example requests
- Test scripts

### 6. test-api.js
**What**: Simple API test script  
**For**: Quick connectivity check  
**Run**: `node test-api.js`  
**Tests**:
- Health check
- Login
- Get current user
- Fetch titles

### 7. api-testing-dashboard.html
**What**: Interactive visual dashboard  
**For**: Quick reference in browser  
**Open**: In any web browser  
**Shows**:
- Setup workflow
- Endpoint reference
- System architecture
- Troubleshooting
- Quick commands

---

## 🔑 Key Endpoints

### Most Important (Start Here)
```
GET  /health                      # Check if backend is running
POST /api/auth/login              # Login to get token
GET  /api/auth/me                 # Verify token works
GET  /api/titles                  # Get list of titles
```

### Common Operations
```
POST /api/titles                  # Create a new title
POST /api/patents                 # Add patent to title
POST /api/evaluations             # Add evaluation
GET  /api/export/patents          # Export to CSV/Excel
POST /api/import/patents          # Import from CSV
```

### Advanced Operations
```
POST /api/titles/:id/copy         # Copy a title
POST /api/merge/titles            # Merge titles
POST /api/attachments/upload      # Upload file
GET  /api/patents/companies/...   # Get by company
```

---

## ⚙️ Configuration Quick Reference

### Default Ports
- Backend: `4000`
- SQL Server: `1433`
- Frontend: `3000`

### Default Credentials
```
Username: tan286
Password: 026339229
```

### Database
```
Host: localhost
Port: 1433
Database: patent_navi
User: tan286
```

### JWT Settings
```
Token Expiry: 24 hours
Refresh Token Expiry: 7 days
```

---

## 🧪 Testing Workflow at a Glance

```
1. Health Check      → Verify backend is running
2. Login             → Get JWT token
3. Get Current User  → Verify token works
4. List Titles       → Fetch existing titles
5. Create Title      → Create new title
6. List Patents      → Get patents for title
7. Create Patent     → Add patent to title
8. Create Evaluation → Add evaluation to patent
9. Update Status     → Change patent status
10. Export Data      → Export to CSV/Excel
```

---

## 📊 Statistics

| Item | Number |
|------|--------|
| API Endpoints | 50+ |
| Request Types | 4 (GET, POST, PUT, DELETE) |
| Postman Requests | 30+ pre-configured |
| Documentation Pages | 5 comprehensive guides |
| Setup Instructions | 7 major sections |
| Troubleshooting Tips | 15+ solutions |
| Example Responses | 10+ included |

---

## ✅ Verification Checklist

Before you start, verify:
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] SQL Server Express available
- [ ] Postman installed
- [ ] Git (optional)

After setup, verify:
- [ ] Backend runs without errors
- [ ] Database connection works
- [ ] Health check returns 200
- [ ] Login succeeds
- [ ] Can fetch data from API
- [ ] Postman collection imported

---

## 🎓 Knowledge Requirements

### Minimal (To Get Started)
- Basic command line usage
- Know what REST API is
- Can install software
- Can run commands

### Helpful (To Understand Better)
- Basic SQL knowledge
- Understanding of JWT tokens
- REST API concepts
- JSON format
- HTTP methods

### Advanced (For Development)
- Express.js knowledge
- TypeScript basics
- Prisma ORM
- SQL Server administration

---

## 📞 Getting Help

### Setup Issues
→ See: `API_TESTING_SETUP_GUIDE.md` → Troubleshooting

### Testing Issues
→ See: `POSTMAN_TESTING_GUIDE.md` → Troubleshooting

### General Questions
→ See: `README_TESTING.md` → Support

### Want Visual Reference?
→ Open: `api-testing-dashboard.html`

### Quick Test?
→ Run: `node test-api.js`

---

## 🚀 Success Criteria

Your setup is **complete** when:
- ✅ SQL Server is running
- ✅ Backend starts on port 4000
- ✅ Health check returns 200
- ✅ Login works with test credentials
- ✅ Postman collection imported
- ✅ Can fetch titles list
- ✅ Can create new records

---

## 📅 Estimated Timeline

| Task | Time | Status |
|------|------|--------|
| Read this index | 5 min | ⏱️ |
| Read setup guide | 30 min | ⏱️ |
| Install SQL Server | 15 min | ⏱️ |
| Configure backend | 10 min | ⏱️ |
| Run migrations | 5 min | ⏱️ |
| Start backend | 2 min | ⏱️ |
| Import Postman | 3 min | ⏱️ |
| Run first test | 10 min | ⏱️ |
| **Total** | **~80 min** | ⏱️ |

---

## 🎉 Next Steps

### Right Now
1. Read: This index (you're doing it!)
2. Decide: Which path to take (see above)

### In 5 Minutes
1. Read: `TESTING_PACKAGE_SUMMARY.md`
2. Understand: What files you have

### In 30 Minutes
1. Read: `API_TESTING_SETUP_GUIDE.md`
2. Start: Setup process

### In 1 Hour
1. Finish: Backend setup
2. Test: With `test-api.js`

### In 2 Hours
1. Import: Postman collection
2. Start: Testing endpoints

---

## 💡 Pro Tips

1. **Bookmark the dashboard**: `api-testing-dashboard.html` for quick reference
2. **Keep terminal visible**: Watch logs while testing
3. **Save Postman environment**: Backup for team sharing
4. **Test sequentially**: Some tests depend on previous results
5. **Check logs first**: Debugging is faster with error messages
6. **Use variables**: Auto-save reduces manual work
7. **Save responses**: Useful for documentation

---

## 🔐 Security Reminders

⚠️ **For Development Only**:
- Default credentials should be changed
- Don't commit `.env` to git
- Use strong passwords in production
- Keep JWT secrets secure
- Enable HTTPS in production

---

## 📢 Final Note

This testing package is **complete and ready to use**. All files are properly configured and documented. 

**You have everything you need to:**
- ✅ Set up the backend
- ✅ Test all 50+ API endpoints
- ✅ Understand the system
- ✅ Debug issues
- ✅ Share with team

**Start with**: `API_TESTING_SETUP_GUIDE.md`

---

## 📞 Questions?

- Setup issues → Check `API_TESTING_SETUP_GUIDE.md`
- Testing questions → Check `POSTMAN_TESTING_GUIDE.md`
- Need reference → Open `api-testing-dashboard.html`
- Quick test → Run `node test-api.js`

---

**Created**: November 13, 2025  
**Version**: 1.0  
**Status**: ✅ Complete & Ready

🎉 **Happy Testing!** 🎉

