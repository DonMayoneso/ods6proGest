/* --- mundo.js: LÓGICA DEL SISTEMA H₂Q --- */

let audioCtx; // Contexto de audio global para efectos

// --- 1. SISTEMA DE AUDIO (SINTETIZADOR DE GLITCH) ---
function initAudioContext() {
    // Inicializar el contexto de audio solo tras una interacción del usuario
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Si está suspendido (política de navegadores), reanudarlo
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playGlitchSound() {
    // Si no hay contexto, no hacer nada
    if (!audioCtx) return; 

    // Crear buffer de ruido blanco (0.2 segundos)
    const bufferSize = audioCtx.sampleRate * 0.2; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Generar estática
    }

    // Fuente de sonido
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Filtro para que suene como cinta vieja (Bandpass 1000Hz)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    // Control de volumen (Fade out rápido)
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    // Conexiones: Ruido -> Filtro -> Volumen -> Altavoces
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
}

// --- 2. SISTEMA DE PESTAÑAS (TABS) ---
// Se asigna a window para que funcione con los onclick del HTML
window.openTab = function(tabId) {
    initAudioContext(); // Asegurar audio activo
    playGlitchSound();  // Sonido de interfaz
    
    // 1. Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active-content'));
    // 2. Desactivar botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // 3. Activar contenido seleccionado
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.add('active-content');
    
    // 4. Activar botón visualmente
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabId)) btn.classList.add('active');
    });
};

// --- 3. INICIALIZACIÓN PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Efecto Matrix Fondo
    initMatrixEffect();

    // B. Secuencia de Inicio (Boot Animation)
    runBootSequence();

    // C. Configuración de Modales (Personajes, PDF, Lightbox)
    setupModals();

    // D. Reproductor de Video VHS
    setupVideoPlayer();

    // E. Reproductor de Audio
    setupAudioPlayer();

    // F. Botón Scroll to Top
    setupScrollTop();
});

// --- 4. FUNCIONES DE LÓGICA ---

function runBootSequence() {
    const bootOverlay = document.getElementById('boot-overlay');
    const mainContainer = document.getElementById('main-container');
    const lines = [
        "> BIOS DATE 01/01/2025...",
        "> CPU: QUANTUM CORE... OK",
        "> MEMORY TEST: 64TB... OK",
        "> MOUNTING ../ASERVA/...",
        "> DECRYPTING FILES...",
        "> ACCESS GRANTED."
    ];
    let delay = 0;

    lines.forEach(line => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'boot-line';
            p.innerText = line;
            bootOverlay.appendChild(p);
            bootOverlay.scrollTop = bootOverlay.scrollHeight;
        }, delay);
        delay += 350;
    });

    // Finalizar carga
    setTimeout(() => {
        bootOverlay.style.opacity = '0';
        bootOverlay.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            bootOverlay.style.display = 'none';
            mainContainer.style.opacity = '1'; // Mostrar web real
        }, 500);
    }, delay + 800);
}

function setupModals() {
    // Referencias
    const charModal = document.getElementById('charModal');
    const charImg = document.getElementById('charModalImg');
    const imgModal = document.getElementById('imgModal'); // Lightbox
    const lightboxImg = document.getElementById('lightboxImg');
    const cards = document.querySelectorAll('.char-card');

    // 1. Abrir Modal de Personaje al clickear tarjeta
    cards.forEach(card => {
        card.onclick = () => {
            playGlitchSound();
            
            // Llenar datos desde atributos HTML
            const imgSrc = card.getAttribute('data-img');
            charImg.src = imgSrc;
            
            // Resetear visualización por si hubo error antes
            charImg.style.display = 'block';
            const placeholder = charImg.nextElementSibling; // El div de NO DATA
            if (placeholder && placeholder.classList.contains('no-data-placeholder')) {
                placeholder.style.display = 'none';
            }

            document.getElementById('charModalName').innerText = card.getAttribute('data-name');
            document.getElementById('charModalRole').innerText = card.getAttribute('data-role');
            document.getElementById('charModalDesc').innerHTML = card.getAttribute('data-desc');
            
            charModal.style.display = 'block';
        };
    });

    // 2. Abrir Lightbox al clickear imagen del personaje
    if (charImg) {
        charImg.onclick = () => {
            // Solo abrir si la imagen es válida y visible
            if (charImg.style.display !== 'none') {
                lightboxImg.src = charImg.src;
                imgModal.style.display = 'block';
            }
        };
    }

    // 3. Modal PDF y Créditos
    document.getElementById('btn-leeme').onclick = () => document.getElementById('pdfModal').style.display = 'block';
    document.getElementById('btn-creditos').onclick = () => document.getElementById('creditos-section').scrollIntoView({behavior:"smooth"});

    // 4. Cerrar cualquier modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        }
    });

    // Cerrar al clickear fuera
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = "none";
    }
}

