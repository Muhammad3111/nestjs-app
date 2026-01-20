# 🚨 URGENT: Server Deployment Fix

## ❌ Kritik Muammolar

### 1. Database Name Xatosi (HAR 10 SEKUNDDA!)

```
FATAL: database "moneychange_user" does not exist
```

**Sabab:** `.env` da database nomi noto'g'ri.

### 2. Missing Table

```
ERROR: relation "app_settings" does not exist
```

**Sabab:** `AppSettingModule` import qilinmagan.

---

## ✅ TEZKOR YECHIM (5 daqiqa)

### 1️⃣ Serverda `.env` ni Tuzating

```bash
# SSH orqali serverga ulaning
ssh deploy@vmi2805191

# Loyiha papkasiga o'ting
cd ~/nestjs-app

# .env ni tahrirlang
nano .env
```

**20-qatorni toping va o'zgartiring:**

```env
# ❌ NOTO'G'RI (hozirgi)
MONEYCHANGE_DB_URL=postgresql://postgres:moneychange@31M@moneychange_db:5432/moneychange_user

# ✅ TO'G'RI (yangi)
MONEYCHANGE_DB_URL=postgresql://moneychange_user:moneychange@31M@moneychange_db:5432/moneychange_db
```

**Muhim o'zgarishlar:**

- `postgres` → `moneychange_user` (user)
- `moneychange_user` → `moneychange_db` (database nomi)

**Saqlang:** `Ctrl+X`, keyin `Y`, keyin `Enter`

---

### 2️⃣ Local da Kod Yangilash

**Windows da (d:\NestJs\nestjs-app):**

`app.module.ts` allaqachon yangilangan ✅

```bash
# Git commit va push
git add .
git commit -m "fix: add AppSettingModule to app.module.ts for app_settings table"
git push origin main
```

---

### 3️⃣ Serverda Deploy Qilish

```bash
# Serverda (SSH da)
cd ~/nestjs-app

# Yangi kodlarni pull qiling
git pull origin main

# Container larni to'xtatish
docker compose down

# Qayta build va ishga tushirish
docker compose build
docker compose up -d

# Loglarni kuzatish
docker compose logs -f
```

---

## 🔍 Muvaffaqiyat Belgilari

### Database Logs (To'g'ri):

```
moneychange_db | database system is ready to accept connections
```

**❌ Endi ko'rinmasligi kerak:**

```
FATAL: database "moneychange_user" does not exist
```

### Migration Logs (To'g'ri):

```
moneychange_migration | query: CREATE TABLE "app_settings"...
moneychange_migration | No migrations are pending
```

### API Logs (To'g'ri):

```
moneychange_api | [Nest] LOG [TypeOrmModule] AppSetting entity loaded
moneychange_api | [Nest] LOG [NestApplication] Nest application successfully started
```

---

## 🧪 Test Qilish

```bash
# Serverda
curl http://localhost:3001/api/analytics/global
```

**Kutilgan javob (200 OK):**

```json
{
  "totalIncome": 0,
  "totalExpense": 0,
  "totalBalanceUZS": 0,
  "totalBalanceUSD": 0,
  "totalRegions": 0,
  "totalOrders": 0
}
```

---

## 📋 To'liq `.env` Example (Server uchun)

```env
# =========================
# APP
# =========================
NODE_ENV=production
PORT=3000

# =========================
# SECURITY
# =========================
MONEYCHANGE_JWT_SECRET=af15b7cd8580b0766cf02a8a2f957ed3070b9356aba2f7afb2a66cf68876b2325d208edb267803a3149d5dc6cfe94dcda2624c392f99fa11d2b4963c8748330a
REGISTRATION_SECRET_DEFAULT=changeme-2026

# =========================
# DATABASE (PostgreSQL)
# =========================
# ✅ TO'G'RI - User va database bir xil
MONEYCHANGE_DB_URL=postgresql://moneychange_user:moneychange@31M@moneychange_db:5432/moneychange_db

# =========================
# POSTGRES CONTAINER
# =========================
POSTGRES_DB=moneychange_db
POSTGRES_USER=moneychange_user
POSTGRES_PASSWORD=moneychange@31M

# =========================
# CORS
# =========================
ALLOWED_ORIGINS=https://moneychange.uz,https://www.moneychange.uz
```

---

## 🐛 Agar Hali Ham Muammo Bo'lsa

### Database ni Qayta Yaratish

```bash
# Serverda
docker compose down -v  # Volume larni ham o'chiradi

# Qayta ishga tushirish
docker compose build --no-cache
docker compose up -d

# Loglarni kuzatish
docker compose logs -f
```

### Database Ichini Ko'rish

```bash
# PostgreSQL ga ulaning
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db

# Tables ni ko'ring
\dt

# app_settings table borligini tekshiring
SELECT * FROM app_settings;

# Chiqish
\q
```

---

## ✅ Success Checklist

- [ ] `.env` da `MONEYCHANGE_DB_URL` to'g'ri (moneychange_db)
- [ ] `app.module.ts` da `AppSettingModule` import qilingan
- [ ] Git push qilindi
- [ ] Serverda `git pull` qilindi
- [ ] `docker compose down` bajarildi
- [ ] `docker compose up -d` bajarildi
- [ ] Database xatolari to'xtadi
- [ ] `app_settings` table yaratildi
- [ ] API muvaffaqiyatli ishga tushdi
- [ ] Test endpoint 200 OK qaytaradi

---

## 🚀 Qisqa Buyruqlar

**Serverda ketma-ket bajaring:**

```bash
# 1. .env ni tuzating (yuqoridagi ko'rsatmaga qarang)
nano ~/nestjs-app/.env

# 2. Yangi kodlarni pull qiling va deploy qiling
cd ~/nestjs-app && \
git pull origin main && \
docker compose down && \
docker compose build && \
docker compose up -d && \
docker compose logs -f
```

---

## 📝 Nima O'zgardi?

### Local (Windows):

- ✅ `app.module.ts` - `AppSettingModule` import qilindi

### Server (.env):

- ✅ Database URL - `moneychange_user` → `moneychange_db`
- ✅ User - `postgres` → `moneychange_user`

### Natija:

- ✅ Database connection ishlaydi
- ✅ `app_settings` table yaratiladi
- ✅ Registration secret verification ishlaydi
- ✅ Barcha API endpoint lar ishlaydi

**Omad! 🎉**
