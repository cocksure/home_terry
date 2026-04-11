// HomeTerry Enhanced JavaScript
// Professional interactions and animations with modern effects

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Page Loader with Enhanced Animation
    // ========================================
    const loader = document.getElementById('pageLoader');
    if (loader) {
        // Create enhanced loader if not exists
        if (!loader.querySelector('.loading-progress')) {
            loader.innerHTML = `
                <div class="loading-logo">HomeTerry</div>
                <div class="spinner"></div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
            `;
        }

        window.addEventListener('load', function() {
            // Animate progress bar
            const progressBar = loader.querySelector('.loading-progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }

            // Hide loader after animation
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                document.body.style.overflow = 'visible';
            }, 800);
        });
    }

    // ========================================
    // Navbar Scroll Effect with Parallax
    // ========================================
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Add/remove scrolled class
            if (scrollTop > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Navbar always stays visible
            navbar.style.transform = 'translateY(0)';

            // Parallax effect for hero elements
            const heroContent = document.querySelector('.hero-content');
            if (heroContent && scrollTop < window.innerHeight) {
                const scrolled = scrollTop * 0.5;
                heroContent.style.transform = `translateY(${scrolled}px)`;
            }
        });
    }

    // ========================================
    // Animated Counter
    // ========================================
    function animateCounter() {
        const counters = document.querySelectorAll('.stat-number');
        if (counters.length === 0) return;

        counters.forEach(counter => {
            const target = +counter.getAttribute('data-count');
            const increment = target / 60;
            let current = 0;

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            counter.textContent = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    updateCounter();
                    observer.unobserve(counter);
                }
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    // ========================================
    // Parallax Effects
    // ========================================
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-element, .floating-card');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.3;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            // Parallax for hero shapes
            const shapes = document.querySelectorAll('.hero-shape');
            shapes.forEach((shape, index) => {
                const speed = 0.1 + (index * 0.05);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // ========================================
    // Floating Cards Animation
    // ========================================
    function initFloatingCards() {
        const cards = document.querySelectorAll('.floating-card');

        cards.forEach((card, index) => {
            // Set initial random position for natural look
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            const randomDelay = index * 0.2;

            card.style.setProperty('--random-x', `${randomX}px`);
            card.style.setProperty('--random-y', `${randomY}px`);
            card.style.animationDelay = `${randomDelay}s`;

            // Interactive rotation on hover
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.1) rotate(5deg)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    }

    // ========================================
    // Glow Button Effects
    // ========================================
    function initGlowButtons() {
        const glowButtons = document.querySelectorAll('.btn-glow');

        glowButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.boxShadow = '0 0 30px rgba(0, 206, 209, 0.6)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.boxShadow = '';
            });
        });
    }

    // ========================================
    // Enhanced Scroll Reveal Animation
    // ========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-element, .card, .category-card, .section-title, .feature-card');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');

                        // Staggered animation for children
                        const childElements = entry.target.querySelectorAll('.stagger-element');
                        childElements.forEach((child, childIndex) => {
                            setTimeout(() => {
                                child.classList.add('revealed');
                            }, childIndex * 100);
                        });
                    }, index * 100);

                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        revealElements.forEach(el => {
            el.classList.add('reveal-element');
            revealObserver.observe(el);
        });
    }

    // ========================================
    // Back to Top Button with Enhanced Animation
    // ========================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
                backToTop.style.opacity = '1';
            } else {
                backToTop.classList.remove('show');
                backToTop.style.opacity = '0';
            }
        });

        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('animating');

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            setTimeout(() => {
                this.classList.remove('animating');
            }, 1000);
        });
    }

    // ========================================
    // Smooth Scroll for Anchor Links with Offset
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#!') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    // Calculate offset for navbar
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const targetPosition = target.offsetTop - navbarHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ========================================
    // Lazy Loading Images with Blur Effect
    // ========================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Add blur effect while loading
                    img.style.filter = 'blur(5px)';

                    // Load image
                    img.src = img.dataset.src;

                    // Remove blur when loaded
                    img.onload = () => {
                        img.classList.add('loaded');
                        img.style.filter = 'blur(0)';
                        img.style.transition = 'filter 0.5s ease';
                    };

                    observer.unobserve(img);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '200px'
        });

        images.forEach(img => {
            // Add low-res placeholder if not exists
            if (!img.src && img.dataset.lowres) {
                img.src = img.dataset.lowres;
            }
            imageObserver.observe(img);
        });
    }

    // ========================================
    // Enhanced Card Hover Effects with 3D
    // ========================================
    function init3DCards() {
        const cards = document.querySelectorAll('.product-card-3d, .card');

        cards.forEach(card => {
            // Store original transform
            const originalTransform = card.style.transform;

            card.addEventListener('mousemove', (e) => {
                if (!card.classList.contains('product-card-3d')) return;

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateY = ((x - centerX) / centerX) * 5;
                const rotateX = ((centerY - y) / centerY) * 5;

                card.style.transform = `${originalTransform} perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = originalTransform;
                card.style.transition = 'transform 0.5s ease';
            });

            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.2s ease';
            });
        });
    }

    // ========================================
    // Advanced Form Validation
    // ========================================
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Add floating label effect
        const floatInputs = form.querySelectorAll('.float-input');
        floatInputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });

            // Check initial value
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
            });

            input.addEventListener('blur', function() {
                validateField(this, true);
            });
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showNotification('Please check the form for errors', 'error');
                // Scroll to first error
                const firstError = this.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    });

    function validateField(field, showError = false) {
        field.classList.remove('is-valid', 'is-invalid');

        if (!field.value.trim() && field.hasAttribute('required')) {
            if (showError) {
                field.classList.add('is-invalid');
            }
            return false;
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        // Phone validation
        if (field.name.includes('phone') && field.value) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        if (field.value) {
            field.classList.add('is-valid');
        }

        return true;
    }

    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (!validateField(field, true)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // ========================================
    // Advanced Notification System
    // ========================================
    window.showNotification = function(message, type = 'success', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => {
            if (notification.getAttribute('data-type') === type) {
                notification.remove();
            }
        });

        const notification = document.createElement('div');
        notification.className = `custom-notification ${type}`;
        notification.setAttribute('data-type', type);
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            min-width: 300px;
            padding: 15px 20px;
            border-radius: 10px;
            background: ${type === 'error' ? '#f8d7da' : '#d1e7dd'};
            color: ${type === 'error' ? '#842029' : '#0f5132'};
            border: 1px solid ${type === 'error' ? '#f5c2c7' : '#badbcc'};
            box-shadow: var(--shadow-lg);
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

        notification.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} me-3"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close btn-sm" 
                        onclick="this.closest('.custom-notification').style.transform='translateX(120%)'; 
                                 setTimeout(() => this.closest('.custom-notification').remove(), 300);">
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        const timeout = setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        // Pause on hover
        notification.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
        });

        notification.addEventListener('mouseleave', () => {
            setTimeout(() => {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => notification.remove(), 300);
            }, 1000);
        });
    };

    // ========================================
    // Enhanced Product Image Gallery
    // ========================================
    window.changeMainImage = function(imageUrl, thumbnail) {
        const mainImage = document.getElementById('mainImage');
        const imageContainer = mainImage ? mainImage.parentElement : null;

        if (mainImage && imageContainer) {
            // Create new image element
            const newImage = new Image();
            newImage.src = imageUrl;
            newImage.className = 'gallery-image';
            newImage.style.opacity = '0';
            newImage.style.position = 'absolute';
            newImage.style.top = '0';
            newImage.style.left = '0';
            newImage.style.width = '100%';
            newImage.style.height = '100%';
            newImage.style.objectFit = 'cover';
            newImage.style.transition = 'opacity 0.3s ease';

            // Add to container
            imageContainer.appendChild(newImage);

            // Fade in new image
            setTimeout(() => {
                newImage.style.opacity = '1';
            }, 10);

            // Remove old image after transition
            setTimeout(() => {
                if (mainImage.parentElement === imageContainer) {
                    mainImage.remove();
                }
                newImage.id = 'mainImage';
                newImage.removeAttribute('style');
            }, 300);

            // Update active thumbnail with animation
            document.querySelectorAll('.thumbnail').forEach(t => {
                t.classList.remove('active');
                t.style.transform = 'scale(0.9)';
            });

            if (thumbnail) {
                thumbnail.classList.add('active');
                thumbnail.style.transform = 'scale(1.1)';

                // Add click effect
                thumbnail.style.animation = 'thumbnailClick 0.3s ease';
                setTimeout(() => {
                    thumbnail.style.animation = '';
                }, 300);
            }
        }
    };

    // ========================================
    // Mobile Menu with Animation
    // ========================================
    function initMobileMenu() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        if (navbarToggler && navbarCollapse) {
            navbarToggler.addEventListener('click', () => {
                const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';

                // Animate hamburger icon
                const icon = navbarToggler.querySelector('.navbar-toggler-icon');
                if (icon) {
                    icon.style.transition = 'transform 0.3s ease';
                    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
                }
            });

            // Close menu on link click with animation
            const navLinks = navbarCollapse.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 992) {
                        // Animate out
                        navbarCollapse.style.transform = 'translateX(100%)';
                        navbarCollapse.style.opacity = '0';

                        setTimeout(() => {
                            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                            if (bsCollapse) {
                                bsCollapse.hide();
                            }
                            // Reset styles
                            navbarCollapse.style.transform = '';
                            navbarCollapse.style.opacity = '';
                        }, 300);
                    }
                });
            });
        }
    }

    // ========================================
    // Initialize all effects
    // ========================================
    function initializeEffects() {
        // Initialize in order
        initLazyLoading();
        initScrollReveal();
        animateCounter();
        initParallax();
        init3DCards();
        initFloatingCards();
        initGlowButtons();
        initMobileMenu();
    }

    // Start initialization
    initializeEffects();

    // ========================================
    // Console Easter Egg
    // ========================================
    console.log('%c🏠 HomeTerry Premium', 'color: #00CED1; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
    console.log('%c✨ Modern E-commerce Experience', 'color: #00A5A8; font-size: 16px;');
    console.log('%cMade with ❤️ and cutting-edge animations', 'color: #6B7280; font-size: 14px;');

    // Performance monitoring
    window.addEventListener('load', () => {
        const timing = performance.getEntriesByType('navigation')[0];
        console.log(`Page loaded in ${timing.loadEventEnd - timing.fetchStart}ms`);
    });
});

// ========================================
// Global Animations CSS
// ========================================
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    /* Enhanced Animations */
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(var(--random-x, 0)) translateY(var(--random-y, 0));
        }
        50% {
            transform: translateY(-20px) translateX(var(--random-x, 0)) translateY(var(--random-y, 0));
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }
    
    @keyframes shake {
        0%, 100% {
            transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
        }
        20%, 40%, 60%, 80% {
            transform: translateX(5px);
        }
    }
    
    @keyframes thumbnailClick {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1.1);
        }
    }
    
    @keyframes gradient-shift {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }
    
    /* Scroll reveal classes */
    .reveal-element {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .reveal-element.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    .stagger-element {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .stagger-element.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Loading animation */
    .loading-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #7FFFD4, #00CED1);
        width: 0%;
        transition: width 0.8s ease;
    }
    
    /* Form validation styles */
    .is-valid {
        border-color: #00CED1 !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2300CED1' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e") !important;
    }
    
    .is-invalid {
        border-color: #ff6b6b !important;
        animation: shake 0.5s ease;
    }
    
    .float-input {
        position: relative;
    }
    
    .float-input label {
        position: absolute;
        top: 50%;
        left: 15px;
        transform: translateY(-50%);
        transition: all 0.3s ease;
        color: #6B7280;
        pointer-events: none;
    }
    
    .float-input.focused label,
    .float-input input:focus + label,
    .float-input input:not(:placeholder-shown) + label {
        top: -10px;
        left: 10px;
        font-size: 0.8rem;
        color: #00CED1;
        background: white;
        padding: 0 5px;
    }
    
    /* Custom tooltip */
    .custom-tooltip .tooltip-inner {
        background: var(--turquoise-gradient);
        color: white;
        border-radius: 10px;
        padding: 8px 12px;
        box-shadow: var(--shadow-md);
    }
    
    .custom-tooltip .tooltip-arrow::before {
        border-top-color: #00CED1;
    }
    
    /* Mobile filter animation */
    .filter-section {
        transition: max-height 0.3s ease;
    }
    
    /* Image load animation */
    .gallery-image {
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(enhancedStyles);