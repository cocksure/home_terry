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
    // Product Image Zoom on Hover
    // ========================================
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        const imageContainer = mainImage.parentElement;

        imageContainer.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            mainImage.style.transformOrigin = `${x}% ${y}%`;
            mainImage.style.transform = 'scale(1.5)';
        });

        imageContainer.addEventListener('mouseleave', function() {
            mainImage.style.transform = 'scale(1)';
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