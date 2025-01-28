// Configuramos el lienzo
const lienzo = document.getElementById('gameCanvas');
const ctx = lienzo.getContext('2d');
lienzo.width = 800;
lienzo.height = 600;

// Declaramos variables generales del juego
const anchoPaleta = 100;
const altoPaleta = 10;
const radioPelota = 8;
const filasLadrillos = 5;
const columnasLadrillos = 8;
const anchoLadrillo = 75;
const altoLadrillo = 20;
const espacioEntreLadrillos = 10;
const desplazamientoSuperiorLadrillo = 30;
const desplazamientoIzquierdoLadrillo = 30;

let paletaX = (lienzo.width - anchoPaleta) / 2;
let pelotaX = lienzo.width / 2;
let pelotaY = lienzo.height - 40; 
let velocidadPelotaX = 0; // Comienza recta
let velocidadPelotaY = -4;
let derechaPulsada = false;
let izquierdaPulsada = false;
let puntuacion = 0;

// Crear los ladrillos
const ladrillos = [];
for (let c = 0; c < columnasLadrillos; c++) {
    ladrillos[c] = [];
    for (let r = 0; r < filasLadrillos; r++) {
        ladrillos[c][r] = { x: 0, y: 0, estado: 1 };
    }
}

// Manejamos teclas
document.addEventListener('keydown', manejarTeclaAbajo);
document.addEventListener('keyup', manejarTeclaArriba);

function manejarTeclaAbajo(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        derechaPulsada = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        izquierdaPulsada = true;
    }
}

function manejarTeclaArriba(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        derechaPulsada = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        izquierdaPulsada = false;
    }
}

// Dibujamos toda la paleta
function dibujarPaleta() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paletaX, lienzo.height - altoPaleta - 10, anchoPaleta, altoPaleta);
}

// Vamos con la pelota:
function dibujarPelota() {
    ctx.beginPath();
    ctx.arc(pelotaX, pelotaY, radioPelota, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4500';
    ctx.fill();
    ctx.closePath();
}

// Pasamos con los ladrillos:
function dibujarLadrillos() {
    for (let c = 0; c < columnasLadrillos; c++) {
        for (let r = 0; r < filasLadrillos; r++) {
            if (ladrillos[c][r].estado === 1) {
                const ladrilloX = c * (anchoLadrillo + espacioEntreLadrillos) + desplazamientoIzquierdoLadrillo;
                const ladrilloY = r * (altoLadrillo + espacioEntreLadrillos) + desplazamientoSuperiorLadrillo;
                ladrillos[c][r].x = ladrilloX;
                ladrillos[c][r].y = ladrilloY;
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(ladrilloX, ladrilloY, anchoLadrillo, altoLadrillo);
            }
        }
    }
}

// Dibujamos puntaje:
function dibujarPuntuacion() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Puntuación: ' + puntuacion, 8, 20);
}

// Detectamos colisiones
function detectarColisiones() {
    for (let c = 0; c < columnasLadrillos; c++) {
        for (let r = 0; r < filasLadrillos; r++) {
            const ladrillo = ladrillos[c][r];
            if (ladrillo.estado === 1) {
                if (
                    pelotaX > ladrillo.x &&
                    pelotaX < ladrillo.x + anchoLadrillo &&
                    pelotaY > ladrillo.y &&
                    pelotaY < ladrillo.y + altoLadrillo
                ) {
                    velocidadPelotaY = -velocidadPelotaY;
                    ladrillo.estado = 0;
                    puntuacion++;
                    if (puntuacion === filasLadrillos * columnasLadrillos) {
                        alert('¡Ganaste!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

// Actualizamos el juego
function actualizar() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    dibujarLadrillos();
    dibujarPaleta();
    dibujarPelota();
    dibujarPuntuacion();
    detectarColisiones();

    // Mover la pelota
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;

    if (pelotaX + radioPelota > lienzo.width || pelotaX - radioPelota < 0) {
        velocidadPelotaX = -velocidadPelotaX;
    }
    if (pelotaY - radioPelota < 0) {
        velocidadPelotaY = -velocidadPelotaY;
    } else if (pelotaY + radioPelota > lienzo.height) {
        if (
            pelotaX > paletaX &&
            pelotaX < paletaX + anchoPaleta
        ) {
            // Introducir un ángulo basado en la posición de la colisión
            const deltaX = pelotaX - (paletaX + anchoPaleta / 2);
            velocidadPelotaX = deltaX * 0.15;
            velocidadPelotaY = -velocidadPelotaY;
        } else {
            alert('Fin del juego');
            document.location.reload();
        }
    }

    if (derechaPulsada && paletaX < lienzo.width - anchoPaleta) {
        paletaX += 7;
    } else if (izquierdaPulsada && paletaX > 0) {
        paletaX -= 7;
    }

    requestAnimationFrame(actualizar);
}

// Iniciamos juego
actualizar();
