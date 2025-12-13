// About Page JavaScript
// Counter animations, card hover effects, timeline interactions

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Animated Statistics Counters
    // ========================================
    // Note: This uses the global counter animation from main.js
    // No need to duplicate the function here, it's called automatically

    // ========================================
    // Enhanced Hover Effects for Feature Cards
    // ========================================
    const valueCards = document.querySelectorAll('.feature-card');
    if (valueCards.length > 0) {
        valueCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // ========================================
    // Interactive Timeline Items
    // ========================================
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        timelineItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all items
                timelineItems.forEach(i => i.classList.remove('active'));

                // Add active class to clicked item
                this.classList.add('active');

                // Add visual feedback
                this.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
    }

    // ========================================
    // Process Steps Animation on Scroll
    // ========================================
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const processObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    processObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        processSteps.forEach(step => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(30px)';
            step.style.transition = 'all 0.6s ease';
            processObserver.observe(step);
        });
    }

    // ========================================
    // Stat Cards Animation
    // ========================================
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
        statCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.05)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
});