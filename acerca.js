document.addEventListener('DOMContentLoaded', () => {
    // Elementos del Lightbox
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('lightboxImg');
    const closeModal = document.querySelector('.close-modal');
    
    // Seleccionar todas las imágenes que activan el lightbox
    const triggers = document.querySelectorAll('.lightbox-trigger');

    // Función abrir modal
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const img = trigger.querySelector('img');
            if (img) {
                modal.style.display = 'flex';
                modalImg.src = img.src;
            }
        });
    });

    // Función cerrar modal (Botón X)
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Función cerrar modal (Click fuera de la imagen)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
});