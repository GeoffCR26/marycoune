// --- Scroll Reveal Animations ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
reveal(); // Trigger once on load

// --- Canvas Starfield Background ---
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
}

function initStars() {
    stars = [];
    const numStars = Math.floor((width * height) / 1000); // Density of stars

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            color: Math.random() > 0.8 ? '#fbbf24' : '#e2e8f0', // mostly white, some gold
            velocity: Math.random() * 0.2 + 0.05,
            alpha: Math.random()
        });
    }
}

function render() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // Twinkling effect
        star.alpha += (Math.random() - 0.5) * 0.05;
        if(star.alpha < 0.1) star.alpha = 0.1;
        if(star.alpha > 1) star.alpha = 1;

        ctx.fillStyle = `rgba(${star.color === '#fbbf24' ? '251, 191, 36' : '226, 232, 240'}, ${star.alpha})`;
        ctx.fill();

        // Upward movement
        star.y -= star.velocity;

        // Reset if off screen
        if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
        }
    });

    requestAnimationFrame(render);
}

// Initial setup
window.addEventListener('resize', resize);
resize();
render();

// --- Background Music & Mute Logic ---
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');
const muteText = document.getElementById('mute-text');

let audioStarted = false;

// Démarrer l'audio au premier clic sur la page (pour contourner le blocage autoplay des navigateurs)
document.addEventListener('click', function(e) {
    if (!audioStarted && bgMusic && e.target !== muteBtn && !muteBtn.contains(e.target)) {
        bgMusic.volume = 0.4; // Volume modéré
        let playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
             playPromise.then(_ => {
                 audioStarted = true;
             }).catch(error => {
                 console.log("Autoplay prevented:", error);
             });
        }
    }
}, { once: true });

// Gestion du bouton Mute
if (muteBtn && bgMusic) {
    muteBtn.addEventListener('click', (e) => {
        // Empêcher l'événement de se propager au document click initial
        e.stopPropagation(); 
        
        // Si le son n'a pas encore démarré, on le démarre explicitement
        if(!audioStarted) {
            bgMusic.volume = 0.4;
            bgMusic.play();
            audioStarted = true;
            return;
        }

        if (bgMusic.muted) {
            bgMusic.muted = false;
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up');
            muteText.innerText = 'Couper le son';
            muteBtn.classList.add('pulse-btn');
        } else {
            bgMusic.muted = true;
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute');
            muteText.innerText = 'Activer le son';
            muteBtn.classList.remove('pulse-btn');
        }
    });
}

// --- Casting Carousel Logic ---
const castingTrack = document.getElementById('castingTrack');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (castingTrack && prevBtn && nextBtn) {
    // Scroll amount is roughly one card width + gap
    const scrollAmount = 300;

    prevBtn.addEventListener('click', () => {
        castingTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        castingTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}

