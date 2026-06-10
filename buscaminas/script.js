

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
        function generarTablero(tablero) {
            const body = document.body;
            const tabla = document.createElement('table');
            tabla.id = "tableroBuscaminas";
            tabla.border = "1";
            for (let i = 0; i < tablero.filas; i++) {
                const fila = document.createElement('tr');
                for (let j = 0; j < tablero.columnas; j++) {
                    const celda = document.createElement('td');
                    const nuevaCelda = new Celda(false, 0, false, false);
                    tablero.celdas.push(nuevaCelda);
                    celda.style.width = "50px";
                    celda.style.height = "50px";
                    celda.style.textAlign = "center";
                    celda.addEventListener('click', function () {
                        tablero.clicEnCelda(i * tablero.columnas + j);
                        actualizarTablero(tablero);
                    });

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

        function actualizarTablero(tablero) {
            let juegoTerminado = false;
            tablero.celdas.forEach((celda, index) => {
                const celdaHTML = document.getElementById('tableroBuscaminas').querySelectorAll('td')[index];
                if (celda.revelada) {
                    if (celda.tieneBomba) {
                        celdaHTML.textContent = "💣";
                        if (!juegoTerminado) {
                            juegoTerminado = true;
                            setTimeout(() => {
                                const reiniciar = confirm('¡Has perdido! ¿Quieres volver a jugar?');
                                if (reiniciar) {
                                    reiniciarJuego();
                                } else {
                                    descubrirTodaMatriz(tableroJuego);
                                }
                            }, 100);
                        }
                    } else {
                        const valor = celda.bombasAlrededor;
                        celdaHTML.textContent = valor > 0 ? valor : "";
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
                    celdaHTML.textContent = celda.marcada ? "🚩" : "";
                    celdaHTML.classList.remove('empty', 'no-number');
                }
            });
        }

        function reiniciarJuego() {
            const reiniciar = confirm('¡Has perdido! ¿Quieres volver a jugar?');
            if (reiniciar) {
                tableroJuego.celdas.forEach(celda => {
                    celda.revelada = false;
                    celda.marcada = false;
                    celda.tieneBomba = false;
                    celda.bombasAlrededor = 0;
                });
                tableroJuego.colocarBombas();
                actualizarTablero(tableroJuego);
            } else {
                descubrirTodaMatriz(tableroJuego);
            }
        }

        function descubrirTodaMatriz(tablero) {
            tablero.celdas.forEach((celda, index) => {
                celda.revelar();
            });
            actualizarTablero(tablero);
        }

        function submitForm(event) {
            event.preventDefault();
            const nuevasFilas = parseInt(document.getElementById('filas').value);
            const nuevasColumnas = parseInt(document.getElementById('columnas').value);
            const nuevasBombas = parseInt(document.getElementById('bombas').value);
            tableroJuego.filas = nuevasFilas;
            tableroJuego.columnas = nuevasColumnas;
            tableroJuego.cantidadBombas = nuevasBombas;
            tableroJuego.celdas = [];
            const tableroAnterior = document.getElementById('tableroBuscaminas');
            if (tableroAnterior) {
                tableroAnterior.remove();
            }
            generarTablero(tableroJuego);
            tableroJuego.colocarBombas();
            const formulario = document.getElementById('userForm');
            formulario.style.display = 'none';
            const tablero = document.getElementById('tableroBuscaminas');
            if (tablero) {
                tablero.style.display = 'table';
            }
            alert('Formulario enviado correctamente, ¡A JUGAR, CUIDADO CON LAS MINAS!');
        }

        function guardarUsuarioLocalStorage(nombre, apellido) {
            localStorage.setItem('nombreUsuario', nombre);
            localStorage.setItem('apellidoUsuario', apellido);
        }

        function obtenerUsuarioLocalStorage() {
            const nombre = localStorage.getItem('nombreUsuario');
            const apellido = localStorage.getItem('apellidoUsuario');
            return { nombre, apellido };
        }

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