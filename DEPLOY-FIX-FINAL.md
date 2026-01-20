# 🔧 Deployment Muammolarini To'liq Yechish

## ❌ Aniqlangan Barcha Muammolar

### 1. Database User/Name Mismatch

```
FATAL: database "moneychange_user" does not exist
```

**Sabab:** `.env` da `POSTGRES_USER=moneychange_user` lekin `MONEYCHANGE_DB_URL` da `postgres` ishlatilgan.

### 2. TypeORM Config File Topilmayapti

```
Error: Unable to open file: "/app/src/config/typeorm.config.ts"
```

**Sabab:** Dockerfile da faqat `dist` folder copy qilingan, `src` folder yo'q.

### 3. Missing Dependencies

```
Couldn't find tsconfig.json. tsconfig-paths will be skipped
```

**Sabab:** Dockerfile da `npm ci --omit=dev` ishlatilgan, migration uchun kerakli package lar o'chirilgan.

---

## ✅ To'liq Yechim

### 1-Qadam: Serverda `.env` Faylini To'g'rilash

```bash
# Serverga SSH orqali ulaning
ssh deploy@vmi2805191

# Loyiha papkasiga o'ting
cd ~/nestjs-app

# .env faylni tahrirlang
nano .env
```

**`.env` faylini quyidagicha almashtiring:**

```env
# =========================
# APP (MoneyChange API)
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
# User va database nomi bir xil bo'lishi kerak!
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

**Asosiy o'zgarishlar:**

- ✅ `MONEYCHANGE_DB_URL` da `postgres` → `moneychange_user`
- ✅ `ALLOWED_ORIGINS` qo'shildi (main.ts ishlatadi)
- ✅ Keraksiz keylar olib tashlandi

**Saqlash:** `Ctrl+X`, keyin `Y`, keyin `Enter`

---

### 2-Qadam: Local da Fayllarni Yangilash

**Windows da (d:\NestJs\nestjs-app):**

#### A. Dockerfile allaqachon yangilangan ✅

- `src` va `tsconfig.json` copy qilinadi
- Migration dependencies saqlanadi

#### B. Git commit va push

```bash
# Terminal da
cd d:\NestJs\nestjs-app

# O'zgarishlarni ko'ring
git status

# Add va commit
git add .
git commit -m "fix: update Dockerfile for migration support and fix env configuration"

# GitHub ga push
git push origin main
```

---

### 3-Qadam: Serverda Yangilash va Deploy

```bash
# Serverda
cd ~/nestjs-app

# 1. Yangi kodlarni pull qiling
git pull origin main

# 2. Eski container va volume larni o'chiring
docker compose down -v

# 3. Qayta build qiling (cache siz)
docker compose build --no-cache

# 4. Ishga tushiring
docker compose up -d

# 5. Loglarni real-time kuzating
docker compose logs -f
```

---

## 🔍 Kutilgan Natija

### Migration Container:

```
moneychange_migration | query: SELECT version()
moneychange_migration | query: SELECT * FROM current_schema()
moneychange_migration | query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
moneychange_migration | query: SELECT * FROM "information_schema"."tables"...
moneychange_migration | query: CREATE TABLE "migrations"...
moneychange_migration | No migrations are pending
```

### Database Container:

```
moneychange_db | database system is ready to accept connections
```

### API Container:

```
moneychange_api | [Nest] LOG [NestFactory] Starting Nest application...
moneychange_api | [Nest] LOG [InstanceLoader] AppModule dependencies initialized
moneychange_api | [Nest] LOG [RoutesResolver] AppController {/}:
moneychange_api | [Nest] LOG [RouterExplorer] Mapped {/, GET} route
moneychange_api | [Nest] LOG [NestApplication] Nest application successfully started
```

---

## ✅ Tekshirish

### 1. Container Status

```bash
docker compose ps
```

**Kutilgan:**

```
NAME                    STATUS
moneychange_api         Up (healthy)
moneychange_db          Up (healthy)
moneychange_migration   Exited (0)
```

### 2. API Test

```bash
# Local test (serverda)
curl http://localhost:3001/api/analytics/global

