/*
  Warnings:

  - You are about to alter the column `fecha_creacion` on the `aporte_proyecto` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_actualizacion` on the `aporte_proyecto` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha` on the `log_anulacion` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_creacion` on the `proyecto` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha_actualizacion` on the `proyecto` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `fecha` on the `total_log` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `aporte_proyecto` MODIFY `fecha_creacion` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `fecha_actualizacion` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `log_anulacion` MODIFY `fecha` DATETIME NOT NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE `proyecto` MODIFY `fecha_creacion` DATETIME NOT NULL DEFAULT NOW(),
    MODIFY `fecha_actualizacion` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW();

-- AlterTable
ALTER TABLE `total_log` MODIFY `fecha` DATETIME NOT NULL DEFAULT NOW();

-- CreateTable
CREATE TABLE `producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `codigo_barra` VARCHAR(191) NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `stock_actual` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `id_categoria` INTEGER NOT NULL,
    `id_unidad_medida` INTEGER NOT NULL,

    UNIQUE INDEX `producto_codigo_barra_key`(`codigo_barra`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unidad_medida` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `abreviatura` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('entrada', 'salida', 'ajuste') NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referencia` VARCHAR(150) NULL,
    `observacion` TEXT NULL,
    `id_producto` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_movimientos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `producto` ADD CONSTRAINT `producto_id_unidad_medida_fkey` FOREIGN KEY (`id_unidad_medida`) REFERENCES `unidad_medida`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_producto_fkey` FOREIGN KEY (`id_producto`) REFERENCES `producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimiento` ADD CONSTRAINT `movimiento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
