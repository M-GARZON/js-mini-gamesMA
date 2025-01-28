class Tablero {
    //Creamos las propiedades de la clase:
    filas;
    columnas;
    cantidadBombas;
    celdas;

    //Creamos el constructor:
    constructor(filas, columnas, cantidadBombas, celdas) {
        //Inicializamos las propiedades del tablero
        this.filas = filas;
        this.columnas = columnas;
        this.cantidadBombas = cantidadBombas;
        this.celdas = celdas;
    }

    //Hacemos el metodo para colocar als bombas en el tablero de manera aleatoria:
    colocarBombas() {
        let bombasColocadas = 0;
        // Iteramos hasta que se coloquen todas las bombas necesarias
        while (bombasColocadas < this.cantidadBombas) {
            // Generamos un índice aleatorio dentro del rango de la cantidad de celdas
            const randomIndex = Math.floor(Math.random() * this.celdas.length);
            // Verificamos si la celda en el índice generado ya tiene una bomba
            if (!this.celdas[randomIndex].tieneBomba) {
                this.celdas[randomIndex].tieneBomba = true;
                bombasColocadas++;
            }
        }

        // Calculamos el número de bombas adyacentes para cada celda del tablero
        this.celdas.forEach((celda, index) => {
            const adyacentes = this.calcularCeldasAdyacentes(index);
            // Contamos cuántas de las celdas adyacentes tienen bomba y lo asignamos a la celda actual
            celda.bombasAlrededor = adyacentes.filter(i => this.celdas[i].tieneBomba).length;
        });
    }

    //Creamos el método para calcular los índices de las celdas adyacentes a una celda dada
    calcularCeldasAdyacentes(index) {
        const adyacentes = [];
        const filaActual = Math.floor(index / this.columnas);
        const columnaActual = index % this.columnas;

        // Iteramos sobre las filas y columnas adyacentes
        for (let i = filaActual - 1; i <= filaActual + 1; i++) {
            for (let j = columnaActual - 1; j <= columnaActual + 1; j++) {
                // Verificamos si la fila y columna están dentro de los límites del tablero
                if (i >= 0 && i < this.filas && j >= 0 && j < this.columnas) {
                    adyacentes.push(i * this.columnas + j);// Agregamos el índice de la celda adyacente
                }
            }
        }
        return adyacentes; //Devolvemos los indices de las celdas adyacentes
    }

    //Pasamos hacer el método para revelar las celdas adyacentes a una celda dada
    revelarCeldasAdyacentes(fila, columna) {
        for (let i = fila - 1; i <= fila + 1; i++) {
            for (let j = columna - 1; j <= columna + 1; j++) {
                if (i >= 0 && i < this.filas && j >= 0 && j < this.columnas) {
                    const index = i * this.columnas + j;
                    const celda = this.celdas[index];
                    // Verificamos si la celda adyacente no ha sido revelada
                    if (!celda.revelada) {
                        celda.revelar();// La revelamos
                        // Si la celda no tiene bombas adyacentes, revelamos también sus adyacentes
                        if (celda.bombasAlrededor === 0) {
                            this.revelarCeldasAdyacentes(i, j);
                        }
                    }
                }
            }
        }
    }

    //Metodo para revisar si todas las celdas sin bomba han sido reveladas:
    verificarVictoria() {
        const celdasSinBombas = this.celdas.filter(celda => !celda.tieneBomba);
        const todasReveladas = celdasSinBombas.every(celda => celda.revelada);
        //Si cumple, mostramos un mensaje de victoria:
        if (todasReveladas) {
            alert("HAS GANADO CAMPEOOOOON/AAAA!!!!!!!");
        }
    }

    // Método para manejar el clic en una celda
    clicEnCelda(index) {
        const celda = this.celdas[index];
        if (!celda.revelada) {
            celda.revelar(); //Revelamos la celda
            //Verificamos si la celda contiene bomba
            if (celda.tieneBomba) {
                //Si tiene bomba ha perdido, preguntamos al user si quiere volver a jugar:
                if (confirm("Has perdido. ¿Quieres volver a jugar?")) {
                    reiniciarJuego();//Si asi es, reiniciamos
                } else {//Si no le decimos adios
                    alert("Gracias por jugar. Hasta la próxima.");
                }
            } else if (celda.bombasAlrededor === 0) {
                //Si no tiene bombas adyacentes, revelamos las celdas adyacentes también
                const fila = Math.floor(index / this.columnas);
                const columna = index % this.columnas;
                this.revelarCeldasAdyacentes(fila, columna);
            }
            //Por ultimos miramos si, se ha cumplido la condicion para ganar:
            this.verificarVictoria();
        }
    }

    // Método para marcar una celda con una bandera
    marcarCelda(index) {
        const celda = this.celdas[index];
        if (!celda.revelada) {
            celda.marcar();// Marcamos la celda con una bandera
        }
    }
}
