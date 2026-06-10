class Tablero {
    filas;
    columnas;
    cantidadBombas;
    celdas;

    constructor(filas, columnas, cantidadBombas, celdas) {
        this.filas = filas;
        this.columnas = columnas;
        this.cantidadBombas = cantidadBombas;
        this.celdas = celdas;
    }

    colocarBombas() {
        let bombasColocadas = 0;
        while (bombasColocadas < this.cantidadBombas) {
            const randomIndex = Math.floor(Math.random() * this.celdas.length);
            if (!this.celdas[randomIndex].tieneBomba) {
                this.celdas[randomIndex].tieneBomba = true;
                bombasColocadas++;
            }
        }

        this.celdas.forEach((celda, index) => {
            const adyacentes = this.calcularCeldasAdyacentes(index);
            celda.bombasAlrededor = adyacentes.filter(i => this.celdas[i].tieneBomba).length;
        });
    }

    calcularCeldasAdyacentes(index) {
        const adyacentes = [];
        const filaActual = Math.floor(index / this.columnas);
        const columnaActual = index % this.columnas;

        for (let i = filaActual - 1; i <= filaActual + 1; i++) {
            for (let j = columnaActual - 1; j <= columnaActual + 1; j++) {
                if (i >= 0 && i < this.filas && j >= 0 && j < this.columnas) {
                    adyacentes.push(i * this.columnas + j);
                }
            }
        }
        return adyacentes;
    }

    revelarCeldasAdyacentes(fila, columna) {
        for (let i = fila - 1; i <= fila + 1; i++) {
            for (let j = columna - 1; j <= columna + 1; j++) {
                if (i >= 0 && i < this.filas && j >= 0 && j < this.columnas) {
                    const index = i * this.columnas + j;
                    const celda = this.celdas[index];
                    if (!celda.revelada) {
                        celda.revelar();
                        if (celda.bombasAlrededor === 0) {
                            this.revelarCeldasAdyacentes(i, j);
                        }
                    }
                }
            }
        }
    }

    verificarVictoria() {
        const celdasSinBombas = this.celdas.filter(celda => !celda.tieneBomba);
        const todasReveladas = celdasSinBombas.every(celda => celda.revelada);
        if (todasReveladas) {
            alert("HAS GANADO CAMPEOOOOON/AAAA!!!!!!!");
        }
    }

    clicEnCelda(index) {
        const celda = this.celdas[index];
        if (!celda.revelada) {
            celda.revelar();
            if (celda.tieneBomba) {
                if (confirm("Has perdido. ¿Quieres volver a jugar?")) {
                    reiniciarJuego();
                } else {
                    alert("Gracias por jugar. Hasta la próxima.");
                }
            } else if (celda.bombasAlrededor === 0) {
                const fila = Math.floor(index / this.columnas);
                const columna = index % this.columnas;
                this.revelarCeldasAdyacentes(fila, columna);
            }
            this.verificarVictoria();
        }
    }

    marcarCelda(index) {
        const celda = this.celdas[index];
        if (!celda.revelada) {
            celda.marcar();
        }
    }
}
