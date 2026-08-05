/*
================================================================================
ARCHIVO: menus.js
LENGUAJE: JavaScript
FUNCIÓN: Controla toda la página menus.html.
CONEXIONES IMPORTANTES:
1. menus.html carga este archivo al final de la página.
2. Usa elementos HTML por id y clase: cambiar un id en HTML exige cambiarlo aquí.
3. Usa el arreglo global "alimentos" creado antes por alimentos.js.
4. Lee datos de localStorage que fueron guardados por login.js.
5. Usa la librería externa jsPDF cargada en menus.html para crear el PDF.
6. Cambia clases CSS (.activo, .llena, .meta-completa) definidas en menus.css.
NOTA: Este archivo no usa PHP, MySQL ni servidor; actualmente trabaja en el navegador.
================================================================================
*/
/* menus.js: controla tarjetas, buscador, menú personalizado, límite de calorías, ventana frontal y reporte PDF. */

let categoriaActual = "A.O.A. bajo en grasa"; // Guarda la categoría que se mostrará al abrir la página.
let menuUsuario = cargarMenuGuardado(); // Recupera la lista de alimentos guardada anteriormente.
let limiteCalorias = Number(localStorage.getItem("caloriasDia")) || 0; // Lee del navegador la meta de calorías calculada en la página anterior.
let nombreUsuario = localStorage.getItem("nombreUsuario") || "usuario"; // Lee el nombre guardado para personalizar el menú y el PDF.
let objetivoUsuario = localStorage.getItem("objetivoUsuario") || "No especificado"; // Lee el objetivo elegido por el usuario en la calculadora.
let modoLibre = limiteCalorias === 0; // Activa el modo libre cuando no existe un límite de calorías.
let ultimoFocoAntesModal = null; // Recuerda qué control estaba seleccionado antes de abrir la ventana modal.

