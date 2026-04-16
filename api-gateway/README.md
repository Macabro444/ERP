# API Gateway

Punto de entrada único del sistema ERP. Maneja autenticación JWT, validación de permisos y rate limiting.

## Puerto
`4000`

## Tecnología
- Node.js + Fastify
- Supabase Auth

## Variables de entorno
```env
PORT=4000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key
USER_SERVICE_URL=http://localhost:3001
GROUPS_SERVICE_URL=http://localhost:3002
TICKETS_SERVICE_URL=http://localhost:3003
```

## Instalación
```bash
npm install
node index.js
```

## Rutas disponibles

| Método | Ruta | Servicio | Permiso requerido |
|---|---|---|---|
| POST | `/auth/login` | user-service | ❌ |
| POST | `/auth/register` | user-service | ❌ |
| GET | `/usuarios` | user-service | `usuario.view` |
| PATCH | `/usuarios/:id` | user-service | `usuario.editar` |
| DELETE | `/usuarios/:id` | user-service | `usuario.eliminar` |
| GET | `/grupos` | groups-service | `grupos.view` |
| POST | `/grupos` | groups-service | `grupos.crear` |
| PATCH | `/grupos/:id` | groups-service | `grupos.editar` |
| DELETE | `/grupos/:id` | groups-service | `grupos.eliminar` |
| GET | `/tickets` | tickets-service | `tickets.view` |
| POST | `/tickets` | tickets-service | `tickets.crear` |
| PATCH | `/tickets/:id` | tickets-service | `ticket.editar` |
| DELETE | `/tickets/:id` | tickets-service | `ticket.eliminar` |
| GET | `/estados` | tickets-service | ✅ |
| GET | `/prioridades` | tickets-service | ✅ |
| GET | `/permisos` | user-service | `permisos.view` |

## Seguridad
- Validación JWT en cada request
- Rate limiting: 100 requests/minuto por IP
- Validación de permisos granulares
- CORS configurado

## Respuesta de error
```json
{
  "statusCode": 403,
  "intOpCode": "SxGW403",
  "data": {
    "message": "No tienes permiso para realizar esta acción"
  }
}
```

## Códigos de operación
| Código | Descripción |
|---|---|
| SxGW200 | Operación exitosa |
| SxGW401 | Token inválido |
| SxGW403 | Sin permisos |
| SxGW429 | Rate limit excedido |
| SxGW500 | Error interno |