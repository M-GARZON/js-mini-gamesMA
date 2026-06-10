document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('donutCanvas');
    const ctx = canvas.getContext('2d');

    const particleCount = 80;
    const connectionDistance = 120;
    const mouseRepelRadius = 150;
    const mouseRepelStrength = 0.3;

    const colors = [
        '#FF6B9D', '#C44569', '#F8B500', '#FF6B6B',
        '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
    ];

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let mouseActive = false;

    class Particle {
        constructor() {
            this.reset();
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = 2 + Math.random() * 2;
            this.baseSize = this.size;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.life = 1.0;
        }

        update() {
            if (mouseActive) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.hypot(dx, dy);

                if (distance < mouseRepelRadius && distance > 0) {
                    const force = (mouseRepelRadius - distance) / mouseRepelRadius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * mouseRepelStrength;
                    this.vy += Math.sin(angle) * force * mouseRepelStrength;
                }
            }

            particles.forEach(other => {
                if (other === this) return;

                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.hypot(dx, dy);

                if (distance < connectionDistance && distance > 0) {
                    const force = (connectionDistance - distance) / connectionDistance * 0.001;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force;
                    this.vy += Math.sin(angle) * force;
                }
            });

            this.vx *= 0.98;
            this.vy *= 0.98;

            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) {
                this.vx *= -0.8;
                this.x = Math.max(0, Math.min(canvas.width, this.x));
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.vy *= -0.8;
                this.y = Math.max(0, Math.min(canvas.height, this.y));
            }

            const speed = Math.hypot(this.vx, this.vy);
            this.size = this.baseSize + speed * 0.5;
        }

        draw() {
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 2
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color + 'CC');
            gradient.addColorStop(1, this.color + '00');

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouseActive = true;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseActive = false;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        mouseActive = true;
    });

    canvas.addEventListener('touchend', () => {
        mouseActive = false;
    });

    function drawConnections() {
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(other => {
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.hypot(dx, dy);

                if (distance < connectionDistance) {
                    const opacity = 1 - (distance / connectionDistance);
                    const gradient = ctx.createLinearGradient(
                        particle.x, particle.y,
                        other.x, other.y
                    );

                    gradient.addColorStop(0, particle.color + Math.floor(opacity * 100).toString(16).padStart(2, '0'));
                    gradient.addColorStop(1, other.color + Math.floor(opacity * 100).toString(16).padStart(2, '0'));

                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.5;
                    ctx.globalAlpha = opacity * 0.6;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });
        });
    }

    function drawMouseEffect() {
        if (!mouseActive) return;

        const gradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, mouseRepelRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, mouseRepelRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function animate() {
        ctx.fillStyle = 'rgba(243, 229, 245, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawConnections();

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawMouseEffect();

        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    animate();
});
