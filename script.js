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


    // 4. Contact Form Handler (Mailto fallback)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = form.querySelector('.send-button');
    const originalBtnText = submitBtn.innerHTML;

    form.addEventListener('submit', (e) => {
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

        // Simulate loading state
        submitBtn.innerHTML = 'Wird gesendet...';
        submitBtn.disabled = true;

        // Construct mailto link
        const mailSubject = encodeURIComponent(`[Website Anfrage] ${subject} von ${name}`);
        const mailBody = encodeURIComponent(
            `Name: ${name}\nE-Mail: ${email}\nBetreff: ${subject}\n\n--- Nachricht ---\n\n${message}`
        );
        const mailtoLink = `mailto:zenginolcay@outlook.com?subject=${mailSubject}&body=${mailBody}`;

        // Small delay to simulate processing before opening mail client
        setTimeout(() => {
            window.location.href = mailtoLink;
            
            showStatus('Dein E-Mail-Programm wird geöffnet. Bitte sende die Nachricht dort ab.', 'success');
            form.reset();
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Clear success message after a while
            setTimeout(() => { formStatus.textContent = ''; }, 6000);
        }, 1000);
    });

    function showStatus(msg, type) {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }
});
