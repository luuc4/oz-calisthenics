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
    let isScrollTicking = false;

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', () => {
        if (isScrollTicking) return;
        isScrollTicking = true;
        requestAnimationFrame(() => {
            onScroll();
            updateActiveNavLink();
            updateBackToTop();
            isScrollTicking = false;
        });
    }, { passive: true });
    onScroll(); // Initial check


    // 2. Modern Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        const isOpen = navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
        document.body.style.overflow = isOpen ? 'hidden' : '';
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


    // 3. Active Nav Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-menu .nav-link:not(.btn-nav-cta)');

    function updateActiveNavLink() {
        const scrollY = window.scrollY + 120;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinksForHighlight.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
        });
    }
    updateActiveNavLink();


    // 4. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (isSmallScreen || prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }


    // 5. Contact Form Handler (Formspree AJAX)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (form && formStatus) {
        const submitBtn = form.querySelector('.send-button');
        const originalBtnText = submitBtn.innerHTML;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subjectSelect = document.getElementById('subject');
            const subject = subjectSelect.options[subjectSelect.selectedIndex].value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                showStatus('Bitte fülle alle Pflichtfelder aus.', 'error');
                return;
            }

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


    // 6. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    function updateBackToTop() {
        if (!backToTopBtn) return;
        backToTopBtn.classList.toggle('visible', window.scrollY > 600);
    }
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        updateBackToTop();
    }


    // 7. Pricing Toggle (Erwachsene / Schüler)
    const pricingToggle = document.getElementById('pricing-toggle');
    const labelRegular = document.getElementById('toggle-label-regular');
    const labelStudent = document.getElementById('toggle-label-student');

    if (pricingToggle) {
        labelRegular.classList.add('active');

        pricingToggle.addEventListener('click', () => {
            const isStudent = pricingToggle.getAttribute('aria-checked') === 'false';
            pricingToggle.setAttribute('aria-checked', isStudent);

            labelRegular.classList.toggle('active', !isStudent);
            labelStudent.classList.toggle('active', isStudent);

            const mode = isStudent ? 'student' : 'regular';

            // Animate price values
            document.querySelectorAll('.price-value').forEach(el => {
                el.classList.add('switching');
                setTimeout(() => {
                    el.textContent = el.dataset[mode];
                    el.classList.remove('switching');
                }, 150);
            });

            // Update per-unit prices and savings badges
            document.querySelectorAll('.price-per-unit[data-regular]').forEach(el => {
                el.innerHTML = el.dataset[mode];
            });
            document.querySelectorAll('.savings-badge[data-regular]').forEach(el => {
                el.innerHTML = el.dataset[mode];
            });
        });
    }


    // 8. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all other items
            faqItems.forEach(other => other.classList.remove('open'));
            // Toggle current
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });


    // 9. Subject selector helper (used by pricing cards)
    window.selectSubject = function(value) {
        const select = document.getElementById('subject');
        if (select) select.value = value;
    };
});
