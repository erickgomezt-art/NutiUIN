/*
================================================================================
ARCHIVO: login.js
LENGUAJE: JavaScript
FUNCIÓN: Controla la portada y la calculadora nutricional.
SE USA EN: index.html y mvp.html.
CONEXIONES:
1. HTML llama funciones como entrar(), calcularIMC() y abrirMenuPersonalizado().
2. JavaScript busca elementos HTML por su id con document.getElementById().
3. Guarda datos en localStorage; después menus.js lee esos mismos datos.
4. Abre otras páginas usando window.location.href.
================================================================================
*/
/* login.js: contiene la entrada a la calculadora y el cálculo nutricional. */

/* Función que abre primero la calculadora desde la página de inicio. */
function entrar(){ // Declara la función entrar(), que se ejecuta al presionar el botón de inicio.
    window.location.href = "mvp.html"; // Cambia la página actual y abre mvp.html, que es la calculadora.
} // Cierra la función entrar().

/* Función que abre el menú sin obligar al usuario a llenar la calculadora. */
function entrarMenuDirecto(){ // Declara la función que se ejecuta al presionar "Entrar directo al menú".
    localStorage.removeItem("caloriasDia"); // Borra calorías anteriores para que el menú entre en modo libre.
    localStorage.removeItem("nombreUsuario"); // Borra el nombre anterior para mostrar un mensaje general.
    localStorage.removeItem("objetivoUsuario"); // Borra el objetivo anterior porque no se llenó la calculadora.
    localStorage.removeItem("edadUsuario"); // Borra la edad anterior para que el PDF no muestre datos viejos.
    localStorage.removeItem("generoUsuario"); // Borra el género anterior.
    localStorage.removeItem("pesoUsuario"); // Borra el peso anterior.
    localStorage.removeItem("estaturaUsuario"); // Borra la estatura anterior.
    localStorage.removeItem("actividadUsuario"); // Borra el texto de actividad física anterior.
    localStorage.removeItem("imcUsuario"); // Borra el IMC anterior.
    localStorage.removeItem("clasificacionIMC"); // Borra la clasificación anterior.
    localStorage.removeItem("metabolismoBasal"); // Borra el metabolismo basal anterior.
    localStorage.removeItem("menuUsuario"); // Limpia alimentos anteriores para empezar un menú nuevo.
    window.location.href = "menus.html"; // Abre la página del menú sin pasar por la calculadora.
} // Cierra la función entrarMenuDirecto().

