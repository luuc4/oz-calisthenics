/* ============================================
   OZ Calisthenics – Modern JS functionality
   ============================================ */

/* Named constants */
const THURSDAY = 4;
const NAV_SCROLL_OFFSET = 120;
const BACK_TO_TOP_THRESHOLD = 600;
const REVEAL_THRESHOLD = 0.15;
const SUPERSAAS_FALLBACK_URL = 'https://www.supersaas.at/schedule/ozcalisthenics/Calisthenics_Foundations';
const COURSE_START_HOUR = 18;
const COURSE_END_HOUR = 20;

function getNextThursday() {
    const now = new Date();
    const day = now.getDay();
    let diff = (THURSDAY - day + 7) % 7;
    if (diff === 0) diff = 7;
    const next = new Date(now);
    next.setDate(now.getDate() + diff);
    next.setHours(0, 0, 0, 0);
    return next;
}

document.addEventListener('DOMContentLoaded', () => {
    const smallScreenMQ = window.matchMedia('(max-width: 768px)');
    const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 0. Next Thursday date
    const nextThursdayEl = document.getElementById('next-thursday');
    const nextThursday = getNextThursday();
    if (nextThursdayEl) {
        nextThursdayEl.textContent = nextThursday.toLocaleDateString('de-AT', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    // 0b. Dynamic age display
    const ageEl = document.getElementById('olcay-age');
    if (ageEl) {
        const birth = new Date(2001, 2, 30); // 30. März 2001
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        ageEl.textContent = age;
    }

    // 1. Navbar Scroll Effect + Active Link + Back-to-Top
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinksForHighlight = document.querySelectorAll('.nav-menu .nav-link:not(.btn-nav-cta)');
    let isScrollTicking = false;

    const updateNavbar = () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    };

    const updateActiveNavLink = () => {
        const scrollY = window.scrollY + NAV_SCROLL_OFFSET;
        let currentSection = '';
        sections.forEach(section => {
            const top = section.offsetTop;
            if (scrollY >= top && scrollY < top + section.offsetHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        navLinksForHighlight.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + currentSection;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    const updateBackToTop = () => {
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', window.scrollY > BACK_TO_TOP_THRESHOLD);
    };

    window.addEventListener('scroll', () => {
        if (isScrollTicking) return;
        isScrollTicking = true;
        requestAnimationFrame(() => {
            updateNavbar();
            updateActiveNavLink();
            updateBackToTop();
            isScrollTicking = false;
        });
    }, { passive: true });
    updateNavbar();
    updateActiveNavLink();
    updateBackToTop();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 2. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    const closeMenu = () => {
        if (!navMenu || !navMenu.classList.contains('active')) return;
        navMenu.classList.remove('active');
        navToggle?.classList.remove('active');
        navToggle?.setAttribute('aria-label', 'Menü öffnen');
        navToggle?.setAttribute('aria-expanded', 'false');
        navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    const toggleMenu = () => {
        if (!navMenu || !navToggle) return;
        const willOpen = !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', willOpen);
        navToggle.classList.toggle('active', willOpen);
        navToggle.setAttribute('aria-label', willOpen ? 'Menü schließen' : 'Menü öffnen');
        navToggle.setAttribute('aria-expanded', String(willOpen));
        navOverlay?.classList.toggle('active', willOpen);
        document.body.style.overflow = willOpen ? 'hidden' : '';
    };

    navToggle?.addEventListener('click', toggleMenu);
    navOverlay?.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu?.classList.contains('active')) closeMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu?.classList.contains('active')) return;
        if (!navMenu.contains(e.target) && !navToggle?.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) closeMenu();
    });

    // 3. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (smallScreenMQ.matches || reducedMotionMQ.matches || !('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: REVEAL_THRESHOLD, rootMargin: '0px 0px -50px 0px' });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 4. Contact Form (Formspree AJAX)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    function showStatus(msg, type) {
        if (!formStatus) return;
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }

    if (form && formStatus) {
        const submitBtn = form.querySelector('.send-button');
        const originalBtnText = submitBtn?.innerHTML;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.elements.name?.value.trim();
            const email = form.elements.email?.value.trim();
            const subject = form.elements.subject?.value;
            const message = form.elements.message?.value.trim();

            if (!name || !email || !subject || !message) {
                showStatus('Bitte fülle alle Pflichtfelder aus.', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.innerHTML = 'Wird gesendet...';
                submitBtn.disabled = true;
            }

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
                    const data = await response.json().catch(() => null);
                    if (data?.errors) {
                        showStatus(data.errors.map(err => err.message).join(', '), 'error');
                    } else {
                        showStatus('Fehler beim Senden. Bitte versuche es erneut.', 'error');
                    }
                }
            } catch {
                showStatus('Fehler beim Senden. Schreib direkt an zenginolcay@outlook.com', 'error');
            } finally {
                if (submitBtn && originalBtnText) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 6000);
            }
        });
    }

    // 5. Pricing Toggle (Erwachsene / Schüler)
    const pricingToggle = document.getElementById('pricing-toggle');
    const labelRegular = document.getElementById('toggle-label-regular');
    const labelStudent = document.getElementById('toggle-label-student');

    if (pricingToggle && labelRegular && labelStudent) {
        const setMode = (isStudent) => {
            pricingToggle.setAttribute('aria-checked', String(isStudent));
            labelRegular.classList.toggle('active', !isStudent);
            labelStudent.classList.toggle('active', isStudent);
            const mode = isStudent ? 'student' : 'regular';

            document.querySelectorAll('.price-value').forEach(el => {
                el.classList.add('switching');
                setTimeout(() => {
                    el.textContent = el.dataset[mode];
                    el.classList.remove('switching');
                }, 150);
            });
            document.querySelectorAll('.price-per-unit[data-regular]').forEach(el => {
                el.innerHTML = el.dataset[mode];
            });
            document.querySelectorAll('.savings-badge[data-regular]').forEach(el => {
                el.innerHTML = el.dataset[mode];
            });
        };

        labelRegular.classList.add('active');
        pricingToggle.addEventListener('click', () => {
            setMode(pricingToggle.getAttribute('aria-checked') !== 'true');
        });
        labelRegular.addEventListener('click', () => setMode(false));
        labelStudent.addEventListener('click', () => setMode(true));
    }

    // 6. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 7. Subject prefill (from pricing cards via data-subject)
    document.querySelectorAll('[data-subject]').forEach(link => {
        link.addEventListener('click', () => {
            const select = document.getElementById('subject');
            if (select) select.value = link.dataset.subject;
        });
    });

    // 8. SuperSaaS widget init + booking buttons
    const initSuperSaaS = () => {
        if (window.supersaas_823188 || typeof SuperSaaS === 'undefined') return;
        window.supersaas_823188 = new SuperSaaS(
            '620626:ozcalisthenics',
            '823188:calisthenics',
            { view: 'card', autoselect: 'first_available', domain: 'www.supersaas.de' }
        );
    };

    const ssScript = document.getElementById('supersaas-script');
    if (ssScript) {
        if (typeof SuperSaaS !== 'undefined') {
            initSuperSaaS();
        } else {
            ssScript.addEventListener('load', initSuperSaaS);
        }
    }

    const openBooking = (e) => {
        e.preventDefault();
        if (window.supersaas_823188) {
            window.supersaas_823188.show();
        } else {
            window.open(SUPERSAAS_FALLBACK_URL, '_blank', 'noopener');
        }
    };

    document.querySelectorAll('.btn-booking').forEach(btn => {
        btn.addEventListener('click', openBooking);
    });

    // 9. iCal Download (add Thursday course to calendar)
    const icsBtn = document.getElementById('add-to-calendar');
    if (icsBtn) {
        const pad = (n) => String(n).padStart(2, '0');
        const toICSDate = (d) => (
            d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
            'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'
        );
        icsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const start = new Date(nextThursday);
            start.setHours(COURSE_START_HOUR, 0, 0, 0);
            const end = new Date(nextThursday);
            end.setHours(COURSE_END_HOUR, 0, 0, 0);
            const stamp = toICSDate(new Date());
            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//OZ Calisthenics//DE',
                'CALSCALE:GREGORIAN',
                'BEGIN:VEVENT',
                `UID:${start.getTime()}@oz-calisthenics.at`,
                `DTSTAMP:${stamp}`,
                `DTSTART:${toICSDate(start)}`,
                `DTEND:${toICSDate(end)}`,
                'RRULE:FREQ=WEEKLY;BYDAY=TH',
                'SUMMARY:OZ Calisthenics – Skills & Workout',
                'LOCATION:Purfitness Bludenz\\, Haldenweg 2a\\, 6700 Bludenz',
                'DESCRIPTION:18:00 Skills Kurs\\n19:00 Workout Kurs\\nhttps://oz-calisthenics.at',
                'URL:https://oz-calisthenics.at',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'oz-calisthenics.ics';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }

    // 10. Reviews Carousel
    const reviewsTrack = document.getElementById('reviews-track');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const dotsContainer = document.getElementById('reviews-dots');

    if (reviewsTrack && prevBtn && nextBtn && dotsContainer) {
        const cards = reviewsTrack.querySelectorAll('.review-card');
        const totalCards = cards.length;

        const getVisibleCount = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };

        const getStep = () => {
            const gap = parseFloat(getComputedStyle(reviewsTrack).gap) || 0;
            return cards[0].offsetWidth + gap;
        };

        const currentIndex = () => Math.round(reviewsTrack.scrollLeft / getStep());

        const scrollToIndex = (index) => {
            if (!cards[index]) return;
            reviewsTrack.scrollTo({ left: getStep() * index, behavior: 'smooth' });
        };

        const buildDots = () => {
            const totalDots = Math.max(1, totalCards - getVisibleCount() + 1);
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Review ${i + 1}`);
                dot.addEventListener('click', () => scrollToIndex(i));
                dotsContainer.appendChild(dot);
            }
        };

        const updateState = () => {
            const idx = currentIndex();
            const maxIndex = Math.max(0, totalCards - getVisibleCount());
            prevBtn.disabled = idx <= 0;
            nextBtn.disabled = idx >= maxIndex;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === idx);
            });
        };

        prevBtn.addEventListener('click', () => scrollToIndex(Math.max(0, currentIndex() - 1)));
        nextBtn.addEventListener('click', () => {
            const maxIndex = totalCards - getVisibleCount();
            scrollToIndex(Math.min(maxIndex, currentIndex() + 1));
        });

        reviewsTrack.addEventListener('scroll', () => {
            requestAnimationFrame(updateState);
        }, { passive: true });

        // Keyboard navigation
        reviewsTrack.setAttribute('tabindex', '0');
        reviewsTrack.setAttribute('aria-label', 'Reviews Karussell');
        reviewsTrack.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { buildDots(); updateState(); }, 150);
        });

        buildDots();
        updateState();
    }
});
