NUTRIUIN - VERSIÓN COMPLETA Y COMENTADA
========================================

Esta versión conserva el funcionamiento del proyecto y añade comentarios claros para entender qué hace cada parte y cómo se conectan HTML, CSS y JavaScript.

IMPORTANTE:
- Empieza abriendo index.html.
- Usa Live Server para que la librería jsPDF pueda cargar desde internet.
- Lee GUIA_PARA_MODIFICAR_EL_CODIGO.txt antes de cambiar nombres de id, class o claves de localStorage.

NUTRIUIN - Proyecto con portada, calculadora y menú personalizado

Flujo correcto de la página:
1. Primero aparece la portada en index.html.
2. Desde la portada el usuario presiona "Ir a la calculadora".
3. El usuario llena sus datos y presiona "Calcular".
4. Después aparece un botón abajo que dice "Crear mi menú".
5. En el menú puede agregar alimentos para crear su propio menú.
6. El sistema no deja agregar alimentos si se pasa de las calorías estimadas al día.
7. La gráfica tipo dona muestra calorías consumidas y calorías restantes.
8. La barra de progreso muestra de forma rápida cuánto lleva usado.

Por qué usé gráfica tipo dona:
La gráfica tipo dona queda mejor porque compara partes de un mismo total. En este caso el total son las calorías estimadas al día, y la dona divide ese total en:
- Calorías consumidas.
- Calorías restantes.

Qué archivos son importantes:
- index.html: portada principal de la página.
- estilos.css: diseño de la portada.
- login.js: conecta la portada con la calculadora, calcula IMC/calorías y guarda el límite.
- mvp.html: calculadora nutricional.
- mvp.css: diseño de la calculadora.
- menus.html: página para crear el menú personalizado.
- menus.css: diseño del menú, resumen, gráfica dona y barra de progreso.
- menus.js: agrega alimentos, revisa el límite de calorías, actualiza la dona y la barra.
- alimentos.js: base de datos de alimentos organizados por categoría.
- menu.html: archivo de compatibilidad que manda a la portada para respetar el flujo correcto.

Cómo abrirlo en Visual Studio Code:
1. Descomprime la carpeta NutriUIN_mejorado.zip.
2. Abre la carpeta NutriUIN_mejorado en Visual Studio Code.
3. Abre index.html.
4. Presiona "Ir a la calculadora".
5. Llena todos los datos y presiona "Calcular".
6. Presiona "Crear mi menú".
7. Busca alimentos y presiona "Agregar".

Nota:
El proyecto conserva comentarios en HTML, CSS y JavaScript para que otra persona pueda entender y modificar el código.

Actualización nueva:
- La portada ahora tiene dos botones.
- El botón "Ir a la calculadora" mantiene el flujo normal: portada, calculadora y menú con límite de calorías.
- El botón "Entrar directo al menú" abre el menú sin llenar la calculadora.
- Cuando se entra directo al menú, funciona en modo libre: deja agregar alimentos, pero no aplica límite de calorías porque no hay cálculo previo.
- Si el usuario sí calcula sus calorías, el menú sigue evitando que se pase de sus calorías estimadas al día.

ACTUALIZACIÓN NUEVA - VENTANA DE LÍMITE Y REPORTE PDF MEJORADO

Ventana frontal de límite de calorías:
- Se reemplazó la alerta simple del navegador por una ventana moderna que aparece encima de toda la página.
- El fondo se oscurece para centrar la atención del usuario.
- La ventana muestra exactamente el mensaje:
  "No se puede agregar porque te pasarías de tus calorías estimadas al día."
- También muestra las calorías consumidas actualmente, el alimento rechazado y cuántas calorías se excedería.
- Se puede cerrar con el botón, con la X, haciendo clic en el fondo o presionando la tecla Escape.
- Cuando la gráfica llega al 100%, recibe una animación de pulso y el resumen cambia a estado de meta completada.

Reporte PDF mejorado:
- El botón ahora dice "Descargar reporte PDF".
- Se usa jsPDF directamente, por lo que el código coincide con la librería cargada en menus.html.
- El PDF incluye:
  1. Encabezado profesional de NutriUIN.
  2. Fecha y hora de generación.
  3. Meta diaria, calorías consumidas y calorías restantes.
  4. Barra visual de progreso.
  5. Nombre, objetivo, actividad, edad, género, peso, estatura e IMC cuando la calculadora fue utilizada.
  6. Resumen de calorías por categoría.
  7. Lista completa de todos los alimentos agregados por el usuario.
  8. Cantidad, unidad, calorías y categoría de cada alimento.
  9. Total de registros y cantidad de alimentos diferentes.
  10. Categoría con mayor aporte de calorías.
  11. Los tres alimentos con más calorías dentro del menú elegido.
  12. Conclusión automática según el avance de la meta.
  13. Numeración de páginas y pie de página.
- El archivo se guarda con el nombre del usuario y la fecha.
- En modo libre también se genera el PDF, indicando que no existe un límite calculado.

Archivos modificados en esta versión:
- login.js: guarda más datos de la calculadora para poder incluirlos en el PDF.
- menus.html: agrega la ventana frontal y el estado dinámico de la meta.
- menus.css: agrega diseño de la ventana, animación de gráfica llena y estados visuales.
- menus.js: agrega la lógica de bloqueo, la ventana frontal y el generador completo de PDF.

Recomendación para abrir el proyecto:
- Abre la carpeta completa con Visual Studio Code.
- Usa Live Server para que la librería jsPDF cargue correctamente desde internet.
- Inicia siempre desde index.html.


ACTUALIZACIÓN DE CATEGORÍAS Y TABLA:
- Se agregó una nueva tarjeta llamada "Cereales sin grasa".
- Sus 352 alimentos se tomaron directamente de la hoja "Cereales sin grasa" del archivo Libro1.xlsx.
- La categoría general "Cereales" conserva los alimentos restantes de cereales.
- En todas las categorías, la última columna ahora se llama "Seleccionar" y debajo aparece el botón "Agregar".
- La versión actual ya no muestra la columna Grupo en las tablas.
- Todas las secciones usan las seis columnas originales del Excel y el botón Seleccionar.
- El campo id="actividad" usa una opción inicial deshabilitada con el texto "Actividad física" para funcionar visualmente como placeholder.

ARCHIVO EXCEL INCLUIDO:
- Libro1.xlsx se incluye dentro de la carpeta como fuente original de datos.
- La página web no abre el Excel en tiempo real.
- Los 352 registros de la hoja "Cereales sin grasa" ya fueron convertidos a objetos JavaScript dentro de alimentos.js.
- Si se modifica el Excel en el futuro, también habrá que actualizar alimentos.js para que la página refleje esos cambios.


ACTUALIZACIÓN - SECCIONES IMPORTADAS DESDE EXCEL

- Las categorías antiguas Carnes, Pescados, Frutas y verduras, Lácteos y Cereales fueron reemplazadas.
- Ahora se muestran las 8 hojas de Tablas_Alimentos_Con_Precios.xlsx.
- La base contiene 1247 alimentos.
- Cada tabla muestra: alimento, cantidad sugerida, unidad, peso bruto, energía, precio por 100 g y botón Seleccionar.
- La hoja A.O.A. bajo en grasa reúne los alimentos que el Excel clasifica dentro de ese grupo, incluyendo carnes, pescados y otros alimentos de origen animal.
