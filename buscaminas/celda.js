class Celda {
    tieneBomba;
    bombasAlrededor;
    revelada;
    marcada;
    constructor(tieneBomba, bombasAlrededor, revelada, marcada) {
        this.tieneBomba = tieneBomba
        this.bombasAlrededor = bombasAlrededor
        this.revelada = revelada
        this.marcada = marcada
    }
    revelar() {
        this.revelada = true;
    }




    marcar() {
        this.marcada = !this.marcada;
    }
}