/* Datos extra guardados desde la calculadora para enriquecer el PDF. */
const perfilUsuario = { // Crea un objeto con los datos del usuario que se usarán en el PDF.
    edad: localStorage.getItem("edadUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    genero: localStorage.getItem("generoUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    peso: localStorage.getItem("pesoUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    estatura: localStorage.getItem("estaturaUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    actividad: localStorage.getItem("actividadUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    imc: localStorage.getItem("imcUsuario") || "", // Lee este dato guardado en localStorage por login.js.
    clasificacion: localStorage.getItem("clasificacionIMC") || "", // Lee este dato guardado en localStorage por login.js.
    metabolismo: localStorage.getItem("metabolismoBasal") || "" // Lee este dato guardado en localStorage por login.js.
}; // Cierra la estructura, función o llamada que se abrió en líneas anteriores.

/* Configuración de las secciones tomadas directamente de las hojas del Excel. */
const categoriasExcel = [
    { nombre: "A.O.A. bajo en grasa", totalId: "totalAOA" },
    { nombre: "Azúcares sin grasa", totalId: "totalAzucares" },
    { nombre: "Cereales con grasa", totalId: "totalCerealesConGrasa" },
    { nombre: "Cereales sin grasa", totalId: "totalCerealesSinGrasa" },
    { nombre: "Frutas", totalId: "totalFrutas" },
    { nombre: "Leche entera", totalId: "totalLecheEntera" },
    { nombre: "Leguminosas", totalId: "totalLeguminosas" },
    { nombre: "Verduras", totalId: "totalVerduras" }
];

/* Cuenta cuántos alimentos hay en cada hoja y escribe el total en su tarjeta. */
function ponerTotales(){
    categoriasExcel.forEach(function(categoria){
        const contador = document.getElementById(categoria.totalId);
        if(contador){
            contador.textContent = contar(categoria.nombre) + " alimentos";
        }
    });
}

function contar(categoria){
    return alimentos.filter(function(item){
        return item.categoria === categoria;
    }).length;
} // Cierra el bloque de código anterior.

/* Muestra los alimentos de la sección seleccionada. */
function mostrarCategoria(categoria){
    categoriaActual = categoria;
    document.getElementById("tituloCategoria").textContent = categoria;
    document.getElementById("busqueda").value = "";

    document.querySelectorAll(".tarjeta").forEach(function(tarjeta){
        tarjeta.classList.toggle("activa", tarjeta.dataset.categoria === categoria);
    });

    pintarTabla(categoria, "");
} // Cierra el bloque de código anterior.

/* Busca alimentos dentro de la categoría actual. */
function buscarAlimento(){ // Inicia la función buscarAlimento para realizar esta tarea cuando sea llamada.
    const texto = document.getElementById("busqueda").value.toLowerCase().trim(); // Busca un campo del HTML y lee o cambia el valor escrito por el usuario.
    pintarTabla(categoriaActual, texto); // Ejecuta esta instrucción como parte de la lógica de la función actual.
} // Cierra el bloque de código anterior.

/* Dibuja la tabla usando las seis columnas presentes en cada hoja del Excel. */
function pintarTabla(categoria, texto){
    const tabla = document.getElementById("tablaAlimentos");
    let html = "";
    let encontrados = 0;

    html += "<table class='tabla-excel'>";
    html += "<thead><tr>";
    html += "<th>Alimento</th>";
    html += "<th>Cantidad sugerida</th>";
    html += "<th>Unidad</th>";
    html += "<th>Peso bruto (g)</th>";
    html += "<th>Energía (kcal)</th>";
    html += "<th>Precio por 100 g (MXN)</th>";
    html += "<th>Seleccionar</th>";
    html += "</tr></thead><tbody>";

    for(let i = 0; i < alimentos.length; i++){
        const item = alimentos[i];
        const nombre = String(item.alimento).toLowerCase();

        if(item.categoria === categoria && nombre.includes(texto)){
            html += "<tr>";
            html += "<td class='columna-alimento'>" + escaparHTML(item.alimento) + "</td>";
            html += "<td>" + escaparHTML(item.cantidad) + "</td>";
            html += "<td>" + escaparHTML(item.unidad) + "</td>";
            html += "<td>" + escaparHTML(item.pesoBruto) + "</td>";
            html += "<td>" + escaparHTML(item.kcal) + "</td>";
            html += "<td>$" + formatearPrecio(item.precio100g) + "</td>";
            html += "<td><button class='boton-agregar' onclick='agregarAlimento(" + i + ")'>Agregar</button></td>";
            html += "</tr>";
            encontrados++;
        }
    }

    html += "</tbody></table>";

    if(encontrados === 0){
        html = "<p class='aviso'>No se encontraron alimentos en esta sección.</p>";
    }

    tabla.innerHTML = html;
}

/* Siempre muestra el precio del Excel con dos decimales. */
function formatearPrecio(valor){
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero.toFixed(2) : "0.00";
} // Cierra la función pintarTabla().

/* Recupera el menú guardado. Si los datos están dañados, inicia vacío para evitar errores. */
function cargarMenuGuardado(){ // Inicia la función cargarMenuGuardado para realizar esta tarea cuando sea llamada.
    const datos = localStorage.getItem("menuUsuario"); // Lee este dato guardado en localStorage por login.js.

    if(!datos){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        return []; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.

    try{ // Intenta ejecutar el código siguiente y permite capturar errores.
        const menu = JSON.parse(datos); // Convierte el texto JSON guardado de nuevo a un arreglo u objeto de JavaScript.
        return Array.isArray(menu) ? menu : []; // Devuelve este resultado a la parte del programa que llamó la función.
    }catch(error){ // Captura un error ocurrido en el bloque try para evitar que la página se detenga.
        console.warn("No se pudo recuperar el menú guardado.", error); // Muestra una advertencia en la consola del navegador para ayudar a detectar problemas.
        return []; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.
} // Cierra el bloque de código anterior.

function guardarMenu(){ // Inicia la función guardarMenu para realizar esta tarea cuando sea llamada.
    localStorage.setItem("menuUsuario", JSON.stringify(menuUsuario)); // Guarda este dato en el navegador para conservarlo al cambiar de página.
} // Cierra el bloque de código anterior.

function calcularTotalMenu(){ // Inicia la función calcularTotalMenu para realizar esta tarea cuando sea llamada.
    return menuUsuario.reduce(function(total, item){ // Suma o combina todos los elementos para obtener un único resultado.
        return total + (Number(item.kcal) || 0); // Devuelve este resultado a la parte del programa que llamó la función.
    }, 0); // Ejecuta esta instrucción como parte de la lógica de la función actual.
} // Cierra el bloque de código anterior.

/* Muestra la ventana frontal cuando un alimento haría que se supere el límite. */
function mostrarModalCalorias(item, totalActual, nuevasCalorias){ // Inicia la función mostrarModalCalorias para realizar esta tarea cuando sea llamada.
    const modal = document.getElementById("modalCalorias"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
    const exceso = Math.max(nuevasCalorias - limiteCalorias, 0); // Crea una variable y guarda en ella el valor calculado en esta línea.

    ultimoFocoAntesModal = document.activeElement; // Actualiza esta variable con un nuevo valor.
    document.getElementById("modalConsumidas").textContent = totalActual + " kcal"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
    document.getElementById("modalAlimento").textContent = item.alimento + " (" + item.kcal + " kcal)"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
    document.getElementById("modalExceso").textContent = exceso + " kcal"; // Busca un elemento del HTML por su id y cambia el texto que muestra.

    modal.classList.add("activo"); // Agrega una clase CSS para activar un cambio visual.
    modal.setAttribute("aria-hidden", "false"); // Cambia un atributo HTML; aquí ayuda a indicar el estado accesible de la ventana.
    document.body.classList.add("modal-abierto"); // Agrega una clase CSS para activar un cambio visual.

    setTimeout(function(){ // Espera un momento breve antes de ejecutar la función interna.
        document.getElementById("botonCerrarModal").focus(); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
    }, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
} // Cierra el bloque de código anterior.

function cerrarModalCalorias(){ // Inicia la función cerrarModalCalorias para realizar esta tarea cuando sea llamada.
    const modal = document.getElementById("modalCalorias"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
    modal.classList.remove("activo"); // Quita una clase CSS para regresar al estado visual anterior.
    modal.setAttribute("aria-hidden", "true"); // Cambia un atributo HTML; aquí ayuda a indicar el estado accesible de la ventana.
    document.body.classList.remove("modal-abierto"); // Quita una clase CSS para regresar al estado visual anterior.

    if(ultimoFocoAntesModal && typeof ultimoFocoAntesModal.focus === "function"){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        ultimoFocoAntesModal.focus(); // Mueve el foco del teclado a este control para mejorar la accesibilidad.
    } // Cierra el bloque de código anterior.
} // Cierra el bloque de código anterior.

/* Agrega un alimento solo si cabe dentro de las calorías estimadas. */
function agregarAlimento(indice){ // Inicia la función agregarAlimento para realizar esta tarea cuando sea llamada.
    const item = alimentos[indice]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const totalActual = calcularTotalMenu(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const nuevasCalorias = totalActual + (Number(item.kcal) || 0); // Crea una variable y guarda en ella el valor calculado en esta línea.

    if(!modoLibre && (totalActual >= limiteCalorias || nuevasCalorias > limiteCalorias)){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        mostrarModalCalorias(item, totalActual, nuevasCalorias); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        return; // Detiene aquí la función para no continuar con el resto del código.
    } // Cierra el bloque de código anterior.

    menuUsuario.push(item); // Agrega el alimento seleccionado al final del menú del usuario.
    guardarMenu(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    actualizarResumen(); // Actualiza la gráfica, las calorías y la lista al abrir la página.
} // Cierra el bloque de código anterior.

function quitarAlimento(indice){ // Inicia la función quitarAlimento para realizar esta tarea cuando sea llamada.
    menuUsuario.splice(indice, 1); // Elimina un alimento del menú usando su posición dentro del arreglo.
    guardarMenu(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    actualizarResumen(); // Actualiza la gráfica, las calorías y la lista al abrir la página.
} // Cierra el bloque de código anterior.

function limpiarMenu(){ // Inicia la función limpiarMenu para realizar esta tarea cuando sea llamada.
    menuUsuario = []; // Vacía completamente el arreglo del menú.
    guardarMenu(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    actualizarResumen(); // Actualiza la gráfica, las calorías y la lista al abrir la página.
} // Cierra el bloque de código anterior.

/* Actualiza saludo, calorías, lista, estado visual y gráfica. */
function actualizarResumen(){ // Inicia la función actualizarResumen para realizar esta tarea cuando sea llamada.
    const total = calcularTotalMenu(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const restantes = Math.max(limiteCalorias - total, 0); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const porcentajeReal = limiteCalorias > 0 ? Math.round((total / limiteCalorias) * 100) : 0; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const porcentajeVisual = Math.min(Math.max(porcentajeReal, 0), 100); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const grafica = document.getElementById("graficaDona"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
    const resumen = document.querySelector(".resumen-menu"); // Busca en el HTML el primer elemento que coincide con este selector CSS.
    const estado = document.getElementById("estadoMeta"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.

    if(modoLibre){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        document.getElementById("saludoUsuario").textContent = "Menú libre"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("limiteCalorias").textContent = "Modo sin calculadora: no hay límite de calorías"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("caloriasRestantes").textContent = "Restantes: sin límite"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("porcentajeGrafica").textContent = "Libre"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("progresoCalorias").style.width = "0%"; // Busca un elemento del HTML y cambia directamente una propiedad de su estilo.
        grafica.style.background = "conic-gradient(#dfeee3 0% 100%)"; // Cambia una propiedad visual directamente desde JavaScript.
        grafica.classList.remove("llena"); // Quita una clase CSS para regresar al estado visual anterior.
        resumen.classList.remove("meta-completa"); // Quita una clase CSS para regresar al estado visual anterior.
        estado.className = "estado-meta libre"; // Ejecuta esta instrucción como parte de la lógica de la función actual.
        estado.textContent = "Modo libre: puedes agregar alimentos sin un límite calculado."; // Cambia el texto visible de este elemento.
    }else{ // Ejecuta este bloque cuando la condición anterior no se cumple.
        document.getElementById("saludoUsuario").textContent = "Menú de " + nombreUsuario; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("limiteCalorias").textContent = "Calorías estimadas: " + limiteCalorias + " kcal"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("caloriasRestantes").textContent = "Restantes: " + restantes + " kcal"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("porcentajeGrafica").textContent = porcentajeVisual + "%"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
        document.getElementById("progresoCalorias").style.width = porcentajeVisual + "%"; // Busca un elemento del HTML y cambia directamente una propiedad de su estilo.
        grafica.style.background = "conic-gradient(#1b8a5a " + porcentajeVisual + "%, #dfeee3 " + porcentajeVisual + "% 100%)"; // Cambia una propiedad visual directamente desde JavaScript.

        grafica.classList.toggle("llena", porcentajeVisual >= 100); // Agrega o quita una clase CSS según el resultado de la condición indicada.
        resumen.classList.toggle("meta-completa", porcentajeVisual >= 100); // Agrega o quita una clase CSS según el resultado de la condición indicada.

        if(porcentajeVisual >= 100){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            estado.className = "estado-meta completa"; // Ejecuta esta instrucción como parte de la lógica de la función actual.
            estado.textContent = "Meta diaria completada: la gráfica llegó al 100%."; // Cambia el texto visible de este elemento.
        }else if(porcentajeVisual >= 80){ // Si la condición anterior falló, comprueba esta segunda condición.
            estado.className = "estado-meta cerca"; // Ejecuta esta instrucción como parte de la lógica de la función actual.
            estado.textContent = "Cerca del límite: revisa las calorías antes de agregar otro alimento."; // Cambia el texto visible de este elemento.
        }else if(porcentajeVisual >= 50){ // Si la condición anterior falló, comprueba esta segunda condición.
            estado.className = "estado-meta medio"; // Ejecuta esta instrucción como parte de la lógica de la función actual.
            estado.textContent = "Buen avance: llevas más de la mitad de tu meta diaria."; // Cambia el texto visible de este elemento.
        }else{ // Ejecuta este bloque cuando la condición anterior no se cumple.
            estado.className = "estado-meta"; // Ejecuta esta instrucción como parte de la lógica de la función actual.
            estado.textContent = "Aún tienes espacio disponible dentro de tu meta diaria."; // Cambia el texto visible de este elemento.
        } // Cierra el bloque de código anterior.
    } // Cierra el bloque de código anterior.

    document.getElementById("caloriasUsadas").textContent = "Consumidas: " + total + " kcal"; // Busca un elemento del HTML por su id y cambia el texto que muestra.
    pintarMenuSeleccionado(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
} // Cierra el bloque de código anterior.

/* Dibuja la lista de alimentos agregados con más información. */
function pintarMenuSeleccionado(){ // Inicia la función pintarMenuSeleccionado para realizar esta tarea cuando sea llamada.
    const contenedor = document.getElementById("menuSeleccionado"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
    let html = ""; // Crea una variable y guarda en ella el valor calculado en esta línea.

    if(modoLibre && menuUsuario.length === 0){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        contenedor.innerHTML = "<p class='aviso'>Entraste sin calculadora. Puedes agregar alimentos libremente, pero no habrá límite de calorías.</p>"; // Inserta el HTML dinámico construido dentro del contenedor.
        return; // Detiene aquí la función para no continuar con el resto del código.
    } // Cierra el bloque de código anterior.

    if(menuUsuario.length === 0){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        contenedor.innerHTML = "<p class='aviso'>Todavía no agregas alimentos a tu menú.</p>"; // Inserta el HTML dinámico construido dentro del contenedor.
        return; // Detiene aquí la función para no continuar con el resto del código.
    } // Cierra el bloque de código anterior.

    html += "<h3>Alimentos agregados (" + menuUsuario.length + ")</h3>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.
    html += "<ul>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.

    for(let i = 0; i < menuUsuario.length; i++){ // Inicia un ciclo para recorrer varios elementos uno por uno.
        const item = menuUsuario[i]; // Crea una variable y guarda en ella el valor calculado en esta línea.
        html += "<li><strong>" + escaparHTML(item.alimento) + "</strong>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.
        html += " <span>" + escaparHTML(item.cantidad) + " " + escaparHTML(item.unidad) + " · " + escaparHTML(item.kcal) + " kcal · " + escaparHTML(item.categoria) + "</span>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.
        html += " <button class='boton-quitar' onclick='quitarAlimento(" + i + ")'>Quitar</button></li>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.
    } // Cierra el bloque de código anterior.

    html += "</ul>"; // Añade esta parte a la cadena de HTML que se está construyendo dinámicamente.
    contenedor.innerHTML = html; // Inserta el HTML dinámico construido dentro del contenedor.
} // Cierra el bloque de código anterior.

/* Crea un resumen por categoría para la pantalla de reporte y el PDF. */
function obtenerResumenCategorias(){ // Inicia la función obtenerResumenCategorias para realizar esta tarea cuando sea llamada.
    const resumen = {}; // Crea una variable y guarda en ella el valor calculado en esta línea.

    menuUsuario.forEach(function(item){ // Recorre cada elemento de la lista y ejecuta la función para cada uno.
        const categoria = item.categoria || "Sin categoría"; // Crea una variable y guarda en ella el valor calculado en esta línea.

        if(!resumen[categoria]){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            resumen[categoria] = { categoria: categoria, cantidad: 0, kcal: 0 }; // Ejecuta esta instrucción como parte de la lógica de la función actual.
        } // Cierra el bloque de código anterior.

        resumen[categoria].cantidad++; // Ejecuta esta instrucción como parte de la lógica de la función actual.
        resumen[categoria].kcal += Number(item.kcal) || 0; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.

    return Object.values(resumen).sort(function(a, b){ // Ordena los elementos comparando sus valores.
        return b.kcal - a.kcal; // Devuelve este resultado a la parte del programa que llamó la función.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
} // Cierra el bloque de código anterior.

function obtenerMensajeAutomatico(total, restantes, porcentaje){ // Inicia la función obtenerMensajeAutomatico para realizar esta tarea cuando sea llamada.
    if(modoLibre){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        return "Tu menú fue creado en modo libre. El reporte organiza tus alimentos y calorías registradas sin compararlas con una meta diaria."; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.

    if(porcentaje >= 100){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        return "Completaste el 100% de tu meta estimada. Para agregar otro alimento, primero retira uno del menú actual."; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.

    if(porcentaje >= 80){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        return "Estás muy cerca de tu meta estimada. Revisa las calorías de cada nueva porción antes de agregarla."; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.

    if(porcentaje >= 50){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        return "Llevas más de la mitad de tu meta. Todavía tienes " + restantes + " kcal disponibles en este menú."; // Devuelve este resultado a la parte del programa que llamó la función.
    } // Cierra el bloque de código anterior.

    return "Tu menú todavía tiene bastante espacio disponible. Hasta ahora has registrado " + total + " kcal."; // Devuelve este resultado a la parte del programa que llamó la función.
} // Cierra el bloque de código anterior.

/* Convierte una cadena en un nombre seguro para el archivo PDF. */
function limpiarNombreArchivo(texto){ // Inicia la función limpiarNombreArchivo para realizar esta tarea cuando sea llamada.
    return String(texto || "usuario") // Devuelve este resultado a la parte del programa que llamó la función.
        .normalize("NFD") // Separa acentos de las letras para poder limpiar el nombre del archivo.
        .replace(/[\u0300-\u036f]/g, "") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/[^a-zA-Z0-9_-]+/g, "_") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/^_+|_+$/g, "") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .slice(0, 40) || "usuario"; // Recorta la cadena o lista al tamaño indicado.
} // Cierra el bloque de código anterior.

/* Exporta un reporte PDF completo usando la librería jsPDF ya cargada en menus.html. */
function exportarPDF(){ // Inicia la función exportarPDF para realizar esta tarea cuando sea llamada.
    if(menuUsuario.length === 0){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        alert("Primero agrega alimentos a tu menú antes de descargar el PDF."); // Muestra una ventana sencilla de aviso al usuario.
        return; // Detiene aquí la función para no continuar con el resto del código.
    } // Cierra el bloque de código anterior.

    if(!window.jspdf || !window.jspdf.jsPDF){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        alert("No se pudo cargar la herramienta para crear el PDF. Revisa tu conexión a internet o abre el proyecto con Live Server."); // Muestra una ventana sencilla de aviso al usuario.
        return; // Detiene aquí la función para no continuar con el resto del código.
    } // Cierra el bloque de código anterior.

    const boton = document.querySelector(".boton-pdf"); // Busca en el HTML el primer elemento que coincide con este selector CSS.
    const textoOriginal = boton.textContent; // Crea una variable y guarda en ella el valor calculado en esta línea.
    boton.disabled = true; // Activa o desactiva el botón mientras se realiza el proceso.
    boton.textContent = "Creando reporte..."; // Cambia el texto visible de este elemento.

    try{ // Intenta ejecutar el código siguiente y permite capturar errores.
        const jsPDF = window.jspdf.jsPDF; // Crea una variable y guarda en ella el valor calculado en esta línea.
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" }); // Crea una variable y guarda en ella el valor calculado en esta línea.
        construirReportePDF(doc); // Ejecuta esta instrucción como parte de la lógica de la función actual.

        const fechaArchivo = new Date().toISOString().slice(0, 10); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const usuarioArchivo = modoLibre ? "menu_libre" : limpiarNombreArchivo(nombreUsuario); // Crea una variable y guarda en ella el valor calculado en esta línea.
        doc.save("NutriUIN_" + usuarioArchivo + "_" + fechaArchivo + ".pdf"); // Descarga el documento PDF terminado con el nombre indicado.
    }catch(error){ // Captura un error ocurrido en el bloque try para evitar que la página se detenga.
        console.error("Error al generar el PDF:", error); // Muestra el detalle del error en la consola del navegador.
        alert("Ocurrió un error al crear el PDF. Abre la consola para revisar el detalle."); // Muestra una ventana sencilla de aviso al usuario.
    }finally{ // Ejecuta este bloque al terminar, haya ocurrido o no un error.
        boton.disabled = false; // Activa o desactiva el botón mientras se realiza el proceso.
        boton.textContent = textoOriginal; // Cambia el texto visible de este elemento.
    } // Cierra el bloque de código anterior.
} // Cierra el bloque de código anterior.

/* Dibuja todo el reporte dentro del PDF. */
function construirReportePDF(doc){ // Inicia la función construirReportePDF para realizar esta tarea cuando sea llamada.
    const total = calcularTotalMenu(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const restantes = modoLibre ? 0 : Math.max(limiteCalorias - total, 0); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const porcentaje = modoLibre ? 0 : Math.min(Math.round((total / limiteCalorias) * 100), 100); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const resumenCategorias = obtenerResumenCategorias(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const fecha = new Date(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const fechaTexto = fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const horaTexto = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const anchoPagina = 210; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const altoPagina = 297; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const margen = 15; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const anchoUtil = anchoPagina - (margen * 2); // Crea una variable y guarda en ella el valor calculado en esta línea.
    let y = 15; // Crea una variable y guarda en ella el valor calculado en esta línea.

    const verde = [27, 138, 90]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const verdeOscuro = [27, 94, 58]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const verdeClaro = [238, 248, 239]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const gris = [90, 100, 94]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const grisClaro = [240, 244, 241]; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const rojoSuave = [181, 72, 72]; // Crea una variable y guarda en ella el valor calculado en esta línea.

    function asegurarEspacio(alturaNecesaria){ // Inicia la función asegurarEspacio para realizar esta tarea cuando sea llamada.
        if(y + alturaNecesaria > altoPagina - 18){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            doc.addPage(); // Agrega una nueva página al PDF cuando ya no hay espacio.
            y = 18; // Actualiza esta variable con un nuevo valor.
        } // Cierra el bloque de código anterior.
    } // Cierra el bloque de código anterior.

    function tituloSeccion(texto){ // Inicia la función tituloSeccion para realizar esta tarea cuando sea llamada.
        asegurarEspacio(14); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        doc.setFillColor(...verdeOscuro); // Configura el color de relleno de la siguiente figura del PDF.
        doc.roundedRect(margen, y, anchoUtil, 9, 2, 2, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        doc.setTextColor(255, 255, 255); // Configura el color del texto que se dibujará en el PDF.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(11); // Configura la tipografía que se usará en el PDF.
        doc.text(texto, margen + 4, y + 6.2); // Escribe este texto dentro del documento PDF.
        y += 14; // Ejecuta esta instrucción como parte de la lógica de la función actual.
        doc.setTextColor(35, 59, 47); // Configura el color del texto que se dibujará en el PDF.
    } // Cierra el bloque de código anterior.

    function textoParrafo(texto, sangria, ancho){ // Inicia la función textoParrafo para realizar esta tarea cuando sea llamada.
        const x = margen + (sangria || 0); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const maxAncho = ancho || (anchoUtil - (sangria || 0)); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const lineas = doc.splitTextToSize(String(texto), maxAncho); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const altura = lineas.length * 5; // Crea una variable y guarda en ella el valor calculado en esta línea.
        asegurarEspacio(altura + 2); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(9.5); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...gris); // Configura el color del texto que se dibujará en el PDF.
        doc.text(lineas, x, y); // Escribe este texto dentro del documento PDF.
        y += altura + 2; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.

    function datoEtiqueta(etiqueta, valor, x, yy, ancho){ // Inicia la función datoEtiqueta para realizar esta tarea cuando sea llamada.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(8.5); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...verdeOscuro); // Configura el color del texto que se dibujará en el PDF.
        doc.text(etiqueta, x, yy); // Escribe este texto dentro del documento PDF.
        doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(55, 65, 60); // Configura el color del texto que se dibujará en el PDF.
        const lineas = doc.splitTextToSize(String(valor), ancho); // Crea una variable y guarda en ella el valor calculado en esta línea.
        doc.text(lineas, x, yy + 4.3); // Escribe este texto dentro del documento PDF.
    } // Cierra el bloque de código anterior.

    /* Portada superior del reporte. */
    doc.setFillColor(...verdeOscuro); // Configura el color de relleno de la siguiente figura del PDF.
    doc.roundedRect(margen, y, anchoUtil, 34, 4, 4, "F"); // Dibuja una caja o rectángulo dentro del PDF.
    doc.setTextColor(255, 255, 255); // Configura el color del texto que se dibujará en el PDF.
    doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
    doc.setFontSize(22); // Configura la tipografía que se usará en el PDF.
    doc.text("NutriUIN", margen + 7, y + 13); // Escribe este texto dentro del documento PDF.
    doc.setFontSize(13); // Configura la tipografía que se usará en el PDF.
    doc.text("Reporte de menú personalizado", margen + 7, y + 22); // Escribe este texto dentro del documento PDF.
    doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
    doc.setFontSize(8.5); // Configura la tipografía que se usará en el PDF.
    doc.text("Generado el " + fechaTexto + " a las " + horaTexto, margen + 7, y + 29); // Escribe este texto dentro del documento PDF.
    y += 42; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    /* Tarjetas con números principales. */
    const anchoTarjeta = (anchoUtil - 8) / 3; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const tarjetas = modoLibre ? [ // Crea una variable y guarda en ella el valor calculado en esta línea.
        ["Modo", "Menú libre"], // Inicia o agrega un elemento dentro de una lista de datos.
        ["Consumidas", total + " kcal"], // Inicia o agrega un elemento dentro de una lista de datos.
        ["Alimentos", menuUsuario.length] // Inicia o agrega un elemento dentro de una lista de datos.
    ] : [ // Ejecuta esta instrucción como parte de la lógica de la función actual.
        ["Meta diaria", limiteCalorias + " kcal"], // Inicia o agrega un elemento dentro de una lista de datos.
        ["Consumidas", total + " kcal"], // Inicia o agrega un elemento dentro de una lista de datos.
        ["Restantes", restantes + " kcal"] // Inicia o agrega un elemento dentro de una lista de datos.
    ]; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    tarjetas.forEach(function(tarjeta, indice){ // Recorre cada elemento de la lista y ejecuta la función para cada uno.
        const x = margen + indice * (anchoTarjeta + 4); // Crea una variable y guarda en ella el valor calculado en esta línea.
        doc.setFillColor(...verdeClaro); // Configura el color de relleno de la siguiente figura del PDF.
        doc.roundedRect(x, y, anchoTarjeta, 22, 3, 3, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(8.5); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...verdeOscuro); // Configura el color del texto que se dibujará en el PDF.
        doc.text(tarjeta[0], x + 4, y + 7); // Escribe este texto dentro del documento PDF.
        doc.setFontSize(13); // Configura la tipografía que se usará en el PDF.
        doc.text(String(tarjeta[1]), x + 4, y + 16); // Escribe este texto dentro del documento PDF.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
    y += 30; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    /* Barra de progreso. */
    if(!modoLibre){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(9); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...verdeOscuro); // Configura el color del texto que se dibujará en el PDF.
        doc.text("Progreso de la meta: " + porcentaje + "%", margen, y); // Escribe este texto dentro del documento PDF.
        y += 4; // Ejecuta esta instrucción como parte de la lógica de la función actual.
        doc.setFillColor(223, 238, 227); // Configura el color de relleno de la siguiente figura del PDF.
        doc.roundedRect(margen, y, anchoUtil, 6, 3, 3, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        doc.setFillColor(...verde); // Configura el color de relleno de la siguiente figura del PDF.
        doc.roundedRect(margen, y, anchoUtil * (porcentaje / 100), 6, 3, 3, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        y += 13; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.

    tituloSeccion("Datos del usuario y cálculo inicial"); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    asegurarEspacio(34); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    doc.setFillColor(...grisClaro); // Configura el color de relleno de la siguiente figura del PDF.
    doc.roundedRect(margen, y, anchoUtil, 31, 3, 3, "F"); // Dibuja una caja o rectángulo dentro del PDF.

    if(modoLibre){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        datoEtiqueta("Modo de entrada", "Menú libre sin calculadora", margen + 5, y + 7, 80); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Objetivo", "No calculado", margen + 65, y + 7, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Registro actual", menuUsuario.length + " alimentos", margen + 125, y + 7, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Nota", "El reporte organiza únicamente los datos agregados al menú.", margen + 5, y + 20, 165); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    }else{ // Ejecuta este bloque cuando la condición anterior no se cumple.
        datoEtiqueta("Nombre", nombreUsuario, margen + 5, y + 7, 52); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Objetivo", objetivoUsuario, margen + 65, y + 7, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Actividad", perfilUsuario.actividad || "No disponible", margen + 125, y + 7, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Edad / género", (perfilUsuario.edad || "-") + " / " + (perfilUsuario.genero || "-"), margen + 5, y + 20, 52); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("Peso / estatura", (perfilUsuario.peso || "-") + " kg / " + (perfilUsuario.estatura || "-") + " m", margen + 65, y + 20, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        datoEtiqueta("IMC", (perfilUsuario.imc || "-") + (perfilUsuario.clasificacion ? " · " + perfilUsuario.clasificacion : ""), margen + 125, y + 20, 50); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.
    y += 38; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    if(!modoLibre && perfilUsuario.metabolismo){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        textoParrafo("Metabolismo basal guardado por la calculadora: " + perfilUsuario.metabolismo + " kcal. Los resultados son orientativos para el proyecto y no sustituyen la valoración de un profesional."); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.

    tituloSeccion("Resumen por categorías"); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    asegurarEspacio(10 + resumenCategorias.length * 8); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    doc.setFontSize(8.5); // Configura la tipografía que se usará en el PDF.
    resumenCategorias.forEach(function(fila, indice){ // Recorre cada elemento de la lista y ejecuta la función para cada uno.
        const fondo = indice % 2 === 0 ? verdeClaro : [255, 255, 255]; // Crea una variable y guarda en ella el valor calculado en esta línea.
        doc.setFillColor(...fondo); // Configura el color de relleno de la siguiente figura del PDF.
        doc.rect(margen, y - 4.5, anchoUtil, 8, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...verdeOscuro); // Configura el color del texto que se dibujará en el PDF.
        doc.text(fila.categoria, margen + 3, y); // Escribe este texto dentro del documento PDF.
        doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...gris); // Configura el color del texto que se dibujará en el PDF.
        doc.text(fila.cantidad + " alimento(s)", margen + 88, y); // Escribe este texto dentro del documento PDF.
        doc.text(fila.kcal + " kcal", margen + 145, y); // Escribe este texto dentro del documento PDF.
        y += 8; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
    y += 4; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    tituloSeccion("Lista completa de alimentos agregados"); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    const columnas = { // Crea una variable y guarda en ella el valor calculado en esta línea.
        numero: margen, // Define la posición horizontal de esta columna dentro de la tabla del PDF.
        alimento: margen + 9, // Define la posición horizontal de esta columna dentro de la tabla del PDF.
        porcion: margen + 92, // Define la posición horizontal de esta columna dentro de la tabla del PDF.
        kcal: margen + 136, // Define la posición horizontal de esta columna dentro de la tabla del PDF.
        categoria: margen + 154 // Define la posición horizontal de esta columna dentro de la tabla del PDF.
    }; // Cierra la estructura, función o llamada que se abrió en líneas anteriores.

    function encabezadoTablaAlimentos(){ // Inicia la función encabezadoTablaAlimentos para realizar esta tarea cuando sea llamada.
        doc.setFillColor(...verde); // Configura el color de relleno de la siguiente figura del PDF.
        doc.rect(margen, y, anchoUtil, 8, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        doc.setFont("helvetica", "bold"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(7.5); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(255, 255, 255); // Configura el color del texto que se dibujará en el PDF.
        doc.text("#", columnas.numero + 2, y + 5.3); // Escribe este texto dentro del documento PDF.
        doc.text("Alimento", columnas.alimento, y + 5.3); // Escribe este texto dentro del documento PDF.
        doc.text("Porción", columnas.porcion, y + 5.3); // Escribe este texto dentro del documento PDF.
        doc.text("Kcal", columnas.kcal, y + 5.3); // Escribe este texto dentro del documento PDF.
        doc.text("Categoría", columnas.categoria, y + 5.3); // Escribe este texto dentro del documento PDF.
        y += 10; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.

    encabezadoTablaAlimentos(); // Ejecuta esta instrucción como parte de la lógica de la función actual.

    menuUsuario.forEach(function(item, indice){ // Recorre cada elemento de la lista y ejecuta la función para cada uno.
        const nombreLineas = doc.splitTextToSize(String(item.alimento), 78); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const categoriaLineas = doc.splitTextToSize(String(item.categoria), 35); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const maxLineas = Math.max(nombreLineas.length, categoriaLineas.length, 1); // Crea una variable y guarda en ella el valor calculado en esta línea.
        const altoFila = Math.max(8, maxLineas * 4 + 3); // Crea una variable y guarda en ella el valor calculado en esta línea.

        if(y + altoFila > altoPagina - 20){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            doc.addPage(); // Agrega una nueva página al PDF cuando ya no hay espacio.
            y = 18; // Actualiza esta variable con un nuevo valor.
            encabezadoTablaAlimentos(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        } // Cierra el bloque de código anterior.

        if(indice % 2 === 0){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            doc.setFillColor(...grisClaro); // Configura el color de relleno de la siguiente figura del PDF.
            doc.rect(margen, y - 4, anchoUtil, altoFila, "F"); // Dibuja una caja o rectángulo dentro del PDF.
        } // Cierra el bloque de código anterior.

        doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(7.4); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(45, 55, 50); // Configura el color del texto que se dibujará en el PDF.
        doc.text(String(indice + 1), columnas.numero + 2, y); // Escribe este texto dentro del documento PDF.
        doc.text(nombreLineas, columnas.alimento, y); // Escribe este texto dentro del documento PDF.
        doc.text(String(item.cantidad) + " " + String(item.unidad), columnas.porcion, y); // Escribe este texto dentro del documento PDF.
        doc.text(String(item.kcal), columnas.kcal, y); // Escribe este texto dentro del documento PDF.
        doc.text(categoriaLineas, columnas.categoria, y); // Escribe este texto dentro del documento PDF.
        y += altoFila; // Ejecuta esta instrucción como parte de la lógica de la función actual.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
    y += 5; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    tituloSeccion("Datos destacados del menú"); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    const alimentosOrdenados = menuUsuario.slice().sort(function(a, b){ // Ordena los elementos comparando sus valores.
        return (Number(b.kcal) || 0) - (Number(a.kcal) || 0); // Devuelve este resultado a la parte del programa que llamó la función.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
    const alimentosUnicos = new Set(menuUsuario.map(function(item){ return item.alimento; })).size; // Transforma cada elemento de la lista para crear una nueva lista.
    const categoriaPrincipal = resumenCategorias.length ? resumenCategorias[0] : null; // Crea una variable y guarda en ella el valor calculado en esta línea.
    const topTres = alimentosOrdenados.slice(0, 3).map(function(item){ // Transforma cada elemento de la lista para crear una nueva lista.
        return item.alimento + " (" + item.kcal + " kcal)"; // Devuelve este resultado a la parte del programa que llamó la función.
    }).join(" · "); // Une los elementos de la lista en una sola cadena de texto.

    textoParrafo("• Total de registros: " + menuUsuario.length + " alimentos. Alimentos diferentes: " + alimentosUnicos + "."); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    if(categoriaPrincipal){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        textoParrafo("• Categoría con mayor aporte de calorías en este menú: " + categoriaPrincipal.categoria + " con " + categoriaPrincipal.kcal + " kcal."); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    } // Cierra el bloque de código anterior.
    textoParrafo("• Alimentos con más calorías dentro de tu selección: " + topTres + "."); // Ejecuta esta instrucción como parte de la lógica de la función actual.

    tituloSeccion("Conclusión automática"); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    asegurarEspacio(28); // Ejecuta esta instrucción como parte de la lógica de la función actual.
    doc.setFillColor(...verdeClaro); // Configura el color de relleno de la siguiente figura del PDF.
    doc.roundedRect(margen, y, anchoUtil, 24, 3, 3, "F"); // Dibuja una caja o rectángulo dentro del PDF.
    const mensaje = obtenerMensajeAutomatico(total, restantes, porcentaje); // Crea una variable y guarda en ella el valor calculado en esta línea.
    const lineasMensaje = doc.splitTextToSize(mensaje, anchoUtil - 10); // Crea una variable y guarda en ella el valor calculado en esta línea.
    doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
    doc.setFontSize(9.5); // Configura la tipografía que se usará en el PDF.
    doc.setTextColor(...verdeOscuro); // Configura el color del texto que se dibujará en el PDF.
    doc.text(lineasMensaje, margen + 5, y + 7); // Escribe este texto dentro del documento PDF.
    y += 30; // Ejecuta esta instrucción como parte de la lógica de la función actual.

    textoParrafo("Este reporte es informativo y fue generado a partir de los alimentos capturados por el usuario en NutriUIN. Los valores dependen de la base de datos del proyecto y de las porciones seleccionadas."); // Ejecuta esta instrucción como parte de la lógica de la función actual.

    /* Pie de página con numeración en todas las páginas. */
    const totalPaginas = doc.getNumberOfPages(); // Crea una variable y guarda en ella el valor calculado en esta línea.
    for(let pagina = 1; pagina <= totalPaginas; pagina++){ // Inicia un ciclo para recorrer varios elementos uno por uno.
        doc.setPage(pagina); // Cambia a la página indicada para poder escribir su pie de página.
        doc.setDrawColor(210, 225, 214); // Ejecuta una instrucción de la librería jsPDF sobre el documento.
        doc.line(margen, altoPagina - 13, anchoPagina - margen, altoPagina - 13); // Dibuja una línea decorativa dentro del PDF.
        doc.setFont("helvetica", "normal"); // Configura la tipografía que se usará en el PDF.
        doc.setFontSize(7.5); // Configura la tipografía que se usará en el PDF.
        doc.setTextColor(...gris); // Configura el color del texto que se dibujará en el PDF.
        doc.text("NutriUIN · Reporte informativo del menú personalizado", margen, altoPagina - 8); // Escribe este texto dentro del documento PDF.
        doc.text("Página " + pagina + " de " + totalPaginas, anchoPagina - margen, altoPagina - 8, { align: "right" }); // Escribe este texto dentro del documento PDF.
    } // Cierra el bloque de código anterior.

    doc.setProperties({ // Guarda metadatos descriptivos dentro del archivo PDF.
        title: "Reporte de menú personalizado NutriUIN", // Define este dato descriptivo en las propiedades del PDF.
        subject: "Alimentos, calorías y resumen del menú del usuario", // Define este dato descriptivo en las propiedades del PDF.
        author: "NutriUIN", // Define este dato descriptivo en las propiedades del PDF.
        creator: "NutriUIN" // Define este dato descriptivo en las propiedades del PDF.
    }); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.
} // Cierra el bloque de código anterior.

/* Evita que caracteres especiales rompan el HTML dinámico. */
function escaparHTML(texto){ // Inicia la función escaparHTML para realizar esta tarea cuando sea llamada.
    return String(texto) // Devuelve este resultado a la parte del programa que llamó la función.
        .replace(/&/g, "&amp;") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/</g, "&lt;") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/>/g, "&gt;") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/"/g, "&quot;") // Reemplaza caracteres para obtener un texto seguro o limpio.
        .replace(/'/g, "&#039;"); // Reemplaza caracteres para obtener un texto seguro o limpio.
} // Cierra el bloque de código anterior.

/* Cierra el modal con la tecla Escape. */
document.addEventListener("keydown", function(evento){ // Escucha un evento del navegador para reaccionar cuando ocurra.
    if(evento.key === "Escape"){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
        const modal = document.getElementById("modalCalorias"); // Busca en menus.html el elemento que tiene este id para poder modificarlo.
        if(modal.classList.contains("activo")){ // Comprueba esta condición antes de ejecutar el bloque siguiente.
            cerrarModalCalorias(); // Ejecuta esta instrucción como parte de la lógica de la función actual.
        } // Cierra el bloque de código anterior.
    } // Cierra el bloque de código anterior.
}); // Cierra la estructura, función o llamada que se abrió en líneas anteriores.

/* Inicialización automática al abrir menus.html. */
ponerTotales(); // Ejecuta la función al cargar la página para mostrar los totales por categoría.
mostrarCategoria(categoriaActual); // Muestra automáticamente la categoría inicial cuando abre la página.
actualizarResumen(); // Actualiza la gráfica, las calorías y la lista al abrir la página.
