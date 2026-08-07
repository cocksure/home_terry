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
                    const imageUrl = this.querySelector('img').src;
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
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        const imageContainer = mainImage.parentElement;
        imageContainer.style.position = 'relative';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.cursor = 'none';

        const lens = document.createElement('div');
        lens.className = 'product-detail-lens';
        imageContainer.appendChild(lens);

        let naturalWidth = 0;
        let naturalHeight = 0;
        const magnifyScale = 2.2;

        const updateNaturalSize = () => {
            if (mainImage.naturalWidth && mainImage.naturalHeight) {
                naturalWidth = mainImage.naturalWidth;
                naturalHeight = mainImage.naturalHeight;
            } else {
                const preload = new Image();
                preload.src = mainImage.src;
                preload.onload = () => {
                    naturalWidth = preload.width;
                    naturalHeight = preload.height;
                };
            }
        };

        const updateLensBackground = () => {
            lens.style.backgroundImage = `url('${mainImage.src}')`;
            lens.style.backgroundSize = `${naturalWidth * magnifyScale}px ${naturalHeight * magnifyScale}px`;
        };

        updateNaturalSize();
        mainImage.addEventListener('load', () => {
            updateNaturalSize();
            updateLensBackground();
        });

        const updateLens = (event) => {
            const rect = imageContainer.getBoundingClientRect();
            const mx = event.clientX - rect.left;
            const my = event.clientY - rect.top;
            const isInside = mx > 0 && my > 0 && mx < rect.width && my < rect.height;

            if (!isInside) {
                lens.classList.remove('active');
                return;
            }

            const px = mx / rect.width;
            const py = my / rect.height;
            const bgX = Math.round((naturalWidth * magnifyScale - lens.offsetWidth) * px * -1);
            const bgY = Math.round((naturalHeight * magnifyScale - lens.offsetHeight) * py * -1);

            lens.style.left = `${mx}px`;
            lens.style.top = `${my}px`;
            lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
            lens.style.backgroundImage = `url('${mainImage.src}')`;
            lens.classList.add('active');
        };

        imageContainer.addEventListener('mouseenter', () => {
            updateLensBackground();
        });
        imageContainer.addEventListener('mousemove', updateLens);
        imageContainer.addEventListener('mouseleave', () => {
            lens.classList.remove('active');
        });
    }

    // ========================================
    // Share Buttons Functionality
    // ========================================
    const shareButtons = document.querySelectorAll('.btn[href*="facebook"], .btn[href*="twitter"], .btn[href*="telegram"], .btn[href*="whatsapp"]');
    if (shareButtons.length > 0) {
        const currentUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);

        shareButtons.forEach(button => {
            const href = button.getAttribute('href');

            if (href === '#') {
                button.addEventListener('click', function(e) {
                    e.preventDefault();

                    const icon = this.querySelector('i');
                    let shareUrl = '';

                    if (icon.classList.contains('fa-facebook-f')) {
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                    } else if (icon.classList.contains('fa-twitter')) {
                        shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`;
                    } else if (icon.classList.contains('fa-telegram-plane')) {
                        shareUrl = `https://t.me/share/url?url=${currentUrl}&text=${pageTitle}`;
                    } else if (icon.classList.contains('fa-whatsapp')) {
                        shareUrl = `https://wa.me/?text=${pageTitle}%20${currentUrl}`;
                    }

                    if (shareUrl) {
                        window.open(shareUrl, '_blank', 'width=600,height=400');
                    }
                });
            }
        });
    }

    // ========================================
    // Related Products Hover Effect
    // ========================================
    const relatedProductCards = document.querySelectorAll('.product-card');
    if (relatedProductCards.length > 0) {
        relatedProductCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
});