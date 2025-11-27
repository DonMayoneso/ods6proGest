document.addEventListener('DOMContentLoaded', () => {
    
    // LÓGICA LIGHTBOX
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('lightboxImg');
    const closeModal = document.querySelector('.close-modal');
    const triggers = document.querySelectorAll('.lightbox-trigger');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const img = trigger.querySelector('img');
            if (img) {
                modal.style.display = 'flex';
                modalImg.src = img.src;
            }
        });
    });

    closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) { modal.style.display = 'none'; }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });


    // LÓGICA TYPEWRITER

    function typeWriterSequence(elements, speed = 15) {
        let currentEl = 0;
        
        function typeNext() {
            if (currentEl >= elements.length) return;
            
            const el = elements[currentEl];
            const text = el.getAttribute('data-text-content');
            el.innerHTML = '';
            el.classList.add('typing');
            
            let i = 0;
            function type() {
                if (i < text.length) {
                    el.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    el.classList.remove('typing');
                    currentEl++;
                    typeNext();
                }
            }
            type();
        }
        typeNext();
    }

    // Inicializar
    const textBlocks = document.querySelectorAll('.text-content');

    textBlocks.forEach(block => {
        const paragraphs = block.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            
            const originalText = p.textContent;
            p.setAttribute('data-text-content', originalText);
            p.innerHTML = '';
            p.style.minHeight = '1.4em';
        });

        setTimeout(() => {
            typeWriterSequence(paragraphs, 20);
        }, 500);
    });

});