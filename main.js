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
        if (star.alpha < 0.1) star.alpha = 0.1;
        if (star.alpha > 1) star.alpha = 1;

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


// --- Casting Carousel Logic (boucle infinie fluide & Drag-to-scroll) ---
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

    // --- Drag to Scroll (Glisser avec la souris) ---
    let isDown = false;
    let startX;
    let scrollLeftPos;

    castingTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        castingTrack.classList.add('active');
        // On désactive le scroll fluide natif pendant le drag pour que le mouvement suive exactement la souris
        castingTrack.style.scrollBehavior = 'auto';
        startX = e.pageX - castingTrack.offsetLeft;
        scrollLeftPos = castingTrack.scrollLeft;
    });

    castingTrack.addEventListener('mouseleave', () => {
        isDown = false;
        castingTrack.classList.remove('active');
        castingTrack.style.scrollBehavior = 'smooth'; // On réactive pour les boutons
    });

    castingTrack.addEventListener('mouseup', () => {
        isDown = false;
        castingTrack.classList.remove('active');
        castingTrack.style.scrollBehavior = 'smooth';
    });

    castingTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Empêche le navigateur de vouloir sélectionner du texte ou "sauvegarder" l'image
        const x = e.pageX - castingTrack.offsetLeft;
        const walk = (x - startX) * 1.5; // Multiplicateur de vitesse (1.5x)
        castingTrack.scrollLeft = scrollLeftPos - walk;
    });
}