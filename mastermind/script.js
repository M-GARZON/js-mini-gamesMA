const MAX_INTENTOS = 10;
const MAX_COMBI_COLORES = 4;
const COLORS = ['white', 'blue', 'green', 'violet', 'yellow', 'red', 'orange', 'cyan'];

const master = [];
const userCombi = [];
let intento = 0;

function llenarMaster() {
    for (let i = 0; i < MAX_COMBI_COLORES; i++) {
        const colorAleatorio = COLORS[Math.floor(Math.random() * COLORS.length)];
        master.push(colorAleatorio);
    }
    
}


function agregarFilaDeIntento() {
    const resultadosContainer = document.getElementById('Result');

    const maxFilas = 11; // Número máximo de filas permitidas

    // Verificar si ya hay 10 filas
    if (resultadosContainer.children.length >= maxFilas) {
        return;
    }

    for (let i = 0; i < 1; i++) {

        const nuevaFila = document.createElement('div');
        nuevaFila.classList.add('rowResult', 'w100', 'flex', 'wrap');

        //Creamos rectangulos
        for (let j = 0; j < MAX_COMBI_COLORES; j++) {
            const nuevoRectanguloResultado = document.createElement('div');
            nuevoRectanguloResultado.classList.add('rectangulo', 'resultado');
            nuevaFila.appendChild(nuevoRectanguloResultado);
        }

        //Creamos circulos
        for (let k = 0; k < MAX_COMBI_COLORES; k++) {
            const nuevoCirculoResultado = document.createElement('div');
            nuevoCirculoResultado.classList.add('circulo', 'resultado');
            nuevaFila.appendChild(nuevoCirculoResultado);
        }

        resultadosContainer.appendChild(nuevaFila);
    }
}

//Configuramos boton comprobar
function Comprobar() {
    intento++;

    if (intento === MAX_INTENTOS) {
        alert("Has perdido")
        
    } else {
        
        agregarFilaDeIntento();

        const resultadosContainer = document.getElementById('Result');
        const rectangulosExistente = resultadosContainer.lastChild.querySelectorAll('.rectangulo'); // Selecciona los rectángulos
        const circulosExistente = resultadosContainer.lastChild.querySelectorAll('.circulo'); //Selecciona los circulos

        const resultado = compararCombinaciones();

        // Actualiza la interfaz con los colores elegidos por el usuario y los resultados
        for (let i = 0; i < MAX_COMBI_COLORES; i++) {
            rectangulosExistente[i].style.backgroundColor = userCombi[i];

            // Pinta los círculos según el resultado de la comparación
            if (resultado[i] === 'black') {
                circulosExistente[i].style.backgroundColor = 'black';
            } else if (resultado[i] === 'white') {
                circulosExistente[i].style.backgroundColor = 'white';
            } else {
                circulosExistente[i].style.back
                groundColor = 'grey';
            }
        }

        // Verifica si todos los círculos son negros
        const todosNegros = resultado.every(color => color.toLowerCase() === 'black');

        // Si todos son negros, muestra el mensaje de victoria y bloquea el botón de comprobar
        if (todosNegros) {
            document.getElementById('checkButton').disabled = true;
            pintarMaster();

            alert("¡CAMPEÓN! HAS GANADO");
        }
        

        // Limpia el array userCombi
        userCombi.length = 0;

        const combiText = document.getElementById('combiText');
        combiText.value = '';

    }
}

// Función para pintar los rectángulos del master
function pintarMaster() {
    const masterContainer = document.getElementById('master');

    if (!masterContainer) {
        return;
    }

    const masterRectangulos = masterContainer.querySelectorAll('.cel.flex');

    for (let i = 0; i < MAX_COMBI_COLORES; i++) {
        if (!master[i]) {
            return;
        }
        masterRectangulos[i].style.backgroundColor = master[i];
    }
}


//Añade color al input
function añadeColor(color) {
    if (userCombi.length < MAX_COMBI_COLORES) {
        userCombi.push(color);
        actualizarInterfaz();
    }
}

function actualizarInterfaz() {
    const combiText = document.getElementById('combiText');
    combiText.value = userCombi.join(', ');

}


function compararCombinaciones() {
    const resultado = [];

    for (let i = 0; i < MAX_COMBI_COLORES; i++) {
        if (userCombi[i] === master[i]) {
            resultado.push('black');
        } else if (master.includes(userCombi[i])) {
            resultado.push('white');
        } else {
            resultado.push('grey');
        }
    }

    return resultado;
}

function init() {
    llenarMaster();
}