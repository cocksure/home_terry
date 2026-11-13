// Product Detail Page JavaScript
// Product image gallery interactions and product-specific features

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Product Image Gallery
    // ========================================
    // Note: changeMainImage function is available globally from main.js
    // This file provides additional product-specific enhancements

    // ========================================
    // Thumbnail Keyboard Navigation
    // ========================================
    const thumbnails = document.querySelectorAll('.thumbnail');
    if (thumbnails.length > 0) {
        thumbnails.forEach((thumbnail, index) => {
            // Make thumbnails keyboard accessible
            thumbnail.setAttribute('tabindex', '0');
            thumbnail.setAttribute('role', 'button');

            // Add keyboard navigation
            thumbnail.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const imageUrl = this.dataset.full;
                    if (typeof changeMainImage === 'function') {
                        changeMainImage(imageUrl, this);
                    }
                }

                // Arrow key navigation
                if (e.key === 'ArrowRight' && index < thumbnails.length - 1) {
                    e.preventDefault();
                    thumbnails[index + 1].focus();
                }
                if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    thumbnails[index - 1].focus();
                }
            });
        });
    }

    // ========================================
    // Product Image Magnifier Lens
    // ========================================
    // Увеличение = реальное разрешение фото / размер на экране (от 2x до 3.5x),
    // поэтому в лупе видны настоящие пиксели снимка, а не растянутая картинка.
    const mainImage = document.getElementById('mainImage');
    if (mainImage && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const imageContainer = mainImage.parentElement;
        imageContainer.style.position = 'relative';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.cursor = 'none';

        const lens = document.createElement('div');
        lens.className = 'product-detail-lens';
        imageContainer.appendChild(lens);

        let frame = null;
        let lastEvent = null;

        const updateLens = () => {
            frame = null;
            const imgRect = mainImage.getBoundingClientRect();
            const boxRect = imageContainer.getBoundingClientRect();
            const mx = lastEvent.clientX - imgRect.left;
            const my = lastEvent.clientY - imgRect.top;

            if (mx < 0 || my < 0 || mx > imgRect.width || my > imgRect.height) {
                lens.classList.remove('active');
                return;
            }

            const zoom = Math.min(3.5, Math.max(2, (mainImage.naturalWidth || 0) / imgRect.width));
            const half = lens.offsetWidth / 2;

            lens.style.backgroundImage = `url('${mainImage.currentSrc || mainImage.src}')`;
            lens.style.backgroundSize = `${imgRect.width * zoom}px ${imgRect.height * zoom}px`;
            lens.style.backgroundPosition = `${half - mx * zoom}px ${half - my * zoom}px`;
            lens.style.left = `${lastEvent.clientX - boxRect.left}px`;
            lens.style.top = `${lastEvent.clientY - boxRect.top}px`;
            lens.classList.add('active');
        };

        imageContainer.addEventListener('mousemove', (event) => {
            lastEvent = event;
            if (!frame) frame = requestAnimationFrame(updateLens);
        });
        imageContainer.addEventListener('mouseleave', () => {
            lens.classList.remove('active');
        });
    }

});
