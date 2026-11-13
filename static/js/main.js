// HomeTerry Enhanced JavaScript
// Professional interactions and animations with modern effects

// ========================================
// Smooth scroll (Lenis)
// lerp вместо фиксированной длительности: прокрутка сразу откликается
// на колесо и мягко докатывается. На тач-экранах остаётся нативная.
// ========================================
let lenis = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 0.95,
    });

    (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    })(performance.now());

    window.__lenis = lenis;
}

function smoothScrollTo(target, offset = 0) {
    if (lenis) {
        lenis.scrollTo(target, { offset });
    } else {
        const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // Page Loader with Enhanced Animation
    // ========================================
    const loader = document.getElementById('pageLoader');
    if (loader) {
        const progressBar = loader.querySelector('.loading-progress-bar');
        const loaderStartTime = Date.now();
        const LOADER_THRESHOLD_MS = 300; // only show loader if page takes longer than this
        let loaderVisible = false;

        // Show loader only if loading takes more than threshold
        const showLoaderTimer = setTimeout(() => {
            loaderVisible = true;
            loader.style.opacity = '1';
            loader.style.visibility = 'visible';
        }, LOADER_THRESHOLD_MS);

        // Hide loader initially until threshold is passed
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        loader.style.transition = 'opacity 0.3s ease';

        // Fake incremental progress for feel
        let progress = 0;
        const fakeProgress = setInterval(() => {
            progress += Math.random() * 18;
            if (progress > 85) { clearInterval(fakeProgress); progress = 85; }
            if (progressBar) progressBar.style.width = progress + '%';
        }, 200);

        function hideLoader() {
            clearInterval(fakeProgress);
            clearTimeout(showLoaderTimer);
            if (progressBar) progressBar.style.width = '100%';

            if (loaderVisible) {
                // Was shown — animate out nicely
                setTimeout(() => {
                    loader.style.opacity = '0';
                    loader.style.visibility = 'hidden';
                    document.body.style.overflow = 'visible';
                }, 650);
            } else {
                // Never became visible — just ensure body scroll is enabled
                document.body.style.overflow = 'visible';
            }
        }

        window.addEventListener('load', hideLoader);
    }

    // ========================================
    // Global Scroll Handler — unified rAF updates
    // ========================================
    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('mainNavbar');
    const heroContentEl = document.querySelector('.hero-content');
    const backToTop = document.getElementById('backToTop');

    if (heroContentEl) heroContentEl.style.willChange = 'transform';

    // Нижняя граница тёмного hero: пока навбар над ним — тёмное стекло
    const darkHero = document.querySelector('body.page-home .hero-section');
    let heroBottom = 0;
    const measureHero = () => {
        heroBottom = darkHero ? darkHero.offsetTop + darkHero.offsetHeight - 70 : 0;
    };
    measureHero();
    window.addEventListener('resize', measureHero, { passive: true });

    let scrollTicking = false;
    let lastScrollY = window.pageYOffset;
    let parallaxElements = [];
    let heroShapes = [];

    function updateScrollEffects() {
        const scrolled = window.pageYOffset;

        if (scrollProgress) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgress.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
        }

        if (navbar) {
            navbar.classList.toggle('scrolled', scrolled > 30);
            navbar.classList.toggle('nav-on-dark', heroBottom > 0 && scrolled < heroBottom);

            // Прячем навбар при прокрутке вниз, показываем при прокрутке вверх
            const delta = scrolled - lastScrollY;
            const menuOpen = navbar.querySelector('.navbar-collapse.show, .dropdown-menu.show');
            if (scrolled < 160 || menuOpen || delta < -6) {
                navbar.classList.remove('nav-hidden');
            } else if (delta > 6) {
                navbar.classList.add('nav-hidden');
            }
            if (Math.abs(delta) > 6) lastScrollY = scrolled;

            if (heroContentEl && window.innerWidth >= 992 && scrolled < window.innerHeight) {
                heroContentEl.style.transform = `translate3d(0, ${scrolled * 0.18}px, 0)`;
            }
        }

        if (parallaxElements.length || heroShapes.length) {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.3;
                const yPos = -(scrolled * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });

            heroShapes.forEach((shape, index) => {
                const speed = 0.06 + (index * 0.03);
                shape.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
            });
        }

        if (backToTop) {
            const visible = scrolled > 300;
            backToTop.classList.toggle('show', visible);
            backToTop.style.opacity = visible ? '1' : '0';
        }
    }

    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;

        requestAnimationFrame(() => {
            updateScrollEffects();
            scrollTicking = false;
        });
    }, { passive: true });
    updateScrollEffects();

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
    // Parallax Effects — desktop only
    // ========================================
    function initParallax() {
        if (window.innerWidth < 768) return;

        parallaxElements = Array.from(document.querySelectorAll('.parallax-element'));
        heroShapes = Array.from(document.querySelectorAll('.hero-shape'));

        parallaxElements.forEach(el => { el.style.willChange = 'transform'; });
        heroShapes.forEach(el => { el.style.willChange = 'transform'; });
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
                button.style.boxShadow = '0 0 30px rgba(var(--accent-rgb),  0.6)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.boxShadow = '';
            });
        });
    }

    // ========================================
    // Scroll Reveal — fixed: visible elements never hidden
    // ========================================
    function initScrollReveal() {
        // Stagger delays for grid children
        document.querySelectorAll('.row.g-3, .row.g-4').forEach(row => {
            const cardCols = Array.from(row.children).filter(c =>
                c.querySelector('.card, .category-card, .feature-card')
            );
            cardCols.forEach((col, i) => {
                const el = col.querySelector('.card, .category-card, .feature-card');
                if (el && i > 0 && i <= 4) el.dataset.delay = String(i * 75);
            });
        });

        const vh = window.innerHeight;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || '0');
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                        entry.target.querySelectorAll('.stagger-element').forEach((c, i) =>
                            setTimeout(() => c.classList.add('revealed'), i * 75)
                        );
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

        // Section divider: separate observer (scaleX animation, not opacity)
        const divObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('divider-ready');
                    divObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.section-divider').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.95) {
                el.classList.add('divider-ready'); // already visible
            } else {
                divObs.observe(el);
            }
        });

        // Generic elements, including sections that already opt into reveal animation.
        document.querySelectorAll('.reveal-element, .card:not(.product-card-animated), .category-card:not(.product-card-animated), .section-title, .section-subtitle, .feature-card:not(.product-card-animated)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.92) {
                // Already in viewport on load — show immediately, no animation
                el.classList.add('revealed');
                el.querySelectorAll('.stagger-element').forEach(c => c.classList.add('revealed'));
            } else {
                el.classList.add('reveal-element');
                observer.observe(el);
            }
        });
    }

    // ========================================
    // Soft Grid Card Entrance — smooth, universal, perspective-aware
    // ========================================
    function initProductCardReveal() {
        if (typeof gsap === 'undefined') return;

        const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const cards = document.querySelectorAll('.product-card');
        if (cards.length === 0) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const card = entry.target;
                const image = card.querySelector('img.card-img-top');
                const searchIcon = card.querySelector('.product-card-search-icon');

                if (image) {
                    // Soft fade + slight zoom-out. The image is already hidden at init (see below),
                    // so there's no visible -> hidden flash. Props are cleared afterwards to restore hover.
                    gsap.fromTo(image, {
                        opacity: 0,
                        scale: 1.04,
                        transition: 'none'
                    }, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.7,
                        ease: 'power2.out',
                        clearProps: 'opacity,transform,transition'
                    });
                }

                if (searchIcon) {
                    gsap.to(searchIcon, {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: 'power3.out',
                        delay: 0.35
                    });
                }

                observerInstance.unobserve(card);
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });

        cards.forEach(card => {
            card.classList.add('product-card-animated');
            buildProductCardLens(card);
            // Hide the image up front so it fades in once instead of showing, vanishing, then fading in
            const image = card.querySelector('img.card-img-top');
            if (image) gsap.set(image, { opacity: 0 });
            observer.observe(card);
            if (!supportsHover) {
                card.classList.add('product-card-touch');
            }
        });
    }

    function buildProductCardLens(card) {
        const imageLink = card.querySelector('a > img.card-img-top');
        const existingLens = card.querySelector('.product-card-lens');

        if (imageLink) {
            const wrapper = imageLink.parentElement;
            wrapper.classList.add('product-card-image-wrap');
            wrapper.style.position = 'relative';
            wrapper.style.overflow = 'hidden';
            wrapper.style.display = 'block';

            if (!existingLens) {
                const lens = document.createElement('div');
                lens.className = 'product-card-lens';
                wrapper.appendChild(lens);
            }

            if (!card.querySelector('.product-card-search-icon')) {
                const icon = document.createElement('div');
                icon.className = 'product-card-search-icon';
                icon.setAttribute('aria-hidden', 'true');
                icon.innerHTML = '<i class="fas fa-magnifying-glass-plus"></i>';
                wrapper.appendChild(icon);
                gsap.set(icon, { y: 6, opacity: 0, scale: 0.9 });
            }

            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                initializeProductCardLensInteraction(card, wrapper, imageLink);
            }
        }
    }

    function initializeProductCardLensInteraction(card, wrapper, image) {
        const lens = wrapper.querySelector('.product-card-lens');
        if (!lens || !image) return;

        let frame = null;
        let clientX = 0;
        let clientY = 0;

        const zoomSrc = image.dataset.zoom || image.src;

        const updateLens = () => {
            const rect = wrapper.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;

            lens.style.left = `${x}px`;
            lens.style.top = `${y}px`;
            lens.style.backgroundPosition = `${px}% ${py}%`;
            lens.style.transform = `translate(-50%, -50%) scale(1)`;
            frame = null;
        };

        wrapper.addEventListener('mouseenter', () => {
            if (!lens.style.backgroundImage) lens.style.backgroundImage = `url('${zoomSrc}')`;
            lens.classList.add('active');
        });

        wrapper.addEventListener('mousemove', event => {
            clientX = event.clientX;
            clientY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(updateLens);
        });

        wrapper.addEventListener('mouseleave', () => {
            lens.classList.remove('active');
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
        });
    }

    // ========================================
    // Back to Top Button with Enhanced Animation
    // ========================================
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('animating');

            smoothScrollTo(0);

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

                    const navbarHeight = navbar ? navbar.offsetHeight : 0;

                    smoothScrollTo(target, -(navbarHeight + 20));
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
    // Advanced Form Validation
    // ========================================
    const forms = document.querySelectorAll('form:not(#contactForm)');
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
        if (!mainImage) return;

        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        if (thumbnail) thumbnail.classList.add('active');

        mainImage.style.transition = 'opacity 0.2s ease';
        mainImage.style.opacity = '0';
        const next = new Image();
        next.onload = () => {
            mainImage.src = imageUrl;
            mainImage.style.opacity = '1';
        };
        next.src = imageUrl;
    };

    // ========================================
    // Mobile Menu with Animation
    // ========================================
    function initMobileMenu() {
        const collapseEl = document.getElementById('navbarNav');
        if (!collapseEl || typeof bootstrap === 'undefined') return;
        const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });

        collapseEl.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) collapse.hide();
            });
        });

        document.addEventListener('click', e => {
            if (collapseEl.classList.contains('show') && !navbar.contains(e.target)) collapse.hide();
        });
    }

    // ========================================
    // Nav indicator: капсула скользит за курсором и возвращается к активной ссылке
    // ========================================
    function initNavIndicator() {
        const indicator = document.querySelector('.nav-indicator');
        const links = Array.from(document.querySelectorAll('.site-nav .navbar-nav .nav-link'));
        if (!indicator || !links.length) return;

        const active = links.find(l => l.classList.contains('active'));

        const moveTo = link => {
            if (!link || window.innerWidth < 992) {
                indicator.classList.remove('ready');
                return;
            }
            indicator.style.width = link.offsetWidth + 'px';
            indicator.style.transform = `translate3d(${link.offsetLeft}px, -50%, 0)`;
            indicator.classList.add('ready');
        };

        // Первая установка без анимации
        indicator.style.transition = 'none';
        moveTo(active);
        requestAnimationFrame(() => requestAnimationFrame(() => { indicator.style.transition = ''; }));

        links.forEach(link => link.addEventListener('mouseenter', () => moveTo(link)));
        links[0].closest('.nav-links-wrap').addEventListener('mouseleave', () => moveTo(active));
        window.addEventListener('resize', () => moveTo(active), { passive: true });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveTo(active));
    }

    // ========================================
    // Floating contact button
    // ========================================
    function initContactFab() {
        const fab = document.getElementById('contactFab');
        if (!fab) return;
        const btn = fab.querySelector('.contact-fab-btn');
        const items = fab.querySelectorAll('.contact-fab-item');

        const setOpen = open => {
            fab.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', String(open));
            items.forEach(a => a.tabIndex = open ? 0 : -1);
        };

        btn.addEventListener('click', () => setOpen(!fab.classList.contains('open')));
        document.addEventListener('click', e => { if (!fab.contains(e.target)) setOpen(false); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    }

    // ========================================
    // Magnetic button effect — desktop only
    // ========================================
    function initMagneticButtons() {
        if (window.innerWidth < 992) return;

        document.querySelectorAll('.btn-glow, .hero-buttons .btn, .btn-pulse').forEach(btn => {
            let rect = null;
            let animationScheduled = false;
            const pointer = { x: 0, y: 0 };

            btn.addEventListener('mouseenter', () => {
                rect = btn.getBoundingClientRect();
                btn.style.transition = 'transform 0.08s ease';
            });

            btn.addEventListener('mousemove', e => {
                pointer.x = e.clientX;
                pointer.y = e.clientY;

                if (animationScheduled) return;
                animationScheduled = true;

                requestAnimationFrame(() => {
                    if (!rect) rect = btn.getBoundingClientRect();
                    const dx = (pointer.x - (rect.left + rect.width / 2)) * 0.28;
                    const dy = (pointer.y - (rect.top + rect.height / 2)) * 0.28;
                    btn.style.transform = `translate3d(${dx}px, ${dy}px, 0) translateY(-2px)`;
                    animationScheduled = false;
                });
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.style.transform = '';
                rect = null;
                animationScheduled = false;
            });
        });
    }

    // ========================================
    // Page entrance animation
    // ========================================
    function initPageEntrance() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Только то, что видно при загрузке: остальное проявляет initScrollReveal при прокрутке.
        // Иначе карточки ниже экрана «появлялись» невидимо при загрузке, а потом анимировались второй раз.
        const vh = window.innerHeight;
        const entranceElements = Array.from(document.querySelectorAll(
            '.category-card, .feature-card, .department-card, .contact-card, .form-floating-custom'
        )).filter(el => el.getBoundingClientRect().top < vh * 0.92);

        entranceElements.forEach((el, index) => {
            el.classList.add('page-enter');
            el.style.setProperty('--enter-delay', `${index * 0.05}s`);
        });

        requestAnimationFrame(() => {
            document.body.classList.add('page-enter-active');
        });
    }

    // ========================================
    // Initialize all effects
    // ========================================
    function initializeEffects() {
        initPageEntrance();
        initProductCardReveal();
        initLazyLoading();
        initScrollReveal();
        animateCounter();
        initParallax();
        initFloatingCards();
        initGlowButtons();
        initMobileMenu();
        initNavIndicator();
        initContactFab();
        initMagneticButtons();
    }

    // Start initialization
    initializeEffects();

    // ========================================
    // Console Easter Egg
    // ========================================
    console.log('%c🏠 HomeTerry Premium', 'color: var(--primary-turquoise); font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
    console.log('%c✨ Modern E-commerce Experience', 'color: var(--dark-turquoise); font-size: 16px;');
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
    
    /* Scroll reveal classes — defer to style.css for the real definitions */
    /* This block intentionally left minimal to avoid overriding CSS */
    
    /* Loading animation */
    .loading-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--light-turquoise), var(--primary-turquoise));
        width: 0%;
        transition: width 0.8s ease;
    }
    
    /* Form validation styles */
    .is-valid {
        border-color: var(--primary-turquoise) !important;
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
        color: var(--primary-turquoise);
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
        border-top-color: var(--primary-turquoise);
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
