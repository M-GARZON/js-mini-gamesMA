// --- CONFIGURACIÓN BÁSICA DEL LIENZO ---
const lienzo = document.getElementById('gameCanvas');
const ctx = lienzo.getContext('2d');

// Resolución base (se puede escalar por CSS si quieres hacerlo responsive)
lienzo.width = 800;
lienzo.height = 600;

// --- CONSTANTES DEL JUEGO ---
const ANCHO_PALETA = 110;
const ALTO_PALETA = 14;
const RADIO_PELOTA = 9;
const FILAS_LADRILLOS = 6;
const COLUMNAS_LADRILLOS = 10;
const ANCHO_LADRILLO = 65;
const ALTO_LADRILLO = 22;
const ESPACIO_LADRILLOS = 8;
const OFFSET_SUPERIOR_LADRILLO = 60;
const OFFSET_IZQUIERDO_LADRILLO = 40;

const VELOCIDAD_PALETA = 5;          // antes 8
const VELOCIDAD_PELOTA_INICIAL = 3;  // antes 5
const MAX_VELOCIDAD_PELOTA = 6;      // antes 9

// --- ESTADO DEL JUEGO ---
let paletaX = (lienzo.width - ANCHO_PALETA) / 2;
let pelotaX = lienzo.width / 2;
let pelotaY = lienzo.height - 80;
let velocidadPelotaX = 0; // al principio quieta, se lanza con ESPACIO
let velocidadPelotaY = 0;

let derechaPulsada = false;
let izquierdaPulsada = false;
let ratonX = null;

let puntuacion = 0;
let vidas = 3;
let juegoIniciado = false;
let juegoPausado = false;
let juegoTerminado = false;

// --- LADRILLOS ---
const coloresFilas = ['#ff4b5c', '#ffb020', '#ffd447', '#66bb6a', '#42a5f5', '#ab47bc'];
const ladrillos = [];

function crearLadrillos() {
    for (let c = 0; c < COLUMNAS_LADRILLOS; c++) {
        ladrillos[c] = [];
        for (let r = 0; r < FILAS_LADRILLOS; r++) {
            ladrillos[c][r] = {
                x: 0,
                y: 0,
                estado: 1,
                color: coloresFilas[r % coloresFilas.length],
                puntos: (FILAS_LADRILLOS - r) * 10
            };
        }
    }
}

crearLadrillos();

// --- CONTROLES ---
document.addEventListener('keydown', manejarTeclaAbajo);
document.addEventListener('keyup', manejarTeclaArriba);
document.addEventListener('mousemove', moverConRaton);

function manejarTeclaAbajo(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        derechaPulsada = true;
        ratonX = null; // Priorizar control por teclado
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        izquierdaPulsada = true;
        ratonX = null; // Priorizar control por teclado
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        if (!juegoIniciado) {
            iniciarRonda();
        } else if (juegoTerminado) {
            reiniciarJuego();
        }
    } else if (e.key.toLowerCase() === 'p') {
        juegoPausado = !juegoPausado;
    }
}

function manejarTeclaArriba(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        derechaPulsada = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        izquierdaPulsada = false;
    }
}

function moverConRaton(e) {
    const rect = lienzo.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    ratonX = posX;
}

// --- DIBUJOS ---
function dibujarFondo() {
    const gradiente = ctx.createLinearGradient(0, 0, 0, lienzo.height);
    gradiente.addColorStop(0, '#020024');
    gradiente.addColorStop(0.4, '#090979');
    gradiente.addColorStop(1, '#00d4ff');
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
}

function dibujarPaleta() {
    const yPaleta = lienzo.height - ALTO_PALETA - 20;
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    const radio = 8;
    ctx.moveTo(paletaX + radio, yPaleta);
    ctx.lineTo(paletaX + ANCHO_PALETA - radio, yPaleta);
    ctx.quadraticCurveTo(paletaX + ANCHO_PALETA, yPaleta, paletaX + ANCHO_PALETA, yPaleta + radio);
    ctx.lineTo(paletaX + ANCHO_PALETA, yPaleta + ALTO_PALETA - radio);
    ctx.quadraticCurveTo(
        paletaX + ANCHO_PALETA,
        yPaleta + ALTO_PALETA,
        paletaX + ANCHO_PALETA - radio,
        yPaleta + ALTO_PALETA
    );
    ctx.lineTo(paletaX + radio, yPaleta + ALTO_PALETA);
    ctx.quadraticCurveTo(paletaX, yPaleta + ALTO_PALETA, paletaX, yPaleta + ALTO_PALETA - radio);
    ctx.lineTo(paletaX, yPaleta + radio);
    ctx.quadraticCurveTo(paletaX, yPaleta, paletaX + radio, yPaleta);
    ctx.closePath();
    ctx.fill();

    // brillo
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(paletaX + 10, yPaleta + 3, ANCHO_PALETA - 20, 4);
}

