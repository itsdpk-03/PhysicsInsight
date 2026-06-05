/* ============================================================
   Physics Insight — Feedback Module
   Handles Google Form embed for feedback/support
   ============================================================ */

const Feedback = (() => {

    /**
     * Render the feedback page.
     */
    function renderPage() {
        return `
            <div class="feedback-page page-enter">
                <!-- Feedback Hero -->
                <section class="feedback-hero">
                    <div class="container">
                        <h1 class="section-title" data-i18n="feedback.title">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Feedback & Support
                        </h1>
                        <p class="section-subtitle" data-i18n="feedback.description">
                            We value your feedback! Report issues, suggest improvements, or let us know how we're doing.
                        </p>
                    </div>
                </section>

                <div class="container">
                    <div class="feedback-grid">
                        <!-- Google Form Embed -->
                        <div class="feedback-form-section glass-card">
                            <h2 class="feedback-form-title">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span data-i18n="feedback.formTitle">Share Your Feedback</span>
                            </h2>
                            <p class="feedback-form-desc" data-i18n="feedback.googleFormText">
                                Fill out the form below to send us your feedback, bug reports, or suggestions.
                            </p>
                            <div class="google-form-embed" id="google-form-container">
                                <div class="form-placeholder">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    <p data-i18n="feedback.formPlaceholder">Google Form will be embedded here.<br>Contact the admin to set up the feedback form.</p>
                                    <p class="form-setup-hint">
                                        To set up: Create a Google Form and replace the iframe src in 
                                        <code>js/feedback.js</code> with your form's embed URL.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Sidebar -->
                        <div class="feedback-sidebar">
                            <!-- Direct Contact -->
                            <div class="contact-card glass-card">
                                <h3 class="contact-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span data-i18n="feedback.messengerTitle">Message Us on Facebook</span>
                                </h3>
                                <p data-i18n="feedback.messengerDesc">Reach out to us directly on our Facebook page for quick responses.</p>
                                <a href="https://www.facebook.com/PhysicsInsight0/" target="_blank" rel="noopener noreferrer" class="btn-primary contact-btn" id="feedback-fb-link">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span data-i18n="feedback.visitFacebook">Visit Physics Insight</span>
                                </a>
                            </div>

                            <!-- FAQ Section -->
                            <div class="faq-card glass-card">
                                <h3 class="faq-title">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    <span data-i18n="feedback.faqTitle">Common Questions</span>
                                </h3>
                                <div class="faq-list">
                                    <div class="faq-item" onclick="this.classList.toggle('open')">
                                        <div class="faq-question">
                                            <span data-i18n="feedback.faq1q">How do I report a content error?</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div class="faq-answer" data-i18n="feedback.faq1a">
                                            Use the feedback form and select "Content Error" as the category. Please mention the specific chapter and question number.
                                        </div>
                                    </div>
                                    <div class="faq-item" onclick="this.classList.toggle('open')">
                                        <div class="faq-question">
                                            <span data-i18n="feedback.faq2q">Can I suggest new features?</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div class="faq-answer" data-i18n="feedback.faq2a">
                                            Absolutely! We love hearing your ideas. Use the form or message us on Facebook with your suggestions.
                                        </div>
                                    </div>
                                    <div class="faq-item" onclick="this.classList.toggle('open')">
                                        <div class="faq-question">
                                            <span data-i18n="feedback.faq3q">Is this website free to use?</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div class="faq-answer" data-i18n="feedback.faq3a">
                                            Yes! Physics Insight is completely free for all NEB students. Our goal is to make quality physics education accessible to everyone.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Report Types -->
                            <div class="report-types-card glass-card">
                                <h3 class="report-title" data-i18n="feedback.categoriesTitle">What can you report?</h3>
                                <div class="report-type-list">
                                    <div class="report-type">
                                        <span class="report-icon bug">🐛</span>
                                        <div>
                                            <strong data-i18n="feedback.catBug">Bug Report</strong>
                                            <p data-i18n="feedback.catBugDesc">Something isn't working correctly</p>
                                        </div>
                                    </div>
                                    <div class="report-type">
                                        <span class="report-icon content">📝</span>
                                        <div>
                                            <strong data-i18n="feedback.catContent">Content Error</strong>
                                            <p data-i18n="feedback.catContentDesc">Wrong answer, typo, or missing info</p>
                                        </div>
                                    </div>
                                    <div class="report-type">
                                        <span class="report-icon suggestion">💡</span>
                                        <div>
                                            <strong data-i18n="feedback.catSuggestion">Suggestion</strong>
                                            <p data-i18n="feedback.catSuggestionDesc">Ideas for improvement or new features</p>
                                        </div>
                                    </div>
                                    <div class="report-type">
                                        <span class="report-icon other">💬</span>
                                        <div>
                                            <strong data-i18n="feedback.catOther">Other</strong>
                                            <p data-i18n="feedback.catOtherDesc">General feedback or questions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Set the Google Form embed URL.
     * Call this to replace the placeholder with an actual Google Form.
     * @param {string} formUrl - The Google Form embed URL
     */
    function setGoogleForm(formUrl) {
        const container = document.getElementById('google-form-container');
        if (!container || !formUrl) return;

        container.innerHTML = `
            <iframe 
                src="${formUrl}" 
                width="100%" 
                height="800" 
                frameborder="0" 
                marginheight="0" 
                marginwidth="0"
                loading="lazy"
                title="Feedback Form">
                Loading…
            </iframe>
        `;
    }

    return {
        renderPage,
        setGoogleForm
    };
})();
