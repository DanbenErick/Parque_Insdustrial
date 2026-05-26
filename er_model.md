# Modelo de Entidad-Relación (Estructura Profesional)

Este modelo refleja una arquitectura de base de datos normalizada y escalable para el sistema del Parque Industrial Jicamarca. 

## Diagrama Visual (Mermaid)

```mermaid
erDiagram
    ROL ||--o{ USUARIO : "asigna"
    USUARIO ||--o{ MEDIDOR : "posee"
    USUARIO ||--o{ RECIBO : "recibe"
    USUARIO ||--o{ LECTURA : "registra"
    
    ROL {
        int id PK
        string nombre_rol "Ej. Admin, Operario, Miembro"
        string permisos_json
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    USUARIO {
        int id PK
        int rol_id FK
        string documento_identidad "DNI o RUC"
        string nombre_razonsocial
        string clave_acceso "Hash encriptado (PIN o Password)"
        string cargo_representante
        string telefono
        string correo
        string id_manzana "Null para staff"
        string lote "Null para staff"
        boolean es_activo
        datetime ultimo_acceso "Fecha de último login"
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    PERIODO_FACTURACION ||--o{ RECIBO : "define"
    PERIODO_FACTURACION {
        int id PK
        string mes_anio "Ej. Oct 2024"
        decimal factor_multiplicador "Configurado mensualmente"
        decimal tarifa_kwh "Precio de energía por mes"
        decimal tarifa_mantenimiento "Precio fijo mantenimiento"
        date fecha_inicio
        date fecha_fin
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    MEDIDOR ||--o{ LECTURA : "tiene"
    MEDIDOR {
        int id PK
        int usuario_id FK "Refiere al Miembro"
        string num_serie "Ej. ENG-0042"
        string tipo_servicio "Luz, Agua"
        boolean operativo
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    LECTURA {
        int id PK
        int medidor_id FK
        int operario_id FK "Refiere al Operario"
        decimal lectura_anterior
        decimal lectura_actual
        decimal consumo_calculado
        timestamp fecha_registro "Default: Current Timestamp"
        string estado "Validado, Observado"
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    RECIBO ||--o{ PAGO : "es cancelado por"
    RECIBO {
        int id PK
        int usuario_id FK "Refiere al Miembro"
        int periodo_id FK "Refiere a PERIODO_FACTURACION"
        string numero_comprobante "Ej. REC-2024-001"
        decimal cargo_energia
        decimal cargo_mantenimiento
        decimal subtotal
        decimal igv
        decimal total
        date fecha_emision
        date fecha_vencimiento
        string estado "Pendiente, Pagado, Vencido"
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    PAGO {
        int id PK
        int recibo_id FK
        decimal monto_pagado
        string metodo_pago "Transferencia, Efectivo, etc."
        string numero_operacion
        timestamp fecha_pago "Default: Current Timestamp"
        string estado_validacion "Pendiente, Confirmado"
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }
```

## Diccionario de Tablas y Patrones Profesionales

### 1. Campos de Auditoría (En todas las tablas)
Toda tabla profesional incluye los campos:
- `created_at`: Se genera automáticamente por el motor de BD al hacer el *INSERT*.
- `updated_at`: Se actualiza automáticamente en cada *UPDATE*.
- `deleted_at`: Se utiliza para el **Borrado Lógico** (Soft Delete).

### 2. Tabla `ROL` y Normalización
Los roles ("Admin", "Operario", "Miembro") ya no están escritos a mano como texto. Se manejan en su propia tabla `ROL`. 
- **Escalabilidad:** Esto permite crear nuevos roles (ej. "Auditor") sin tocar el código y asignar permisos dinámicos a través del campo `permisos_json`.

### 3. Tabla `USUARIO`
- `clave_acceso`: Se estandariza el nombre del campo. Guardará un Hash encriptado tanto si el usuario configuró una contraseña alfanumérica como si es un operario con un PIN numérico.
- `ultimo_acceso`: Registrará la estampa de tiempo (timestamp) cada vez que el usuario haga Login exitosamente.

### 4. Tabla `PERIODO_FACTURACION`
Esta es una adición crítica para sistemas de facturación industrial. 
- En lugar de poner el **factor multiplicador** y las **tarifas** a cada medidor de forma individual, se centraliza en un Período Mensual. Así, al cerrar el mes, el administrador configura la tarifa y el factor aplicable a ese mes para todos en bloque.

### 5. Timestamps Automáticos
Los campos como `fecha_registro` (en Lecturas) y `fecha_pago` (en Pagos) están configurados como `timestamp`. Esto significa que la base de datos toma la hora exacta del servidor en el momento de la inserción, evitando errores humanos u horas desfasadas.