# Public test
curl https://api.moneychange.uz/api/analytics/global
```

**Kutilgan response:**

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

## 📋 Nima O'zgardi?

### `.env` Fayl:

| Eski                                           | Yangi                                                  | Sabab                                        |
| ---------------------------------------------- | ------------------------------------------------------ | -------------------------------------------- |
| `MONEYCHANGE_DB_URL=postgresql://postgres:...` | `MONEYCHANGE_DB_URL=postgresql://moneychange_user:...` | User va POSTGRES_USER bir xil bo'lishi kerak |
| `ALLOWED_ORIGINS` yo'q                         | `ALLOWED_ORIGINS=https://moneychange.uz,...`           | main.ts ishlatadi                            |

### `Dockerfile`:

| Eski                | Yangi                               | Sabab                          |
| ------------------- | ----------------------------------- | ------------------------------ |
| `npm ci --omit=dev` | `npm ci --only=production`          | Migration uchun ts-node kerak  |
| Faqat `dist` copy   | `dist`, `src`, `tsconfig.json` copy | Migration ts fayllarni o'qiydi |

### `package.json`:

| Eski                                | Yangi                            | Sabab                            |
| ----------------------------------- | -------------------------------- | -------------------------------- |
| `ts-node` devDependencies da        | `ts-node` dependencies da        | Production migration uchun kerak |
| `tsconfig-paths` devDependencies da | `tsconfig-paths` dependencies da | Migration path resolution uchun  |

---

## 🐛 Troubleshooting

### Agar migration hali ham fail bo'lsa:

```bash
# Migration ni qo'lda bajaring
docker compose run --rm moneychange_migration

# Yoki API container ichida
docker compose exec moneychange_api npm run migration:run
```

### Database ichini ko'rish:

```bash
# PostgreSQL ga ulaning
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db

# Database larni ko'ring
\l

# Tables ni ko'ring
\dt

# Chiqish
\q
```

### Agar database yaratilmagan bo'lsa:

```bash
# PostgreSQL container ichiga kiring
docker compose exec moneychange_db psql -U moneychange_user -d postgres

# Database yarating
CREATE DATABASE moneychange_db;
GRANT ALL PRIVILEGES ON DATABASE moneychange_db TO moneychange_user;
\q

# Migration ni qayta bajaring
docker compose restart moneychange_migration
```

---

## 🚀 Qisqa Buyruqlar (Serverda)

```bash
# Hammasi bir joyda:
cd ~/nestjs-app && \
git pull origin main && \
docker compose down -v && \
docker compose build --no-cache && \
docker compose up -d && \
docker compose logs -f
```

---

## 📝 Muhim Eslatmalar

### Database Connection Format:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Sizning holatda:

- **User:** `moneychange_user` (POSTGRES_USER bilan bir xil!)
- **Password:** `moneychange@31M`
- **Host:** `moneychange_db` (Docker container nomi)
- **Port:** `5432`
- **Database:** `moneychange_db` (POSTGRES_DB bilan bir xil!)

### Docker Compose Network:

- Container lar `moneychange_net` network da
- Container lar bir-birini container name orqali topadi
- `moneychange_db` = database hostname
- `moneychange_api` = API hostname

---

## ✅ Final Checklist

- [ ] `.env` faylda `MONEYCHANGE_DB_URL` to'g'ri (moneychange_user ishlatilgan)
- [ ] `.env` da `ALLOWED_ORIGINS` mavjud
- [ ] `Dockerfile` yangilangan (src va tsconfig.json copy qilinadi)
- [ ] `package.json` da ts-node va tsconfig-paths dependencies da
- [ ] GitHub ga push qilindi
- [ ] Serverda `git pull` qilindi
- [ ] `docker compose down -v` bajarildi
- [ ] `docker compose build --no-cache` bajarildi
- [ ] `docker compose up -d` bajarildi
- [ ] Migration muvaffaqiyatli (Exited 0)
- [ ] API healthy
- [ ] Test endpoint ishlayapti (200 OK)

---

## 🎉 Success!

Agar barcha qadamlar to'g'ri bajarilsa:

✅ Database yaratiladi va tayyor bo'ladi
✅ Migration muvaffaqiyatli bajariladi
✅ API ishga tushadi va healthy bo'ladi
✅ Barcha endpoint lar ishlaydi

**API URL:** https://api.moneychange.uz
**Health Check:** https://api.moneychange.uz/api/analytics/global

Omad! 🚀
