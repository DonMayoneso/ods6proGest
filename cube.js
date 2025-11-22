document.addEventListener('DOMContentLoaded', () => {
    // INYECCIÓN DINÁMICA DE DATOS EN EL CUBO
    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            const mundos = data.mundos; 
            const faces = document.querySelectorAll('.face');
            
            faces.forEach((face, index) => {
                if (mundos[index]) {
                    const world = mundos[index];
                    face.setAttribute('data-world', world.id);
                    
                    const img = face.querySelector('.world-bg');
                    if(img) img.src = world.imagenUrl;
                    
                    const title = face.querySelector('.world-title');
                    if(title) title.textContent = world.titulo;
                }
            });
        })
        .catch(error => console.error('Error cargando datos.json:', error));

    // PANELES COLAPSABLES
    function setupPanel(panelId, btnId) {
        const panel = document.getElementById(panelId), btn = document.getElementById(btnId), icon = btn.querySelector('i');
        btn.addEventListener('click', e => { 
            e.stopPropagation(); 
            panel.classList.toggle('collapsed'); 
            icon.className = panel.classList.contains('collapsed') ? 'fas fa-plus' : 'fas fa-minus'; 
        });
        panel.addEventListener('mousedown', e => e.stopPropagation()); 
        panel.addEventListener('touchstart', e => e.stopPropagation());
    }
    setupPanel('water-panel', 'min-water'); 
    setupPanel('mascot-panel', 'min-mascot');

    // FOOTER MOVIL
    const footer = document.getElementById('main-footer'), ftBtn = document.getElementById('footer-toggle'), ftIcon = ftBtn.querySelector('i');
    ftBtn.addEventListener('click', () => { 
        footer.classList.toggle('visible'); 
        ftIcon.className = footer.classList.contains('visible') ? 'fas fa-chevron-down' : 'fas fa-chevron-up'; 
    });

    // FRASES MASCOTA
    const phrases = ["El agua es la fuerza motriz de toda la naturaleza.", "Sin agua azul, no hay verde.", "Cuidar el agua es cuidar la vida.", "Miles han vivido sin amor, ni uno solo sin agua.", "El 70% de tu cuerpo es agua, ¡cuídala!", "La escasez afecta al 40% de la población."];
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

    // DATOS AGUA
    const waterFill = document.getElementById('waterFill'), alarmLayer = document.getElementById('alarmLayer'), progressBarFill = document.getElementById('progress-bar-fill'), liveLCD = document.getElementById('live-consumption');
    const FWP = 2.5; 
    setTimeout(() => { 
        const yPos = 2200 - (2200 * (FWP / 100)); 
        waterFill.setAttribute('y', yPos); 
        alarmLayer.setAttribute('y', yPos); 
        progressBarFill.style.width = `${FWP}%`; 
    }, 500);
    
    const TAV = 4750000000, msPY = 365*24*60*60*1000, rPMs = TAV / msPY;
    setInterval(() => { 
        const now=new Date(), sOY=new Date(now.getFullYear(),0,1), msPYr=now-sOY; 
        let cY=msPYr*rPMs; 
        cY+=((Math.random()*1000)-500); 
        liveLCD.textContent=Math.floor(cY).toLocaleString('en-US'); 
    }, 150);

    // CUBO & VIAJE
    const cube = document.querySelector('.cube'), mC = document.getElementById('orbit-controls'), tBtn = document.getElementById('toggle-rotation'), tIcon = tBtn.querySelector('i'), tTxt = tBtn.querySelector('span'), sT = document.getElementById('spaceTravel'), tT = document.querySelector('.travel-text');
    let isD=false, isAR=true, pMX=0, pMY=0, rX=-15, rY=15, sMX=0, sMY=0, hM=false, cT=null;
    
    tBtn.addEventListener('click', e => { 
        isAR = !isAR; 
        tIcon.className = isAR?'fas fa-pause':'fas fa-play'; 
        tTxt.textContent = isAR?'PAUSAR ORBITA':'REANUDAR ORBITA'; 
        e.stopPropagation(); 
    });
    
    function animR() { 
        if(!isD && isAR) { 
            rX+=0.05; rY+=0.08; 
            cube.style.transform=`rotateX(${rX}deg) rotateY(${rY}deg)`; 
        } 
        requestAnimationFrame(animR); 
    } 
    animR();
    
    function travel(f) { 
        let n=f.getAttribute('data-world'); 
        sT.style.display='block'; 
        createStars(); 
        setTimeout(()=>{tT.textContent="Viajando a "+n+"...";tT.style.opacity=1;},500); 
        // Redirección a la subcarpeta nave/
        setTimeout(()=>window.location.href='nave/nave.html?mundo='+encodeURIComponent(n),3000); 
    }
    
    function createStars() { 
        sT.innerHTML=''; 
        sT.appendChild(tT); 
        for(let i=0;i<150;i++){ 
            let s=document.createElement('div');s.className='star'; 
            let sz=Math.random()*3;s.style.width=sz+'px';s.style.height=sz+'px'; 
            s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%'; 
            s.style.animation=`moveStar ${1+Math.random()*2}s linear infinite`; 
            sT.appendChild(s); 
        } 
        if(!document.getElementById('st-style')){ 
            let st=document.createElement('style');st.id='st-style'; 
            st.textContent='@keyframes moveStar { 0% { transform: translateZ(0); opacity: 1; } 100% { transform: translateZ(1000px); opacity: 0; } }'; 
            document.head.appendChild(st); 
        }
    }

    mC.addEventListener('mousedown', e=>{isD=true;hM=false;sMX=e.clientX;sMY=e.clientY;pMX=e.clientX;pMY=e.clientY;cT=e.target.closest('.face');mC.style.cursor='grabbing';});
    document.addEventListener('mousemove', e=>{if(!isD)return;if(Math.abs(e.clientX-sMX)>5||Math.abs(e.clientY-sMY)>5){hM=true;cT=null;}rY+=(e.clientX-pMX)*0.3;rX-=(e.clientY-pMY)*0.3;cube.style.transform=`rotateX(${rX}deg) rotateY(${rY}deg)`;pMX=e.clientX;pMY=e.clientY;});
    document.addEventListener('mouseup', ()=>{isD=false;mC.style.cursor='grab';if(!hM&&cT)travel(cT);cT=null;});

    mC.addEventListener('touchstart', e=>{isD=true;hM=false;let t=e.touches[0];sMX=t.clientX;sMY=t.clientY;pMX=t.clientX;pMY=t.clientY;cT=e.target.closest('.face');});
    document.addEventListener('touchmove', e=>{if(!isD)return;let t=e.touches[0];if(Math.abs(t.clientX-sMX)>5||Math.abs(t.clientY-sMY)>5){hM=true;cT=null;e.preventDefault();}rY+=(t.clientX-pMX)*0.5;rX-=(t.clientY-pMY)*0.5;cube.style.transform=`rotateX(${rX}deg) rotateY(${rY}deg)`;pMX=t.clientX;pMY=t.clientY;});
    document.addEventListener('touchend', ()=>{isD=false;if(!hM){if(cT)travel(cT);}cT=null;});
});