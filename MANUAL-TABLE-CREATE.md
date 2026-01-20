# 🛠️ Qo'lda `app_settings` Table Yaratish

Migration ishlamayapti. Qo'lda Docker PostgreSQL da table yaratamiz.

---

## 🚀 Tezkor Yechim (Serverda)

### Variant 1: SQL Fayl Orqali (Tavsiya Etiladi)

```bash
# 1. Serverga SQL faylni yuklang
scp create-app-settings.sql deploy@vmi2805191:~/nestjs-app/

# 2. Serverga SSH orqali ulaning
ssh deploy@vmi2805191

# 3. SQL ni bajarish
cd ~/nestjs-app
docker compose exec -T moneychange_db psql -U moneychange_user -d moneychange_db < create-app-settings.sql
```

---

### Variant 2: Bevosita PostgreSQL ga Ulaning

```bash
# Serverda
ssh deploy@vmi2805191
cd ~/nestjs-app

# PostgreSQL container ichiga kiring
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db
```

**PostgreSQL ichida quyidagilarni bajaring:**

```sql
-- UUID extension ni yoqish
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- app_settings table yaratish
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL,
    value TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique index yaratish
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_app_settings_key" ON app_settings(key);

-- Tekshirish
\dt

-- app_settings ni ko'rish
SELECT * FROM app_settings;

-- Chiqish
\q
```

---

### Variant 3: Bir Qatorli Buyruq

```bash
# Serverda
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE TABLE IF NOT EXISTS app_settings (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), key VARCHAR(100) NOT NULL, value TEXT, \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE UNIQUE INDEX IF NOT EXISTS \"IDX_app_settings_key\" ON app_settings(key);"
```

---

## ✅ Tekshirish

### 1. Table Yaratilganini Tekshirish

```bash
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "\dt"
```

**Kutilgan natija:**

```
           List of relations
 Schema |     Name      | Type  |      Owner
--------+---------------+-------+-----------------
 public | app_settings  | table | moneychange_user
 public | migrations    | table | moneychange_user
 public | orders        | table | moneychange_user
 public | regions       | table | moneychange_user
 public | users         | table | moneychange_user
```

### 2. Table Strukturasini Ko'rish

```bash
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "\d app_settings"
```

**Kutilgan natija:**

```
                Table "public.app_settings"
   Column   |            Type             | Nullable
------------+-----------------------------+----------
 id         | uuid                        | not null
 key        | character varying(100)      | not null
 value      | text                        |
 updatedAt  | timestamp without time zone |
Indexes:
    "app_settings_pkey" PRIMARY KEY, btree (id)
    "IDX_app_settings_key" UNIQUE, btree (key)
```

---

## 🧪 API Test Qilish

Table yaratilgandan keyin API ni test qiling:

```bash
# User registration
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "phone": "+998901234567",
    "password": "Admin123!",
    "role": "admin",
    "secretKey": "changeme-2026"
  }'
```

**Kutilgan javob (201 Created):**

```json
{
  "id": "uuid-here",
  "username": "admin",
  "phone": "+998901234567",
  "role": "admin"
}
```

---

## 🔧 Agar Xato Bo'lsa

### Table allaqachon mavjud

```
ERROR: relation "app_settings" already exists
```

**Yechim:** Hammasi yaxshi, table allaqachon yaratilgan.

### Permission denied

```
ERROR: permission denied for schema public
```

**Yechim:**

```sql
-- PostgreSQL da
GRANT ALL PRIVILEGES ON SCHEMA public TO moneychange_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moneychange_user;
```

### UUID extension yo'q

```
ERROR: function uuid_generate_v4() does not exist
```

**Yechim:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📋 Barcha Tables ni Ko'rish

```bash
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

---

## 🎯 Qisqacha

**Eng oson usul:**

```bash
# 1. Serverga ulaning
ssh deploy@vmi2805191

# 2. Quyidagi buyruqni bajaring
cd ~/nestjs-app && docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE TABLE IF NOT EXISTS app_settings (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), key VARCHAR(100) NOT NULL, value TEXT, \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE UNIQUE INDEX IF NOT EXISTS \"IDX_app_settings_key\" ON app_settings(key);"

# 3. Tekshiring
docker compose exec moneychange_db psql -U moneychange_user -d moneychange_db -c "\dt"

# 4. API ni test qiling
curl -X POST http://localhost:3001/api/users/register -H "Content-Type: application/json" -d '{"username":"admin","phone":"+998901234567","password":"Admin123!","role":"admin","secretKey":"changeme-2026"}'
```

**Tayyor! 🎉**