/* Función que calcula el IMC, metabolismo basal y calorías aproximadas. */
function calcularIMC(){ // Declara la función que se ejecuta al presionar el botón "Calcular".
    let nombre = document.getElementById("nombre").value; // Toma el texto escrito en el campo nombre.
    let edad = Number(document.getElementById("edad").value); // Toma la edad y la convierte a número.
    let genero = document.getElementById("genero").value; // Toma el género seleccionado en la lista.
    let peso = Number(document.getElementById("peso").value); // Toma el peso escrito y lo convierte a número.
    let estatura = Number(document.getElementById("estatura").value); // Toma la estatura escrita y la convierte a número.
    let actividad = Number(document.getElementById("actividad").value); // Toma el factor de actividad física y lo convierte a número.
    let objetivo = document.getElementById("objetivo").value; // Toma el objetivo seleccionado por el usuario.
    let resultado = document.getElementById("resultado"); // Guarda la caja donde se mostrarán los resultados.
    let botonMenu = document.getElementById("botonMenu"); // Guarda el botón que abre el menú personalizado.

    if(nombre == "" || edad == 0 || peso == 0 || estatura == 0 || actividad == 0){ // Verifica si falta algún dato obligatorio.
        resultado.innerHTML = "⚠️ Completa todos los campos para calcular."; // Muestra una advertencia si faltan datos.
        botonMenu.classList.add("oculto"); // Mantiene oculto el botón del menú si los datos están incompletos.
        return; // Detiene la función para evitar cálculos incompletos.
    } // Cierra la validación de datos.

    let imc = peso / (estatura * estatura); // Calcula el IMC usando peso dividido entre estatura al cuadrado.
    let clasificacion = ""; // Prepara una variable vacía para guardar la clasificación del IMC.

    if(imc < 18.5){ // Revisa si el IMC es menor a 18.5.
        clasificacion = "Bajo peso"; // Guarda la clasificación bajo peso.
    }else if(imc < 25){ // Si no fue bajo peso, revisa si está debajo de 25.
        clasificacion = "Peso normal"; // Guarda la clasificación peso normal.
    }else if(imc < 30){ // Si no fue normal, revisa si está debajo de 30.
        clasificacion = "Sobrepeso"; // Guarda la clasificación sobrepeso.
    }else{ // Si no entró en los casos anteriores, es 30 o más.
        clasificacion = "Obesidad"; // Guarda la clasificación obesidad.
    } // Cierra las condiciones de clasificación.

    let alturaCM = estatura * 100; // Convierte la estatura de metros a centímetros.
    let metabolismo = 0; // Crea la variable donde se guardará el metabolismo basal.

    if(genero == "Hombre"){ // Revisa si el usuario seleccionó Hombre.
        metabolismo = (10 * peso) + (6.25 * alturaCM) - (5 * edad) + 5; // Calcula metabolismo basal con fórmula para hombre.
    }else{ // Si no es Hombre, usa la fórmula para Mujer.
        metabolismo = (10 * peso) + (6.25 * alturaCM) - (5 * edad) - 161; // Calcula metabolismo basal con fórmula para mujer.
    } // Cierra la condición del género.

    let calorias = metabolismo * actividad; // Multiplica el metabolismo por el nivel de actividad para estimar calorías diarias.
    let caloriasRedondeadas = Math.round(calorias); // Redondea las calorías para usarlas como límite del menú.

    let actividadTexto = document.getElementById("actividad").options[document.getElementById("actividad").selectedIndex].text; // Obtiene el nombre visible del nivel de actividad.

    localStorage.setItem("nombreUsuario", nombre); // Guarda el nombre para mostrarlo en la página del menú.
    localStorage.setItem("caloriasDia", caloriasRedondeadas); // Guarda el límite de calorías para que menus.js pueda usarlo.
    localStorage.setItem("objetivoUsuario", objetivo); // Guarda el objetivo elegido como dato informativo.
    localStorage.setItem("edadUsuario", edad); // Guarda la edad para incluirla en el reporte PDF.
    localStorage.setItem("generoUsuario", genero); // Guarda el género seleccionado.
    localStorage.setItem("pesoUsuario", peso); // Guarda el peso capturado.
    localStorage.setItem("estaturaUsuario", estatura); // Guarda la estatura capturada.
    localStorage.setItem("actividadUsuario", actividadTexto); // Guarda el nombre del nivel de actividad física.
    localStorage.setItem("imcUsuario", imc.toFixed(2)); // Guarda el IMC con dos decimales.
    localStorage.setItem("clasificacionIMC", clasificacion); // Guarda la clasificación del IMC.
    localStorage.setItem("metabolismoBasal", metabolismo.toFixed(0)); // Guarda el metabolismo basal redondeado.
    localStorage.removeItem("menuUsuario"); // Limpia el menú anterior para empezar uno nuevo con las nuevas calorías.

    resultado.innerHTML = // Empieza a escribir el resultado dentro de la caja de resultados.
        "<h2>Resultado de " + nombre + "</h2>" + // Muestra el nombre del usuario en un título.
        "<p><b>IMC:</b> " + imc.toFixed(2) + "</p>" + // Muestra el IMC con dos decimales.
        "<p><b>Clasificación:</b> " + clasificacion + "</p>" + // Muestra la clasificación del IMC.
        "<p><b>Objetivo:</b> " + objetivo + "</p>" + // Muestra el objetivo elegido.
        "<p><b>Metabolismo basal:</b> " + metabolismo.toFixed(0) + " kcal</p>" + // Muestra metabolismo basal sin decimales.
        "<p><b>Calorías estimadas al día:</b> " + caloriasRedondeadas + " kcal</p>" + // Muestra calorías aproximadas por día.
        "<small>Resultado orientativo para proyecto escolar. No sustituye la revisión de un profesional.</small>"; // Agrega una nota aclaratoria.

    botonMenu.classList.remove("oculto"); // Muestra el botón para ir al menú después de calcular correctamente.
} // Cierra la función calcularIMC().

/* Función que abre la página para crear el menú personalizado. */
function abrirMenuPersonalizado(){ // Declara la función que se ejecuta al presionar "Crear mi menú".
    window.location.href = "menus.html"; // Abre la página de alimentos para armar el menú personalizado.
} // Cierra la función abrirMenuPersonalizado().
