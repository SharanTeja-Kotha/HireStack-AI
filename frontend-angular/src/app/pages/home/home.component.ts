import { Component, AfterViewInit, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    /* ── Hero ─────────────────────────────── */
    .hero-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 72px;
      align-items: center;
    }
    .hero-label {
      display: inline-flex; align-items:center; gap:8px;
      background: rgba(56,189,248,0.1);
      border: 1px solid rgba(56,189,248,0.22);
      border-radius: 999px;
      padding: 6px 16px 6px 10px;
      font-size: 0.78rem; font-weight: 700;
      color: #38bdf8; letter-spacing: 0.06em;
      text-transform: uppercase; margin-bottom: 20px;
    }
    .label-dot {
      width:8px; height:8px; border-radius:50%;
      background:#38bdf8;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.25);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%,100% { box-shadow:0 0 0 3px rgba(56,189,248,0.25); }
      50%      { box-shadow:0 0 0 7px rgba(56,189,248,0);    }
    }
    .hero-title {
      font-family:'Poppins',sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -0.04em;
      color: #fff;
      margin-bottom: 22px;
    }
    .hero-desc {
      font-size: 1.1rem; color: #94a3b8;
      line-height: 1.75; max-width: 520px;
      margin-bottom: 36px;
    }
    .cta-group { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:36px; }
    .btn-hero-primary {
      display: inline-flex; align-items:center; gap:10px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      color: #0a0f1e; border-radius:14px;
      font-weight:800; font-size:0.97rem;
      box-shadow: 0 8px 28px rgba(56,189,248,0.35);
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      border:none; cursor:pointer; text-decoration:none;
      position:relative; overflow:hidden;
    }
    .btn-hero-primary::after {
      content:'';
      position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent);
      opacity:0; transition:opacity 0.3s;
    }
    .btn-hero-primary:hover { transform:translateY(-3px); box-shadow:0 14px 40px rgba(56,189,248,0.45); }
    .btn-hero-primary:hover::after { opacity:1; }
    .btn-hero-outline {
      display:inline-flex; align-items:center; gap:10px;
      padding:14px 28px;
      background:transparent;
      border:1.5px solid rgba(255,255,255,0.18);
      color:rgba(255,255,255,0.82); border-radius:14px;
      font-weight:700; font-size:0.97rem;
      transition:all 0.3s; cursor:pointer; text-decoration:none;
    }
    .btn-hero-outline:hover { background:rgba(255,255,255,0.07); border-color:#38bdf8; color:#38bdf8; }
    .trust-row { display:flex; gap:20px; flex-wrap:wrap; }
    .trust-pill {
      display:inline-flex; align-items:center; gap:7px;
      font-size:0.82rem; color:#64748b; font-weight:500;
    }
    .trust-pill i { color:#10b981; font-size:0.78rem; }

    /* Metrics */
    .metrics-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .m-card {
      background:rgba(255,255,255,0.05);
      border:1px solid rgba(255,255,255,0.08);
      border-radius:20px; padding:28px 22px;
      text-align:center; backdrop-filter:blur(12px);
      transition:all 0.35s cubic-bezier(0.4,0,0.2,1);
      position:relative; overflow:hidden;
    }
    .m-card::before {
      content:'';
      position:absolute; bottom:0; left:0; right:0;
      height:2px;
      background:linear-gradient(90deg,#38bdf8,#a855f7);
      transform:scaleX(0); transition:transform 0.35s;
    }
    .m-card:hover { transform:translateY(-5px); border-color:rgba(56,189,248,0.25); background:rgba(255,255,255,0.08); }
    .m-card:hover::before { transform:scaleX(1); }
    .m-val {
      font-family:'Poppins',sans-serif;
      font-size:2.3rem; font-weight:900; line-height:1;
      background:linear-gradient(135deg,#38bdf8,#c084fc);
      -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
      display:block;
    }
    .m-lbl {
      display:block; font-size:0.72rem; color:#64748b;
      margin-top:8px; font-weight:700;
      text-transform:uppercase; letter-spacing:0.08em;
    }

    /* ── How It Works ─────────────────────────── */
    .how-section { background:#fff; }
    .how-grid {
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:28px; margin-top:56px;
    }
    .how-card {
      background:linear-gradient(180deg,#ffffff,#f7faff);
      border:1px solid rgba(226,232,240,0.7);
      border-radius:24px; padding:40px 30px;
      text-align:center; position:relative; overflow:hidden;
      box-shadow:0 6px 28px rgba(15,23,42,0.06);
      transition:all 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .how-card::after {
      content:'';
      position:absolute; bottom:0; left:0; right:0;
      height:3px;
      background:linear-gradient(90deg,var(--col-a),var(--col-b));
      transform:scaleX(0); transition:transform 0.4s;
    }
    .how-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(0,0,0,0.1); }
    .how-card:hover::after { transform:scaleX(1); }
    .how-card:nth-child(1){ --col-a:#38bdf8; --col-b:#0ea5e9; }
    .how-card:nth-child(2){ --col-a:#a855f7; --col-b:#c084fc; }
    .how-card:nth-child(3){ --col-a:#10b981; --col-b:#34d399; }
    .step-badge {
      position:absolute; top:20px; right:20px;
      width:28px; height:28px; border-radius:50%;
      background:linear-gradient(135deg,#f1f5f9,#e2e8f0);
      display:flex; align-items:center; justify-content:center;
      font-size:0.7rem; font-weight:800; color:#94a3b8;
    }
    .how-logo {
      width:78px; height:78px; margin-bottom:26px;
      filter:drop-shadow(0 12px 20px rgba(15,23,42,0.18));
      transition:transform 0.45s var(--ease-spring);
    }
    .how-card:hover .how-logo { transform:translateY(-5px) scale(1.07) rotate(-3deg); }
    .how-card h3 { font-size:1.2rem; font-weight:800; margin-bottom:12px; color:#0f172a; }
    .how-card p { color:#64748b; font-size:0.92rem; line-height:1.7; margin:0; }

    /* ── Why Choose HireStack ─────────────────── */
    .why-section { background:#f8fafc; }
    .section-header { text-align:center; margin-bottom:56px; }
    .section-eyebrow {
      display:inline-flex; align-items:center; gap:8px;
      background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(168,85,247,.08));
      color:#0ea5e9; font-size:0.76rem; font-weight:800;
      letter-spacing:0.1em; text-transform:uppercase;
      padding:6px 18px; border-radius:999px; margin-bottom:16px;
      border:1px solid rgba(56,189,248,.15);
    }
    .section-h2 {
      font-family:'Poppins',sans-serif;
      font-size:clamp(1.9rem,4vw,2.8rem);
      font-weight:900; letter-spacing:-0.03em;
      margin-bottom:14px; color:#0f172a;
      line-height:1.15;
    }
    .section-lead {
      color:#64748b; max-width:520px; margin:0 auto;
      font-size:1.02rem; line-height:1.75;
    }
    .features-grid {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(290px,1fr));
      gap:24px;
    }
    .feat-card {
      background:linear-gradient(180deg,#ffffff,#f8fafe);
      border-radius:22px; padding:34px 28px;
      border:1px solid #e8edf2;
      box-shadow:0 4px 20px rgba(15,23,42,0.05);
      transition:all 0.35s cubic-bezier(0.4,0,0.2,1);
      position:relative; overflow:hidden;
    }
    .feat-card::before {
      content:'';
      position:absolute; top:0; left:0; right:0; height:3px;
      background:var(--feat-grad);
      transform:scaleX(0); transform-origin:left;
      transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .feat-card:hover { transform:translateY(-6px); box-shadow:0 20px 44px rgba(0,0,0,0.09); border-color:rgba(56,189,248,0.2); }
    .feat-card:hover::before { transform:scaleX(1); }
    .feat-card.accent-dark {
      background:linear-gradient(145deg,#0f172a,#1e293b);
      border-color:#1e293b;
    }
    .feat-logo {
      width:60px; height:60px; margin-bottom:22px;
      filter:drop-shadow(0 10px 16px rgba(15,23,42,0.16));
      transition:transform 0.45s var(--ease-spring);
    }
    .feat-card:hover .feat-logo { transform:translateY(-4px) scale(1.08) rotate(3deg); }
    .feat-card.accent-dark:hover .feat-logo { transform:translateY(-4px) scale(1.08); }
    .feat-card h3 { font-size:1.1rem; font-weight:800; margin-bottom:10px; color:#0f172a; }
    .feat-card.accent-dark h3 { color:#f1f5f9; }
    .feat-card p { color:#64748b; font-size:0.92rem; line-height:1.7; margin:0; }
    .feat-card.accent-dark p { color:#94a3b8; }
    .feat-cta {
      display:inline-flex; align-items:center; gap:8px;
      margin-top:24px; padding:12px 24px;
      background:linear-gradient(135deg,#38bdf8,#0ea5e9);
      color:#0a0f1e; border-radius:12px; font-weight:700; font-size:0.92rem;
      text-decoration:none; transition:all 0.3s;
    }
    .feat-cta:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(56,189,248,0.35); }

    /* ── CTA Banner ─────────────────────────── */
    .cta-banner {
      background:
        radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.15),transparent 60%),
        radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.15),transparent 60%),
        linear-gradient(135deg,#0a0f1e,#0f172a);
      padding:100px 0;
      text-align:center;
    }
    .cta-banner h2 {
      font-family:'Poppins',sans-serif;
      font-size:clamp(1.9rem,4vw,3rem);
      font-weight:900; letter-spacing:-0.04em;
      color:#fff; margin-bottom:16px;
    }
    .cta-banner p { color:#64748b; font-size:1.05rem; margin-bottom:40px; }

    /* Responsive */
    @media(max-width:1024px) {
      .hero-grid { grid-template-columns:1fr; gap:48px; }
      .how-grid { grid-template-columns:1fr 1fr; }
    }
    @media(max-width:768px) {
      .how-grid { grid-template-columns:1fr; }
      .metrics-grid { grid-template-columns:1fr 1fr; }
      .hero-title { font-size:2.4rem; }
      .cta-group { justify-content:center; }
      .trust-row { justify-content:center; }
      .hero-desc { margin:0 auto 36px; }
    }
    @media(max-width:480px) {
      .metrics-grid { grid-template-columns:1fr 1fr; }
    }
  `],
  template: `
    <!-- ══ HERO ══════════════════════════════════════════════ -->
    <section class="hero" style="padding:120px 0 100px;min-height:90vh;display:flex;align-items:center;">
      <!-- Floating orbs -->
      <div class="hero-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="container" style="position:relative;z-index:10;width:100%;">
        <div class="hero-grid">
          <!-- Text Column -->
          <div>
            <div class="hero-label anim-hero">
              <span class="label-dot"></span>
              Next-Gen ML Resume Analysis
            </div>

            <h1 class="hero-title anim-hero anim-delay-1">
              AI-Powered<br>
              <span class="gradient-text">Resume Analysis</span>
              <br>Platform
            </h1>

            <p class="hero-desc anim-hero anim-delay-2">
              Analyze resumes using Machine Learning to estimate hiring probability, recommend suitable job roles, and visualize candidate insights through an interactive dashboard.
            </p>

            <div class="cta-group anim-hero anim-delay-3">
              <a routerLink="/analyze" class="btn-hero-primary">
                <i class="fas fa-rocket"></i> Analyze My CV
              </a>
              <a routerLink="/jobs" class="btn-hero-outline">
                <i class="fas fa-briefcase"></i> View Job Openings
              </a>
            </div>

            <div class="trust-row anim-hero anim-delay-4">
              <span class="trust-pill"><i class="fas fa-check-circle"></i> Resume Analysis</span>
              <span class="trust-pill"><i class="fas fa-check-circle"></i> Job Recommendation</span>
              <span class="trust-pill"><i class="fas fa-check-circle"></i> ML Prediction</span>
            </div>
          </div>

          <!-- Metrics Column -->
          <div class="anim-hero anim-delay-2">
            <div class="metrics-grid">
              <div class="m-card">
                <span class="m-val"><i class="fas fa-file-alt"></i></span>
                <span class="m-lbl">Resume Analysis</span>
              </div>
              <div class="m-card">
                <span class="m-val"><i class="fas fa-briefcase"></i></span>
                <span class="m-lbl">Job Recommendation</span>
              </div>
              <div class="m-card">
                <span class="m-val"><i class="fas fa-chart-line"></i></span>
                <span class="m-lbl">ML Prediction</span>
              </div>
              <div class="m-card">
                <span class="m-val"><i class="fas fa-cubes"></i></span>
                <span class="m-lbl">Candidate Clustering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ HOW IT WORKS ══════════════════════════════════════ -->
    <section class="how-section" style="padding:96px 0;">
      <div class="container">
        <div class="section-header aos">
          <div class="section-eyebrow"><i class="fas fa-play-circle"></i> How it Works</div>
          <h2 class="section-h2">Three Steps,<br><span class="gradient-text">Immediate Results</span></h2>
          <p class="section-lead">A seamless experience from resume upload to personalized job recommendations.</p>
        </div>

        <div class="how-grid">
          <div class="how-card aos aos-d1">
            <div class="step-badge">01</div>
            <img class="how-logo" src="assets/icons/cv-upload.svg" alt="" width="78" height="78">
            <h3>Submit Your CV</h3>
            <p>Upload a PDF resume or fill out the interactive form. Our AI parser automatically extracts your skills and details in real time.</p>
          </div>
          <div class="how-card aos aos-d2">
            <div class="step-badge">02</div>
            <img class="how-logo" src="assets/icons/ml-brain.svg" alt="" width="78" height="78">
            <h3>Instant ML Analysis</h3>
            <p>Our RandomForest and XGBoost models calculate your hiring probability, predicted salary, and profile cluster in seconds.</p>
          </div>
          <div class="how-card aos aos-d3">
            <div class="step-badge">03</div>
            <img class="how-logo" src="assets/icons/target.svg" alt="" width="78" height="78">
            <h3>Targeted Matches</h3>
            <p>Discover top matching job listings tailored to your profile using our TF-IDF cosine similarity recommendation engine.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ WHY HIRESTACK ═══════════════════════════════════════ -->
    <section class="why-section" style="padding:96px 0;">
      <div class="container">
        <div class="section-header aos">
          <div class="section-eyebrow">✨ Why HireStack?</div>
          <h2 class="section-h2">Your Competitive Advantage<br><span class="gradient-text">From Day One</span></h2>
          <p class="section-lead">A platform built for candidates and recruiters, powered by state-of-the-art ML models.</p>
        </div>

        <div class="features-grid">
          <div class="feat-card aos aos-d1" style="--feat-grad:linear-gradient(90deg,#22d3ee,#0891b2);">
            <img class="feat-logo" src="assets/icons/lightning.svg" alt="" width="60" height="60">
            <h3>Real-Time Analysis</h3>
            <p>Get results in seconds. Hiring probability, predicted salary, and profile cluster — computed instantly by our ML models.</p>
          </div>

          <div class="feat-card aos aos-d2" style="--feat-grad:linear-gradient(90deg,#818cf8,#6366f1);">
            <img class="feat-logo" src="assets/icons/layers.svg" alt="" width="60" height="60">
            <h3>Multi-Model Pipeline</h3>
            <p>RandomForest, XGBoost, and KMeans combined. Multiple complementary models for high performance and deep candidate segmenting.</p>
          </div>

          <div class="feat-card aos aos-d3" style="--feat-grad:linear-gradient(90deg,#2dd4bf,#0d9488);">
            <img class="feat-logo" src="assets/icons/match.svg" alt="" width="60" height="60">
            <h3>TF-IDF Recommendations</h3>
            <p>The TF-IDF matching engine scans your resume and retrieves the most relevant jobs among thousands of live postings.</p>
          </div>

          <div class="feat-card aos aos-d4" style="--feat-grad:linear-gradient(90deg,#fbbf24,#f59e0b);">
            <img class="feat-logo" src="assets/icons/pdf.svg" alt="" width="60" height="60">
            <h3>Intelligent PDF Parser</h3>
            <p>Upload a PDF or fill out the form. The automated extraction of your skills, education, and experience is fast and reliable.</p>
          </div>

          <div class="feat-card aos aos-d5" style="--feat-grad:linear-gradient(90deg,#fb7185,#e11d48);">
            <img class="feat-logo" src="assets/icons/shield.svg" alt="" width="60" height="60">
            <h3>Secure &amp; Private</h3>
            <p>JWT authentication and role-based access control (candidate / recruiter / admin) keep your professional data safe.</p>
          </div>

          <div class="feat-card accent-dark aos aos-d6" style="--feat-grad:linear-gradient(90deg,#38bdf8,#a855f7);">
            <img class="feat-logo" src="assets/icons/sparkle.svg" alt="" width="60" height="60">
            <h3>Ready to Start?</h3>
            <p>Analyze your resume and unlock your hiring potential in less than 30 seconds.</p>
            <a routerLink="/analyze" class="feat-cta">
              <i class="fas fa-rocket"></i> Analyze My CV
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA BANNER ════════════════════════════════════════ -->
    <section class="cta-banner">
      <div class="container">
        <div class="aos">
          <div class="section-eyebrow" style="display:inline-flex;margin-bottom:20px;">
            <i class="fas fa-chart-line"></i> Get Started
          </div>
          <h2>Accelerate Your Job Search<br>With Artificial Intelligence</h2>
          <p>Join thousands of candidates who have already optimized their profiles with HireStack.</p>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
            <a routerLink="/analyze" class="btn-hero-primary" style="font-size:1rem;">
              <i class="fas fa-rocket"></i> Analyze My CV Now
            </a>
            <a routerLink="/showcase" class="btn-hero-outline" style="font-size:1rem;">
              <i class="fas fa-microscope"></i> View Our Project
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  c1 = signal(0);
  c2 = signal(0);
  c3 = signal(0);
  c4 = signal(0);

  private observer!: IntersectionObserver;
  private timers: ReturnType<typeof setInterval>[] = [];

  ngAfterViewInit(): void {
    this.startCounters();
    this.setupScrollAnimations();
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearInterval(t));
    if (this.observer) this.observer.disconnect();
  }

  private startCounters(): void {
    this.animateCount(this.c1, 95, 1800);
    this.animateCount(this.c2, 10, 2000);
    this.animateCount(this.c3, 500, 2200);
    this.animateCount(this.c4, 4, 1200);
  }

  private animateCount(sig: ReturnType<typeof signal<number>>, target: number, duration: number): void {
    const fps = 60;
    const steps = Math.round(duration / (1000 / fps));
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      current = Math.round(target * ease);
      sig.set(Math.min(current, target));
      if (step >= steps) clearInterval(timer);
    }, 1000 / fps);
    this.timers.push(timer);
  }

  private setupScrollAnimations(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.aos, .animate-on-scroll').forEach(el => this.observer.observe(el));
  }
}
