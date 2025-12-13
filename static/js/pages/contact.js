// Contact Page JavaScript
// Form validation, character counter, quick contact selection, WhatsApp integration

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Contact Form Elements
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = document.getElementById('submitBtn');
    const submitText = submitBtn.querySelector('.submit-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const charCount = document.getElementById('charCount');
    const messageInput = document.getElementById('message');

    // ========================================
    // Character Counter for Message
    // ========================================
    messageInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500`;

        if (length > 500) {
            this.value = this.value.substring(0, 500);
            charCount.textContent = '500/500';
            charCount.style.color = 'var(--accent-coral)';
        } else if (length > 450) {
            charCount.style.color = 'var(--accent-coral)';
        } else if (length > 400) {
            charCount.style.color = 'var(--accent-gold)';
        } else {
            charCount.style.color = 'var(--gray)';
        }
    });

    // ========================================
    // Quick Contact Type Selection
    // ========================================
    const quickContactBtns = document.querySelectorAll('.quick-contacts .btn');
    const subjectInput = document.getElementById('subject');

    quickContactBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            quickContactBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update subject based on selection
            const type = this.dataset.type;

            const subjects = {
                'general': this.textContent.trim().replace(/\s+/g, ' '),
                'wholesale': this.textContent.trim().replace(/\s+/g, ' '),
                'cooperation': this.textContent.trim().replace(/\s+/g, ' ')
            };

            if (subjects[type]) {
                subjectInput.value = subjects[type];
            }
        });
    });

    // ========================================
    // Form Submission with Validation
    // ========================================
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        // Show loading state
        submitText.classList.add('d-none');
        loadingSpinner.classList.remove('d-none');
        submitBtn.disabled = true;

        // Hide previous messages
        successMessage.classList.add('d-none');
        errorMessage.classList.add('d-none');

        try {
            // Simulate API call (replace with actual submission)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            successMessage.classList.remove('d-none');

            // Reset form
            this.reset();
            this.classList.remove('was-validated');
            charCount.textContent = '0/500';
            charCount.style.color = 'var(--gray)';

            // Reset quick contact buttons
            quickContactBtns.forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 0) btn.classList.add('active');
            });

        } catch (error) {
            // Show error message
            errorMessage.classList.remove('d-none');
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            submitText.classList.remove('d-none');
            loadingSpinner.classList.add('d-none');
            submitBtn.disabled = false;

            // Scroll to messages
            document.getElementById('formMessages').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });

    // ========================================
    // WhatsApp Chat Bubble
    // ========================================
    const chatBubble = document.querySelector('.chat-bubble');
    if (chatBubble) {
        chatBubble.addEventListener('click', function() {
            const phone = '998901234567';
            const message = encodeURIComponent(chatBubble.getAttribute('data-message') || 'Hello! I have a question about HomeTerry products.');
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        });
    }

    // ========================================
    // Initialize Bootstrap Tooltips
    // ========================================
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (typeof bootstrap !== 'undefined' && tooltips.length > 0) {
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }
});