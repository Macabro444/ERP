# Groups Service

Microservicio de gestión de grupos y miembros del sistema ERP.

## Puerto
`3002`

## Tecnología
- Node.js + Express
- Supabase

## Variables de entorno
```env
PORT=3002
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
| GET | `/grupos` | Listar grupos | ✅ |
| POST | `/grupos` | Crear grupo | ✅ |
| PATCH | `/grupos/:id` | Editar grupo | ✅ |
| DELETE | `/grupos/:id` | Eliminar grupo | ✅ |
| POST | `/grupos/:id/miembros` | Agregar miembro | ✅ |
| DELETE | `/grupos/:id/miembros/:userId` | Quitar miembro | ✅ |
| GET | `/health` | Estado del servicio | ❌ |

## Respuesta JSON
```json
{
  "statusCode": 200,
  "intOpCode": "SxGR200",
  "data": {}
}
```

## Códigos de operación
| Código | Descripción |
|---|---|
| SxGR200 | Operación exitosa |
| SxGR201 | Recurso creado |
| SxGR400 | Datos inválidos |
| SxGR404 | No encontrado |
| SxGR409 | Conflicto |
| SxGR500 | Error interno |