# User Service

Microservicio de autenticación, usuarios y permisos del sistema ERP.

## Puerto
`3001`

## Tecnología
- Node.js + Express
- Supabase Auth

## Variables de entorno
```env
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
USER_SERVICE_URL=http://localhost:3001
```

## Instalación
```bash
npm install
node index.js
```

## Endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión | ❌ |
| GET | `/usuarios` | Listar usuarios | ✅ |
| GET | `/usuarios/perfil/:id` | Obtener perfil | ✅ |
| PATCH | `/usuarios/:id` | Actualizar usuario | ✅ |
| DELETE | `/usuarios/:id` | Eliminar usuario | ✅ |
| GET | `/permisos` | Listar permisos | ✅ |
| GET | `/health` | Estado del servicio | ❌ |

## Respuesta JSON
```json
{
  "statusCode": 200,
  "intOpCode": "SxUS200",
  "data": {}
}
```

## Códigos de operación
| Código | Descripción |
|---|---|
| SxUS200 | Operación exitosa |
| SxUS201 | Recurso creado |
| SxUS400 | Datos inválidos |
| SxUS401 | No autorizado |
| SxUS404 | No encontrado |
| SxUS409 | Conflicto |
| SxUS500 | Error interno |