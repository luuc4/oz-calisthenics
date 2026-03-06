/* ============================================
   OZ Calisthenics – Modern JS functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 0. Next Thursday date
    const nextThursdayEl = document.getElementById('next-thursday');
    if (nextThursdayEl) {
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 4=Thu
        let diff = (4 - day + 7) % 7;
        if (diff === 0) diff = 7; // if today is Thursday, show next week
        const next = new Date(now);
        next.setDate(now.getDate() + diff);
        nextThursdayEl.textContent = next.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // 1. Navbar Scroll Effect (Blur on scroll)
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    let isScrollTicking = false;
    window.addEventListener('scroll', () => {
        if (isScrollTicking) return;
        isScrollTicking = true;
        requestAnimationFrame(() => {
            onScroll();
            isScrollTicking = false;
        });
    }, { passive: true });
    onScroll(); // Initial check


    // 2. Modern Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        // Prevent scrolling body when menu is open on mobile
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    navToggle.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            toggleMenu();
        }
    });


    // 3. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (isSmallScreen || prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve after revealing once for better performance
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15, // Trigger when 15% of element is visible
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters viewport
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }


    // 4. Contact Form Handler (Formspree AJAX)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (form && formStatus) {
        const submitBtn = form.querySelector('.send-button');
        const originalBtnText = submitBtn.innerHTML;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Basic validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subjectSelect = document.getElementById('subject');
            const subject = subjectSelect.options[subjectSelect.selectedIndex].value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                showStatus('Bitte fülle alle Pflichtfelder aus.', 'error');
                return;
            }

            // Loading state
            submitBtn.innerHTML = 'Wird gesendet...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showStatus('Nachricht erfolgreich gesendet!', 'success');
                    form.reset();
                } else {
                    const data = await response.json();
                    if (data && Object.prototype.hasOwnProperty.call(data, 'errors')) {
                        showStatus(data.errors.map(err => err.message).join(', '), 'error');
                    } else {
                        showStatus('Fehler beim Senden. Bitte versuche es erneut.', 'error');
                    }
                }
            } catch {
                showStatus('Fehler beim Senden. Schreib direkt an zenginolcay@outlook.com', 'error');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 6000);
            }
        });
    }

    function showStatus(msg, type) {
        if (!formStatus) return;
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }
});