function dibujarPelota() {
    ctx.beginPath();
    ctx.arc(pelotaX, pelotaY, RADIO_PELOTA, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(
        pelotaX - 3,
        pelotaY - 3,
        2,
        pelotaX,
        pelotaY,
        RADIO_PELOTA
    );
    grad.addColorStop(0, '#fff');
    grad.addColorStop(1, '#ff6b00');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.closePath();
}

function dibujarLadrillos() {
    for (let c = 0; c < COLUMNAS_LADRILLOS; c++) {
        for (let r = 0; r < FILAS_LADRILLOS; r++) {
            const ladrillo = ladrillos[c][r];
            if (ladrillo.estado === 1) {
                const ladrilloX =
                    c * (ANCHO_LADRILLO + ESPACIO_LADRILLOS) + OFFSET_IZQUIERDO_LADRILLO;
                const ladrilloY =
                    r * (ALTO_LADRILLO + ESPACIO_LADRILLOS) + OFFSET_SUPERIOR_LADRILLO;
                ladrillo.x = ladrilloX;
                ladrillo.y = ladrilloY;

                const grad = ctx.createLinearGradient(
                    ladrilloX,
                    ladrilloY,
                    ladrilloX,
                    ladrilloY + ALTO_LADRILLO
                );
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, ladrillo.color);
                grad.addColorStop(1, '#000000');

                ctx.fillStyle = grad;
                ctx.fillRect(ladrilloX, ladrilloY, ANCHO_LADRILLO, ALTO_LADRILLO);

                // borde
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.strokeRect(ladrilloX + 0.5, ladrilloY + 0.5, ANCHO_LADRILLO - 1, ALTO_LADRILLO - 1);
            }
        }
    }
}

function dibujarHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Puntuación: ' + puntuacion, 20, 24);

    ctx.textAlign = 'right';
    ctx.fillText('Vidas: ' + vidas, lienzo.width - 20, 24);
}

function dibujarEstado() {
    if (!juegoIniciado && !juegoTerminado) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '28px Arial';
        ctx.fillText('Pulsa ESPACIO para comenzar', lienzo.width / 2, lienzo.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText(
            'Mueve con ← → o con el ratón. Pulsa P para pausar.',
            lienzo.width / 2,
            lienzo.height / 2 + 20
        );
    } else if (juegoPausado && !juegoTerminado) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '28px Arial';
        ctx.fillText('PAUSA', lienzo.width / 2, lienzo.height / 2 - 10);
        ctx.font = '16px Arial';
        ctx.fillText('Pulsa P para continuar', lienzo.width / 2, lienzo.height / 2 + 20);
    } else if (juegoTerminado) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '32px Arial';
        const mensaje =
            puntuacion === FILAS_LADRILLOS * COLUMNAS_LADRILLOS * 10 ? '¡HAS GANADO!' : 'GAME OVER';
        ctx.fillText(mensaje, lienzo.width / 2, lienzo.height / 2 - 20);
        ctx.font = '18px Arial';
        ctx.fillText(
            'Puntuación: ' + puntuacion,
            lienzo.width / 2,
            lienzo.height / 2 + 10
        );
        ctx.fillText(
            'Pulsa ESPACIO para jugar de nuevo',
            lienzo.width / 2,
            lienzo.height / 2 + 40
        );
    }
}

// --- LÓGICA DEL JUEGO ---
function iniciarRonda() {
    juegoIniciado = true;
    if (velocidadPelotaX === 0 && velocidadPelotaY === 0) {
        // Lanzamos la pelota con un ángulo inicial aleatorio
        const angulo = (Math.random() * Math.PI) / 3 + Math.PI / 6; // entre 30º y 90º
        velocidadPelotaX = VELOCIDAD_PELOTA_INICIAL * Math.cos(angulo);
        velocidadPelotaY = -VELOCIDAD_PELOTA_INICIAL * Math.sin(angulo);
    }
}

function reiniciarRonda() {
    paletaX = (lienzo.width - ANCHO_PALETA) / 2;
    pelotaX = lienzo.width / 2;
    pelotaY = lienzo.height - 80;
    velocidadPelotaX = 0;
    velocidadPelotaY = 0;
    juegoIniciado = false;
}

function reiniciarJuego() {
    puntuacion = 0;
    vidas = 3;
    juegoTerminado = false;
    crearLadrillos();
    reiniciarRonda();
}

