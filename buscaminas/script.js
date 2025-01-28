

// Esta función genera y el tablero de juego.
function generarTablero(tablero) {
    const body = document.body;
    // Creamos un nuevo elemento de tabla.
    const tabla = document.createElement('table');
    // Le asignamos un ID.
    tabla.id = "tableroBuscaminas"; 
    tabla.border = "1";
    // Iteramos sobre cada fila del tablero.
    for (let i = 0; i < tablero.filas; i++) {
        //Creamos un elento fila
        const fila = document.createElement('tr');
        //Iteramos sobre cada columna esta vez 
        for (let j = 0; j < tablero.columnas; j++) {
            //Conforme creamos celdas
            const celda = document.createElement('td');
            // Creamos una nueva instancia de la clase Celda y la agregamos a la matriz de celdas del tablero.
            const nuevaCelda = new Celda(false, 0, false, false);
            tablero.celdas.push(nuevaCelda);
            //Añadimos dos cositas de css para las celdas.
            celda.style.width = "50px";
            celda.style.height = "50px";
            celda.style.textAlign = "center";
            // Agregamos un event listener para click izquierdo
            celda.addEventListener('click', function () {
                tablero.clicEnCelda(i * tablero.columnas + j);
                actualizarTablero(tablero);
            });


            // Agregamos un event listener para click derecho
            celda.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                tablero.marcarCelda(i * tablero.columnas + j);
                actualizarTablero(tablero);
            });
            fila.appendChild(celda);
        }
        tabla.appendChild(fila);
    }
    body.appendChild(tabla);
}


//Pasamos hacer la funcion que actualizara la apariencia del tablero
function actualizarTablero(tablero) {
    let juegoTerminado = false;
    //Iteramos sobre cada celda del tablero:
    tablero.celdas.forEach((celda, index) => {
        const celdaHTML = document.getElementById('tableroBuscaminas').querySelectorAll('td')[index];
        
        //Verificamos si la celda este revelada:
        if (celda.revelada) {
            //Si la celda tiene una bomba mostrara un emoji de uan bomba (basicamente para hacerlo bonito, podriamos poner B de bomba)
            if (celda.tieneBomba) {
                celdaHTML.textContent = "💣";
                // Si el juego no ha terminado, mostraremos un mensaje de confirmación de pérdida.
                if (!juegoTerminado) {
                    juegoTerminado = true;
                    setTimeout(() => {
                        const reiniciar = confirm('¡Has perdido! ¿Quieres volver a jugar?');
                        if (reiniciar) {
                            reiniciarJuego(); //Funion que veremos mas abajo para reiniciar el juego
                        } else {
                            descubrirTodaMatriz(tableroJuego); //Funcion para descubrir toda la matriz
                        }
                    }, 100); // Espera 100 milisegundos antes de mostrar el mensaje de confirmación
                }
            } else {
                // Si la celda no tiene bomba, mostraremos el número de bombas vecinas o dejaremos vacío si no tiene ninguna.
                const valor = celda.bombasAlrededor;
                celdaHTML.textContent = valor > 0 ? valor : "";
                // Añadimos o quitamos clases CSS según el valor de la celda.
                if (valor === 0) {
                    celdaHTML.classList.add('empty');
                } else {
                    celdaHTML.classList.remove('empty');
                }
                if (valor === "") {
                    celdaHTML.classList.add('no-number');
                } else {
                    celdaHTML.classList.remove('no-number');
                }
            }
        } else {
            // Si la celda no está revelada, mostramos una bandera si está marcada.
            celdaHTML.textContent = celda.marcada ? "🚩" : "";
            celdaHTML.classList.remove('empty', 'no-number');
        }
        
    });

}

//Funcion que, en el caso que el user pierda y acepte el promp, podra reiniciar el jeugo
function reiniciarJuego() {
    const reiniciar = confirm('¡Has perdido! ¿Quieres volver a jugar?');
    //Si el user confirma el reiniciar haremos:
    if (reiniciar) {
        // Limpiamos el estado de las celdas
        tableroJuego.celdas.forEach(celda => {
            celda.revelada = false;
            celda.marcada = false;
            celda.tieneBomba = false;
            celda.bombasAlrededor = 0;
        });
        // Colocamos nuevas bombas
        tableroJuego.colocarBombas();
        // Actualizamos el tablero
        actualizarTablero(tableroJuego);
    } else {
        // Descubrimos toda la matriz sin reiniciar el juego (Funcion de abajo)
        descubrirTodaMatriz(tableroJuego);
    }
}


