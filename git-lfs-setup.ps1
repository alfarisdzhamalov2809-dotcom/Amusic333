# Git LFS Setup Script
# Navigate to project root
Push-Location $PSScriptRoot

Write-Host "🔧 Инициализация Git LFS..." -ForegroundColor Green

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "❌ Ошибка: это не Git репозиторий" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Initialize Git LFS
Write-Host "1️⃣  Git LFS install..." -ForegroundColor Yellow
git lfs install --local

# Track media files
Write-Host "2️⃣  Отслеживание медиа-файлов..." -ForegroundColor Yellow
git lfs track "*.mp3" 2>$null
git lfs track "*.wav" 2>$null
git lfs track "*.flac" 2>$null
git lfs track "*.png" 2>$null
git lfs track "*.jpg" 2>$null
git lfs track "*.jpeg" 2>$null
git lfs track "*.gif" 2>$null
git lfs track "*.svg" 2>$null
git lfs track "*.mp4" 2>$null
git lfs track "*.mov" 2>$null

# Verify .gitattributes was created
if (Test-Path ".gitattributes") {
    Write-Host "✅ .gitattributes создан" -ForegroundColor Green
    Write-Host "`n📋 Отслеживаемые файлы:" -ForegroundColor Cyan
    git lfs track
} else {
    Write-Host "❌ Ошибка при создании .gitattributes" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Stage .gitattributes
Write-Host "`n3️⃣  Добавление .gitattributes в индекс..." -ForegroundColor Yellow
git add .gitattributes .gitignore

# Check git status
Write-Host "`n4️⃣  Статус репозитория:" -ForegroundColor Yellow
git status

# Commit
Write-Host "`n5️⃣  Коммит конфигурации Git LFS..." -ForegroundColor Yellow
git commit -m "chore: инициализировать Git LFS для медиа-файлов"

Write-Host "`n✅ Git LFS успешно настроен!" -ForegroundColor Green
Write-Host "📊 LFS файлы:" -ForegroundColor Cyan
git lfs ls-files

Pop-Location
