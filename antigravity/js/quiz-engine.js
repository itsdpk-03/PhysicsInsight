/* ============================================================
   Physics Insight — Quiz & Test Engine
   Handles MCQ quizzes, daily quizzes, and mock tests
   ============================================================ */

const QuizEngine = (() => {
    let questions = [];
    let config = {};
    let answers = [];         // User's selected answers (index or -1 for unanswered)
    let currentIndex = 0;
    let timerInterval = null;
    let timeRemaining = 0;
    let startTime = 0;
    let isFinished = false;
    let containerId = '';

    /* ----------------------------------------------------------
       INITIALIZATION
    ---------------------------------------------------------- */

    /**
     * Initialize the quiz engine with questions and configuration.
     * @param {Array} questionList - Array of question objects
     * @param {Object} cfg - Configuration object:
     *   - containerId: DOM element ID to render into
     *   - timeLimit: Total time in seconds (0 = no limit)
     *   - perQuestionTime: Time per question in seconds (0 = use timeLimit for whole quiz)
     *   - showInstantFeedback: Show correct/incorrect after each answer
     *   - negativeMarkingRate: Deduction rate for wrong answers (0 = none)
     *   - allowNavigation: Allow prev/next navigation
     *   - shuffleQuestions: Shuffle question order
     *   - shuffleOptions: Shuffle option order per question
     *   - onComplete: Callback when quiz is submitted
     *   - title: Quiz/Test title
     *   - mode: 'quiz' | 'test' (quiz = instant feedback, test = submit all at end)
     */
    function init(questionList, cfg) {
        questions = cfg.shuffleQuestions ? shuffleArray([...questionList]) : [...questionList];
        config = {
            containerId: cfg.containerId || 'app',
            timeLimit: cfg.timeLimit || 0,
            perQuestionTime: cfg.perQuestionTime || 0,
            showInstantFeedback: cfg.showInstantFeedback ?? true,
            negativeMarkingRate: cfg.negativeMarkingRate || 0,
            allowNavigation: cfg.allowNavigation ?? true,
            shuffleOptions: cfg.shuffleOptions ?? false,
            onComplete: cfg.onComplete || null,
            title: cfg.title || 'Quiz',
            mode: cfg.mode || 'quiz',
            marksPerQuestion: cfg.marksPerQuestion || null  // null = use question.marks or 1
        };

        answers = new Array(questions.length).fill(-1);
        currentIndex = 0;
        isFinished = false;
        startTime = Date.now();

        // Shuffle options if configured
        if (config.shuffleOptions) {
            questions.forEach(q => {
                const indices = q.options.map((_, i) => i);
                const shuffled = shuffleArray(indices);
                q._optionMap = shuffled;
                q._originalCorrect = q.correct;
                q.correct = shuffled.indexOf(q.correct);
                q.options = shuffled.map(i => q.options[i]);
            });
        }

        render();
    }

    /* ----------------------------------------------------------
       RENDERING
    ---------------------------------------------------------- */

    function render() {
        const container = document.getElementById(config.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-container page-enter">
                <div class="quiz-header-bar">
                    <h2 class="quiz-title">${config.title}</h2>
                    <div class="quiz-meta">
                        <span class="quiz-question-counter" id="quiz-counter">
                            ${I18n.t('quiz.question')} <strong>${currentIndex + 1}</strong> ${I18n.t('quiz.of')} <strong>${questions.length}</strong>
                        </span>
                        ${config.timeLimit || config.perQuestionTime ? `
                            <div class="quiz-timer" id="quiz-timer">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span id="timer-display">--:--</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="quiz-progress">
                    <div class="quiz-progress-bar" id="quiz-progress" style="width: ${((currentIndex + 1) / questions.length) * 100}%"></div>
                </div>

                ${config.allowNavigation ? renderQuestionNav() : ''}

                <div id="quiz-body" class="quiz-body">
                    <!-- Question rendered here -->
                </div>

                <div class="quiz-actions" id="quiz-actions">
                    ${config.allowNavigation ? `
                        <button class="btn-secondary quiz-btn" id="quiz-prev" ${currentIndex === 0 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            ${I18n.t('quiz.prevQuestion') || 'Previous'}
                        </button>
                    ` : ''}
                    <div class="quiz-actions-right">
                        ${currentIndex < questions.length - 1 ? `
                            <button class="btn-primary quiz-btn" id="quiz-next">
                                ${I18n.t('quiz.nextQuestion') || 'Next'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        ` : `
                            <button class="btn-primary quiz-btn submit-btn" id="quiz-submit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ${I18n.t('quiz.submitQuiz') || 'Submit'}
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        renderQuestion();
        startTimer();
        bindQuizEvents();
    }

    function renderQuestionNav() {
        let dots = '';
        questions.forEach((_, i) => {
            let cls = 'quiz-dot';
            if (i === currentIndex) cls += ' current';
            if (answers[i] !== -1) cls += ' answered';
            dots += `<button class="${cls}" data-index="${i}" title="Question ${i + 1}">${i + 1}</button>`;
        });
        return `<div class="quiz-question-nav" id="quiz-nav">${dots}</div>`;
    }

    function renderQuestion() {
        const body = document.getElementById('quiz-body');
        if (!body) return;

        const q = questions[currentIndex];
        const lang = I18n.getLang();
        const questionText = I18n.getBilingual(q.question);
        const hasAnswered = answers[currentIndex] !== -1;
        const isInstantMode = config.showInstantFeedback && config.mode === 'quiz';

        body.innerHTML = `
            <div class="quiz-question-card animate-fadeIn">
                <div class="question-number-badge">${currentIndex + 1}</div>
                ${q.marks ? `<span class="marks-badge">${q.marks} ${q.marks > 1 ? 'marks' : 'mark'}</span>` : ''}
                <p class="quiz-question-text">${questionText}</p>
                
                <div class="quiz-options" id="quiz-options">
                    ${q.options.map((opt, i) => {
                        const optText = I18n.getBilingual(opt);
                        const letter = String.fromCharCode(65 + i);
                        let cls = 'quiz-option';
                        
                        if (answers[currentIndex] === i) cls += ' selected';
                        
                        if (isInstantMode && hasAnswered) {
                            if (i === q.correct) cls += ' correct';
                            else if (answers[currentIndex] === i && i !== q.correct) cls += ' incorrect';
                            cls += ' locked';
                        }
                        
                        return `
                            <button class="${cls}" data-option="${i}" id="quiz-option-${i}" ${isInstantMode && hasAnswered ? 'disabled' : ''}>
                                <span class="option-letter">${letter}</span>
                                <span class="option-text">${optText}</span>
                                ${isInstantMode && hasAnswered && i === q.correct ? '<span class="option-icon correct-icon">✓</span>' : ''}
                                ${isInstantMode && hasAnswered && answers[currentIndex] === i && i !== q.correct ? '<span class="option-icon incorrect-icon">✗</span>' : ''}
                            </button>
                        `;
                    }).join('')}
                </div>

                ${isInstantMode && hasAnswered && q.explanation ? `
                    <div class="quiz-explanation animate-fadeIn">
                        <div class="explanation-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <span>${I18n.t('quiz.explanation') || 'Explanation'}</span>
                        </div>
                        <p>${I18n.getBilingual(q.explanation)}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /* ----------------------------------------------------------
       TIMER
    ---------------------------------------------------------- */

    function startTimer() {
        if (!config.timeLimit && !config.perQuestionTime) return;

        clearInterval(timerInterval);

        if (config.perQuestionTime) {
            timeRemaining = config.perQuestionTime;
        } else {
            timeRemaining = config.timeLimit;
        }

        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (config.perQuestionTime) {
                    // Auto-advance to next question
                    if (currentIndex < questions.length - 1) {
                        goToQuestion(currentIndex + 1);
                    } else {
                        submitQuiz();
                    }
                } else {
                    // Time's up for entire quiz
                    submitQuiz();
                }
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const display = document.getElementById('timer-display');
        const timer = document.getElementById('quiz-timer');
        if (!display) return;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Urgency styling
        if (timer) {
            timer.classList.remove('warning', 'danger');
            if (timeRemaining <= 60) timer.classList.add('danger');
            else if (timeRemaining <= 300) timer.classList.add('warning');
        }
    }

    /* ----------------------------------------------------------
       EVENT HANDLING
    ---------------------------------------------------------- */

    function bindQuizEvents() {
        // Option selection
        document.getElementById('quiz-options')?.addEventListener('click', (e) => {
            const optBtn = e.target.closest('.quiz-option');
            if (!optBtn || optBtn.disabled) return;

            const optIndex = parseInt(optBtn.getAttribute('data-option'));
            selectAnswer(optIndex);
        });

        // Navigation buttons
        document.getElementById('quiz-prev')?.addEventListener('click', () => {
            if (currentIndex > 0) goToQuestion(currentIndex - 1);
        });

        document.getElementById('quiz-next')?.addEventListener('click', () => {
            if (currentIndex < questions.length - 1) goToQuestion(currentIndex + 1);
        });

        document.getElementById('quiz-submit')?.addEventListener('click', () => {
            const unanswered = answers.filter(a => a === -1).length;
            if (unanswered > 0) {
                if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) {
                    return;
                }
            }
            submitQuiz();
        });

        // Question navigation dots
        document.getElementById('quiz-nav')?.addEventListener('click', (e) => {
            const dot = e.target.closest('.quiz-dot');
            if (!dot) return;
            const idx = parseInt(dot.getAttribute('data-index'));
            goToQuestion(idx);
        });
    }

    function selectAnswer(optIndex) {
        const isInstantMode = config.showInstantFeedback && config.mode === 'quiz';
        const alreadyAnswered = answers[currentIndex] !== -1;

        if (isInstantMode && alreadyAnswered) return;

        answers[currentIndex] = optIndex;

        // Re-render question to show selection/feedback
        renderQuestion();
        bindQuizEvents();

        // Update navigation dot
        const dot = document.querySelector(`.quiz-dot[data-index="${currentIndex}"]`);
        if (dot) dot.classList.add('answered');

        // In quiz mode with instant feedback and auto-advance
        if (isInstantMode) {
            // Auto-advance after a delay
            setTimeout(() => {
                if (currentIndex < questions.length - 1) {
                    goToQuestion(currentIndex + 1);
                }
            }, 1500);
        }
    }

    function goToQuestion(index) {
        if (index < 0 || index >= questions.length) return;
        currentIndex = index;

        // Update UI elements
        const counter = document.getElementById('quiz-counter');
        if (counter) {
            counter.innerHTML = `${I18n.t('quiz.question')} <strong>${currentIndex + 1}</strong> ${I18n.t('quiz.of')} <strong>${questions.length}</strong>`;
        }

        const progress = document.getElementById('quiz-progress');
        if (progress) {
            progress.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
        }

        // Update nav dots
        document.querySelectorAll('.quiz-dot').forEach((dot, i) => {
            dot.classList.toggle('current', i === currentIndex);
        });

        // Update prev button
        const prevBtn = document.getElementById('quiz-prev');
        if (prevBtn) prevBtn.disabled = currentIndex === 0;

        // Update next/submit button
        const actions = document.querySelector('.quiz-actions-right');
        if (actions) {
            if (currentIndex < questions.length - 1) {
                actions.innerHTML = `
                    <button class="btn-primary quiz-btn" id="quiz-next">
                        ${I18n.t('quiz.nextQuestion') || 'Next'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                `;
            } else {
                actions.innerHTML = `
                    <button class="btn-primary quiz-btn submit-btn" id="quiz-submit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${I18n.t('quiz.submitQuiz') || 'Submit'}
                    </button>
                `;
            }
        }

        renderQuestion();
        bindQuizEvents();

        // Reset per-question timer
        if (config.perQuestionTime) {
            startTimer();
        }
    }

    /* ----------------------------------------------------------
       SCORING & RESULTS
    ---------------------------------------------------------- */

    function submitQuiz() {
        clearInterval(timerInterval);
        isFinished = true;

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const results = calculateResults(timeTaken);

        renderResults(results);

        if (config.onComplete) {
            config.onComplete(results);
        }
    }

    function calculateResults(timeTaken) {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;
        const chapterBreakdown = {};

        questions.forEach((q, i) => {
            const marks = config.marksPerQuestion || q.marks || 1;
            totalMarks += marks;

            const chapterKey = `Grade ${q.grade} - Ch ${q.chapter}`;
            if (!chapterBreakdown[chapterKey]) {
                chapterBreakdown[chapterKey] = { correct: 0, total: 0, marks: 0, totalMarks: 0 };
            }
            chapterBreakdown[chapterKey].total++;
            chapterBreakdown[chapterKey].totalMarks += marks;

            if (answers[i] === -1) {
                unanswered++;
            } else if (answers[i] === q.correct) {
                correct++;
                obtainedMarks += marks;
                chapterBreakdown[chapterKey].correct++;
                chapterBreakdown[chapterKey].marks += marks;
            } else {
                incorrect++;
                obtainedMarks -= marks * config.negativeMarkingRate;
                chapterBreakdown[chapterKey].marks -= marks * config.negativeMarkingRate;
            }
        });

        obtainedMarks = Math.max(0, obtainedMarks);
        const percentage = Math.round((obtainedMarks / totalMarks) * 100);

        return {
            correct,
            incorrect,
            unanswered,
            totalQuestions: questions.length,
            obtainedMarks: Math.round(obtainedMarks * 100) / 100,
            totalMarks,
            percentage,
            timeTaken,
            chapterBreakdown,
            answers: answers.slice(),
            questions: questions
        };
    }

    function renderResults(results) {
        const container = document.getElementById(config.containerId);
        if (!container) return;

        const minutes = Math.floor(results.timeTaken / 60);
        const seconds = results.timeTaken % 60;

        // Determine score color
        let scoreClass = 'score-low';
        if (results.percentage >= 80) scoreClass = 'score-high';
        else if (results.percentage >= 50) scoreClass = 'score-medium';

        container.innerHTML = `
            <div class="results-container page-enter">
                <div class="results-header">
                    <h2 class="results-title">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        ${I18n.t('mock.resultTitle') || 'Results'}
                    </h2>
                </div>

                <div class="results-score-section">
                    <div class="score-circle ${scoreClass}" style="--score: ${results.percentage}">
                        <svg viewBox="0 0 120 120" class="score-ring">
                            <circle cx="60" cy="60" r="54" class="score-ring-bg"/>
                            <circle cx="60" cy="60" r="54" class="score-ring-fill" 
                                    style="stroke-dasharray: ${2 * Math.PI * 54}; stroke-dashoffset: ${2 * Math.PI * 54 * (1 - results.percentage / 100)}"/>
                        </svg>
                        <div class="score-value">
                            <span class="score-number">${results.percentage}%</span>
                            <span class="score-label">${results.obtainedMarks}/${results.totalMarks}</span>
                        </div>
                    </div>
                </div>

                <div class="results-stats">
                    <div class="stat-card stat-correct">
                        <div class="stat-icon">✓</div>
                        <div class="stat-info">
                            <span class="stat-value">${results.correct}</span>
                            <span class="stat-name">${I18n.t('quiz.correct') || 'Correct'}</span>
                        </div>
                    </div>
                    <div class="stat-card stat-incorrect">
                        <div class="stat-icon">✗</div>
                        <div class="stat-info">
                            <span class="stat-value">${results.incorrect}</span>
                            <span class="stat-name">${I18n.t('quiz.incorrect') || 'Incorrect'}</span>
                        </div>
                    </div>
                    <div class="stat-card stat-unanswered">
                        <div class="stat-icon">—</div>
                        <div class="stat-info">
                            <span class="stat-value">${results.unanswered}</span>
                            <span class="stat-name">${I18n.t('quiz.unanswered') || 'Unanswered'}</span>
                        </div>
                    </div>
                    <div class="stat-card stat-time">
                        <div class="stat-icon">⏱</div>
                        <div class="stat-info">
                            <span class="stat-value">${minutes}:${String(seconds).padStart(2, '0')}</span>
                            <span class="stat-name">${I18n.t('mock.timeTaken') || 'Time Taken'}</span>
                        </div>
                    </div>
                </div>

                ${config.negativeMarkingRate > 0 ? `
                    <div class="negative-marking-note">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        Negative marking: ${config.negativeMarkingRate * 100}% deducted per wrong answer
                    </div>
                ` : ''}

                <div class="results-review">
                    <h3 class="review-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        ${I18n.t('mock.reviewAnswers') || 'Review Answers'}
                    </h3>
                    <div class="review-list" id="review-list">
                        ${results.questions.map((q, i) => {
                            const isCorrect = results.answers[i] === q.correct;
                            const isUnanswered = results.answers[i] === -1;
                            let statusClass = isUnanswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect');

                            return `
                                <div class="review-item ${statusClass}">
                                    <div class="review-item-header" onclick="this.parentElement.classList.toggle('expanded')">
                                        <span class="review-number">${i + 1}</span>
                                        <span class="review-question">${I18n.getBilingual(q.question).substring(0, 80)}${I18n.getBilingual(q.question).length > 80 ? '...' : ''}</span>
                                        <span class="review-status-icon">${isUnanswered ? '—' : (isCorrect ? '✓' : '✗')}</span>
                                    </div>
                                    <div class="review-item-body">
                                        <p class="review-full-question">${I18n.getBilingual(q.question)}</p>
                                        <div class="review-options">
                                            ${q.options.map((opt, oi) => {
                                                let optCls = 'review-option';
                                                if (oi === q.correct) optCls += ' correct';
                                                if (results.answers[i] === oi && oi !== q.correct) optCls += ' selected-wrong';
                                                return `<div class="${optCls}"><span class="option-letter">${String.fromCharCode(65 + oi)}</span> ${I18n.getBilingual(opt)}</div>`;
                                            }).join('')}
                                        </div>
                                        ${q.explanation ? `<div class="review-explanation"><strong>${I18n.t('quiz.explanation') || 'Explanation'}:</strong> ${I18n.getBilingual(q.explanation)}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="results-actions">
                    <button class="btn-primary" onclick="window.location.hash = '#/mock'">${I18n.t('mock.backToMockTests') || 'Back to Tests'}</button>
                    <button class="btn-secondary" onclick="window.location.reload()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        ${I18n.t('common.retry') || 'Try Again'}
                    </button>
                </div>
            </div>
        `;
    }

    /* ----------------------------------------------------------
       UTILITIES
    ---------------------------------------------------------- */

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function destroy() {
        clearInterval(timerInterval);
        questions = [];
        answers = [];
        currentIndex = 0;
        isFinished = false;
    }

    /* ----------------------------------------------------------
       DAILY QUIZ HELPERS
    ---------------------------------------------------------- */

    /**
     * Get today's quiz questions from a pool based on date.
     * Uses a deterministic selection so all users get the same quiz each day.
     */
    function getDailyQuestions(pool, count = 10) {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const seed = hashString(dateStr);

        // Seeded shuffle
        const indices = pool.map((_, i) => i);
        const shuffled = seededShuffle(indices, seed);
        return shuffled.slice(0, count).map(i => pool[i]);
    }

    /**
     * Get streak count from localStorage.
     */
    function getStreak() {
        const data = JSON.parse(localStorage.getItem('pi_quiz_streak') || '{}');
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (data.lastDate === today) {
            return { count: data.count || 0, completedToday: true };
        } else if (data.lastDate === yesterday) {
            return { count: data.count || 0, completedToday: false };
        } else {
            return { count: 0, completedToday: false };
        }
    }

    /**
     * Update streak after completing daily quiz.
     */
    function updateStreak() {
        const streak = getStreak();
        const today = new Date().toDateString();

        const newCount = streak.completedToday ? streak.count : streak.count + 1;
        localStorage.setItem('pi_quiz_streak', JSON.stringify({
            count: newCount,
            lastDate: today
        }));

        return newCount;
    }

    /**
     * Save mock test score.
     */
    function saveMockScore(type, testId, score) {
        const key = `pi_mock_${type}_${testId}`;
        const data = JSON.parse(localStorage.getItem(key) || '{"attempts": 0, "bestScore": 0}');
        data.attempts++;
        data.bestScore = Math.max(data.bestScore, score);
        data.lastAttempt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * Get mock test stats.
     */
    function getMockStats(type, testId) {
        const key = `pi_mock_${type}_${testId}`;
        return JSON.parse(localStorage.getItem(key) || '{"attempts": 0, "bestScore": 0}');
    }

    // --- Hash / seed helpers ---

    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function seededShuffle(arr, seed) {
        const result = [...arr];
        let s = seed;
        for (let i = result.length - 1; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            const j = s % (i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /* ----------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------- */
    return {
        init,
        destroy,
        getDailyQuestions,
        getStreak,
        updateStreak,
        saveMockScore,
        getMockStats
    };
})();
