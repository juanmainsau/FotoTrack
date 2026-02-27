CREATE DATABASE IF NOT EXISTS `fototrack_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `fototrack_db`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- -----------------------------------------------------
-- Tabla: acciones_auditoria
-- -----------------------------------------------------
DROP TABLE IF EXISTS `acciones_auditoria`;
CREATE TABLE `acciones_auditoria` (
  `idAccion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`idAccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: album
-- -----------------------------------------------------
DROP TABLE IF EXISTS `album`;
CREATE TABLE `album` (
  `idAlbum` int NOT NULL AUTO_INCREMENT,
  `nombreEvento` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaEvento` date NOT NULL,
  `localizacion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precioFoto` int DEFAULT NULL,
  `precioAlbum` int DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `visibilidad` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Público',
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoInterno` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaCarga` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idAlbum`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: metodos_pago
-- -----------------------------------------------------
DROP TABLE IF EXISTS `metodos_pago`;
CREATE TABLE `metodos_pago` (
  `idMetodoPago` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idMetodoPago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: tipos_entidad
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tipos_entidad`;
CREATE TABLE `tipos_entidad` (
  `idTipoEntidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idTipoEntidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: tipos_producto
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tipos_producto`;
CREATE TABLE `tipos_producto` (
  `idTipoProducto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precioBase` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estaActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idTipoProducto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: parametros_sistema
-- -----------------------------------------------------
DROP TABLE IF EXISTS `parametros_sistema`;
CREATE TABLE `parametros_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `watermark_enabled` tinyint(1) DEFAULT '1',
  `watermark_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `watermark_ruta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `watermark_opacity` int DEFAULT '40',
  `watermark_size` float DEFAULT '0.3',
  `watermark_position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'south_east',
  `calidad_default` int DEFAULT '90',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla: usuarios
-- -----------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `firebase_uid` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_referencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idCarrito` int DEFAULT NULL,
  `faceDescriptor` json DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Resto de tablas con sus Foreing Keys (dependientes de usuarios y album)
-- -----------------------------------------------------

DROP TABLE IF EXISTS `carritos`;
CREATE TABLE `carritos` (
  `idCarrito` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`idCarrito`),
  KEY `fk_carritos_usuario` (`idUsuario`),
  CONSTRAINT `fk_carritos_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actualización de la FK circular en usuarios (post-creación de carrito)
ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuario_carrito` FOREIGN KEY (`idCarrito`) REFERENCES `carritos` (`idCarrito`) ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `idAuditoria` int NOT NULL AUTO_INCREMENT,
  `fechaHora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuarioResponsable` int NOT NULL,
  `idAccion` int NOT NULL,
  `idTipoEntidad` int NOT NULL,
  `idEntidadAfectada` int NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci,
  `ipOrigen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idAuditoria`),
  CONSTRAINT `fk_auditoria_accion` FOREIGN KEY (`idAccion`) REFERENCES `acciones_auditoria` (`idAccion`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_auditoria_tipoentidad` FOREIGN KEY (`idTipoEntidad`) REFERENCES `tipos_entidad` (`idTipoEntidad`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`idUsuarioResponsable`) REFERENCES `usuarios` (`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `imagenes`;
CREATE TABLE `imagenes` (
  `idImagen` int NOT NULL AUTO_INCREMENT,
  `idAlbum` int NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fechaCarga` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rutaOriginal` text COLLATE utf8mb4_unicode_ci,
  `rutaMiniatura` text COLLATE utf8mb4_unicode_ci,
  `rutaOptimizado` text COLLATE utf8mb4_unicode_ci,
  `public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_id_thumb` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_id_optimized` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idImagen`),
  CONSTRAINT `fk_imagenes_album` FOREIGN KEY (`idAlbum`) REFERENCES `album` (`idAlbum`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `clasificaciones_faciales`;
CREATE TABLE `clasificaciones_faciales` (
  `idClasificacion` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idImagen` int NOT NULL,
  `nivelConfianza` decimal(5,4) NOT NULL,
  `fechaClasificacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`idClasificacion`),
  CONSTRAINT `fk_clasfac_imagen` FOREIGN KEY (`idImagen`) REFERENCES `imagenes` (`idImagen`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_clasfac_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `compras`;
CREATE TABLE `compras` (
  `idCompra` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idMetodoPago` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estadoPago` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `idTransaccionMP` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idCompra`),
  CONSTRAINT `fk_compras_metodopago` FOREIGN KEY (`idMetodoPago`) REFERENCES `metodos_pago` (`idMetodoPago`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_compras_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `entregas`;
CREATE TABLE `entregas` (
  `idEntrega` int NOT NULL AUTO_INCREMENT,
  `idCompra` int NOT NULL,
  `enlaceDescarga` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaGeneracion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaExpiracion` datetime DEFAULT NULL,
  `descargasRealizadas` int NOT NULL DEFAULT '0',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`idEntrega`),
  UNIQUE KEY `uk_entregas_compra` (`idCompra`),
  CONSTRAINT `fk_entregas_compra` FOREIGN KEY (`idCompra`) REFERENCES `compras` (`idCompra`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `img_referencia_facial`;
CREATE TABLE `img_referencia_facial` (
  `idImagenReferencia` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `rutaArchivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaCarga` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `esActiva` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`idImagenReferencia`),
  CONSTRAINT `fk_imgref_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `items_carrito`;
CREATE TABLE `items_carrito` (
  `idItem` int NOT NULL AUTO_INCREMENT,
  `idCarrito` int NOT NULL,
  `tipoProducto` int NOT NULL,
  `idImagen` int DEFAULT NULL,
  `idAlbum` int DEFAULT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precioUnitario` decimal(10,2) NOT NULL,
  `fechaAgregado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idItem`),
  CONSTRAINT `fk_itemscarr_album` FOREIGN KEY (`idAlbum`) REFERENCES `album` (`idAlbum`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscarr_carrito` FOREIGN KEY (`idCarrito`) REFERENCES `carritos` (`idCarrito`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscarr_imagen` FOREIGN KEY (`idImagen`) REFERENCES `imagenes` (`idImagen`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscarr_tipoproducto` FOREIGN KEY (`tipoProducto`) REFERENCES `tipos_producto` (`idTipoProducto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `items_compra`;
CREATE TABLE `items_compra` (
  `idItemCompra` int NOT NULL AUTO_INCREMENT,
  `idCompra` int NOT NULL,
  `tipoProducto` int NOT NULL,
  `idImagen` int DEFAULT NULL,
  `idAlbum` int DEFAULT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precioUnitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idItemCompra`),
  CONSTRAINT `fk_itemscompra_album` FOREIGN KEY (`idAlbum`) REFERENCES `album` (`idAlbum`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscompra_compra` FOREIGN KEY (`idCompra`) REFERENCES `compras` (`idCompra`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscompra_imagen` FOREIGN KEY (`idImagen`) REFERENCES `imagenes` (`idImagen`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_itemscompra_tipoproducto` FOREIGN KEY (`tipoProducto`) REFERENCES `tipos_producto` (`idTipoProducto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `perfiles`;
CREATE TABLE `perfiles` (
  `idUsuario` int NOT NULL,
  `consentimientoRF` tinyint(1) NOT NULL DEFAULT '0',
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigoPostal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fechaAltaPerfil` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaUltimaModif` datetime DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  CONSTRAINT `fk_perfiles_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes` (
  `idReporte` int NOT NULL AUTO_INCREMENT,
  `idUsuarioGenerador` int NOT NULL,
  `tipoReporte` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fechaInicio` datetime DEFAULT NULL,
  `fechaFin` datetime DEFAULT NULL,
  `parametros` text COLLATE utf8mb4_unicode_ci,
  `fechaGeneracion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rutaArchivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idReporte`),
  CONSTRAINT `fk_reportes_usuario` FOREIGN KEY (`idUsuarioGenerador`) REFERENCES `usuarios` (`idUsuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rostros`;
CREATE TABLE `rostros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idImagen` int NOT NULL,
  `descriptor` json NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `rostros_ibfk_1` FOREIGN KEY (`idImagen`) REFERENCES `imagenes` (`idImagen`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `usuario_coincidencias`;
CREATE TABLE `usuario_coincidencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idImagen` int NOT NULL,
  `distancia` float NOT NULL,
  `confirmado` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_match` (`idUsuario`,`idImagen`),
  CONSTRAINT `usuario_coincidencias_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE,
  CONSTRAINT `usuario_coincidencias_ibfk_2` FOREIGN KEY (`idImagen`) REFERENCES `imagenes` (`idImagen`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;