function detectarColisionesLadrillos() {
    for (let c = 0; c < COLUMNAS_LADRILLOS; c++) {
        for (let r = 0; r < FILAS_LADRILLOS; r++) {
            const ladrillo = ladrillos[c][r];
            if (ladrillo.estado === 1) {
                const bx = ladrillo.x;
                const by = ladrillo.y;

                if (
                    pelotaX + RADIO_PELOTA > bx &&
                    pelotaX - RADIO_PELOTA < bx + ANCHO_LADRILLO &&
                    pelotaY + RADIO_PELOTA > by &&
                    pelotaY - RADIO_PELOTA < by + ALTO_LADRILLO
                ) {
                    // Determinar de qué lado golpea para un rebote más realista
                    const dentroX =
                        Math.min(pelotaX + RADIO_PELOTA - bx, bx + ANCHO_LADRILLO - (pelotaX - RADIO_PELOTA));
                    const dentroY =
                        Math.min(pelotaY + RADIO_PELOTA - by, by + ALTO_LADRILLO - (pelotaY - RADIO_PELOTA));

                    if (dentroX < dentroY) {
                        velocidadPelotaX = -velocidadPelotaX;
                    } else {
                        velocidadPelotaY = -velocidadPelotaY;
                    }

                    ladrillo.estado = 0;
                    puntuacion += ladrillo.puntos;

                    if (todosLadrillosRotos()) {
                        juegoTerminado = true;
                    }
                    return;
                }
            }
        }
    }
}

function todosLadrillosRotos() {
    for (let c = 0; c < COLUMNAS_LADRILLOS; c++) {
        for (let r = 0; r < FILAS_LADRILLOS; r++) {
            if (ladrillos[c][r].estado === 1) return false;
        }
    }
    return true;
}

function detectarColisionesParedesYPala() {
    // Paredes laterales
    if (pelotaX + RADIO_PELOTA > lienzo.width || pelotaX - RADIO_PELOTA < 0) {
        velocidadPelotaX = -velocidadPelotaX;
    }

    // Techo
    if (pelotaY - RADIO_PELOTA < 0) {
        velocidadPelotaY = -velocidadPelotaY;
    }

    // Pala
    const yPaleta = lienzo.height - ALTO_PALETA - 20;
    if (
        pelotaY + RADIO_PELOTA >= yPaleta &&
        pelotaY + RADIO_PELOTA <= yPaleta + ALTO_PALETA &&
        pelotaX >= paletaX &&
        pelotaX <= paletaX + ANCHO_PALETA &&
        velocidadPelotaY > 0
    ) {
        // Calcular rebote según punto de impacto
        const centroPaleta = paletaX + ANCHO_PALETA / 2;
        const distancia = pelotaX - centroPaleta;
        const normalizado = distancia / (ANCHO_PALETA / 2); // entre -1 y 1
        const angulo = normalizado * (Math.PI / 3); // hasta 60º

        const velocidad = Math.min(
            Math.sqrt(velocidadPelotaX ** 2 + velocidadPelotaY ** 2) * 1.03,
            MAX_VELOCIDAD_PELOTA
        );

        velocidadPelotaX = velocidad * Math.sin(angulo);
        velocidadPelotaY = -Math.abs(velocidad * Math.cos(angulo));
        pelotaY = yPaleta - RADIO_PELOTA - 1; // evitar quedarse pegada
    }

    // Parte inferior (pierde vida)
    if (pelotaY - RADIO_PELOTA > lienzo.height) {
        vidas--;
        if (vidas <= 0) {
            juegoTerminado = true;
        } else {
            reiniciarRonda();
        }
    }
}

function actualizarPaleta() {
    if (ratonX !== null) {
        // Seguir al ratón con suavizado
        const objetivoX = ratonX - ANCHO_PALETA / 2;
        paletaX += (objetivoX - paletaX) * 0.25;
    } else {
        if (derechaPulsada && paletaX < lienzo.width - ANCHO_PALETA) {
            paletaX += VELOCIDAD_PALETA;
        } else if (izquierdaPulsada && paletaX > 0) {
            paletaX -= VELOCIDAD_PALETA;
        }
    }

    // Limites
    if (paletaX < 0) paletaX = 0;
    if (paletaX + ANCHO_PALETA > lienzo.width) paletaX = lienzo.width - ANCHO_PALETA;

    // Si la pelota aún no se ha lanzado, que siga a la pala
    if (!juegoIniciado && !juegoTerminado) {
        pelotaX = paletaX + ANCHO_PALETA / 2;
        pelotaY = lienzo.height - ALTO_PALETA - 20 - RADIO_PELOTA - 2;
    }
}

function actualizarPelota() {
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;
}

// --- BUCLE PRINCIPAL ---
function bucle() {
    dibujarFondo();
    dibujarLadrillos();
    dibujarPaleta();
    dibujarPelota();
    dibujarHUD();
    dibujarEstado();

    if (!juegoPausado && juegoIniciado && !juegoTerminado) {
        actualizarPaleta();
        actualizarPelota();
        detectarColisionesParedesYPala();
        detectarColisionesLadrillos();
    } else {
        // Aunque esté pausado/estado inicial, actualizamos solo la pala para que siga al ratón
        actualizarPaleta();
    }

    requestAnimationFrame(bucle);
}

// Iniciar bucle
reiniciarRonda();
bucle();
