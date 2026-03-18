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

// --- Casting Carousel Logic (boucle infinie fluide) ---
const castingTrack = document.getElementById('castingTrack');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (castingTrack && prevBtn && nextBtn) {
    const scrollAmount = 300;
    const originalCards = Array.from(castingTrack.querySelectorAll('.cast-card'));
    const cardCount = originalCards.length;

    // Cloner toutes les cartes et les ajouter à la fin ET au début
    // pour créer l'illusion de boucle infinie
    const clonesEnd = [];
    const clonesStart = [];

    originalCards.forEach(card => {
        const cloneEnd = card.cloneNode(true);
        cloneEnd.setAttribute('aria-hidden', 'true');
        cloneEnd.classList.add('clone');
        clonesEnd.push(cloneEnd);
        castingTrack.appendChild(cloneEnd);
    });

    originalCards.forEach(card => {
        const cloneStart = card.cloneNode(true);
        cloneStart.setAttribute('aria-hidden', 'true');
        cloneStart.classList.add('clone');
        clonesStart.push(cloneStart);
    });
    // Insérer les clones au début (dans l'ordre)
    clonesStart.reverse().forEach(clone => {
        castingTrack.insertBefore(clone, castingTrack.firstChild);
    });

    // Calculer la largeur totale des cartes originales clonées au début
    // (card width + gap) pour positionner le scroll au "vrai" début
    function getCardWidth() {
        const card = castingTrack.querySelector('.cast-card');
        const style = getComputedStyle(castingTrack);
        const gap = parseFloat(style.gap) || 32; // fallback 2rem = 32px
        return card.offsetWidth + gap;
    }

    // Positionner le scroll au début des vraies cartes (après les clones du début)
    const initialOffset = getCardWidth() * cardCount;
    castingTrack.scrollLeft = initialOffset;
    // Révéler le carousel une fois positionné
    castingTrack.classList.add('ready');

    let isScrolling = false;

    // Vérifier si on a atteint une zone de clones et repositionner silencieusement
    function checkLoop() {
        const cardW = getCardWidth();
        const cloneBlockSize = cardW * cardCount;
        const maxOriginalScroll = cloneBlockSize + (cardW * cardCount);

        // Si on a scrollé dans les clones de fin → revenir aux originaux (début)
        if (castingTrack.scrollLeft >= maxOriginalScroll - 2) {
            castingTrack.style.scrollBehavior = 'auto';
            castingTrack.scrollLeft = castingTrack.scrollLeft - cloneBlockSize;
            castingTrack.style.scrollBehavior = 'smooth';
        }
        // Si on a scrollé dans les clones de début → sauter aux originaux (fin)
        if (castingTrack.scrollLeft <= 2) {
            castingTrack.style.scrollBehavior = 'auto';
            castingTrack.scrollLeft = castingTrack.scrollLeft + cloneBlockSize;
            castingTrack.style.scrollBehavior = 'smooth';
        }
        isScrolling = false;
    }

    // Écouter la fin du scroll pour repositionner
    let scrollTimeout;
    castingTrack.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkLoop, 100);
    });

    nextBtn.addEventListener('click', () => {
        castingTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        castingTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
}

