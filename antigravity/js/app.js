/* ============================================================
   Physics Insight — Core App Router & Controller (SPA)
   ============================================================ */

const App = (() => {
    let currentRoute = '/';
    let currentParams = {};
    let grade11Data = null;
    let grade12Data = null;
    let quizPool = null;

    /**
     * Initialize the Application.
     */
    async function init() {
        // Init theme first to avoid flash
        Components.initTheme();

        // Init Translations
        await I18n.init();

        // Render Navbar and Footer
        Components.renderNavbar();
        Components.renderFooter();
        Components.initScrollToTop();

        // Load curriculum indices
        try {
            const [g11, g12, pool] = await Promise.all([
                fetch('data/grade11/chapters.json').then(r => r.json()),
                fetch('data/grade12/chapters.json').then(r => r.json()),
                fetch('data/quiz/pool.json').then(r => r.json())
            ]);
            grade11Data = g11;
            grade12Data = g12;
            quizPool = pool.questions;
        } catch (err) {
            console.error('App: Failed to load syllabus content.', err);
        }

        // Listen for route changes
        window.addEventListener('hashchange', handleRouteChange);
        
        // Listen for language changes to update page content dynamically
        window.addEventListener('languageChanged', () => {
            I18n.updateDOM();
            Components.renderNavbar();
            Components.renderFooter();
            refreshPage();
        });

        // Trigger initial route
        handleRouteChange();

        // Remove initial loader if present
        const loader = document.getElementById('initial-loader');
        if (loader) loader.remove();
    }

    /**
     * Handle Hash Route changes.
     */
    function handleRouteChange() {
        const hash = window.location.hash || '#/';
        const parsed = parseHash(hash);
        currentRoute = parsed.route;
        currentParams = parsed.params;

        // Clean up any running quiz timers
        QuizEngine.destroy();

        // Collapse mobile nav if open
        Components.closeMobileNav();

        // Update active classes on navbar links
        Components.updateActiveNavLink();

        // Render the page
        renderPage();

        // Scroll to top
        window.scrollTo(0, 0);

        // Bind scroll animations
        setTimeout(Components.initScrollAnimations, 100);
    }

    /**
     * Refresh the current active page without changing hashes.
     */
    function refreshPage() {
        renderPage();
    }

    /**
     * Parse Hash string.
     * e.g., "#/chapter/11/physical-quantities" -> { route: "/chapter/:grade/:slug", params: { grade: "11", slug: "physical-quantities" } }
     */
    function parseHash(hash) {
        const cleanHash = hash.replace('#', '');
        const segments = cleanHash.split('/').filter(Boolean);

        if (segments.length === 0) {
            return { route: '/', params: {} };
        }

        // Match patterns
        if (segments[0] === 'chapters') {
            return { route: '/chapters', params: { grade: segments[1] || '11' } };
        }
        if (segments[0] === 'chapter') {
            return { route: '/chapter', params: { grade: segments[1], slug: segments[2] } };
        }
        if (segments[0] === 'quiz') {
            return { route: '/quiz', params: {} };
        }
        if (segments[0] === 'mock') {
            if (segments.length === 1) {
                return { route: '/mock', params: {} };
            }
            return { route: '/mock/test', params: { type: segments[1], id: segments[2] } };
        }
        if (segments[0] === 'feedback') {
            return { route: '/feedback', params: {} };
        }
        if (segments[0] === 'about') {
            return { route: '/about', params: {} };
        }

        return { route: '/', params: {} };
    }

    /**
     * Render the active page into main app container.
     */
    function renderPage() {
        const app = document.getElementById('app');
        if (!app) return;

        switch (currentRoute) {
            case '/':
                app.innerHTML = renderHome();
                // Trigger stats counting animation
                setTimeout(() => {
                    const stats = [
                        { id: 'stat-ch', val: 51 },
                        { id: 'stat-q', val: 500 },
                        { id: 'stat-mock', val: 12 }
                    ];
                    stats.forEach(s => {
                        const el = document.getElementById(s.id);
                        if (el) Components.animateCounter(el, s.val);
                    });
                }, 200);
                break;

            case '/chapters':
                app.innerHTML = renderChapters(currentParams.grade);
                bindChaptersEvents(currentParams.grade);
                break;

            case '/chapter':
                loadAndRenderChapter(currentParams.grade, currentParams.slug);
                break;

            case '/quiz':
                app.innerHTML = renderQuizIntro();
                break;

            case '/mock':
                app.innerHTML = renderMockHub();
                break;

            case '/mock/test':
                loadAndRenderMockTest(currentParams.type, currentParams.id);
                break;

            case '/feedback':
                app.innerHTML = Feedback.renderPage();
                // Embed form placeholder. User can put a real google form URL here
                Feedback.setGoogleForm('https://docs.google.com/forms/d/e/1FAIpQLSc62J772xLhL_qKz9K0rU0-c2l15jX1yE-v85yO1wL9y5X1yE/viewform?embedded=true');
                break;

            case '/about':
                app.innerHTML = renderAbout();
                break;

            default:
                app.innerHTML = `<div class="container"><h1 class="text-center mb-4">404 - Not Found</h1></div>`;
        }

        // Apply translations
        I18n.updateDOM();
    }

    /* ============================================================
       PAGE RENDERERS
       ============================================================ */

    /* ----------------------------------------------------------
       HOME PAGE
    ---------------------------------------------------------- */
    function renderHome() {
        return `
            <div class="home-page">
                <!-- Hero Section -->
                <section class="hero container page-enter">
                    <div class="hero-grid">
                        <div class="hero-content">
                            <h1 class="hero-title"><span class="text-gradient" data-i18n="home.heroTitle">Master Physics Conceptually</span></h1>
                            <p class="hero-subtitle" data-i18n="home.heroSubtitle">Master NEB Grade 11 & 12 Physics. Solve important questions, take daily quiz tests, and ace your IOE & IOM entrance tests.</p>
                            <div class="hero-buttons">
                                <a href="#/chapters/11" class="btn-primary">
                                    <span data-i18n="home.ctaChapters">Start Learning</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </a>
                                <a href="#/quiz" class="btn-secondary">
                                    <span data-i18n="home.ctaQuiz">Take Quiz Now</span>
                                </a>
                            </div>
                        </div>
                        <div class="hero-visual">
                            <div class="hero-atom animate-float">
                                <div class="hero-nucleus"></div>
                                <div class="hero-orbit hero-orbit-1"></div>
                                <div class="hero-orbit hero-orbit-2"></div>
                                <div class="hero-orbit hero-orbit-3"></div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Stats Counters Section -->
                <section class="stats-section">
                    <div class="container">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number" id="stat-ch" data-suffix="+">0</div>
                                <div class="stat-label" data-i18n="home.statsChapters">Chapters Covered</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="stat-q" data-suffix="+">0</div>
                                <div class="stat-label" data-i18n="home.statsQuestions">Practice Questions</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="stat-mock" data-suffix="+">0</div>
                                <div class="stat-label" data-i18n="home.statsMockTests">Mock Tests Completed</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features-section container animate-on-scroll">
                    <h2 class="section-title text-center mb-5" data-i18n="home.featuresTitle">Why Physics Insight?</h2>
                    <div class="features-grid">
                        <div class="feature-card glass-card">
                            <div class="feature-icon">🌐</div>
                            <h3 class="feature-title" data-i18n="home.feature1Title">Bilingual Syllabus</h3>
                            <p class="feature-desc" data-i18n="home.feature1Desc">Seamlessly toggle between English and Nepali Devanagari translation for all topics, equations, and solutions.</p>
                        </div>
                        <div class="feature-card glass-card">
                            <div class="feature-icon">🎯</div>
                            <h3 class="feature-title" data-i18n="home.feature2Title">Entrance Preparation</h3>
                            <p class="feature-desc" data-i18n="home.feature2Desc">Specially curated mock entrance series conforming to IOE and MEC standards with marking guidelines.</p>
                        </div>
                        <div class="feature-card glass-card">
                            <div class="feature-icon">📝</div>
                            <h3 class="feature-title" data-i18n="home.feature3Title">Important Questions</h3>
                            <p class="feature-desc" data-i18n="home.feature3Desc">Chapterwise long questions, short conceptual questions, and solved numerical problems targeting NEB board exams.</p>
                        </div>
                        <div class="feature-card glass-card">
                            <div class="feature-icon">⚡</div>
                            <h3 class="feature-title" data-i18n="home.feature4Title">Extensible & Active</h3>
                            <p class="feature-desc" data-i18n="home.feature4Desc">Continuous updates based on recent syllabi, student feedback, and custom requests submitted directly to us.</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    /* ----------------------------------------------------------
       CHAPTERS PAGE
    ---------------------------------------------------------- */
    function renderChapters(grade) {
        const data = parseInt(grade) === 12 ? grade12Data : grade11Data;
        if (!data) return `<div class="loader-container"><div class="atom-loader"><div class="atom-nucleus"></div></div></div>`;

        const titleKey = parseInt(grade) === 12 ? 'chapters.grade12Title' : 'chapters.grade11Title';

        return `
            <div class="chapters-page container page-enter">
                <div class="chapters-header">
                    <h1 class="page-title" data-i18n="${titleKey}">Syllabus</h1>
                    <div class="chapters-filters">
                        <div class="search-container">
                            <input type="text" class="search-input" id="chapter-search" placeholder="Search chapters or units..." data-i18n-attr="placeholder" data-i18n="chapters.searchPlaceholder">
                            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                </div>

                <div class="syllabus-list" id="syllabus-list">
                    ${data.units.map((unit, index) => {
                        const unitName = I18n.getBilingual(unit.name);
                        return `
                            <div class="unit-accordion open" data-unit-id="${index}">
                                <button class="unit-header" aria-expanded="true">
                                    <div class="unit-title-group">
                                        <h3 class="unit-title">${unitName}</h3>
                                        <span class="unit-badge">${unit.chapters.length} ${unit.chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                                    </div>
                                    <svg class="unit-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                                <div class="unit-content">
                                    <div class="chapters-grid">
                                        ${unit.chapters.map(ch => {
                                            const chTitle = I18n.getBilingual(ch.title);
                                            // Check if we have sample content for this chapter (ch.questionCount > 0)
                                            const hasContent = ch.questionCount > 0;
                                            const link = hasContent ? `#/chapter/${grade}/${ch.slug}` : 'javascript:alert(\'Full content for this chapter is coming soon!\')';
                                            return `
                                                <div class="chapter-card glass-card" data-title="${chTitle.toLowerCase()}" data-unit="${unitName.toLowerCase()}">
                                                    <div class="chapter-header-info">
                                                        <span class="chapter-num">Chapter ${ch.id}</span>
                                                        <h4 class="chapter-title">${chTitle}</h4>
                                                    </div>
                                                    <div class="chapter-meta">
                                                        <span class="chapter-q-badge">${ch.questionCount} ${I18n.t('chapters.questionsCount')}</span>
                                                        <a href="${link}" class="btn-secondary btn-sm" ${!hasContent ? 'style="opacity: 0.5"' : ''}>
                                                            <span data-i18n="chapters.viewChapter">View</span>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function bindChaptersEvents(grade) {
        // Search filter
        const search = document.getElementById('chapter-search');
        if (search) {
            search.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                document.querySelectorAll('.chapter-card').forEach(card => {
                    const title = card.getAttribute('data-title');
                    const unit = card.getAttribute('data-unit');
                    const matches = title.includes(query) || unit.includes(query);
                    card.style.display = matches ? 'flex' : 'none';
                });

                // Hide units with no matching chapters
                document.querySelectorAll('.unit-accordion').forEach(accordion => {
                    const visibleCards = accordion.querySelectorAll('.chapter-card[style="display: flex"]').length;
                    const totalCards = accordion.querySelectorAll('.chapter-card').length;
                    
                    // If searching, hide accordion headers if zero match
                    if (query !== '') {
                        accordion.style.display = visibleCards > 0 ? 'block' : 'none';
                    } else {
                        accordion.style.display = 'block';
                    }
                });
            });
        }

        // Accordion toggle
        document.querySelectorAll('.unit-header').forEach(header => {
            header.addEventListener('click', () => {
                const accordion = header.closest('.unit-accordion');
                const content = accordion.querySelector('.unit-content');
                const isOpen = accordion.classList.contains('open');

                accordion.classList.toggle('open');
                header.setAttribute('aria-expanded', !isOpen);
                
                if (!isOpen) {
                    content.style.maxHeight = '1500px';
                } else {
                    content.style.maxHeight = '0px';
                }
            });
        });
    }

    /* ----------------------------------------------------------
       CHAPTER DETAIL VIEW
    ---------------------------------------------------------- */
    async function loadAndRenderChapter(grade, slug) {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `<div class="loader-container"><div class="atom-loader"><div class="atom-nucleus"></div></div></div>`;

        try {
            const path = `data/grade${grade}/ch${getChapterNumberFromSlug(grade, slug)}-${slug}.json`;
            const ch = await fetch(path).then(r => r.json());
            
            const unitName = I18n.getBilingual(ch.unit);
            const chTitle = I18n.getBilingual(ch.title);

            app.innerHTML = `
                <div class="chapter-detail-page container page-enter">
                    <a href="#/chapters/${grade}" class="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span data-i18n="chapter.backToChapters">Back to Chapters</span>
                    </a>

                    <div class="chapter-hero">
                        <div class="chapter-badge-row">
                            <span class="detail-badge detail-badge-grade">Grade ${grade}</span>
                            <span class="detail-badge detail-badge-unit">${unitName}</span>
                        </div>
                        <h1 class="page-title">${chTitle}</h1>
                    </div>

                    <div class="chapter-tabs">
                        <button class="tab-btn active" data-tab="theory" data-i18n="chapter.topics">Key Topics</button>
                        <button class="tab-btn" data-tab="questions" data-i18n="chapter.importantQuestions">Solved Questions</button>
                    </div>

                    <div class="tab-content">
                        <!-- Theory Tab -->
                        <div class="tab-pane active" id="tab-theory">
                            ${ch.topics.map(topic => {
                                const topicTitle = I18n.getBilingual(topic.title);
                                const topicContent = I18n.getBilingual(topic.content);
                                return `
                                    <div class="topic-card">
                                        <h3 class="topic-title">${topicTitle}</h3>
                                        <p class="topic-content">${topicContent}</p>
                                        ${topic.formulas && topic.formulas.length > 0 ? `
                                            <div class="formulas-list">
                                                <h4 class="formula-heading" data-i18n="chapter.formula">Formulas</h4>
                                                ${topic.formulas.map(formula => `
                                                    <div class="formula-box">${formula}</div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <!-- Questions Tab -->
                        <div class="tab-pane" id="tab-questions">
                            <div class="questions-list">
                                ${ch.importantQuestions.map(q => {
                                    const qText = I18n.getBilingual(q.question);
                                    const solText = I18n.getBilingual(q.solution);
                                    
                                    let badgeClass = 'q-badge-short';
                                    if (q.type === 'long') badgeClass = 'q-badge-long';
                                    if (q.type === 'numerical') badgeClass = 'q-badge-numerical';

                                    const typeNameKey = `chapter.${q.type}Question`;

                                    return `
                                        <div class="question-card" id="q-card-${q.id}">
                                            <div class="question-header">
                                                <div class="question-info">
                                                    <div class="question-meta-row">
                                                        <span class="q-badge ${badgeClass}" data-i18n="${typeNameKey}">${q.type}</span>
                                                        <span class="q-badge q-badge-marks">${q.marks} <span data-i18n="chapter.marks">marks</span></span>
                                                    </div>
                                                    <p class="question-text">${qText}</p>
                                                </div>
                                                <button class="btn-primary solution-toggle-btn" onclick="document.getElementById('q-card-${q.id}').classList.toggle('expanded')">
                                                    <span data-i18n="chapter.showSolution">Solution</span>
                                                    <svg class="dropdown-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </button>
                                            </div>
                                            <div class="solution-panel">
                                                <div class="solution-body">
                                                    <h4 class="solution-title" data-i18n="chapter.showSolution">Solution</h4>
                                                    <div class="solution-content">${solText.replace(/\n/g, '<br/>')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Bind tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

                    btn.classList.add('active');
                    const tabId = `tab-${btn.getAttribute('data-tab')}`;
                    document.getElementById(tabId).classList.add('active');
                });
            });

            I18n.updateDOM();

        } catch (err) {
            console.error('App: Failed to load chapter content.', err);
            app.innerHTML = `<div class="container text-center"><p data-i18n="common.error">Failed to load content.</p></div>`;
        }
    }

    function getChapterNumberFromSlug(grade, slug) {
        const data = parseInt(grade) === 12 ? grade12Data : grade11Data;
        const found = data.units.flatMap(u => u.chapters).find(c => c.slug === slug);
        return found ? found.id : 1;
    }

    /* ----------------------------------------------------------
       DAILY QUIZ PAGE INTRO & SETUP
    ---------------------------------------------------------- */
    function renderQuizIntro() {
        // Check streak
        const streak = QuizEngine.getStreak();

        // Check if already completed today
        const completedToday = streak.completedToday;

        setTimeout(() => {
            document.getElementById('start-quiz-btn')?.addEventListener('click', startDailyQuiz);
        }, 50);

        return `
            <div class="quiz-intro-page container page-enter">
                <div class="results-container text-center">
                    <h1 class="mb-2" data-i18n="quiz.dailyQuizTitle">Daily Quiz</h1>
                    <p class="mb-4" data-i18n="quiz.dailyQuizDesc">Sharpen your physics concepts every day. 10 questions, 60 seconds per question with explanations.</p>
                    
                    <div class="streak-badge glass-card mb-4" style="display:inline-flex; align-items:center; gap:12px; padding:16px 32px;">
                        <span style="font-size:2.5rem;">🔥</span>
                        <div style="text-align:left;">
                            <h4 style="margin:0;"><span data-i18n="quiz.streak">Streak</span>: ${streak.count}</h4>
                            <small class="text-muted">Play daily to grow your streak!</small>
                        </div>
                    </div>

                    <div class="quiz-intro-actions">
                        ${completedToday ? `
                            <p class="mb-4 text-gradient" style="font-weight:700;" data-i18n="quiz.tryAgainTomorrow">Come back tomorrow for a new set of questions!</p>
                            <button class="btn-secondary" onclick="window.location.hash = '#/'">Back to Home</button>
                        ` : `
                            <button class="btn-primary" id="start-quiz-btn" data-i18n="quiz.startQuiz">Start Today's Quiz</button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    function startDailyQuiz() {
        if (!quizPool || quizPool.length === 0) {
            alert('Quiz pool is not loaded yet.');
            return;
        }

        const todayQuestions = QuizEngine.getDailyQuestions(quizPool, 10);
        
        QuizEngine.init(todayQuestions, {
            containerId: 'app',
            perQuestionTime: 60,
            showInstantFeedback: true,
            mode: 'quiz',
            title: I18n.t('quiz.dailyQuizTitle'),
            onComplete: (results) => {
                // Update streak count
                QuizEngine.updateStreak();
            }
        });
    }

    /* ----------------------------------------------------------
       MOCK TEST HUB
    ---------------------------------------------------------- */
    function renderMockHub() {
        // Fetch stats
        const engStats = QuizEngine.getMockStats('engineering', '1');
        const medStats = QuizEngine.getMockStats('medical', '1');

        return `
            <div class="mock-hub container page-enter">
                <h1 class="page-title text-center mb-1" data-i18n="mock.title">Mock Test Hub</h1>
                <p class="text-center text-muted mb-4">Simulate real board and university entrance exams under timed conditions.</p>

                <div class="mock-grid">
                    <!-- Engineering (IOE) -->
                    <div class="mock-card glass-card mock-card-engineering">
                        <div class="mock-card-header">
                            <div class="mock-type-icon">⚙️</div>
                            <h2 class="mock-title" data-i18n="mock.engineeringTitle">Engineering Entrance (IOE)</h2>
                            <p class="mock-desc" data-i18n="mock.engineeringDesc">IOE marking standard: 10 × 1 mark + 15 × 2 marks. Total 40 marks. 10% negative marking.</p>
                        </div>
                        <div class="mock-details">
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.duration">Duration</span>
                                <span class="mock-detail-value">45 Mins</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.questions">Questions</span>
                                <span class="mock-detail-value">25</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.attempts">Attempts</span>
                                <span class="mock-detail-value">${engStats.attempts}</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.bestScore">Best Score</span>
                                <span class="mock-detail-value">${engStats.bestScore}%</span>
                            </div>
                        </div>
                        <a href="#/mock/engineering/1" class="btn-primary mock-start-btn" data-i18n="mock.startTest">Launch Exam Mode</a>
                    </div>

                    <!-- Medical (IOM/MEC) -->
                    <div class="mock-card glass-card mock-card-medical">
                        <div class="mock-card-header">
                            <div class="mock-type-icon">🩺</div>
                            <h2 class="mock-title" data-i18n="mock.medicalTitle">Medical Entrance (IOM/MEC)</h2>
                            <p class="mock-desc" data-i18n="mock.medicalDesc">MEC MBBS standard: 50 × 1 mark. Total 50 marks. 25% negative marking.</p>
                        </div>
                        <div class="mock-details">
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.duration">Duration</span>
                                <span class="mock-detail-value">45 Mins</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.questions">Questions</span>
                                <span class="mock-detail-value">50</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.attempts">Attempts</span>
                                <span class="mock-detail-value">${medStats.attempts}</span>
                            </div>
                            <div class="mock-detail-item">
                                <span class="mock-detail-label" data-i18n="mock.bestScore">Best Score</span>
                                <span class="mock-detail-value">${medStats.bestScore}%</span>
                            </div>
                        </div>
                        <a href="#/mock/medical/1" class="btn-primary mock-start-btn" data-i18n="mock.startTest">Launch Exam Mode</a>
                    </div>
                </div>
            </div>
        `;
    }

    /* ----------------------------------------------------------
       LIVE MOCK EXAM RENDERER
       ---------------------------------------------------------- */
    async function loadAndRenderMockTest(type, id) {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `<div class="loader-container"><div class="atom-loader"><div class="atom-nucleus"></div></div></div>`;

        try {
            const test = await fetch(`data/mock/${type}-${id}.json`).then(r => r.json());

            QuizEngine.init(test.questions, {
                containerId: 'app',
                timeLimit: test.duration,
                showInstantFeedback: false,
                negativeMarkingRate: test.negativeMarkingRate,
                mode: 'test',
                title: I18n.getBilingual(test.title),
                onComplete: (results) => {
                    // Save best score to localStorage
                    QuizEngine.saveMockScore(type, id, results.percentage);
                }
            });

        } catch (err) {
            console.error('App: Failed to load mock test.', err);
            app.innerHTML = `<div class="container text-center"><p data-i18n="common.error">Failed to load content.</p></div>`;
        }
    }

    /* ----------------------------------------------------------
       ABOUT PAGE
    ---------------------------------------------------------- */
    function renderAbout() {
        return `
            <div class="about-page container page-enter">
                <div class="about-hero">
                    <h1 class="page-title mb-2" data-i18n="about.title">About Physics Insight</h1>
                </div>

                <div class="about-grid">
                    <div class="about-img-container">
                        <div class="hero-atom animate-float" style="width:200px; height:200px;">
                            <div class="hero-nucleus" style="width:30px; height:30px;"></div>
                            <div class="hero-orbit hero-orbit-1"></div>
                            <div class="hero-orbit hero-orbit-2"></div>
                        </div>
                    </div>
                    <div class="about-mission-section glass-card">
                        <h2 class="mission-heading" data-i18n="about.missionTitle">Our Mission</h2>
                        <p class="mission-desc" data-i18n="about.missionDesc">Physics Insight started as a Facebook educational page to simplify physics concepts for Nepali +2 students. This platform expands that goal by offering comprehensive interactive tools, bilingual study notes, and simulation mock tests to help students excel in board papers and entrance exams.</p>
                        <a href="https://www.facebook.com/PhysicsInsight0/" target="_blank" rel="noopener noreferrer" class="btn-primary" id="about-fb-btn" style="align-self:flex-start;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            <span data-i18n="feedback.visitFacebook">Visit Facebook Page</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Public API
    return {
        init,
        refreshPage
    };
})();

// Initialize application on load
window.addEventListener('DOMContentLoaded', App.init);
