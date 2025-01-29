document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('donutCanvas');
    const ctx = canvas.getContext('2d');

    const donuts = [];
    const numDonuts = 5; // Aumentado el número de donuts
    const donutRadius = 20; // Tamaño de los donuts
    const speed = 2.5; // Velocidad general

    // Función para crear un donut con posición y velocidad aleatoria
    function createDonut() {
        return {
            x: Math.random() * (canvas.width - donutRadius * 2) + donutRadius,
            y: Math.random() * (canvas.height - donutRadius * 2) + donutRadius,
            dx: (Math.random() - 0.5) * speed * 2,
            dy: (Math.random() - 0.5) * speed * 2,
            radius: donutRadius
        };
    }

    // Crear los donuts
    for (let i = 0; i < numDonuts; i++) {
        let newDonut;
        let overlapping;

        do {
            newDonut = createDonut();
            overlapping = donuts.some(d => 
                Math.hypot(d.x - newDonut.x, d.y - newDonut.y) < donutRadius * 2
            );
        } while (overlapping);

        donuts.push(newDonut);
    }

    // Dibujar un donut en el canvas
    function drawDonut(donut) {
        ctx.beginPath();
        ctx.arc(donut.x, donut.y, donut.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'brown';
        ctx.stroke();
        ctx.closePath();

        // Agujero del donut
        ctx.beginPath();
        ctx.arc(donut.x, donut.y, donut.radius / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    // Actualizar posición y detectar colisiones
    function updateDonuts() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < donuts.length; i++) {
            const donut = donuts[i];

            // Rebote en los bordes
            if (donut.x + donut.dx > canvas.width - donut.radius || donut.x + donut.dx < donut.radius) {
                donut.dx = -donut.dx;
            }
            if (donut.y + donut.dy > canvas.height - donut.radius || donut.y + donut.dy < donut.radius) {
                donut.dy = -donut.dy;
            }

            // Colisiones con otros donuts
            for (let j = i + 1; j < donuts.length; j++) {
                const otherDonut = donuts[j];
                const dx = donut.x - otherDonut.x;
                const dy = donut.y - otherDonut.y;
                const distance = Math.hypot(dx, dy);

                if (distance < donut.radius * 2) {
                    // Intercambio de velocidades para simular colisión
                    let tempDx = donut.dx;
                    let tempDy = donut.dy;
                    donut.dx = otherDonut.dx;
                    donut.dy = otherDonut.dy;
                    otherDonut.dx = tempDx;
                    otherDonut.dy = tempDy;

                    // Mover ligeramente para evitar solapamiento
                    let angle = Math.atan2(dy, dx);
                    let overlap = donut.radius * 2 - distance;
                    donut.x += Math.cos(angle) * overlap / 2;
                    donut.y += Math.sin(angle) * overlap / 2;
                    otherDonut.x -= Math.cos(angle) * overlap / 2;
                    otherDonut.y -= Math.sin(angle) * overlap / 2;
                }
            }

            // Mover el donut
            donut.x += donut.dx;
            donut.y += donut.dy;

            // Dibujar el donut actualizado
            drawDonut(donut);
        }

        requestAnimationFrame(updateDonuts);
    }

    updateDonuts();
});
