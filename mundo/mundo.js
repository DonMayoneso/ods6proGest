document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const worldId = urlParams.get('mundo') || 'Mundo A';

    const els = {
        title: document.getElementById('dynamic-title'),
        titleRow: document.getElementById('title-row'),
        historyBox: document.getElementById('history-box'),
        video: document.getElementById('dynamic-video'),
        vidPlaceholder: document.getElementById('video-placeholder'),
        img: document.getElementById('dynamic-img'),
        imgContainer: document.getElementById('img-container'),
        imgPlaceholder: document.getElementById('img-placeholder'),
        layoutContainer: document.getElementById('layout-container'),
        audio: document.getElementById('dynamic-audio'),
        playBtn: document.getElementById('cyber-play'),
        playIcon: document.getElementById('cyber-play').querySelector('i'),
        resetBtn: document.getElementById('cyber-reset'),
        visualizer: document.getElementById('visualizer'),
        gallerySection: document.getElementById('gallery-section'),
        galleryTrack: document.getElementById('gallery-track'),
        teamGrid: document.getElementById('team-grid'),
        btnLeeme: document.getElementById('btn-leeme'),
        pdfModal: document.getElementById('pdfModal'),
        pdfEmbed: document.getElementById('pdfEmbed'),
        downloadLink: document.getElementById('downloadLink'),
        imgModal: document.getElementById('imgModal'),
        lightboxImg: document.getElementById('lightboxImg'),
        galleryModal: document.getElementById('galleryModal'),
        galModalImg: document.getElementById('galModalImg'),
        galModalTitle: document.getElementById('galModalTitle'),
        galModalDesc: document.getElementById('galModalDesc'),
        btnCreditos: document.getElementById('btn-creditos'),
        secCreditos: document.getElementById('creditos-section'),
        closeButtons: document.querySelectorAll('.close-modal'),
        backToTop: document.getElementById('backToTop')
    };

    function typeWriterSequence(elements, speed) {
        let currentEl = 0;
        function typeNext() {
            if (currentEl >= elements.length) return;
            const el = elements[currentEl];
            const text = el.getAttribute('data-text');
            el.classList.add('typing');
            let i = 0;
            function type() {
                if (i < text.length) { el.textContent += text.charAt(i); i++; setTimeout(type, speed); } 
                else { el.classList.remove('typing'); currentEl++; typeNext(); }
            }
            type();
        }
        typeNext();
    }

    fetch('../datos.json')
        .then(res => res.json())
        .then(data => {
            const world = data.mundos.find(w => w.id === worldId);
            
            if (world) {
                if(world.themeColor) document.documentElement.style.setProperty('--text-main', world.themeColor);
                if(world.accentColor) document.documentElement.style.setProperty('--accent-color', world.accentColor);

                els.layoutContainer.classList.add(world.ubimg === "right" ? 'layout-right' : 'layout-left');
                els.titleRow.classList.add(world.ubtitle === "left" ? 'title-left' : 'title-right');

                els.title.textContent = "";
                const typeTitle = (txt, i=0) => {
                    if(i < txt.length) { els.title.textContent += txt.charAt(i); setTimeout(()=>typeTitle(txt, i+1), 60); }
                };
                typeTitle(world.titulo);

                const paragraphs = world.historia.split('\n');
                const pElements = [];
                paragraphs.forEach(pText => {
                    if(pText.trim() !== "") {
                        const p = document.createElement('p'); p.className = 'dynamic-paragraph'; p.setAttribute('data-text', pText);
                        els.historyBox.appendChild(p); pElements.push(p);
                    }
                });
                setTimeout(() => typeWriterSequence(pElements, 20), 1000);

                if (world.videoPath) {
                    els.video.querySelector('source').src = '../' + world.videoPath; els.video.load();
                    els.video.style.display = 'block'; els.vidPlaceholder.style.display = 'none';
                } else { els.vidPlaceholder.innerHTML = "<span>SIN SEÑAL DE VIDEO</span>"; }

                if (world.imagenUrl) {
                    const imgSrc = '../' + world.imagenUrl;
                    els.img.src = imgSrc; els.img.style.display = 'block'; els.imgPlaceholder.style.display = 'none';
                    els.imgContainer.onclick = () => { els.lightboxImg.src = imgSrc; els.imgModal.style.display = 'flex'; };
                }

                if (world.audioPath) {
                    els.audio.querySelector('source').src = '../' + world.audioPath; els.audio.load();
                    els.playBtn.addEventListener('click', () => {
                        if (els.audio.paused) { els.audio.play(); els.playIcon.className = 'fas fa-pause'; els.visualizer.classList.add('playing'); } 
                        else { els.audio.pause(); els.playIcon.className = 'fas fa-play'; els.visualizer.classList.remove('playing'); }
                    });
                    els.resetBtn.addEventListener('click', () => {
                        els.audio.currentTime = 0;
                        if(els.audio.paused) { els.audio.play(); els.playIcon.className = 'fas fa-pause'; els.visualizer.classList.add('playing'); }
                    });
                    els.audio.addEventListener('ended', () => { els.playIcon.className = 'fas fa-play'; els.visualizer.classList.remove('playing'); });
                }

                if(world.pdfPath) {
                    els.btnLeeme.onclick = () => { 

                        const pdfSrc = '../' + world.pdfPath;
                        els.pdfEmbed.src = pdfSrc; els.downloadLink.href = pdfSrc; els.pdfModal.style.display = "flex"; 
                    };
                } else { els.btnLeeme.style.display = 'none'; }

                if (world.galeria && world.galeria.length > 0) {
                    els.gallerySection.style.display = 'block';
                    if(world.galDirection === "reverse") els.galleryTrack.classList.add('reverse-scroll');
                    const createItem = (itemData) => {
                        const div = document.createElement('div'); div.className = 'gallery-item';
                        const img = document.createElement('img'); 

                        const galleryImgSrc = '../' + itemData.src;
                        img.src = galleryImgSrc; div.appendChild(img);
                        div.onclick = () => {
                            els.galModalImg.src = galleryImgSrc; els.galModalTitle.textContent = itemData.titulo; els.galModalDesc.textContent = itemData.desc;
                            els.galleryModal.style.display = 'flex';
                        };
                        return div;
                    };
                    world.galeria.forEach(item => els.galleryTrack.appendChild(createItem(item)));
                    for(let i=0; i<3; i++) { world.galeria.forEach(item => els.galleryTrack.appendChild(createItem(item))); }
                } else { els.gallerySection.style.display = 'none'; }

                if (world.creditos && world.creditos.length > 0) {
                    world.creditos.forEach(estudiante => {
                        const card = document.createElement('div');
                        card.className = 'student-card';

                        const avatarSrc = '../' + estudiante.foto;
                        card.innerHTML = `
                            <img src="${avatarSrc}" alt="${estudiante.nombre}" class="student-img" onerror="this.src='https://via.placeholder.com/80?text=USER'">
                            <div class="student-name">${estudiante.nombre}</div>
                            <div class="student-role">${estudiante.rol}</div>
                            <a href="${estudiante.link}" target="_blank" class="profile-btn">Ver Perfil</a>
                        `;
                        els.teamGrid.appendChild(card);
                    });
                } else { els.teamGrid.innerHTML = "<p>Información no disponible.</p>"; }

            } else { els.title.textContent = "ERROR 404"; }
        })
        .catch(err => console.error(err));

    els.btnCreditos.addEventListener('click', () => els.secCreditos.scrollIntoView({ behavior: 'smooth' }));
    els.closeButtons.forEach(btn => btn.addEventListener('click', () => document.getElementById(btn.getAttribute('data-target')).style.display = "none"));
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.style.display = "none"; });
    
    window.onscroll = () => {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            els.backToTop.style.display = "flex";
        } else {
            els.backToTop.style.display = "none";
        }
    };
    els.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});