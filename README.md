# Backend — ExpressJS + GraphQL (Apollo) + Prisma + PostgreSQL

> **Stack**: Node.js 20, Express 4, Apollo Server (GraphQL), Prisma ORM, PostgreSQL 16  
> **Objetivo**: API GraphQL para gestionar **Plantas**, **Operaciones**, **Rangos de Volumen** y **Costos Indirectos** por combinación *(planta × operación × rango)*.

---

## 0) Resumen rápido

- **Endpoint GraphQL**: `http://localhost:4000/graphql`  
- **Healthcheck**: `http://localhost:4000/health`  
- **DB**: PostgreSQL (Docker Compose recomendado)  
- **ORM**: Prisma (migraciones + seed de datos base)  
- **Ejecución dev**: `npm run dev`

---

## 1) Requisitos

- **Node.js 20** (recomendado usar `nvm`)
- **Docker** + **Docker Compose** (o PostgreSQL local)
- **npm** (o pnpm/yarn si prefieres)

### (Opcional) Instalar Node 20 con `nvm`
```bash
nvm install 20
nvm use 20
node -v
```

---

## 2) Estructura del proyecto (backend)

```
server/
├─ src/
│  ├─ index.js            # Express + Apollo Server + context Prisma
│  ├─ schema.graphql      # Definición del esquema GraphQL
│  └─ resolvers.js        # Resolvers de Query/Mutation
├─ prisma/
│  ├─ schema.prisma       # Modelos de datos Prisma
│  └─ seed.js             # Carga de datos iniciales (tiers, planta demo, etc.)
├─ .env.example           # Variables de entorno de ejemplo
├─ package.json
└─ README.md              # (este archivo)
```

---

## 3) Variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```
DATABASE_URL="postgresql://prisma:prisma@localhost:5432/pricing?schema=public"
PORT=4000
```

> **Nota**: Asegúrate que `localhost:5432` y las credenciales coincidan con tu Postgres (o Docker Compose).

---

## 4) Base de datos (PostgreSQL con Docker Compose)

Coloca este archivo `docker-compose.yml` **en la raíz del monorepo** (por fuera de `server/`), o en cualquier carpeta desde la que quieras levantar la DB:

```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    container_name: pricing_db
    environment:
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
      POSTGRES_DB: pricing
    ports:
      - "5432:5432"
    volumes:
      - pgdata_pricing:/var/lib/postgresql/data
volumes:
  pgdata_pricing:
```

Levantar la base:
```bash
docker compose up -d
# comprobar que está arriba
docker ps
```

---

## 5) Instalación y configuración

Desde la carpeta `server/`:

```bash
npm install
# Generar cliente Prisma (por si hace falta)
npx prisma generate
# Aplicar migraciones (crea tablas)
npm run prisma:migrate -- --name init
# (opcional) abrir Prisma Studio para ver tablas
npx prisma studio
```

### Seed de datos iniciales
```bash
npm run seed
```
Esto carga:
- Rangos de volumen (tiers): `≤300 kg`, `301–500 kg`, `501 kg–1T`, `1–3T`, `3–5T`, `5–10T`, `10–20T`, `20–30T`
- 1 Planta de demo: **PL-001 — Planta Lima**
- 3 Operaciones de ejemplo: **Impresión**, **Laminado**, **Embolsado**
- Costos indirectos con valor base `10.00 PEN` para todas las combinaciones operación × rango en la planta demo.

---

## 6) Ejecutar en desarrollo

```bash
npm run dev
# -> 🚀 GraphQL listo en http://localhost:4000/graphql
# -> Healthcheck en http://localhost:4000/health
```

> Asegúrate de tener la DB arriba antes (`docker compose up -d`).

---


### Endpoint
- **URL**: `POST http://localhost:4000/graphql`

---





