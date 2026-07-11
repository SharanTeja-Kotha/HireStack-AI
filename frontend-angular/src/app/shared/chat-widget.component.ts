import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  template: '',
})
export class ChatWidgetComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Load the CORRECT n8n chat CSS (style.css, not chat.bundle.css)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/style.css';
    document.head.appendChild(link);

    // CSS overrides — fix z-index, white circle toggle, brand colors only
    const style = document.createElement('style');
    style.textContent = `
      /* ── Brand / theme variables ── */
      :root {
        --chat--color--primary: #38bdf8;
        --chat--color--primary-shade-50: #0ea5e9;
        --chat--color--primary--shade-100: #0284c7;
        --chat--color--secondary: #38bdf8;
        --chat--color-secondary-shade-50: #0ea5e9;
        --chat--color-dark: #0f172a;
        --chat--color-light: #f1f5f9;
        --chat--color-light-shade-50: #e2e8f0;
        --chat--color-light-shade-100: #cbd5e1;
        --chat--color-white: #ffffff;

        /* Header */
        --chat--header--background: #0f172a;
        --chat--header--color: #f1f5f9;

        /* Toggle — white circle */
        --chat--toggle--background: #ffffff;
        --chat--toggle--hover--background: #f1f5f9;
        --chat--toggle--active--background: #e2e8f0;
        --chat--toggle--color: #0f172a;
        --chat--toggle--size: 60px;

        /* Window */
        --chat--window--width: 380px;
        --chat--window--height: min(560px, calc(100vh - 130px));
        --chat--window--z-index: 2147483647;
        --chat--window--bottom: 24px;
        --chat--window--right: 24px;
        --chat--window--border-radius: 16px;
        --chat--window--border: none;

        /* Messages */
        --chat--body--background: #f8fafc;
        --chat--message--bot--background: #ffffff;
        --chat--message--bot--color: #1e293b;
        --chat--message--bot--border: 1px solid #e2e8f0;
        --chat--message--user--background: #38bdf8;
        --chat--message--user--color: #0f172a;
        --chat--message--border-radius: 12px;
      }

      /* ── Positioning — only the wrapper gets position:fixed & high z-index ── */
      .chat-window-wrapper {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 2147483647 !important;
      }

      /* ── White circle toggle with shadow ── */
      .chat-window-wrapper .chat-window-toggle {
        background: #ffffff !important;
        color: #0f172a !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25),
                    0 0 0 2px rgba(56, 189, 248, 0.3) !important;
      }
      .chat-window-wrapper .chat-window-toggle:hover,
      .chat-window-wrapper .chat-window-toggle:focus {
        background: #f8fafc !important;
        transform: scale(1.08) !important;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.3),
                    0 0 0 3px rgba(56, 189, 248, 0.4) !important;
      }
      .chat-window-wrapper .chat-window-toggle svg {
        color: #0f172a !important;
        fill: #0f172a !important;
      }

      /* ── Chat panel shadow / rounded corners ── */
      .chat-window-wrapper .chat-window {
        border-radius: 16px !important;
        overflow: hidden !important;
        border: none !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(226, 232, 240, 0.5) !important;
      }

      /* ── Fix: .chat-layout has height:auto from library's high-specificity rule
         (.chat-window-wrapper .chat-window .chat-layout { flex:1; height:auto })
         This causes it to overflow its window and clip the footer.
         We must match or beat that specificity. ── */
      .chat-window-wrapper .chat-window .chat-layout {
        height: 100% !important;
        min-height: 0 !important;     /* Remove automatic flex min-size */
        overflow: hidden !important;
      }
      .chat-window-wrapper .chat-window .chat-layout .chat-header {
        flex-shrink: 0 !important;
        padding: 12px 16px !important;
      }
      .chat-window-wrapper .chat-window .chat-layout .chat-header * {
        margin-bottom: 2px !important;
      }
      .chat-window-wrapper .chat-window .chat-layout .chat-body {
        flex: 1 1 0 !important;
        min-height: 0 !important;
        overflow-y: auto !important;
      }
      .chat-window-wrapper .chat-window .chat-layout .chat-footer {
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
      }
      /* Ensure window never exceeds viewport so footer is always visible */
      .chat-window-wrapper .chat-window {
        max-height: calc(100vh - 130px) !important;
      }

      /* ── Close button ── */
      .chat-close-button {
        color: rgba(255, 255, 255, 0.85) !important;
      }
      .chat-close-button:hover {
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);

    // Load n8n chat JS (ES module) with fallback to default messages
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat@latest/dist/chat.bundle.es.js';

      const defaultResponses = {
        'bonjour': 'Hello! I am the HireStack Assistant. I am currently in demo mode. Here is how I can help you:\n\n📋 **Resume Analysis** - Discover how our ML models evaluate candidates\n💼 **Job Recommendations** - Explore thousands of job opportunities\n❓ **FAQ** - Frequently asked questions about HireStack',
        'analyse': 'Our system uses 6 trained ML models:\n\n1. **Hiring Prediction** - 100% Accuracy\n2. **Salary Prediction** - MAE Error: $21,106\n3. **Role Classification** - 24 categories, F1: 75.5%\n4. **Job Recommendation** - TF-IDF + Jaccard on 20k+ postings\n\nWant to see more? Visit https://hirestack-frontend.onrender.com',
        'emploi': 'HireStack recommends jobs based on:\n✅ Your skills extracted from the resume\n✅ Your professional experience\n✅ Your specialty field (24 categories)\n✅ Similarity with 20,414 real job offers\n\nTry it now: https://hirestack-frontend.onrender.com',
        'features': 'Key features of HireStack:\n\n✨ **Resume Parsing** - Automatic data extraction\n🤖 **ML Scoring** - Hiring and salary prediction\n💼 **Job Matching** - Smart recommendations\n📊 **Dashboards** - Candidate and recruiter interfaces\n🔔 **Notifications** - Real-time updates\n📈 **Power BI Analytics** - Recruitment insights',
        'default': 'I am currently in demo mode. For full assistance, please contact our team or visit https://hirestack-frontend.onrender.com\n\nYou can ask me about: analysis, jobs, or features.'
      };

      function getDefaultResponse(userMessage) {
        const msg = userMessage.toLowerCase().trim();
        if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('hi')) return defaultResponses.bonjour;
        if (msg.includes('analyse') || msg.includes('analysis') || msg.includes('modèle') || msg.includes('model') || msg.includes('ml')) return defaultResponses.analyse;
        if (msg.includes('emploi') || msg.includes('job') || msg.includes('offre') || msg.includes('offer')) return defaultResponses.emploi;
        if (msg.includes('feature') || msg.includes('capacité') || msg.includes('capacity') || msg.includes('quoi') || msg.includes('what')) return defaultResponses.features;
        return defaultResponses.default;
      }

      createChat({
        webhookUrl: '/api/webhook/chatbot',
        mode: 'window',
        showWelcomeScreen: false,
        initialMessages: [
          'Hello! I am the HireStack Assistant.',
          'How can I help you today?',
          '(Demo Mode - Pre-defined answers)'
        ],
        i18n: {
          en: {
            title: 'HireStack Assistant',
            subtitle: 'Questions about offers, resume analysis, etc.',
            inputPlaceholder: 'Type your message...',
            getStarted: 'New conversation',
            closeButtonTooltip: 'Close',
          }
        },
        onMessage: (message) => {
          console.log('User message:', message);
          // Return default response if n8n not available
          return Promise.resolve({
            text: getDefaultResponse(message),
            delay: 500
          });
        }
      });
    `;
    document.body.appendChild(script);
  }
}