function setupVideoPlayer() {
    const vid = document.getElementById('dynamic-video');
    const startBtn = document.getElementById('btn-video-start');
    const timerDisplay = document.getElementById('rec-timer-display');
    const timerVal = document.getElementById('rec-time-val');
    const controlsPanel = document.getElementById('video-controls');

    if (!vid || !startBtn) return;

    // Función auxiliar para efecto visual
    const triggerGlitch = () => {
        vid.classList.add('vhs-effect');
        playGlitchSound();
        setTimeout(() => vid.classList.remove('vhs-effect'), 300);
    };

    // Botón Gigante Inicial
    startBtn.onclick = () => {
        initAudioContext();
        vid.muted = false; 
        vid.volume = 1.0;
        vid.play().then(() => {
            startBtn.style.display = 'none';
            timerDisplay.classList.add('rec-active');
            controlsPanel.style.display = 'flex';
            vid.removeAttribute('controls');
        }).catch(err => console.error("Error Video:", err));
    };

    // Botones VHS
    document.getElementById('vhs-rewind').onclick = () => {
        triggerGlitch();
        vid.currentTime = Math.max(0, vid.currentTime - 30);
    };

    document.getElementById('vhs-forward').onclick = () => {
        triggerGlitch();
        vid.currentTime = Math.min(vid.duration, vid.currentTime + 30);
    };

    document.getElementById('vhs-restart').onclick = () => {
        triggerGlitch();
        vid.currentTime = 0;
        if(vid.paused) {
            vid.play();
            timerDisplay.classList.add('rec-active');
            document.getElementById('vhs-toggle').innerText = "|| PAUSA";
        }
    };

    const btnToggle = document.getElementById('vhs-toggle');
    btnToggle.onclick = () => {
        if (vid.paused) {
            vid.play();
            timerDisplay.classList.add('rec-active');
            btnToggle.innerText = "|| PAUSA";
        } else {
            vid.pause();
            timerDisplay.classList.remove('rec-active');
            btnToggle.innerText = "> REANUDAR";
        }
    };

    // Actualizar Timer
    vid.ontimeupdate = () => {
        const s = vid.currentTime;
        const date = new Date(s * 1000);
        // Formato manual para evitar zonas horarias
        const hh = String(Math.floor(s / 3600)).padStart(2, '0');
        const mm = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');
        const ms = String(Math.floor((s % 1) * 100)).padStart(2, '0');
        timerVal.innerText = `${hh}:${mm}:${ss}:${ms}`;
    };

    // Al terminar video
    vid.onended = () => {
        timerDisplay.classList.remove('rec-active');
        btnToggle.innerText = "> REINICIAR";
    };
}

function setupAudioPlayer() {
    const audio = document.getElementById('dynamic-audio');
    const playBtn = document.getElementById('cyber-play');
    const resetBtn = document.getElementById('cyber-reset');
    const bars = document.querySelectorAll('.viz-bar');

    if (!audio || !playBtn) return;

    const toggleAnim = (active) => {
        bars.forEach(b => b.style.animation = active ? 'equalize 0.5s infinite' : 'none');
    };

    playBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerText = "[ || ]";
            toggleAnim(true);
        } else {
            audio.pause();
            playBtn.innerText = "[ > ]";
            toggleAnim(false);
        }
    };

    resetBtn.onclick = () => {
        audio.currentTime = 0;
        audio.play();
        playBtn.innerText = "[ || ]";
        toggleAnim(true);
    };

    audio.onended = () => {
        playBtn.innerText = "[ > ]";
        toggleAnim(false);
    };
}

function setupScrollTop() {
    const backBtn = document.getElementById('backToTop');
    if (!backBtn) return;

    window.onscroll = () => {
        if (window.scrollY > 400) backBtn.style.display = 'block';
        else backBtn.style.display = 'none';
    };

    backBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

// --- 5. EFECTO MATRIX ---
function initMatrixEffect() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);
    
    // Ajustar al redimensionar
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}