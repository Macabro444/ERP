# Tickets Service

Microservicio de gestión de tickets, estados y prioridades del sistema ERP.

## Puerto
`3003`

## Tecnología
- Node.js + Fastify
- Supabase

## Variables de entorno
```env
PORT=3003
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key
```

## Instalación
```bash
npm install
node index.js
```

## Endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/tickets` | Listar tickets | ✅ |
| GET | `/tickets/:id` | Obtener ticket | ✅ |
| POST | `/tickets` | Crear ticket | ✅ |
| PATCH | `/tickets/:id` | Editar ticket | ✅ |
| DELETE | `/tickets/:id` | Eliminar ticket | ✅ |
| POST | `/tickets/:id/comentarios` | Agregar comentario | ✅ |
| GET | `/estados` | Listar estados | ✅ |
| GET | `/prioridades` | Listar prioridades | ✅ |
| GET | `/health` | Estado del servicio | ❌ |

## Respuesta JSON
```json
{
  "statusCode": 200,
  "intOpCode": "SxTK200",
  "data": {}
}
```

## Códigos de operación
| Código | Descripción |
|---|---|
| SxTK200 | Operación exitosa |
| SxTK201 | Recurso creado |
| SxTK400 | Datos inválidos |
| SxTK404 | No encontrado |
| SxTK409 | Conflicto |
| SxTK500 | Error interno |