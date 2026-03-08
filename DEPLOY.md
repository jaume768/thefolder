# 🚀 Guía de Despliegue — TheFolder en EC2

## Arquitectura de producción

```
Internet
   │
   ▼
┌─────────────────────────────────┐
│          Caddy (SSL auto)       │  :80 / :443
│  thefolder.es    → frontend     │
│  api.thefolder.es → backend     │
│  admin.thefolder.es → admin     │
└─────────┬───────────────────────┘
          │ (red interna Docker)
    ┌─────┼──────────┐
    ▼     ▼          ▼
frontend backend  frontend-admin
 (nginx)  (:5000)   (nginx)
              │
              ▼
           MongoDB :27017
```

---

## Requisitos previos

- **EC2**: Ubuntu 22.04+ (recomendado `t3.small` mínimo — 2GB RAM)
- **Dominio**: `thefolder.es` con acceso a la gestión de DNS
- **Cuentas**: Cloudinary, Google Cloud Console, Brevo, (MongoDB ya va en Docker)

---

## Paso 1 — Configurar DNS

En tu proveedor de DNS (donde tengas `thefolder.es`), crea estos registros tipo **A** apuntando a la IP pública de tu EC2:

| Tipo | Nombre               | Valor             |
|------|----------------------|-------------------|
| A    | `thefolder.es`       | `<IP_DEL_EC2>`    |
| A    | `www`                | `<IP_DEL_EC2>`    |
| A    | `api`                | `<IP_DEL_EC2>`    |
| A    | `admin`              | `<IP_DEL_EC2>`    |

> ⏳ Los DNS pueden tardar hasta 24h en propagarse, pero normalmente son minutos.

---

## Paso 2 — Preparar el EC2

### 2.1 — Conectar por SSH

```bash
ssh -i tu-clave.pem ubuntu@<IP_DEL_EC2>
```

### 2.2 — Instalar Docker y Docker Compose

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh

# Añadir tu usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER

# Cerrar sesión y volver a conectar para que el grupo surta efecto
exit
```

Vuelve a conectar por SSH y verifica:

```bash
docker --version
docker compose version
```

### 2.3 — Abrir puertos en Security Group de AWS

En la consola de AWS → EC2 → Security Groups del tu instancia, asegúrate de tener estas reglas de entrada (Inbound rules):

| Tipo         | Puerto | Origen       |
|--------------|--------|--------------|
| SSH          | 22     | Tu IP        |
| HTTP         | 80     | 0.0.0.0/0   |
| HTTPS        | 443    | 0.0.0.0/0   |

> ⚠️ NO abrir el puerto 27017 (MongoDB) al exterior.

---

## Paso 3 — Clonar el proyecto

```bash
git clone https://github.com/jaume768/thefolder.git
cd thefolder
```

---

## Paso 4 — Configurar variables de entorno

### 4.1 — Variables de la raíz (MongoDB)

```bash
cp .env.prod.example .env
nano .env
```

Rellena con una contraseña segura para MongoDB:

```
MONGO_USER=thefolder_admin
MONGO_PASSWORD=tu_password_super_seguro_aqui
```

### 4.2 — Variables del backend

```bash
cp backend/.env.prod.example backend/.env
nano backend/.env
```

Rellena todas las variables. Ejemplo:

```
NODE_ENV=production
PORT=5000
SESSION_SECRET=<genera con: openssl rand -hex 32>

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=https://api.thefolder.es/api/auth/google/callback

BREVO_API_KEY=tu_brevo_api_key
SENDER_EMAIL=noreply@thefolder.es
SENDER_NAME=TheFolder

JWT_SECRET=<genera con: openssl rand -hex 32>

MONGO_URI=mongodb://thefolder_admin:tu_password_super_seguro_aqui@mongo:27017/thefolder?authSource=admin

FRONTEND_URL=https://thefolder.es
```

> 💡 Genera secretos seguros con: `openssl rand -hex 32`

> ⚠️ La contraseña de MongoDB en `MONGO_URI` debe coincidir con `MONGO_PASSWORD` del `.env` raíz.

### 4.3 — Google OAuth: añadir URIs de producción

En [Google Cloud Console](https://console.cloud.google.com) → APIs → Credentials → Tu OAuth Client:

- **Authorized JavaScript origins**: `https://thefolder.es`
- **Authorized redirect URIs**: `https://api.thefolder.es/api/auth/google/callback`

---

## Paso 5 — Desplegar

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez tardará unos minutos en:
1. Construir las imágenes (npm install + build de los frontends)
2. Inicializar MongoDB con el usuario root
3. Que Caddy obtenga los certificados SSL de Let's Encrypt

### Verificar que todo está corriendo

```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver 5 contenedores `running`:

```
NAME              STATUS
caddy             Up
mongo             Up
backend           Up
frontend          Up
frontend-admin    Up
```

### Ver logs si algo falla

```bash
# Todos los logs
docker compose -f docker-compose.prod.yml logs

# Logs de un servicio específico
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs caddy
```

---

## Paso 6 — Verificar

Abre en el navegador:

| URL                          | Qué debería mostrar              |
|------------------------------|----------------------------------|
| `https://thefolder.es`       | Frontend público                 |
| `https://www.thefolder.es`   | Frontend público (redirige)      |
| `https://api.thefolder.es`   | Backend (probablemente un 404)   |
| `https://admin.thefolder.es` | Panel de administración          |

Para probar la API directamente:

```bash
curl https://api.thefolder.es/api/auth/login
```

---

## Comandos útiles

```bash
# Parar todo
docker compose -f docker-compose.prod.yml down

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart backend

# Rebuild y redesplegar (tras git pull con cambios)
docker compose -f docker-compose.prod.yml up -d --build

# Ver uso de disco de Docker
docker system df

# Limpiar imágenes antiguas
docker image prune -f
```

---

## Actualizar el proyecto

Cuando hagas cambios en el código:

```bash
cd thefolder
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Backup de MongoDB

```bash
# Crear backup
docker exec mongo mongodump --username thefolder_admin --password TU_PASSWORD --authenticationDatabase admin --out /data/backup

# Copiar backup al host
docker cp mongo:/data/backup ./backup-$(date +%Y%m%d)
```

---

## Troubleshooting

### Caddy no obtiene certificados SSL
- Verifica que los DNS apuntan correctamente: `dig thefolder.es`, `dig api.thefolder.es`
- Verifica que los puertos 80 y 443 están abiertos en el Security Group
- Revisa logs: `docker compose -f docker-compose.prod.yml logs caddy`

### El backend no conecta a MongoDB
- Verifica que la contraseña coincide entre `.env` raíz y `backend/.env`
- Revisa logs: `docker compose -f docker-compose.prod.yml logs backend`

### Error de CORS
- Verifica que el frontend llama a `https://api.thefolder.es`
- Confirma que `admin.thefolder.es` está en CORS (`backend/server.js`)

### Google OAuth no funciona
- Verifica `GOOGLE_CALLBACK_URL=https://api.thefolder.es/api/auth/google/callback`
- Verifica que las URIs están configuradas en Google Cloud Console
