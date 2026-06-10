-- =============================================================================
-- 📐 PARQUE INDUSTRIAL JICAMARCA S.A.
-- Sistema de Gestión Eléctrica
-- Base de datos: MySQL 8.0+
-- Versión: 2.1
-- Fecha: 26 de Mayo, 2026
-- =============================================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS parque_industrial_jicamarca
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parque_industrial_jicamarca;

-- =============================================================================
-- CONFIGURACIÓN INICIAL
-- =============================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 1. TABLA: ROL
-- Catálogo normalizado de roles con permisos dinámicos
-- =============================================================================
DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_rol`     VARCHAR(50)  NOT NULL,
  `permisos_json`  JSON         DEFAULT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`     TIMESTAMP    NULL     DEFAULT NULL,

  UNIQUE KEY `uq_rol_nombre` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de roles del sistema con permisos dinámicos';

-- =============================================================================
-- 2. TABLA: USUARIO
-- Tabla unificada para staff (Admin, Operario) y socios/socios
-- =============================================================================
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id`                    INT AUTO_INCREMENT PRIMARY KEY,
  `rol_id`                INT          NOT NULL,
  `documento_identidad`   VARCHAR(11)  NOT NULL,
  `nombre_razonsocial`    VARCHAR(200) NOT NULL,
  `clave_acceso`          VARCHAR(255) NOT NULL       COMMENT 'Hash bcrypt del password o PIN',
  `cargo_representante`   VARCHAR(100) DEFAULT NULL   COMMENT 'Cargo (staff) o Representante Legal (socio)',
  `telefono`              VARCHAR(20)  DEFAULT NULL,
  `correo`                VARCHAR(100) DEFAULT NULL COMMENT 'Opcional (Ej. para envío de comprobantes)',
  `id_manzana`            VARCHAR(10)  DEFAULT NULL   COMMENT 'NULL para staff, asignado para socios',
  `lote`                  VARCHAR(10)  DEFAULT NULL   COMMENT 'NULL para staff, asignado para socios',
  `direccion`             VARCHAR(255) DEFAULT NULL   COMMENT 'Dirección de la manzana/lote',
  `es_activo`             BOOLEAN      NOT NULL DEFAULT TRUE,
  `saldo_a_favor`         DECIMAL(12,2) DEFAULT 0.00  COMMENT 'Excedente de pagos para descontar en el próximo recibo',
  `ultimo_acceso`         TIMESTAMP    NULL     DEFAULT NULL COMMENT 'Timestamp del último login exitoso',
  `created_at`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`            TIMESTAMP    NULL     DEFAULT NULL,

  -- Constraints
  UNIQUE KEY `uq_usuario_documento` (`documento_identidad`),
  UNIQUE KEY `uq_usuario_correo` (`correo`),

  -- Validación: DNI (8 dígitos) o RUC (11 dígitos), solo numérico
  CONSTRAINT `chk_usuario_documento` CHECK (
    LENGTH(`documento_identidad`) IN (8, 11)
    AND `documento_identidad` REGEXP '^[0-9]+$'
  ),

  -- FK
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`)
    REFERENCES `rol` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_usuario_rol_activo` (`rol_id`, `es_activo`),
  INDEX `idx_usuario_manzana` (`id_manzana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios del sistema: staff operativo y socios/socios';

-- =============================================================================
-- 3. TABLA: PERIODO_FACTURACION
-- Configuración centralizada de tarifas por ciclo mensual
-- =============================================================================
DROP TABLE IF EXISTS `periodo_facturacion`;
CREATE TABLE `periodo_facturacion` (
  `id`                    INT AUTO_INCREMENT PRIMARY KEY,
  `mes_anio`              VARCHAR(20)    NOT NULL      COMMENT 'Ej. Oct 2024',
  `factor_multiplicador`  DECIMAL(6,4)   NOT NULL DEFAULT 1.0000,
  `tarifa_kwh`            DECIMAL(10,4)  NOT NULL      COMMENT 'Precio por kWh de energía eléctrica normal',
  `tarifa_kwh_punta`      DECIMAL(10,4)  NOT NULL DEFAULT 0.0000 COMMENT 'Precio por kWh en hora punta',
  `tarifa_mantenimiento_normal`  DECIMAL(10,2)  NOT NULL DEFAULT 0.00 COMMENT 'Cargo mensual de mantenimiento medidor normal',
  `tarifa_mantenimiento_tiempo_real` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Cargo mensual de mantenimiento medidor tiempo real',
  `fecha_inicio`          DATE           NOT NULL,
  `fecha_fin`             DATE           NOT NULL,
  `created_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`            TIMESTAMP      NULL     DEFAULT NULL,

  -- Constraints
  UNIQUE KEY `uq_periodo_mes` (`mes_anio`),

  CONSTRAINT `chk_periodo_fechas` CHECK (`fecha_fin` > `fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Períodos de facturación con tarifas centralizadas';

-- =============================================================================
-- 4. TABLA: MEDIDOR
-- Equipo de medición eléctrica vinculado a un socio
-- =============================================================================
DROP TABLE IF EXISTS `medidor`;
CREATE TABLE `medidor` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id`   INT          NOT NULL    COMMENT 'Socio propietario del medidor',
  `num_serie`    VARCHAR(20)  NOT NULL    COMMENT 'Número de serie del equipo',
  `tipo`         VARCHAR(20)  NOT NULL DEFAULT 'Normal' COMMENT 'Normal o Tiempo Real',
  `operativo`    BOOLEAN      NOT NULL DEFAULT TRUE,
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`   TIMESTAMP    NULL     DEFAULT NULL,

  -- Constraints
  UNIQUE KEY `uq_medidor_serie` (`num_serie`),

  -- FK
  CONSTRAINT `fk_medidor_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_medidor_usuario` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Medidores eléctricos asignados a socios del parque';

-- =============================================================================
-- 5. TABLA: LECTURA
-- Registro de lectura de un medidor, tomada por un operario
-- =============================================================================
DROP TABLE IF EXISTS `lectura`;
CREATE TABLE `lectura` (
  `id`                 INT AUTO_INCREMENT PRIMARY KEY,
  `medidor_id`         INT            NOT NULL    COMMENT 'Medidor leído',
  `operario_id`        INT            NOT NULL    COMMENT 'Operario que tomó la lectura',
  `periodo_id`         INT            NOT NULL    COMMENT 'Período al que pertenece la lectura',
  `lectura_anterior`   DECIMAL(12,2)  NOT NULL    COMMENT 'Valor previo en kWh (Hora Normal)',
  `lectura_actual`     DECIMAL(12,2)  NOT NULL    COMMENT 'Valor actual en kWh (Hora Normal)',
  `consumo_calculado`  DECIMAL(12,3)  GENERATED ALWAYS AS (`lectura_actual` - `lectura_anterior`) STORED
                                                  COMMENT 'Consumo calculado automáticamente',
  `lectura_anterior_punta` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Valor previo en kWh (Hora Punta)',
  `lectura_actual_punta`   DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Valor actual en kWh (Hora Punta)',
  `consumo_calculado_punta` DECIMAL(12,3) GENERATED ALWAYS AS (`lectura_actual_punta` - `lectura_anterior_punta`) STORED
                                                  COMMENT 'Consumo hora punta calculado',
  `factor_potencia`    DECIMAL(10,4)  DEFAULT 0.00 COMMENT 'Valor de Factor de Potencia / Energía Reactiva',
  `precio_factor_potencia` DECIMAL(10,4) DEFAULT 0.00 COMMENT 'Precio por unidad de energia reactiva',
  `fecha_registro`     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado`             VARCHAR(20)    NOT NULL DEFAULT 'Validado',
  `justificacion`      TEXT           DEFAULT NULL COMMENT 'Justificación si fue editada o rectificada',
  `created_at`         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`         TIMESTAMP      NULL     DEFAULT NULL,

  -- Constraints
  CONSTRAINT `chk_lectura_valores` CHECK (`lectura_actual` >= `lectura_anterior`),
  CONSTRAINT `chk_lectura_estado`  CHECK (`estado` IN ('Validado', 'Observado')),

  -- FK
  CONSTRAINT `fk_lectura_medidor` FOREIGN KEY (`medidor_id`)
    REFERENCES `medidor` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_lectura_operario` FOREIGN KEY (`operario_id`)
    REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_lectura_periodo` FOREIGN KEY (`periodo_id`)
    REFERENCES `periodo_facturacion` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_lectura_periodo_medidor` (`periodo_id`, `medidor_id`),
  INDEX `idx_lectura_operario` (`operario_id`, `fecha_registro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lecturas de medidores eléctricos registradas por operarios';

-- =============================================================================
-- 6. TABLA: RECIBO
-- Comprobante de cobro emitido a un socio por período de facturación
-- =============================================================================
DROP TABLE IF EXISTS `recibo`;
CREATE TABLE `recibo` (
  `id`                   INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id`           INT            NOT NULL    COMMENT 'Socio facturado',
  `periodo_id`           INT            NOT NULL    COMMENT 'Período de facturación',
  `lectura_id`           INT            DEFAULT NULL COMMENT 'Lectura que originó el cargo de energía',
  `numero_comprobante`   VARCHAR(20)    NOT NULL    COMMENT 'Ej. REC-2024-001',
  `cargo_energia`        DECIMAL(12,2)  NOT NULL DEFAULT 0.00
                                                    COMMENT 'consumo × tarifa × factor',
  `cargo_mantenimiento`  DECIMAL(12,2)  NOT NULL DEFAULT 0.00
                                                    COMMENT 'Cargo fijo del período',
  `cargo_fijo`           DECIMAL(12,2)  DEFAULT 0.00,
  `cargo_corte`          DECIMAL(12,2)  DEFAULT 0.00,
  `multa_manipulacion`   DECIMAL(12,2)  DEFAULT 0.00,
  `multa_reconexion`     DECIMAL(12,2)  DEFAULT 0.00,
  `instalacion_medidor`  DECIMAL(12,2)  DEFAULT 0.00,
  `deuda_pendiente`      DECIMAL(12,2)  DEFAULT 0.00,
  `deuda_consumo`        DECIMAL(12,2)  DEFAULT 0.00,
  `deuda_vencida`        DECIMAL(12,2)  DEFAULT 0.00,
  `subtotal`             DECIMAL(12,2)  NOT NULL    COMMENT 'cargo_energia + cargo_mantenimiento + extras',
  `igv`                  DECIMAL(12,2)  NOT NULL    COMMENT '18% sobre subtotal',
  `total`                DECIMAL(12,2)  NOT NULL    COMMENT 'subtotal + igv',
  `fecha_emision`        DATE           NOT NULL,
  `fecha_vencimiento`    DATE           NOT NULL,
  `estado`               VARCHAR(20)    NOT NULL DEFAULT 'Pendiente',
  `created_at`           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`           TIMESTAMP      NULL     DEFAULT NULL,

  -- Constraints
  UNIQUE KEY `uq_recibo_comprobante` (`numero_comprobante`),
  UNIQUE KEY `uq_recibo_usuario_periodo` (`usuario_id`, `periodo_id`),

  CONSTRAINT `chk_recibo_fechas` CHECK (`fecha_vencimiento` > `fecha_emision`),
  CONSTRAINT `chk_recibo_estado` CHECK (`estado` IN ('Pendiente', 'Pagado', 'Pago Parcial', 'Vencido')),

  -- FK
  CONSTRAINT `fk_recibo_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_recibo_periodo` FOREIGN KEY (`periodo_id`)
    REFERENCES `periodo_facturacion` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_recibo_lectura` FOREIGN KEY (`lectura_id`)
    REFERENCES `lectura` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_recibo_usuario_estado` (`usuario_id`, `estado`),
  INDEX `idx_recibo_periodo` (`periodo_id`),
  INDEX `idx_recibo_vencimiento` (`fecha_vencimiento`, `estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Recibos de cobro emitidos a socios del parque';

-- =============================================================================
-- 7. TABLA: PAGO
-- Registro de pago realizado contra un recibo
-- =============================================================================
DROP TABLE IF EXISTS `pago`;
CREATE TABLE `pago` (
  `id`                  INT AUTO_INCREMENT PRIMARY KEY,
  `recibo_id`           INT            NOT NULL    COMMENT 'Recibo que se cancela',
  `monto_pagado`        DECIMAL(12,2)  NOT NULL    COMMENT 'Monto en PEN (Soles)',
  `metodo_pago`         VARCHAR(30)    NOT NULL    COMMENT 'Transferencia, Efectivo, Depósito, Cheque',
  `numero_operacion`    VARCHAR(30)    DEFAULT NULL COMMENT 'Código de la transacción bancaria',
  `fecha_pago`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_validacion`   VARCHAR(20)    NOT NULL DEFAULT 'Pendiente',
  `created_at`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`          TIMESTAMP      NULL     DEFAULT NULL,

  -- Constraints
  CONSTRAINT `chk_pago_monto`  CHECK (`monto_pagado` > 0),
  CONSTRAINT `chk_pago_estado` CHECK (`estado_validacion` IN ('Pendiente', 'Confirmado')),

  -- FK
  CONSTRAINT `fk_pago_recibo` FOREIGN KEY (`recibo_id`)
    REFERENCES `recibo` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_pago_recibo` (`recibo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pagos realizados contra recibos de cobro';

-- =============================================================================
-- 8. TABLA: HISTORIAL_ESTADO
-- Auditoría inmutable de transiciones de estado en recibos y pagos
-- =============================================================================
DROP TABLE IF EXISTS `historial_estado`;
CREATE TABLE `historial_estado` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `tabla_origen`     VARCHAR(20)  NOT NULL    COMMENT 'RECIBO o PAGO',
  `registro_id`      INT          NOT NULL    COMMENT 'ID del registro afectado',
  `estado_anterior`  VARCHAR(20)  NOT NULL,
  `estado_nuevo`     VARCHAR(20)  NOT NULL,
  `cambiado_por`     INT          NOT NULL    COMMENT 'Usuario que ejecutó el cambio',
  `fecha_cambio`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints (sin soft-delete: registros inmutables)
  CONSTRAINT `chk_historial_origen` CHECK (`tabla_origen` IN ('RECIBO', 'PAGO')),

  -- FK
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`cambiado_por`)
    REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Índices
  INDEX `idx_historial_origen` (`tabla_origen`, `registro_id`),
  INDEX `idx_historial_usuario` (`cambiado_por`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Auditoría inmutable de cambios de estado - NO borrar registros';

-- =============================================================================
-- REACTIVAR FK
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- TRIGGERS DE AUDITORÍA
-- =============================================================================

-- Trigger: Registrar en historial cuando cambia el estado de un RECIBO
DELIMITER //
CREATE TRIGGER `trg_recibo_estado_update`
BEFORE UPDATE ON `recibo`
FOR EACH ROW
BEGIN
  IF OLD.`estado` <> NEW.`estado` THEN
    INSERT INTO `historial_estado` (
      `tabla_origen`, `registro_id`,
      `estado_anterior`, `estado_nuevo`,
      `cambiado_por`
    ) VALUES (
      'RECIBO', OLD.`id`,
      OLD.`estado`, NEW.`estado`,
      @current_user_id
    );
  END IF;
END //
DELIMITER ;

-- Trigger: Registrar en historial cuando cambia el estado de un PAGO
DELIMITER //
CREATE TRIGGER `trg_pago_estado_update`
BEFORE UPDATE ON `pago`
FOR EACH ROW
BEGIN
  IF OLD.`estado_validacion` <> NEW.`estado_validacion` THEN
    INSERT INTO `historial_estado` (
      `tabla_origen`, `registro_id`,
      `estado_anterior`, `estado_nuevo`,
      `cambiado_por`
    ) VALUES (
      'PAGO', OLD.`id`,
      OLD.`estado_validacion`, NEW.`estado_validacion`,
      @current_user_id
    );
  END IF;
END //
DELIMITER ;

-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- =============================================================================

-- Roles del sistema
INSERT INTO `rol` (`nombre_rol`, `permisos_json`) VALUES
  ('Admin',    JSON_OBJECT(
    'usuarios', 'CRUD',
    'medidores', 'CRUD',
    'lecturas', 'CRUD',
    'recibos', 'CRUD',
    'pagos', 'CRUD',
    'periodos', 'CRUD',
    'reportes', 'R',
    'configuracion', 'CRUD'
  )),
  ('Operario', JSON_OBJECT(
    'lecturas', 'CR',
    'medidores', 'R',
    'recibos', 'R'
  )),
  ('Socio',  JSON_OBJECT(
    'recibos', 'R',
    'pagos', 'CR',
    'lecturas', 'R'
  ));

-- Usuario administrador por defecto
-- Password: admin123 → Hash bcrypt (reemplazar en producción)
INSERT INTO `usuario` (
  `rol_id`, `documento_identidad`, `nombre_razonsocial`,
  `clave_acceso`, `cargo_representante`, `telefono`,
  `correo`, `es_activo`
) VALUES (
  1, '40123456', 'Carlos Huamaní',
  '$2b$10$placeholder_hash_reemplazar_en_produccion',
  'Administrador Principal', '+51 987 654 321',
  'admin@jicamarca.pe', TRUE
);

-- =============================================================================
-- VISTAS ÚTILES
-- =============================================================================

-- Vista: Usuarios activos (excluye soft-deleted)
CREATE OR REPLACE VIEW `v_usuarios_activos` AS
SELECT
  u.`id`,
  u.`documento_identidad`,
  u.`nombre_razonsocial`,
  r.`nombre_rol`,
  u.`cargo_representante`,
  u.`correo`,
  u.`telefono`,
  u.`id_manzana`,
  u.`lote`,
  u.`es_activo`,
  u.`ultimo_acceso`
FROM `usuario` u
INNER JOIN `rol` r ON r.`id` = u.`rol_id`
WHERE u.`deleted_at` IS NULL;

-- Vista: Recibos pendientes con datos del socio
CREATE OR REPLACE VIEW `v_recibos_pendientes` AS
SELECT
  rec.`id`,
  rec.`numero_comprobante`,
  u.`nombre_razonsocial`    AS socio,
  u.`documento_identidad`   AS ruc_dni,
  u.`id_manzana`,
  u.`lote`,
  pf.`mes_anio`             AS periodo,
  rec.`cargo_energia`,
  rec.`cargo_mantenimiento`,
  rec.`subtotal`,
  rec.`igv`,
  rec.`total`,
  rec.`fecha_emision`,
  rec.`fecha_vencimiento`,
  rec.`estado`,
  DATEDIFF(rec.`fecha_vencimiento`, CURDATE()) AS dias_restantes
FROM `recibo` rec
INNER JOIN `usuario` u ON u.`id` = rec.`usuario_id`
INNER JOIN `periodo_facturacion` pf ON pf.`id` = rec.`periodo_id`
WHERE rec.`deleted_at` IS NULL
  AND rec.`estado` IN ('Pendiente', 'Vencido')
ORDER BY rec.`fecha_vencimiento` ASC;

-- Vista: Resumen de consumo por período
CREATE OR REPLACE VIEW `v_consumo_por_periodo` AS
SELECT
  pf.`mes_anio`             AS periodo,
  u.`nombre_razonsocial`    AS socio,
  m.`num_serie`             AS medidor,
  l.`lectura_anterior`,
  l.`lectura_actual`,
  l.`consumo_calculado`     AS consumo_kwh,
  l.`estado`                AS estado_lectura,
  op.`nombre_razonsocial`   AS operario,
  l.`fecha_registro`
FROM `lectura` l
INNER JOIN `medidor` m ON m.`id` = l.`medidor_id`
INNER JOIN `usuario` u ON u.`id` = m.`usuario_id`
INNER JOIN `usuario` op ON op.`id` = l.`operario_id`
INNER JOIN `periodo_facturacion` pf ON pf.`id` = l.`periodo_id`
WHERE l.`deleted_at` IS NULL
ORDER BY pf.`fecha_inicio` DESC, u.`nombre_razonsocial`;

-- Vista: Dashboard - resumen de cobranza por período
CREATE OR REPLACE VIEW `v_dashboard_cobranza` AS
SELECT
  pf.`mes_anio`                                          AS periodo,
  COUNT(rec.`id`)                                        AS total_recibos,
  SUM(CASE WHEN rec.`estado` = 'Pagado' THEN 1 ELSE 0 END)    AS pagados,
  SUM(CASE WHEN rec.`estado` = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
  SUM(CASE WHEN rec.`estado` = 'Vencido' THEN 1 ELSE 0 END)   AS vencidos,
  SUM(rec.`total`)                                       AS monto_total,
  SUM(CASE WHEN rec.`estado` = 'Pagado' THEN rec.`total` ELSE 0 END)    AS monto_cobrado,
  SUM(CASE WHEN rec.`estado` != 'Pagado' THEN rec.`total` ELSE 0 END)   AS monto_pendiente
FROM `recibo` rec
INNER JOIN `periodo_facturacion` pf ON pf.`id` = rec.`periodo_id`
WHERE rec.`deleted_at` IS NULL
GROUP BY pf.`id`, pf.`mes_anio`
ORDER BY pf.`fecha_inicio` DESC;

-- =============================================================================
-- PROCEDIMIENTO: Generar recibos masivos para un período
-- =============================================================================
DELIMITER //
CREATE PROCEDURE `sp_generar_recibos`(
  IN p_periodo_id INT,
  IN p_admin_id   INT
)
BEGIN
  DECLARE v_tarifa_kwh DECIMAL(10,4);
  DECLARE v_factor     DECIMAL(6,4);
  DECLARE v_tarifa_mant_normal DECIMAL(10,2);
  DECLARE v_tarifa_mant_tr     DECIMAL(10,2);
  DECLARE v_fecha_fin  DATE;
  DECLARE v_mes_anio   VARCHAR(20);

  -- Obtener datos del período
  SELECT `tarifa_kwh`, `factor_multiplicador`, `tarifa_mantenimiento_normal`, `tarifa_mantenimiento_tiempo_real`,
         `fecha_fin`, `mes_anio`
  INTO v_tarifa_kwh, v_factor, v_tarifa_mant_normal, v_tarifa_mant_tr, v_fecha_fin, v_mes_anio
  FROM `periodo_facturacion`
  WHERE `id` = p_periodo_id AND `deleted_at` IS NULL;

  -- Generar recibos para cada socio con lectura en el período
  INSERT INTO `recibo` (
    `usuario_id`, `periodo_id`, `lectura_id`,
    `numero_comprobante`,
    `cargo_energia`, `cargo_mantenimiento`,
    `subtotal`, `igv`, `total`,
    `fecha_emision`, `fecha_vencimiento`, `estado`
  )
  SELECT
    m.`usuario_id`,
    p_periodo_id,
    l.`id`,
    CONCAT('REC-', DATE_FORMAT(v_fecha_fin, '%Y'), '-', LPAD(ROW_NUMBER() OVER (ORDER BY m.`usuario_id`), 4, '0')),
    ROUND(l.`consumo_calculado` * v_tarifa_kwh * v_factor, 2),
    IF(m.`tipo` = 'Tiempo Real', v_tarifa_mant_tr, v_tarifa_mant_normal),
    ROUND(l.`consumo_calculado` * v_tarifa_kwh * v_factor + IF(m.`tipo` = 'Tiempo Real', v_tarifa_mant_tr, v_tarifa_mant_normal), 2),
    ROUND((l.`consumo_calculado` * v_tarifa_kwh * v_factor + IF(m.`tipo` = 'Tiempo Real', v_tarifa_mant_tr, v_tarifa_mant_normal)) * 0.18, 2),
    ROUND((l.`consumo_calculado` * v_tarifa_kwh * v_factor + IF(m.`tipo` = 'Tiempo Real', v_tarifa_mant_tr, v_tarifa_mant_normal)) * 1.18, 2),
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 15 DAY),
    'Pendiente'
  FROM `lectura` l
  INNER JOIN `medidor` m ON m.`id` = l.`medidor_id`
  WHERE l.`periodo_id` = p_periodo_id
    AND l.`estado` = 'Validado'
    AND l.`deleted_at` IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM `recibo` r
      WHERE r.`usuario_id` = m.`usuario_id`
        AND r.`periodo_id` = p_periodo_id
        AND r.`deleted_at` IS NULL
    );

  -- Setear usuario para los triggers
  SET @current_user_id = p_admin_id;

  SELECT CONCAT('Recibos generados para el período: ', v_mes_anio) AS resultado;
END //
DELIMITER ;

-- =============================================================================
-- EVENTO: Marcar recibos vencidos automáticamente (ejecutar diariamente)
-- =============================================================================
DELIMITER //
CREATE EVENT IF NOT EXISTS `evt_marcar_recibos_vencidos`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  -- Setear usuario del sistema para auditoría
  SET @current_user_id = 1;

  UPDATE `recibo`
  SET `estado` = 'Vencido'
  WHERE `estado` = 'Pendiente'
    AND `fecha_vencimiento` < CURDATE()
    AND `deleted_at` IS NULL;
END //
DELIMITER ;

-- =============================================================================
-- 9. TABLAS DE CARGOS Y MULTAS DINÁMICAS
-- =============================================================================
DROP TABLE IF EXISTS `recibo_cargo_dinamico`;
DROP TABLE IF EXISTS `catalogo_cargo_periodo`;
DROP TABLE IF EXISTS `catalogo_cargo`;

CREATE TABLE `catalogo_cargo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tipo` VARCHAR(20) NOT NULL COMMENT 'Costo o Multa',
  `descripcion` VARCHAR(150) NOT NULL,
  `monto_defecto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `es_activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalogo_cargo_periodo` (
  `catalogo_cargo_id` INT NOT NULL,
  `periodo_facturacion_id` INT NOT NULL,
  PRIMARY KEY (`catalogo_cargo_id`, `periodo_facturacion_id`),
  CONSTRAINT `fk_ccp_cargo` FOREIGN KEY (`catalogo_cargo_id`) REFERENCES `catalogo_cargo` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ccp_periodo` FOREIGN KEY (`periodo_facturacion_id`) REFERENCES `periodo_facturacion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recibo_cargo_dinamico` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recibo_id` INT NOT NULL,
  `descripcion` VARCHAR(150) NOT NULL,
  `tipo` VARCHAR(20) NOT NULL,
  `monto` DECIMAL(12,2) NOT NULL,
  `fecha_aplicacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rcd_recibo` FOREIGN KEY (`recibo_id`) REFERENCES `recibo` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ✅ SCRIPT COMPLETADO
-- Tablas creadas:  11
-- Vistas creadas:  4
-- Triggers:        2
-- Procedimientos:  1
-- Eventos:         1
-- =============================================================================
