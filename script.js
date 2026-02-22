/* ============================================
   OZ Calisthenics – Modern JS functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navbar Scroll Effect (Blur on scroll)
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
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


    // 4. Contact Form Handler (Formspree AJAX)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
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
                if (Object.hasOwn(data, 'errors')) {
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
            setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status'; }, 6000);
        }
    });

    function showStatus(msg, type) {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }
});
