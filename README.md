# FotoTrack

**Plataforma web para la gestión y comercialización de fotografías de eventos deportivos.**

FotoTrack es un proyecto de desarrollo web full stack orientado a facilitar la publicación, búsqueda y compra de fotografías deportivas.

El sistema permite a los fotógrafos administrar álbumes y publicar imágenes, mientras que los usuarios pueden explorar galerías, encontrar sus fotografías mediante reconocimiento facial y gestionar sus compras.

El proyecto integra procesamiento de imágenes, reconocimiento facial y automatización de procesos, combinando funcionalidades de comercio electrónico con servicios externos.

## Tecnologías utilizadas

**Frontend**
- React
- JavaScript
- Bootstrap

**Backend**
- Node.js
- Express
- API REST

**Base de datos**
- MySQL

**Servicios y herramientas**
- Cloudinary: almacenamiento y procesamiento de imágenes.
- Firebase Authentication: autenticación de usuarios.
- face-api.js: reconocimiento facial.
- Git y GitHub: control de versiones.
- pnpm: gestión de dependencias.

**Ingeniería de software**
- Metodología de desarrollo UP (Proceso Unificado).
- Análisis y documentación de requerimientos.
- Modelado de bases de datos relacionales.
- Arquitectura por capas.

## Funcionalidades principales

### Gestión de usuarios
- Registro e inicio de sesión.
- Autenticación mediante Google.
- Administración de perfiles y roles de usuario.

### Administración de álbumes y fotografías
- Creación y gestión de álbumes de eventos deportivos.
- Carga de imágenes y almacenamiento mediante Cloudinary.
- Generación de versiones optimizadas y miniaturas.
- Aplicación de marcas de agua para proteger las fotografías publicadas.

### Reconocimiento facial
- Búsqueda de fotografías mediante imágenes faciales de referencia.
- Identificación de posibles coincidencias utilizando face-api.js.
- Consulta de fotografías asociadas a las coincidencias encontradas.

### Comercialización
- Visualización de galerías y fotografías.
- Carrito de compras.
- Gestión y consulta de compras realizadas.
- Entrega automática de fotografías mediante correo electrónico.

### Administración y seguimiento
- Gestión de usuarios y contenido.
- Consultas administrativas.
- Funcionalidades de reportes y auditoría contempladas en el sistema.

## Procesos automatizados

Uno de los objetivos principales del proyecto es reducir tareas manuales mediante tres procesos:

1. **Procesamiento de imágenes:** integración con Cloudinary para almacenar, optimizar y aplicar marcas de agua.
2. **Reconocimiento facial:** utilización de face-api.js para facilitar la búsqueda de fotografías.
3. **Entrega digital:** automatización del envío de fotografías adquiridas mediante correo electrónico.

## Arquitectura

La aplicación está organizada en frontend, backend y base de datos relacional.

En el backend se utiliza una estructura por capas para separar responsabilidades entre controladores, servicios y repositorios, facilitando el mantenimiento y la evolución del sistema.

## Estado del proyecto

Proyecto académico de desarrollo full stack, con funcionalidades principales implementadas y mejoras en curso.

## Autor

**Juan Manuel Insaurraldi**

Estudiante de Licenciatura en Sistemas de Información — Universidad Nacional de Misiones.

GitHub: https://github.com/juanmainsau

## Cómo correr (cuando esté el código):
1) pnpm i
2) pnpm dev (consola 1)
3) .\ngrok http 4000 (consola 2)