// Esta función revela todas las celdas en el tablero. (Se usa al perder, descubre la matriz)
function descubrirTodaMatriz(tablero) {
    // Iteramos sobre cada celda en el tablero.
    tablero.celdas.forEach((celda, index) => {
        // Revelamos cada celda.
        celda.revelar();
    });
    actualizarTablero(tablero);
}


//Fucioens de formulario:
function submitForm(event) {
    event.preventDefault();

    // Validaciones personalizadas
    const fechaNacimiento = new Date(document.getElementById('fechaNacimiento').value);
    const edad = new Date().getFullYear() - fechaNacimiento.getFullYear();
    //Si el user es menor de edad se le impide jugar:
    if (edad < 18) {
        displayErrorMessage('Debes ser mayor de edad.');
        return;
    }

    //Pedimos un nick el cual termine en un num:
    const nick = document.getElementById('nick').value;
    if (!/\d$/.test(nick)) {
        displayErrorMessage('El nick debe terminar en un número.');
        return;
    }

    //Pedimos un correo el cual debe acabar en @itb:
    const mail = document.getElementById('mail').value;
    if (!/.+@itb\./.test(mail)) {
        displayErrorMessage('El correo electrónico debe ser del ITB.');
        return;
    }

    // Obtenemos los valores del formulario (para guardarlos en el localStorage):
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;

    //FUncion que veremos mas adelante para guardar los valores en el localStorage:
    guardarUsuarioLocalStorage(nombre, apellido);

    //Obtenemos las nuevas dimensiones del tablero
    const nuevasFilas = parseInt(document.getElementById('filas').value);
    const nuevasColumnas = parseInt(document.getElementById('columnas').value);
    const nuevasBombas = parseInt(document.getElementById('bombas').value);

    // Actualizamos las propiedades del tablero existente con los nuevos valores
    tableroJuego.filas = nuevasFilas;
    tableroJuego.columnas = nuevasColumnas;
    tableroJuego.cantidadBombas = nuevasBombas;

    // Limpiamos el tablero actual y colocamos uans nuevas bombas
    tableroJuego.celdas = [];
    const tableroAnterior = document.getElementById('tableroBuscaminas');
    if (tableroAnterior) {
        tableroAnterior.remove();
    }
    generarTablero(tableroJuego);
    tableroJuego.colocarBombas();

    // Ocultamos el formulario (para posteriormente reemplazarlo por la matriz/tabla)
    const formulario = document.getElementById('userForm');
    formulario.style.display = 'none';

    // Mostramos la tabla después de enviar el formulario
    const tablero = document.getElementById('tableroBuscaminas');
    if (tablero) {
        tablero.style.display = 'table';
    }

    // Mostramos una alerta conforme todo el formulario es correcto, después de enviar el formulario
    alert('Formulario enviado correctamente, ¡A JUGAR, CUIDADO CON LAS MINAS!');
}

//Pasamos hacer las funciones para LocalStorage:
//Con esta funcion cogemos y guardamos nombre y apellido del form en el localStorage:
function guardarUsuarioLocalStorage(nombre, apellido) {
    localStorage.setItem('nombreUsuario', nombre);
    localStorage.setItem('apellidoUsuario', apellido);
}

//Y con eta otra lo obtenemos y devolvemos para por ultimo:
function obtenerUsuarioLocalStorage() {
    const nombre = localStorage.getItem('nombreUsuario');
    const apellido = localStorage.getItem('apellidoUsuario');
    return { nombre, apellido };
}

//Mostrarlo en un alert y asi demostrar que se ha guardado:
function mostrarBienvenida() {
    const usuario = obtenerUsuarioLocalStorage();
    if (usuario.nombre && usuario.apellido) {
        alert(`¡Bienvenido, ${usuario.nombre} ${usuario.apellido}!`);
    }
}


function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}


const filas = 8;
const columnas = 10;
const cantidadBombas = 10;
const celdas = [];


const tableroJuego = new Tablero(filas, columnas, cantidadBombas, celdas);
generarTablero(tableroJuego);
tableroJuego.colocarBombas();

mostrarBienvenida();