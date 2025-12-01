document.addEventListener('DOMContentLoaded', () => {

    /* LÓGICA DE INTRO VIDEO */
    const introOverlay = document.getElementById('intro-overlay');
    const introVideo = document.getElementById('intro-video');
    const bootBtn = document.getElementById('boot-btn');
    const logoLink = document.querySelector('.logo-link');

    const closeIntro = () => {
        introOverlay.classList.add('hidden');
        setTimeout(() => {
            introOverlay.style.display = 'none';
            introVideo.pause();
        }, 1000);
        sessionStorage.setItem('introPlayed', 'true');
    };

    const playIntro = () => {
        introOverlay.style.display = 'flex';
        introOverlay.classList.remove('hidden');
        introVideo.currentTime = 0;
        introVideo.muted = false;
        bootBtn.style.display = 'none';

        const playPromise = introVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay bloqueado. Esperando interacción.");
                introVideo.muted = true;
                introVideo.play();
                bootBtn.style.display = 'block';
            });
        }
    };

    introVideo.addEventListener('ended', closeIntro);

    bootBtn.addEventListener('click', () => {
        introVideo.currentTime = 0;
        introVideo.muted = false;
        introVideo.play();
        bootBtn.style.display = 'none';
    });

    if(logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            playIntro();
        });
    }

    if (!sessionStorage.getItem('introPlayed')) {
        playIntro();
    } else {
        introOverlay.style.display = 'none';
    }

    /* CARGA DE DATOS JSON (SISTEMA HÍBRIDO) */
    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            const mundos = data.mundos; 
            const faces = document.querySelectorAll('.face');
            
            faces.forEach((face) => {
                // Solo inyectamos datos si la cara tiene data-index (Mundos Internos)
                // Las caras con data-link (Externas) se ignoran para mantener su HTML manual
                if (face.hasAttribute('data-index')) {
                    const index = face.getAttribute('data-index');
                    if (mundos[index]) {
                        const world = mundos[index];
                        face.setAttribute('data-world', world.id);
                        
                        const img = face.querySelector('.world-bg');
                        if(img) img.src = world.imagenUrl;
                        
                        const title = face.querySelector('.world-title');
                        if(title) title.textContent = world.titulo;
                    }
                }
            });
        })
        .catch(error => console.error('Error cargando datos.json:', error));

    /* INTERFAZ DE USUARIO */
    
    function setupPanel(panelId, btnId) {
        const panel = document.getElementById(panelId);
        const btn = document.getElementById(btnId);
        const icon = btn.querySelector('i');

        btn.addEventListener('click', (e) => { 
            e.stopPropagation();
            panel.classList.toggle('collapsed'); 
            icon.className = panel.classList.contains('collapsed') ? 'fas fa-plus' : 'fas fa-minus'; 
        });
        
        panel.addEventListener('mousedown', e => e.stopPropagation()); 
        panel.addEventListener('touchstart', e => e.stopPropagation());
    }
    setupPanel('water-panel', 'min-water'); 
    setupPanel('mascot-panel', 'min-mascot');

    const footer = document.getElementById('main-footer');
    const ftBtn = document.getElementById('footer-toggle');
    const ftIcon = ftBtn.querySelector('i');

    ftBtn.addEventListener('click', () => { 
        footer.classList.toggle('visible'); 
        ftIcon.className = footer.classList.contains('visible') ? 'fas fa-chevron-down' : 'fas fa-chevron-up'; 
    });

    const phrases = [
        "El sistema te cobra por lo que usas, pero la naturaleza te cobra por lo que olvidas",
        "Cuando tratamos al agua como un recurso infinito, la naturaleza nos recuerda, con intereses.",
        "El agua es vida, pero también es tiempo. No perdamos segundos.",
        "La revolución no será de fuego ni metal. Será de agua, renaciendo desde lo profundo",
        "Miles han vivido sin amor, ni uno solo sin agua.",
        "La sed despertó coraje y una voz valiente encendió el desafío contra el poder."
    ];
    const bubble = document.getElementById('speech-bubble'); 
    let pIdx = 0;

    setInterval(() => { 
        bubble.style.opacity = 0;
        setTimeout(() => { 
            pIdx = (pIdx + 1) % phrases.length; 
            bubble.textContent = phrases[pIdx]; 
            bubble.style.opacity = 1;
        }, 500); 
    }, 7000);

    /* SIMULACIÓN DATOS DE AGUA */
    const waterFill = document.getElementById('waterFill');
    const alarmLayer = document.getElementById('alarmLayer');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const liveLCD = document.getElementById('live-consumption');
    
    const FWP = 2.5; 
    setTimeout(() => { 
        const yPos = 2200 - (2200 * (FWP / 100)); 
        waterFill.setAttribute('y', yPos); 
        alarmLayer.setAttribute('y', yPos); 
        progressBarFill.style.width = `${FWP}%`; 
    }, 500);
    
    const TAV = 4750000000;
    const msPY = 365*24*60*60*1000;
    const rPMs = TAV / msPY;

    setInterval(() => { 
        const now = new Date();
        const sOY = new Date(now.getFullYear(), 0, 1);
        const msPYr = now - sOY; 
        let cY = msPYr * rPMs; 
        cY += ((Math.random() * 1000) - 500); 
        liveLCD.textContent = Math.floor(cY).toLocaleString('en-US'); 
    }, 150);

    /* LÓGICA DEL CUBO 3D Y VIAJE */
    const cube = document.querySelector('.cube');
    const mC = document.getElementById('orbit-controls');
    const tBtn = document.getElementById('toggle-rotation');
    const tIcon = tBtn.querySelector('i');
    const tTxt = tBtn.querySelector('span');
    const sT = document.getElementById('spaceTravel');
    const tT = document.querySelector('.travel-text');
    
    let isD = false;
    let isAR = true;
    let pMX = 0, pMY = 0;
    let rX = -15, rY = 15;
    let sMX = 0, sMY = 0;
    let hM = false;
    let cT = null;
    
    tBtn.addEventListener('click', e => { 
        isAR = !isAR; 
        tIcon.className = isAR ? 'fas fa-pause' : 'fas fa-play'; 
        tTxt.textContent = isAR ? 'PAUSAR ORBITA' : 'REANUDAR ORBITA'; 
        e.stopPropagation(); 
    });
    
    function animR() { 
        if(!isD && isAR) { 
            rX += 0.05; 
            rY += 0.08; 
            cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`; 
        } 
        requestAnimationFrame(animR); 
    } 
    animR();
    
    // Función Viajar (Soporta Links Externos e Internos)
    function travel(f) { 
        const externalLink = f.getAttribute('data-link');
        const worldId = f.getAttribute('data-world');
        let name = "Destino Desconocido";

        if (externalLink) {
            const titleEl = f.querySelector('.world-title');
            if(titleEl) name = titleEl.textContent;
        } else if (worldId) {
            name = worldId;
        }

        sT.style.display = 'block'; 
        createStars(); 
        
        setTimeout(() => {
            tT.textContent = "Viajando a " + name + "...";
            tT.style.opacity = 1;
        }, 500); 
        
        setTimeout(() => {
            if (externalLink) {
                // Redirección Externa
                window.location.href = externalLink;
            } else {
                // Redirección Interna a la Nave
                window.location.href = 'nave/nave.html?mundo=' + encodeURIComponent(worldId);
            }
        }, 3000); 
    }
    
    function createStars() { 
        sT.innerHTML = ''; 
        sT.appendChild(tT); 
        for(let i=0; i<150; i++){ 
            let s = document.createElement('div'); s.className = 'star'; 
            let sz = Math.random() * 3;
            s.style.width = sz + 'px'; s.style.height = sz + 'px'; 
            s.style.left = Math.random() * 100 + '%'; 
            s.style.top = Math.random() * 100 + '%'; 
            s.style.animation = `moveStar ${1 + Math.random() * 2}s linear infinite`; 
            sT.appendChild(s); 
        } 
        if(!document.getElementById('st-style')){ 
            let st = document.createElement('style'); st.id = 'st-style'; 
            st.textContent = '@keyframes moveStar { 0% { transform: translateZ(0); opacity: 1; } 100% { transform: translateZ(1000px); opacity: 0; } }'; 
            document.head.appendChild(st); 
        }
    }

    mC.addEventListener('mousedown', e => {
        isD = true; hM = false;
        sMX = e.clientX; sMY = e.clientY;
        pMX = e.clientX; pMY = e.clientY;
        cT = e.target.closest('.face');
        mC.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', e => {
        if(!isD) return;
        if(Math.abs(e.clientX - sMX) > 5 || Math.abs(e.clientY - sMY) > 5) { hM = true; cT = null; }
        
        rY += (e.clientX - pMX) * 0.3;
        rX -= (e.clientY - pMY) * 0.3;
        cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
        
        pMX = e.clientX; pMY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isD = false; mC.style.cursor = 'grab';
        if(!hM && cT) travel(cT);
        cT = null;
    });

    mC.addEventListener('touchstart', e => {
        isD = true; hM = false;
        let t = e.touches[0];
        sMX = t.clientX; sMY = t.clientY;
        pMX = t.clientX; pMY = t.clientY;
        cT = e.target.closest('.face');
    });

    document.addEventListener('touchmove', e => {
        if(!isD) return;
        let t = e.touches[0];
        if(Math.abs(t.clientX - sMX) > 5 || Math.abs(t.clientY - sMY) > 5) {
            hM = true; cT = null; 
            e.preventDefault();
        }
        rY += (t.clientX - pMX) * 0.5;
        rX -= (t.clientY - pMY) * 0.5;
        cube.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
        pMX = t.clientX; pMY = t.clientY;
    });

    document.addEventListener('touchend', () => {
        isD = false;
        if(!hM) { if(cT) travel(cT); }
        cT = null;
    });
});