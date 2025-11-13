# Setup Guide - Patent Navi Backend

## Prerequisites

- Node.js 18+ 
- MS SQL Server (or SQL Server Express)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Database

Update `.env` file with your database connection:

```env
DATABASE_URL="sqlserver://username:password@localhost:1433/patent_navi?schema=public&encrypt=true"
```

### 3. Setup Database Schema

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate
```

### 4. (Optional) Seed Initial Data

You may want to create an initial admin user. You can do this manually or create a seed script.

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

### Login (Example)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

## Common Issues

### Database Connection Error

- Verify SQL Server is running
- Check connection string format
- Ensure SQL Server authentication is enabled
- Check firewall settings

### Port Already in Use

Change `PORT` in `.env` file to use a different port.

### Prisma Migration Issues

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_migration
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the project: `npm run build`
3. Start with: `npm start`
4. Use a process manager like PM2 for production

