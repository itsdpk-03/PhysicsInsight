/* ============================================================
   Physics Insight — UI Components
   Navbar, Footer, and reusable UI components
   ============================================================ */

const Components = (() => {

    /* ----------------------------------------------------------
       NAVBAR
    ---------------------------------------------------------- */
    function renderNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        navbar.innerHTML = `
            <div class="navbar-inner container">
                <a href="#/" class="navbar-brand" id="nav-brand">
                    <div class="brand-atom">
                        <div class="brand-nucleus"></div>
                        <div class="brand-orbit"><div class="brand-electron"></div></div>
                    </div>
                    <span class="brand-text">Physics Insight</span>
                </a>

                <ul class="navbar-links" id="nav-links">
                    <li><a href="#/" class="nav-link" data-route="/" id="nav-home">
                        <span data-i18n="nav.home">Home</span>
                    </a></li>
                    <li class="nav-dropdown">
                        <a href="#/chapters/11" class="nav-link nav-dropdown-trigger" data-route="/chapters" id="nav-chapters">
                            <span data-i18n="nav.chapters">Chapters</span>
                            <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                        <ul class="nav-dropdown-menu">
                            <li><a href="#/chapters/11" class="nav-link" data-route="/chapters/11" id="nav-grade11">
                                <span data-i18n="nav.grade11">Grade 11</span>
                            </a></li>
                            <li><a href="#/chapters/12" class="nav-link" data-route="/chapters/12" id="nav-grade12">
                                <span data-i18n="nav.grade12">Grade 12</span>
                            </a></li>
                        </ul>
                    </li>
                    <li><a href="#/quiz" class="nav-link" data-route="/quiz" id="nav-quiz">
                        <span data-i18n="nav.quiz">Daily Quiz</span>
                        <span class="nav-badge pulse-badge">Live</span>
                    </a></li>
                    <li><a href="#/mock" class="nav-link" data-route="/mock" id="nav-mock">
                        <span data-i18n="nav.mockTests">Mock Tests</span>
                    </a></li>
                    <li><a href="#/feedback" class="nav-link" data-route="/feedback" id="nav-feedback">
                        <span data-i18n="nav.feedback">Feedback</span>
                    </a></li>
                    <li><a href="#/about" class="nav-link" data-route="/about" id="nav-about">
                        <span data-i18n="nav.about">About</span>
                    </a></li>
                </ul>

                <div class="navbar-actions">
                    <button class="lang-toggle" id="lang-toggle" aria-label="Toggle language" title="Switch language">
                        <span class="lang-option ${I18n.getLang() === 'en' ? 'active' : ''}" data-lang="en">EN</span>
                        <span class="lang-divider">/</span>
                        <span class="lang-option ${I18n.getLang() === 'np' ? 'active' : ''}" data-lang="np">ने</span>
                    </button>
                    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Switch theme">
                        <svg class="theme-icon theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        <svg class="theme-icon theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>
            </div>
        `;

        // Bind events
        bindNavbarEvents();
        updateActiveNavLink();
    }

    function bindNavbarEvents() {
        // Theme toggle
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        // Language toggle
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                I18n.toggleLanguage();
                updateLangToggle();
                // Re-render current page
                if (typeof App !== 'undefined' && App.refreshPage) {
                    App.refreshPage();
                }
            });
        }

        // Hamburger menu
        const hamburger = document.getElementById('nav-hamburger');
        const overlay = document.getElementById('mobile-overlay');
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileNav);
        }
        if (overlay) {
            overlay.addEventListener('click', closeMobileNav);
        }

        // Close mobile nav on link click
        document.querySelectorAll('.navbar-links .nav-link').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        // Navbar scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;
            const currentScroll = window.scrollY;

            if (currentScroll > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('pi_theme', next);

        // Update meta theme color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = next === 'dark' ? '#0a0a1a' : '#f8fafc';
        }
    }

    function initTheme() {
        const saved = localStorage.getItem('pi_theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
                metaTheme.content = saved === 'dark' ? '#0a0a1a' : '#f8fafc';
            }
        }
    }

    function updateLangToggle() {
        const lang = I18n.getLang();
        document.querySelectorAll('.lang-option').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-lang') === lang);
        });
    }

    function toggleMobileNav() {
        const links = document.getElementById('nav-links');
        const hamburger = document.getElementById('nav-hamburger');
        const overlay = document.getElementById('mobile-overlay');
        const isOpen = links.classList.contains('open');

        links.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', !isOpen);
        overlay.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    }

    function closeMobileNav() {
        const links = document.getElementById('nav-links');
        const hamburger = document.getElementById('nav-hamburger');
        const overlay = document.getElementById('mobile-overlay');

        links?.classList.remove('open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
        overlay?.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    function updateActiveNavLink() {
        const hash = window.location.hash || '#/';
        const route = hash.replace('#', '');

        document.querySelectorAll('.nav-link').forEach(link => {
            const linkRoute = link.getAttribute('data-route');
            if (!linkRoute) return;

            const isActive = route === linkRoute ||
                (linkRoute !== '/' && route.startsWith(linkRoute));
            link.classList.toggle('active', isActive);
        });
    }

    /* ----------------------------------------------------------
       FOOTER
    ---------------------------------------------------------- */
    function renderFooter() {
        const footer = document.getElementById('footer');
        if (!footer) return;

        footer.innerHTML = `
            <div class="footer-wave">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,70 1440,80 L1440,120 L0,120 Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="footer-content container">
                <div class="footer-grid">
                    <div class="footer-brand-section">
                        <a href="#/" class="footer-brand">
                            <div class="brand-atom">
                                <div class="brand-nucleus"></div>
                                <div class="brand-orbit"><div class="brand-electron"></div></div>
                            </div>
                            <span class="brand-text">Physics Insight</span>
                        </a>
                        <p class="footer-tagline" data-i18n="home.heroSubtitle">Your gateway to mastering NEB Physics</p>
                        <div class="footer-social">
                            <a href="https://www.facebook.com/PhysicsInsight0/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook" id="footer-facebook-link">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="footer-links-section">
                        <h4 class="footer-heading" data-i18n="common.quickLinks">Quick Links</h4>
                        <ul class="footer-link-list">
                            <li><a href="#/chapters/11" data-i18n="nav.grade11">Grade 11</a></li>
                            <li><a href="#/chapters/12" data-i18n="nav.grade12">Grade 12</a></li>
                            <li><a href="#/quiz" data-i18n="nav.quiz">Daily Quiz</a></li>
                            <li><a href="#/mock" data-i18n="nav.mockTests">Mock Tests</a></li>
                        </ul>
                    </div>

                    <div class="footer-links-section">
                        <h4 class="footer-heading" data-i18n="common.support">Support</h4>
                        <ul class="footer-link-list">
                            <li><a href="#/feedback" data-i18n="nav.feedback">Feedback</a></li>
                            <li><a href="#/about" data-i18n="nav.about">About</a></li>
                            <li><a href="https://www.facebook.com/PhysicsInsight0/" target="_blank" rel="noopener noreferrer" data-i18n="common.contactUs">Contact Us</a></li>
                        </ul>
                    </div>

                    <div class="footer-connect-section">
                        <h4 class="footer-heading" data-i18n="about.connectTitle">Connect With Us</h4>
                        <div class="fb-embed-container">
                            <iframe 
                                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FPhysicsInsight0%2F&tabs=timeline&width=280&height=300&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
                                width="280" 
                                height="300" 
                                style="border:none;overflow:hidden" 
                                scrolling="no" 
                                frameborder="0" 
                                allowfullscreen="true" 
                                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                loading="lazy"
                                title="Physics Insight Facebook Page">
                            </iframe>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p class="footer-copyright">
                        © ${new Date().getFullYear()} Physics Insight. <span data-i18n="common.copyright">All rights reserved.</span>
                    </p>
                    <p class="footer-made-with">
                        <span data-i18n="common.madeWith">Made with</span> 
                        <span class="heart">❤️</span> 
                        <span data-i18n="common.forStudents">for NEB students</span>
                    </p>
                </div>
            </div>
        `;
    }

    /* ----------------------------------------------------------
       SCROLL TO TOP BUTTON
    ---------------------------------------------------------- */
    function initScrollToTop() {
        const btn = document.getElementById('scroll-top-btn');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ----------------------------------------------------------
       SCROLL ANIMATIONS (Intersection Observer)
    ---------------------------------------------------------- */
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /* ----------------------------------------------------------
       ANIMATED COUNTER
    ---------------------------------------------------------- */
    function animateCounter(el, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);

            el.textContent = current + (el.getAttribute('data-suffix') || '');

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target + (el.getAttribute('data-suffix') || '');
            }
        }

        requestAnimationFrame(update);
    }

    /* ----------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------- */
    return {
        renderNavbar,
        renderFooter,
        updateActiveNavLink,
        initScrollToTop,
        initScrollAnimations,
        animateCounter,
        initTheme,
        closeMobileNav,
        updateLangToggle
    };
})();
