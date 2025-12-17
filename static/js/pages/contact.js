// Contact Page JavaScript
// Form validation, character counter, quick contact selection, WhatsApp integration

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Contact Form Elements
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const submitText = submitBtn.querySelector('.submit-text');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const charCount = document.getElementById('charCount');
    const messageInput = document.getElementById('message');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const subjectInput = document.getElementById('subject');
    const privacyCheckbox = document.getElementById('privacyPolicy');

    // ========================================
    // CSRF Token Helper
    // ========================================
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // ========================================
    // Phone Input Mask - Автоматическое форматирование номера
    // ========================================
    if (typeof IMask !== 'undefined' && phoneInput) {
        const phoneMask = IMask(phoneInput, {
            mask: '+998 00 000 00 00',
            lazy: false,  // Показывать маску всегда
            placeholderChar: '_'
        });

        // Обновляем значение для валидации
        phoneInput.addEventListener('blur', function() {
            const unmasked = phoneMask.unmaskedValue;
            if (unmasked.length === 12) { // +998 + 9 цифр
                phoneInput.value = '+998' + unmasked.slice(3);
            }
        });
    }

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
    // Custom Validation Messages
    // ========================================
    function showValidationError(field, message) {
        field.classList.add('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }

        // Прокрутить к первому ошибочному полю
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function validateForm() {
        // Сбросить предыдущие ошибки
        contactForm.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });

        // Проверка имени
        if (!nameInput.value.trim()) {
            showValidationError(nameInput, '❌ Пожалуйста, введите ваше имя');
            return false;
        }

        // Проверка телефона
        const phoneValue = phoneInput.value.replace(/\s/g, '');
        if (!phoneValue || phoneValue.length < 13) {
            showValidationError(phoneInput, '❌ Введите правильный номер телефона в формате +998 XX XXX XX XX');
            return false;
        }

        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
            showValidationError(emailInput, '❌ Введите правильный email адрес (например: example@mail.com)');
            return false;
        }

        // Проверка темы
        if (!subjectInput.value.trim()) {
            showValidationError(subjectInput, '❌ Пожалуйста, укажите тему сообщения');
            return false;
        }

        // Проверка сообщения
        if (!messageInput.value.trim()) {
            showValidationError(messageInput, '❌ Пожалуйста, напишите ваше сообщение');
            return false;
        }

        // Проверка чекбокса согласия
        if (!privacyCheckbox.checked) {
            const checkboxParent = privacyCheckbox.parentElement;
            checkboxParent.classList.add('text-danger');
            checkboxParent.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Показать alert
            setTimeout(() => {
                alert('⚠️ Пожалуйста, примите политику конфиденциальности и дайте согласие на обработку персональных данных');
                checkboxParent.classList.remove('text-danger');
            }, 300);
            return false;
        }

        return true;
    }

    // ========================================
    // Form Submission with Validation
    // ========================================
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Используем нашу кастомную валидацию
        if (!validateForm()) {
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
            // Get active contact type for smart routing
            const activeBtn = document.querySelector('.quick-contacts .btn.active');
            const contactType = activeBtn ? activeBtn.dataset.type : 'general';

            // Prepare form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                type: contactType  // Smart routing: general, wholesale, cooperation
            };

            // Получаем CSRF токен для безопасности
            const csrfToken = getCookie('csrftoken');

            // Send to server
            const response = await fetch('/api/submit-contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка отправки');
            }

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