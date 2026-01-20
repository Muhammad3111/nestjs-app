# 🔧 Deployment Xatolarini Tuzatish

## ❌ Aniqlangan Muammolar

### 1. Database Connection String Xatosi

```
FATAL: database "moneychange_user" does not exist
```

**Sabab:** `.env` faylidagi `MONEYCHANGE_DB_URL` noto'g'ri formatda.

### 2. Missing Production Dependencies

```
Error: Cannot find module 'tsconfig-paths/register'
```

**Sabab:** `tsconfig-paths` va `ts-node` faqat devDependencies da edi.

---

## ✅ Tuzatish Qadamlari

### 1-Qadam: Serverda `.env` Faylini To'g'rilash

```bash
# Serverga SSH orqali ulaning
ssh deploy@vmi2805191

# Loyiha papkasiga o'ting
cd ~/nestjs-app

# .env faylni tahrirlang
nano .env
```

**`.env` da quyidagini o'zgartiring:**

```env
# ❌ NOTO'G'RI - Database nomi user bilan aralashgan
MONEYCHANGE_DB_URL=postgresql://moneychange_user:moneychange@31M@moneychange_db:5432/moneychange_user

# ✅ TO'G'RI - Database nomi alohida
MONEYCHANGE_DB_URL=postgresql://moneychange_user:moneychange@31M@moneychange_db:5432/moneychange_db
```

**To'liq `.env` fayl:**

```env
# Application
NODE_ENV=production
PORT=3001

# Database Connection (Docker Compose)
MONEYCHANGE_DB_URL=postgresql://moneychange_user:moneychange@31M@moneychange_db:5432/moneychange_db

# PostgreSQL Container Variables
POSTGRES_USER=moneychange_user
POSTGRES_PASSWORD=moneychange@31M
POSTGRES_DB=moneychange_db

# JWT Secret
MONEYCHANGE_JWT_SECRET=your-generated-jwt-secret-here

# Registration Secret
REGISTRATION_SECRET_DEFAULT=your-registration-secret

# CORS
ALLOWED_ORIGINS=http://localhost:4200,https://yourdomain.com
```

**Saqlang:** `Ctrl+X`, keyin `Y`, keyin `Enter`

---

### 2-Qadam: Local da package.json Yangilash

**Local kompyuterda (Windows):**

```bash
# Loyiha papkasida
cd d:\NestJs\nestjs-app

# Git add va commit
git add package.json
git commit -m "fix: move ts-node and tsconfig-paths to production dependencies"

# GitHub ga push
git push origin main
```

---

### 3-Qadam: Serverda Yangi Kodlarni Pull Qilish

```bash
# Serverda
cd ~/nestjs-app

# Yangi kodlarni pull qiling
git pull origin main

# Dependencies ni qayta o'rnating
npm ci --only=production
```

---

### 4-Qadam: Docker Containers ni Qayta Ishga Tushirish

```bash
# Barcha container larni to'xtatish va o'chirish
docker compose down

# Volume larni tozalash (agar database muammosi bo'lsa)
docker compose down -v

# Qayta build qilish va ishga tushirish
docker compose build --no-cache
docker compose up -d

# Loglarni kuzatish
docker compose logs -f
```

---

## 🔍 Tekshirish

### 1. Container lar Statusini Ko'rish

```bash
docker compose ps
```

**Kutilgan natija:**

```
NAME                    STATUS
moneychange_api         Up (healthy)
moneychange_db          Up (healthy)
moneychange_migration   Exited (0)
```

### 2. Migration Loglarini Ko'rish

```bash
docker compose logs moneychange_migration
```

**Kutilgan natija:**

```
query: SELECT version()
query: SELECT * FROM current_schema()
query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
No migrations are pending
```

### 3. API ni Test Qilish

```bash
# Health check
curl http://localhost:3001/api/analytics/global

# Kutilgan response:
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

## 🐛 Agar Hali Ham Xato Bo'lsa

### Database Muammosi

```bash
# PostgreSQL container ichiga kiring
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db

# Database mavjudligini tekshiring
\l

# Tables ni ko'ring
\dt

# Chiqish
\q
```

### Migration Muammosi

```bash
# Migration ni qo'lda bajaring
docker compose run --rm moneychange_migration

# Yoki API container ichida
docker compose exec moneychange_api npm run migration:run
```

### Container Logs

```bash
# Barcha logs
docker compose logs

# Faqat API logs
docker compose logs moneychange_api

# Faqat DB logs
docker compose logs moneychange_db

# Real-time logs
docker compose logs -f
```

---

## 📝 Muhim Eslatmalar

### Database Connection String Format:

```
postgresql://[username]:[password]@[hostname]:[port]/[database_name]
                                                        └─────┬──────┘
                                                        Bu DATABASE nomi!
```

### Sizning holatda:

- **Username:** `moneychange_user`
- **Password:** `moneychange@31M`
- **Hostname:** `moneychange_db` (Docker container nomi)
- **Port:** `5432`
- **Database:** `moneychange_db` (username bilan bir xil bo'lmasligi kerak!)

---

## ✅ Success Checklist

- [ ] `.env` faylda `MONEYCHANGE_DB_URL` to'g'ri
- [ ] `package.json` da `ts-node` va `tsconfig-paths` dependencies da
- [ ] GitHub ga push qilindi
- [ ] Serverda `git pull` qilindi
- [ ] `npm ci --only=production` bajarildi
- [ ] `docker compose down` bajarildi
- [ ] `docker compose build --no-cache` bajarildi
- [ ] `docker compose up -d` bajarildi
- [ ] Migration muvaffaqiyatli (Exited 0)
- [ ] API healthy
- [ ] Test endpoint ishlayapti

---

## 🚀 Qisqacha Buyruqlar

```bash
# Serverda ketma-ket bajaring:
cd ~/nestjs-app
nano .env  # MONEYCHANGE_DB_URL ni to'g'rilang
git pull origin main
npm ci --only=production
docker compose down -v
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

Muvaffaqiyat! 🎉
