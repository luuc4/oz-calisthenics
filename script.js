/* ============================================
   OZ Calisthenics – JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Mobile menu toggle ----
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ---- Scroll reveal animation ----
    const revealElements = document.querySelectorAll(
        '.section-header, .card, .about-content, .kurs-card, .einzeltraining-hint, .pricing-card, .contact-info, .contact-form'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Contact form (mailto fallback) ----
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            formStatus.textContent = 'Bitte fülle alle Felder aus.';
            formStatus.className = 'form-status error';
            return;
        }

        const mailSubject = encodeURIComponent(`${subject} – ${name}`);
        const mailBody = encodeURIComponent(
            `Name: ${name}\nE-Mail: ${email}\nBetreff: ${subject}\n\n${message}`
        );
        const mailtoLink = `mailto:zenginolcay@outlook.com?subject=${mailSubject}&body=${mailBody}`;

        window.location.href = mailtoLink;

        formStatus.textContent = 'Dein E-Mail-Programm wird geöffnet...';
        formStatus.className = 'form-status success';

        setTimeout(() => {
            form.reset();
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }, 4000);
    });

    // ---- Active nav link highlight on scroll ----
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.style.color = link.getAttribute('href') === `#${id}`
                        ? 'var(--accent)'
                        : '';
                });
            }
        });
    }, {
        threshold: 0.3
    });

    sections.forEach(section => sectionObserver.observe(section));
});
