# Patent Navi Backend API

Backend API server for Patent Navi system built with Node.js, Express, TypeScript, and Prisma.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MS SQL Server
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Excel Processing**: ExcelJS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="sqlserver://user:password@localhost:1433/patent_navi?schema=public&encrypt=true"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Titles

- `GET /api/titles` - List all titles
- `GET /api/titles/:id` - Get title detail
- `POST /api/titles` - Create title
- `PUT /api/titles/:id` - Update title
- `DELETE /api/titles/:id` - Delete title
- `POST /api/titles/:id/copy` - Copy title
- `GET /api/titles/search?q=query` - Search titles

### Patents

- `GET /api/titles/:id/patents` - Get patents by title
- `GET /api/patents/:id` - Get patent detail
- `POST /api/patents` - Create patent
- `PUT /api/patents/:id` - Update patent
- `PUT /api/patents/:id/status` - Update patent status
- `DELETE /api/patents/:id` - Delete patent
- `GET /api/patents/companies/:name/patents` - Get patents by company

### Import/Export

- `POST /api/import/csv` - Import CSV/Excel file
- `POST /api/export/data` - Export data
- `GET /api/export/fields` - Get export fields

### Evaluations

- `GET /api/evaluations/patent/:id` - Get evaluations
- `POST /api/evaluations` - Create evaluation
- `PUT /api/evaluations/:id` - Update evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

### Users & Departments

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `GET /api/users/departments` - List departments
- `GET /api/users/departments/:id/users` - Get users by department

### Classifications

- `GET /api/titles/:id/classification?type=year|month|week` - Get classification data
- `POST /api/classifications/auto-classify/:id` - Auto-classify patents

### Merge

- `POST /api/titles/merge` - Merge titles

### Attachments

- `POST /api/titles/:id/attachments` - Upload attachment
- `GET /api/titles/:id/attachments` - List attachments
- `DELETE /api/attachments/:id` - Delete attachment
- `GET /api/attachments/:id/download` - Download attachment

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── uploads/             # File uploads directory
```

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

## License

ISC

