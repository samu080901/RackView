
# RackView - Dashboard de Inventario de Racks

## Descripción
RackView es un dashboard web diseñado para registrar, consultar y administrar equipos instalados en racks de infraestructura tecnológica.

Permite visualizar la información del inventario de manera organizada y facilita el control de los equipos.

## Funcionalidades
- Visualización del total de equipos y racks.
- Registro de nuevos equipos.
- Edición y eliminación de equipos.
- Búsqueda por nombre o información del equipo.
- Filtros por fabricante y rack.
- Gráficos de distribución de fabricantes.
- Resumen de ocupación de los racks.
- Importación y exportación de archivos CSV.
- Almacenamiento de datos en el navegador.

## Tecnologías utilizadas
- HTML5
- CSS3
- JavaScript
- Chart.js
- CSV
- Visual Studio Code

## Estructura del proyecto

- `index.html`: estructura principal del dashboard.
- `styles.css`: estilos y diseño visual.
- `script.js`: funciones e interactividad.
- `inventario_rack.csv`: archivo de inventario.
- `README.md`: documentación del proyecto.
- `.gitignore`: archivos excluidos del control de versiones.

## Cómo ejecutar el proyecto

1. Descargar o clonar el repositorio.
2. Abrir la carpeta RackView en Visual Studio Code.
3. Abrir el archivo `index.html` con Live Server.
4. El dashboard se abrirá en el navegador.

## Formato del inventario CSV

El archivo debe contener las siguientes columnas:

`rack,equipo,vendor,ubicacion_u,ip,funcion,energia,interfaces`

## Almacenamiento
El dashboard utiliza LocalStorage del navegador para conservar los registros después de actualizar la página.

## Autor
Proyecto académico desarrollado como ejercicio de administración y visualización de inventarios de racks.

## Versión
1.0.0
## Datos de ejemplo

El proyecto incluye un inventario de prueba con equipos
de diferentes fabricantes, distribuidos en tres racks.

Los datos son ficticios y pueden modificarse desde
el dashboard según las necesidades del inventario.

## Mantenimiento del proyecto

Se pueden agregar nuevos equipos, actualizar sus datos
y eliminar registros desde la interfaz principal.
También es posible importar y exportar información