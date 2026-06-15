/*
=====================================================
FUNCIÓN ENTRAR
=====================================================

Esta función se ejecuta cuando el usuario
presiona el botón "Entrar".
*/

function entrar() {

    /*
    window.location.href cambia la página actual.

    En este caso enviará al usuario
    al menú principal de NutriUIN.
    */

    window.location.href = "menu.html";

}

/*
=====================================================
MVP:HTML(desde aqui empieza hasta abajo)FUNCIÓN CALCULAR IMC Y METABOLISMO BASAL
=====================================================

Esta función:

1. Obtiene los datos capturados por el usuario.
2. Calcula el IMC.
3. Clasifica el IMC.
4. Calcula el Metabolismo Basal (MTB).
5. Muestra los resultados.
*/

function calcularIMC(){

    /* =====================================================
       OBTENER DATOS DEL FORMULARIO
       ===================================================== */

    /*
    Obtiene el peso en kilogramos.

    Si más adelante cambias el id="peso"
    en el HTML, también debes cambiarlo aquí.
    */
    let peso =
    document.getElementById("peso").value;

    /*
    Obtiene la estatura en metros.

    Ejemplo:
    1.75
    */
    let estatura =
    document.getElementById("estatura").value;

    /*
    Obtiene la edad del usuario.

    Si cambias id="edad" en el HTML,
    debes modificarlo también aquí.
    */
    let edad =
    document.getElementById("edad").value;

    /*
    Obtiene el género seleccionado.

    Valores esperados:
    Hombre
    Mujer
    */
    let genero =
    document.getElementById("genero").value;

    /* =====================================================
       VALIDACIÓN DE DATOS
       ===================================================== */

    /*
    Verifica que los campos obligatorios
    no estén vacíos.
    */

    if(
        peso == "" ||
        estatura == "" ||
        edad == ""
    ){

        alert(
            "Debes capturar peso, estatura y edad"
        );

        return;
    }

    /* =====================================================
       CÁLCULO DEL IMC
       ===================================================== */

    /*
    Fórmula oficial:

    IMC = peso / estatura²
    */

    let imc =
    peso / (estatura * estatura);

    /* =====================================================
       CLASIFICACIÓN DEL IMC
       ===================================================== */

    /*
    Si quieres modificar los rangos
    de clasificación del IMC,
    este es el lugar donde debes hacerlo.
    */

    let clasificacion = "";

    if(imc < 18.5){

        clasificacion = "Bajo peso";

    }
    else if(imc < 25){

        clasificacion = "Peso normal";

    }
    else if(imc < 30){

        clasificacion = "Sobrepeso";

    }
    else{

        clasificacion = "Obesidad";

    }

    /* =====================================================
       CONVERSIÓN DE ESTATURA
       ===================================================== */

    /*
    La fórmula del metabolismo basal
    utiliza centímetros.

    Por eso convertimos metros
    a centímetros.

    Ejemplo:

    1.75 m = 175 cm
    */

    let alturaCM =
    estatura * 100;

    /* =====================================================
       CÁLCULO DEL METABOLISMO BASAL
       ===================================================== */

    /*
    Variable donde se almacenará
    el resultado final.
    */

    let mtb = 0;

    /*
    Si más adelante cambian la fórmula,
    deben modificar esta sección.
    */

    if(genero == "Hombre"){

        /*
        Fórmula hombre:

        MTB = 10 × peso + 6.25 × altura(cm) - 5 × edad + 5
        */

        mtb =
        (10 * peso)
        +
        (6.25 * alturaCM)
        -
        (5 * edad)
        +
        5;

    }
    else{

        /*
        Fórmula mujer:

        MTB =
        10 × peso
        +
        6.25 × altura(cm)
        -
        5 × edad
        -
        161
        */

        mtb =
        (10 * peso)
        +
        (6.25 * alturaCM)
        -
        (5 * edad)
        -
        161;

    }

    /* =====================================================
       MOSTRAR RESULTADOS
       ===================================================== */

    /*
    toFixed(2)

    Redondea el número
    a dos decimales.
    */

    alert(

        "RESULTADOS NUTRIUIN\n\n" +

        "IMC: " +
        imc.toFixed(2) +

        "\n\nClasificación: " +
        clasificacion +

        "\n\nMetabolismo Basal: " +
        mtb.toFixed(2) +

        " kcal"

    );

}
/* =====================================================
   FIN DE LA FUNCIÓN calcularIMC()
   ===================================================== */