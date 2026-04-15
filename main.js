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

// --- 3D Book Interactive Drag-to-Rotate Only ---
const bookContainer = document.querySelector('.book-container');
const book = document.querySelector('.book');

if (bookContainer && book) {
    let isDraggingBook = false;
    let startX = 0;
    let startY = 0;

    // Angles actuels
    let currentRotX = 15;
    let currentRotY = -30;

    // Angles au début du drag
    let startDragRotX = 15;
    let startDragRotY = -30;

    let currentScale = window.innerWidth <= 600 ? 0.7 : (window.innerWidth <= 900 ? 0.85 : 1);

    window.addEventListener('resize', () => {
        currentScale = window.innerWidth <= 600 ? 0.7 : (window.innerWidth <= 900 ? 0.85 : 1);
        if (!isDraggingBook) {
            book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale})`;
        }
    });

    const startDrag = (e) => {
        // Empêche le navigateur de lancer un drag-and-drop natif sur les images
        if (e.type === 'mousedown') {
            e.preventDefault();
        }

        isDraggingBook = true;
        // Effet de pop lors de la saisie
        book.style.transition = 'transform 0.1s ease-out';
        book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale * 1.05})`;
        bookContainer.style.cursor = 'grabbing';

        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        startDragRotX = currentRotX;
        startDragRotY = currentRotY;

        // On enlève la transition au bout de l'effet "pop" pour suivre doucement le curseur
        setTimeout(() => {
            if (isDraggingBook) book.style.transition = 'none';
        }, 100);
    };

    const moveDrag = (e) => {
        if (!isDraggingBook) return;

        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        const diffX = currentX - startX;
        const diffY = currentY - startY;

        currentRotY = startDragRotY + (diffX * 0.5);
        currentRotX = startDragRotX - (diffY * 0.5);

        // Limites pour ne pas se retrouver totalement à l'envers
        if (currentRotX > 80) currentRotX = 80;
        if (currentRotX < -80) currentRotX = -80;

        book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale * 1.05})`;
    };

    const endDrag = () => {
        if (!isDraggingBook) return;
        isDraggingBook = false;
        bookContainer.style.cursor = 'grab';

        // On remet une transition légère pour le retour à l'échelle normale
        book.style.transition = 'transform 0.3s ease-out';
        book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale})`;
    };

    // Events Souris
    bookContainer.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    // Events Tactiles
    bookContainer.addEventListener('touchstart', (e) => {
        if (e.cancelable) e.preventDefault();
        startDrag(e);
    }, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);

    // Initialisation
    bookContainer.style.cursor = 'grab';
    book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale})`;

    // Réinitialisation au double-clic
    bookContainer.addEventListener('dblclick', () => {
        currentRotX = 15;
        currentRotY = -30;
        book.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        book.style.transform = `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale})`;
    });
}

// --- Vintage Music Player Logic ---
const playlistData = [
    { chapter: "Chapitre 1", quote: "Between the heaven and the embers", song: "In The Stars - Benson Boon", file: "assets/Benson Boone - In the Stars.mp3" },
    { chapter: "Chapitre 2", quote: "I better run", song: "Runaway Baby - Bruno Mars", file: "assets/Runaway Baby - Bruno Mars.mp3" },
    { chapter: "Chapitre 3", quote: "We fall", song: "Atlantis - Seafret", file: "assets/Seafret - Atlantis.mp3" },
    { chapter: "Chapitre 4", quote: "Something toxic", song: "I Was Never There - The Weeknd", file: "assets/The Weeknd - I Was Never There.mp3" },
    { chapter: "Chapitre 5", quote: "I play with your heart", song: "Oops I Did It Again - Britney Spears", file: "assets/Britney Spears - Oops!... I Did It Again.mp3" },
    { chapter: "Chapitre 6", quote: "Take my pain", song: "Heal - Tom Odell", file: "assets/Tom Odell - Heal.mp3" },
    { chapter: "Chapitre 7", quote: "The only way to heal", song: "My Blood - Ellie Goulding", file: "assets/Ellie Goulding - My Blood.mp3" },
    { chapter: "Chapitre 8", quote: "Kill my desire", song: "Play With Fire - Nico Santos", file: "assets/Nico Santos - Play With Fire.mp3" },
    { chapter: "Chapitre 9", quote: "You can do everything", song: "Angel By The Wings – Sia", file: "assets/Angel By The Wings - Sia.mp3" },
    { chapter: "Chapitre 10", quote: "I hear your SOS", song: "Rescue - Lauren Daigle", file: "assets/Lauren Daigle - Rescue.mp3" },
    { chapter: "Chapitre 11", quote: "I need you more than I want to", song: "Shameless – Camila Cabello", file: "assets/Camila Cabello - Shameless.mp3" },
    { chapter: "Chapitre 12", quote: "Let you go", song: "Until I Found You - Stephen Sanchez", file: "assets/Stephen Sanchez - Until I Found You.mp3" },
    { chapter: "Chapitre 13", quote: "Master of pretending", song: "Closed Door - Ismail", file: "assets/Ismail - Closed Doors.mp3" },
    { chapter: "Chapitre 14", quote: "Let the fear you have fall away", song: "Say Yes To Heaven - Lana Del Rey", file: "assets/Lana Del Rey - Say Yes To Heaven.mp3" },
    { chapter: "Chapitre 15", quote: "I don’t love who I am", song: "Half A Man - Dean Lewis", file: "assets/Dean Lewis - Half A Man.mp3" },
    { chapter: "Chapitre 16", quote: "She needs to slow down", song: "Sexy Bitch - David Guetta feat Akon", file: "assets/David Guetta - Sexy Bitch (feat. Akon).mp3" },
    { chapter: "Chapitre 17", quote: "Your darkest fears are gonna come for you", song: "Panic Room - AU/RA", file: "assets/AuRa - Panic Room.mp3" },
    { chapter: "Chapitre 18", quote: "I’ll fight until the end", song: "Outro – M83", file: "assets/OUTRO - m83.mp3" },
    { chapter: "Chapitre 19", quote: "Feels like I can’t move", song: "Softscore - The Neighbourhood", file: "assets/The Neighbourhood - Softcore.mp3" },
    { chapter: "Chapitre 20", quote: "She needs to slow down", song: "You Are Enough - Sleeping At Last", file: "assets/You Are Enough by Sleeping At Last.mp3" },
    { chapter: "Chapitre 21", quote: "I’ll be so fucking rude", song: "Another Love - Tom Odell", file: "assets/Tom Odell - Another Love.mp3" },
    { chapter: "Chapitre 22", quote: "It kills me how your mind can make you feel so worthless", song: "Before You Go - Lewis Capaldi", file: "assets/Lewis Capaldi - Before You Go.mp3" },
    { chapter: "Chapitre 23", quote: "The condition of your soul is erodin", song: "Skin And Bones - David Kushner", file: "assets/David Kushner - Skin and Bones.mp3" },
    { chapter: "Chapitre 24", quote: "We keep this love in photograph", song: "Photograph - Ed Sheeran", file: "assets/Ed Sheeran - Photograph.mp3" },
    { chapter: "Chapitre 25", quote: "He has done this all before", song: "Broken - Isak Danielson", file: "assets/Isak Danielson - Broken.mp3" },
    { chapter: "Chapitre 26", quote: "The Angel Heaven Let Me Think Was You", song: "Apologize - Timbaland ft One Republic", file: "assets/Timbaland - Apologize Feat. OneRepublic.mp3" },
    { chapter: "Chapitre 27", quote: "We Like To Watch You Laughing", song: "Kids - MGMT", file: "assets/MGMT - Kids.mp3" },
    { chapter: "Chapitre 28", quote: "Time flies", song: "Come A Little Closer - Cage the elephant", file: "assets/Cage The Elephant - Come A Little Closer.mp3" },
    { chapter: "Chapitre 29", quote: "Just hold a smile", song: "Never Say Never - The Fray", file: "assets/The Fray - Never Say Never.mp3" },
    { chapter: "Chapitre 30", quote: "This City Got Me Chasing Stars", song: "This City - Sam Fischer", file: "assets/Sam Fischer - This City.mp3" },
    { chapter: "Chapitre 31", quote: "I’ll look after you", song: "Look After You - The Fray", file: "assets/The Fray - Look After You.mp3" },
    { chapter: "Chapitre 32", quote: "I’m ever gonna let you leave", song: "Treehouse - Alex G", file: "assets/Treehouse - Alex G.mp3" },
    { chapter: "Chapitre 33", quote: "My head was underwater", song: "Everything I Wanted - Billie Eilish", file: "assets/Billie Eilish - everything i wanted.mp3" },
    { chapter: "Chapitre 34", quote: "We’ll be fine", song: "Treat You Better – Shawn Mendes", file: "assets/Shawn Mendes - Treat You Better.mp3" },
    { chapter: "Chapitre 35", quote: "You never known how it broke me down", song: "Anchor – Novo Amor", file: "assets/Novo Amor - Anchor.mp3" },
    { chapter: "Chapitre 36", quote: "The same old theme", song: "Zombie – The Cranberries", file: "assets/The Cranberries - Zombie.mp3" },
    { chapter: "Chapitre 37", quote: "Forever young", song: "Forever Young – Alphaville", file: "assets/Forever Young.mp3" },
    { chapter: "Chapitre 38", quote: "Believe me now", song: "Hear Me Now – Bruno Martini", file: "assets/Alok, Bruno Martini feat. Zeeba  Hear Me Now.mp3" },
    { chapter: "Chapitre 39", quote: "You betrayed me", song: "Traitor – Olivia Rodrigo", file: "assets/Olivia Rodrigo - Traitor.mp3" },
    { chapter: "Chapitre 40", quote: "I never hated you like I do right now", song: "Make Me (Cry) – Noah Cyrus, Labyrinth", file: "assets/Noah Cyrus, Labrinth - Make Me (Cry) ft. Labrinth.mp3" },
    { chapter: "Chapitre 41", quote: "You can count on me", song: "Count On Me – Bruno Mars", file: "assets/Bruno Mars - Count On Me.mp3" },
    { chapter: "Epilogue", quote: "", song: "Love in The Dark - Adele", file: "assets/Love In The Dark - Adele.mp3" }
];

const tracklistEl = document.getElementById('vintage-tracklist');
const vinylEl = document.getElementById('vinyl');
const quoteEl = document.getElementById('vp-quote');
const songEl = document.getElementById('vp-song');

if (tracklistEl && vinylEl && quoteEl && songEl) {
    let isInitialLoad = true;
    let currentAudio = new Audio();
    let isPlaying = false;

    // New controls
    const vintagePlayPauseBtn = document.getElementById('vc-play-pause');
    const vintageVolumeSlider = document.getElementById('vc-volume');
    const vintageVolumeIcon = document.querySelector('.vc-volume-icon');

    // Set default volume
    if (vintageVolumeSlider) {
        currentAudio.volume = parseFloat(vintageVolumeSlider.value);
    }

    // Update play/pause button icon function
    function updatePlayPauseUI() {
        if (!vintagePlayPauseBtn) return;
        if (isPlaying) {
            vintagePlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            vintagePlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    // Volume input listener
    if (vintageVolumeSlider && vintageVolumeIcon) {
        vintageVolumeSlider.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            currentAudio.volume = vol;
            if (vol === 0) {
                vintageVolumeIcon.className = 'fas fa-volume-mute vc-volume-icon';
            } else if (vol < 0.5) {
                vintageVolumeIcon.className = 'fas fa-volume-down vc-volume-icon';
            } else {
                vintageVolumeIcon.className = 'fas fa-volume-up vc-volume-icon';
            }
        });
    }

    // Play/Pause button listener
    if (vintagePlayPauseBtn) {
        vintagePlayPauseBtn.addEventListener('click', () => {
            if (!currentAudio.src) return;

            if (isPlaying) {
                currentAudio.pause();
                vinylEl.classList.remove('playing');
                isPlaying = false;
            } else {
                currentAudio.play();
                vinylEl.classList.add('playing');
                isPlaying = true;
            }
            updatePlayPauseUI();
        });
    }

    // Add pointer cursor to vinyl 
    vinylEl.style.cursor = 'pointer';
    vinylEl.title = "Cliquez pour lire ou mettre en pause";

    playlistData.forEach((item) => {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track-item';
        trackDiv.innerHTML = `<span class="track-chapter">${item.chapter}</span>`;
        trackDiv.title = `Lire: ${item.song}`;

        trackDiv.addEventListener('click', () => {

            // If clicking the current active track, toggle playback
            if (trackDiv.classList.contains('active') && !isInitialLoad) {
                if (isPlaying) {
                    currentAudio.pause();
                    vinylEl.classList.remove('playing');
                    isPlaying = false;
                } else {
                    currentAudio.play();
                    vinylEl.classList.add('playing');
                    isPlaying = true;
                }
                updatePlayPauseUI();
                return;
            }

            // Update active states
            const allTracks = document.querySelectorAll('.track-item');
            allTracks.forEach(el => el.classList.remove('active'));
            trackDiv.classList.add('active');

            // Fade out current info
            quoteEl.style.opacity = 0;
            songEl.style.opacity = 0;

            setTimeout(() => {
                // Update text
                if (item.quote) {
                    quoteEl.textContent = `"${item.quote}"`;
                    quoteEl.style.display = 'block';
                } else {
                    quoteEl.textContent = '';
                    quoteEl.style.display = 'none';
                }
                songEl.innerHTML = `<i class="fas fa-music" style="margin-right: 8px;"></i>${item.song}`;
                // Fade in
                quoteEl.style.opacity = 1;
                songEl.style.opacity = 1;
            }, 150);

            // Audio setup
            currentAudio.src = item.file;

            // Toggle vinyl playing state
            if (!isInitialLoad) {
                // Play new song
                currentAudio.play();
                isPlaying = true;

                // Restart animation
                vinylEl.classList.remove('playing');
                setTimeout(() => {
                    vinylEl.classList.add('playing');
                }, 10);
            } else {
                isPlaying = false;
            }
            updatePlayPauseUI();
        });

        tracklistEl.appendChild(trackDiv);
    });

    // Play/Pause when clicking the vinyl
    vinylEl.addEventListener('click', () => {
        // Only works if a track has been loaded into currentAudio.src
        if (!currentAudio.src) return;

        if (isPlaying) {
            currentAudio.pause();
            vinylEl.classList.remove('playing');
            isPlaying = false;
        } else {
            currentAudio.play();
            vinylEl.classList.add('playing');
            isPlaying = true;
        }
        updatePlayPauseUI();
    });

    // Handle end of song
    currentAudio.addEventListener('ended', () => {
        isPlaying = false;
        vinylEl.classList.remove('playing');
        updatePlayPauseUI();
    });

    // Init first item
    const firstTrack = tracklistEl.querySelector('.track-item');
    if (firstTrack) {
        firstTrack.click();
    }

    // Once initial load is done, clicks will animate & play
    setTimeout(() => {
        isInitialLoad = false;
    }, 200);
}