# 📦 GitHub ga Yuklash va Deploy Qilish Qo'llanmasi

Bu qo'llanma loyihangizni GitHub ga yuklash va production serverga deploy qilish bo'yicha qadam-baqadam ko'rsatma beradi.

---

## 🎯 1-Qadam: GitHub Repository Yaratish

### GitHub da yangi repository yarating

1. GitHub ga kiring: https://github.com
2. **"New repository"** tugmasini bosing
3. Repository ma'lumotlarini kiriting:
   - **Repository name:** `nestjs-moneychange-api` (yoki o'zingiz xohlagan nom)
   - **Description:** "NestJS-based Money Exchange API with JWT authentication"
   - **Visibility:** Private yoki Public (sizning tanlovingiz)
   - ❌ **README, .gitignore, license qo'shMANG** (bizda allaqachon bor)
4. **"Create repository"** tugmasini bosing

---

## 🔧 2-Qadam: Loyihani GitHub ga Yuklash

### Terminalda quyidagi buyruqlarni bajaring:

```bash
# 1. Loyiha papkasiga o'ting
cd d:\NestJs\nestjs-app

# 2. Git repository ni initialize qiling (agar qilinmagan bo'lsa)
git init

# 3. Barcha fayllarni staging ga qo'shing
git add .

# 4. Birinchi commit yarating
git commit -m "Initial commit: NestJS MoneyChange API with full features"

# 5. Main branch yarating
git branch -M main

# 6. GitHub remote qo'shing (URL ni o'zingizniki bilan almashtiring)
git remote add origin https://github.com/YOUR_USERNAME/nestjs-moneychange-api.git

# 7. GitHub ga push qiling
git push -u origin main
```

### ⚠️ Muhim:

- `YOUR_USERNAME` ni o'z GitHub username ingiz bilan almashtiring
- Agar GitHub parol so'rasa, **Personal Access Token** ishlatishingiz kerak bo'lishi mumkin

---

## 🔑 3-Qadam: GitHub Personal Access Token Yaratish (Agar kerak bo'lsa)

Agar parol bilan push qila olmasangiz:

1. GitHub Settings ga o'ting: https://github.com/settings/tokens
2. **"Generate new token"** → **"Generate new token (classic)"**
3. Token nomi: `NestJS Deploy`
4. Quyidagi ruxsatlarni belgilang:
   - ✅ `repo` (barcha repo permissions)
   - ✅ `workflow` (agar GitHub Actions ishlatmoqchi bo'lsangiz)
5. **"Generate token"** tugmasini bosing
6. **Token ni nusxalab oling** (faqat bir marta ko'rsatiladi!)

### Token bilan push qilish:

```bash
# HTTPS URL da username:token formatida
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/nestjs-moneychange-api.git

# Push qiling
git push -u origin main
```

---

## 📝 4-Qadam: GitHub da Tekshirish

1. GitHub repository sahifangizga o'ting
2. Barcha fayllar yuklangan bo'lishi kerak:
   - ✅ `src/` papka
   - ✅ `README.md`
   - ✅ `DEPLOYMENT.md`
   - ✅ `API-COMPLETE.json`
   - ✅ `docker-compose.yml`
   - ✅ `.env.example`
   - ✅ `.env.production.example`
   - ✅ `package.json`
   - ❌ `.env` fayli YO'Q bo'lishi kerak (gitignore da)
   - ❌ `DEBUG-*.md` fayllar YO'Q bo'lishi kerak

---

## 🚀 5-Qadam: Production Serverga Deploy Qilish

### Option A: VPS/Cloud Server (DigitalOcean, AWS, Azure, etc.)

#### 1. Serverga SSH orqali ulaning

```bash
ssh root@your-server-ip
# yoki
ssh your-username@your-server-ip
```

#### 2. Kerakli dasturlarni o'rnating

```bash
# System yangilanishi
sudo apt update && sudo apt upgrade -y

# Git o'rnatish
sudo apt install git -y

# Node.js 18.x o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker va Docker Compose o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tekshirish
node --version
npm --version
docker --version
docker-compose --version
```

#### 3. Repository ni clone qiling

```bash
# Loyiha uchun papka yarating
mkdir -p /opt/apps
cd /opt/apps

# GitHub dan clone qiling
git clone https://github.com/YOUR_USERNAME/nestjs-moneychange-api.git
cd nestjs-moneychange-api
```

#### 4. Environment faylini sozlang

```bash
# Production environment faylini yarating
cp .env.production.example .env

# Nano yoki vim da tahrirlang
nano .env
```

**Quyidagilarni to'ldiring:**

```env
NODE_ENV=production
PORT=3001

# Production database
MONEYCHANGE_DB_URL=postgresql://prod_user:STRONG_PASSWORD@localhost:5432/moneychange_prod

POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=moneychange_prod

# JWT secret (64+ characters)
MONEYCHANGE_JWT_SECRET=GENERATE_STRONG_SECRET_HERE

# Registration secret
REGISTRATION_SECRET_DEFAULT=YOUR_SECRET_HERE

# CORS - production domain
ALLOWED_ORIGINS=https://moneychange.uz,https://www.moneychange.uz
```

**Secret generatsiya qilish:**

```bash
# JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Registration secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Docker bilan deploy qiling

```bash
# Docker image yaratish
docker-compose build

# Database migration
docker-compose run --rm migrations

# Serverni ishga tushirish
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f api
```

#### 6. Nginx Reverse Proxy sozlash

```bash
# Nginx o'rnatish
sudo apt install nginx -y

# Configuration yaratish
sudo nano /etc/nginx/sites-available/moneychange-api
```

**Quyidagini qo'shing:**

```nginx
server {
    listen 80;
    server_name api.moneychange.uz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Site ni yoqish
sudo ln -s /etc/nginx/sites-available/moneychange-api /etc/nginx/sites-enabled/

# Nginx test
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

#### 7. SSL sertifikat o'rnatish (Let's Encrypt)

```bash
# Certbot o'rnatish
sudo apt install certbot python3-certbot-nginx -y

# SSL olish
sudo certbot --nginx -d api.moneychange.uz

# Auto-renewal test
sudo certbot renew --dry-run
```

---

### Option B: PM2 bilan (Docker siz)

```bash
# Dependencies o'rnatish
npm ci --only=production

# Build
npm run build

# PM2 o'rnatish
sudo npm install -g pm2

# Migration
npm run migration:run

# PM2 bilan ishga tushirish
pm2 start dist/main.js --name moneychange-api

# PM2 ni saqlash
pm2 save

# Auto-start sozlash
pm2 startup
# Ko'rsatilgan buyruqni bajaring
```

---

## ✅ 6-Qadam: Deployment ni Tekshirish

### 1. Health Check

```bash
# Local test
curl http://localhost:3001/api/analytics/global

# Public test (domain bilan)
curl https://api.moneychange.uz/api/analytics/global
```

### 2. User Registration Test

```bash
curl -X POST https://api.moneychange.uz/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "phone": "+998901234567",
    "password": "SecurePass123!",
    "role": "admin",
    "secretKey": "YOUR_REGISTRATION_SECRET"
  }'
```

### 3. Login Test

```bash
curl -X POST https://api.moneychange.uz/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "password": "SecurePass123!"
  }'
```

---

## 🔄 7-Qadam: Yangilanishlarni Deploy Qilish

### Local da o'zgarishlar kiritganingizdan keyin:

```bash
# 1. O'zgarishlarni commit qiling
git add .
git commit -m "Feature: yangi funksiya qo'shildi"

# 2. GitHub ga push qiling
git push origin main
```

### Serverda yangilash:

```bash
# 1. Serverga ulaning
ssh root@your-server-ip

# 2. Loyiha papkasiga o'ting
cd /opt/apps/nestjs-moneychange-api

# 3. Yangi kodlarni pull qiling
git pull origin main

# 4. Docker bilan yangilash
docker-compose down
docker-compose build
docker-compose run --rm migrations
docker-compose up -d

# YOKi PM2 bilan
npm ci --only=production
npm run build
npm run migration:run
pm2 restart moneychange-api
```

---

## 📊 8-Qadam: Monitoring va Logs

### Docker Logs

```bash
# Real-time logs
docker-compose logs -f api

# Oxirgi 100 qator
docker-compose logs --tail=100 api
```

### PM2 Logs

```bash
# Real-time logs
pm2 logs moneychange-api

# Logs faylini ko'rish
pm2 logs --lines 100
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 9-Qadam: Security Checklist

- [ ] `.env` fayli gitignore da
- [ ] Strong JWT secret ishlatilgan (64+ chars)
- [ ] Strong database password
- [ ] SSL sertifikat o'rnatilgan (HTTPS)
- [ ] Firewall sozlangan (faqat 80, 443, 22 portlar ochiq)
- [ ] Database faqat localhost dan accessible
- [ ] CORS to'g'ri sozlangan
- [ ] Regular backups sozlangan
- [ ] Monitoring o'rnatilgan

---

## 🆘 Troubleshooting

### Muammo: Git push ishlamayapti

**Yechim:**

```bash
# Remote ni tekshiring
git remote -v

# Remote ni qayta sozlang
git remote set-url origin https://github.com/YOUR_USERNAME/repo-name.git

# Token bilan push
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/repo-name.git
```

### Muammo: Docker container ishlamayapti

**Yechim:**

```bash
# Loglarni ko'ring
docker-compose logs api

# Container statusini tekshiring
docker-compose ps

# Qayta ishga tushiring
docker-compose restart api
```

### Muammo: Database connection failed

**Yechim:**

```bash
# PostgreSQL ishlab turganini tekshiring
sudo systemctl status postgresql

# Connection test
psql -h localhost -U prod_user -d moneychange_prod

# .env faylni tekshiring
cat .env | grep DB_URL
```

---

## 📞 Qo'shimcha Yordam

- **DEPLOYMENT.md** - To'liq deployment qo'llanma
- **API-COMPLETE.json** - API dokumentatsiya
- **README.md** - Loyiha haqida ma'lumot

---

## ✅ Deployment Checklist

- [ ] GitHub repository yaratildi
- [ ] Kod GitHub ga yuklandi
- [ ] Server sozlandi (Node.js, Docker, Nginx)
- [ ] Repository clone qilindi
- [ ] `.env` fayli to'ldirildi
- [ ] Docker container ishga tushdi
- [ ] Migration bajarildi
- [ ] Nginx sozlandi
- [ ] SSL o'rnatildi
- [ ] API test qilindi
- [ ] Monitoring sozlandi
- [ ] Backup strategiyasi tayyor

**Tabriklaymiz! 🎉 Loyihangiz production da ishlamoqda!**
