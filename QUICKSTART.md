# 🚀 Inicio Rápido - 5 minutos

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar Supabase

### Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto (gratis)
3. Espera 2 minutos a que se inicialice

### Ejecutar SQL
1. Ve a **SQL Editor** en Supabase
2. Copia todo el contenido de `supabase-schema.sql`
3. Pega y ejecuta (botón "Run")

### Crear usuario admin
1. Ve a **Authentication** → **Users**
2. Click **Add user**
3. Email: `admin@giommetti.com`
4. Password: `admin123`
5. ✅ Auto-confirm user

### Copiar credenciales
1. Ve a **Settings** → **API**
2. Copia tu `Project URL` y `anon public` key

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y pega tus credenciales:
```
VITE_SUPABASE_URL=tu-url-aqui
VITE_SUPABASE_ANON_KEY=tu-key-aqui
```

## 4. Iniciar aplicación

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 5. Login

- Email: `admin@giommetti.com`
- Password: `admin123`

## ✅ ¡Listo!

Ya podés:
- Crear comercios en **Comercios** → **+ Nuevo Comercio**
- Agregar artículos en **Artículos** → **+ Nuevo Artículo**
- Registrar visitas en **Visitas** → **+ Nueva Visita**

---

Ver [README.md](README.md) para más detalles.
