# Test Backend API Connection

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 Backend API Connection Test" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait a bit for server to start
Write-Host "⏳ Waiting for backend to initialize..." 
Start-Sleep -Seconds 3

# Test 1: Health Check
Write-Host ""
Write-Host "Test 1️⃣: Health Check" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "URL: http://localhost:4000/health" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Response:" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json) -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 2: Login
Write-Host ""
Write-Host "Test 2️⃣: Login" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "URL: http://localhost:4000/api/auth/login" -ForegroundColor Gray

$loginBody = @{
    username = "tan286"
    password = "026339229"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($responseData.user.userId)" -ForegroundColor Cyan
    Write-Host "   Token: $($responseData.token.Substring(0, 20))..." -ForegroundColor Cyan
    
    $token = $responseData.token
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 3: Get Current User
Write-Host ""
Write-Host "Test 3️⃣: Get Current User (Authenticated)" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "URL: http://localhost:4000/api/auth/me" -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/auth/me" `
        -Headers $headers `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $userData = $response.Content | ConvertFrom-Json
    Write-Host "✅ User fetched!" -ForegroundColor Green
    Write-Host "   ID: $($userData.data.id)" -ForegroundColor Cyan
    Write-Host "   Name: $($userData.data.name)" -ForegroundColor Cyan
    Write-Host "   Role: $($userData.data.permission)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 4: Get All Titles
Write-Host ""
Write-Host "Test 4️⃣: Get All Titles (Authenticated)" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "URL: http://localhost:4000/api/titles" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/titles" `
        -Headers $headers `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $titlesData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Titles fetched!" -ForegroundColor Green
    
    if ($titlesData.data) {
        Write-Host "   Total: $($titlesData.data.Count) titles" -ForegroundColor Cyan
        if ($titlesData.data.Count -gt 0) {
            Write-Host "   First title: $($titlesData.data[0].titleName)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   Total: 0 titles (empty database)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Backend API is working correctly!" -ForegroundColor Green
Write-Host "   - Database: Connected ✓" -ForegroundColor Green
Write-Host "   - Authentication: Working ✓" -ForegroundColor Green
Write-Host "   - API Endpoints: Responding ✓" -ForegroundColor Green
Write-Host ""
