// === CLEAN, STABLE, AND OPTIMIZED VERSION ===

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) disableAOS();
    initNavigation();
    initScrollEffects();
    initAnimations();
    initFormHandling();
    initLazyLoading();
});

// === NAVIGATION ===
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!navToggle || !navMenu) {
        console.error('Navigation elements missing');
        return;
    }

    // Toggle mobile menu
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active', isActive);
        document.body.classList.toggle('menu-open', isActive);
    });

    // Close on outside click or ESC
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

    // Reset menu on refresh
    closeMenu();

    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// === SCROLL EFFECTS ===
function initScrollEffects() {
    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    // Fade-in on scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// === AOS / ANIMATIONS ===
function initAnimations() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            disable: window.innerWidth <= 768
        });
    }

    // Disable heavy animations for mobile
    if (window.innerWidth <= 768) disableAnimations();

    // Plan card hover
    document.querySelectorAll('.plan-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-8px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });
}

function disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        * { animation: none !important; transition: none !important; }
        html, body, .hero { overflow-x: hidden !important; width: 100%; }
        .hero-particles, .hero-overlay, .hero-background { display: none !important; }
    `;
    document.head.appendChild(style);
}

function disableAOS() {
    if (typeof AOS !== 'undefined') AOS.init({ disable: true });
}

// === FORM HANDLING ===
function initFormHandling() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const valid = [...form.elements].every(el => !el.required || validateField(el));
        if (!valid) return;

        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            form.reset();
        }, 2000);
    });

    form.querySelectorAll('input[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const val = field.value.trim();
    let err = '';

    if (field.required && !val) err = `${getFieldLabel(field.name)} is required.`;
    if (field.name === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        err = 'Please enter a valid email.';
    if (field.name === 'phone' && val && !/^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/\s/g, '')))
        err = 'Please enter a valid phone number.';

    err ? showFieldError(field, err) : clearFieldError(field);
    return !err;
}

function getFieldLabel(name) {
    return { name: 'Name', email: 'Email', phone: 'Phone', message: 'Message' }[name] || name;
}

function showFieldError(f, msg) {
    clearFieldError(f);
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = msg;
    f.style.borderColor = '#ef4444';
    f.parentNode.appendChild(err);
}
function clearFieldError(f) {
    const err = f.parentNode.querySelector('.field-error');
    if (err) err.remove();
    f.style.borderColor = '';
}

// === NOTIFICATIONS ===
function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    n.querySelector('.notification-close').onclick = () => n.remove();
    Object.assign(n.style, {
        position: 'fixed', top: '20px', right: '20px',
        background: type === 'success' ? '#10b981' : '#3b82f6',
        color: '#fff', padding: '1rem 1.5rem', borderRadius: '0.5rem',
        zIndex: '10000', display: 'flex', alignItems: 'center',
        gap: '1rem', maxWidth: '400px', animation: 'slideInRight 0.3s ease-out'
    });
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 5000);
}

// === LAZY LOADING ===
function initLazyLoading() {
    const imgs = document.querySelectorAll('img[data-src]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const img = e.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                obs.unobserve(img);
            }
        });
    });
    imgs.forEach(img => obs.observe(img));
}

// === CSS INJECTION (ONCE) ===
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight { from {transform: translateX(100%);opacity:0;} to {transform: translateX(0);opacity:1;} }
.notification { animation: slideInRight 0.3s ease-out; }
.field-error { color:#ef4444; font-size:0.875rem; margin-top:0.25rem; }
.lazy { opacity:0; transition:opacity 0.3s; }
.lazy.loaded { opacity:1; }
`;
document.head.appendChild(style);
