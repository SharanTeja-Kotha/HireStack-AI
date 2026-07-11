import { Component, OnInit, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { Job, CVHistory } from '../../core/models';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [FormsModule, RouterLink],
  styles: [`
    /* Grid */
    .jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:22px;}
    /* Job card */
    .job-card{background:#fff;border:1.5px solid rgba(226,232,240,.7);border-radius:20px;padding:24px;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;}
    .job-card::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#38bdf8,#a855f7);transform:scaleX(0);transition:transform .35s;}
    .job-card:hover{box-shadow:0 16px 40px rgba(0,0,0,.1);transform:translateY(-4px);border-color:rgba(56,189,248,.25);}
    .job-card:hover::before{transform:scaleX(1);}
    /* Source badges */
    .source-badge{position:absolute;top:14px;right:14px;padding:4px 12px;border-radius:999px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;}
    .sb-recruiter{background:#dcfce7;color:#15803d;}
    .sb-scraper{background:#dbeafe;color:#1d4ed8;}
    .sb-dataset{background:#f3e8ff;color:#7c3aed;}
    /* Meta */
    .job-meta{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0;font-size:.8rem;color:#64748b;}
    .job-badges{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;}
    .badge-pill{padding:4px 10px;border-radius:999px;font-size:.7rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;}
    .badge-green{background:#dcfce7;color:#15803d;}
    .badge-blue{background:#dbeafe;color:#1d4ed8;}
    .badge-purple{background:#f3e8ff;color:#7c3aed;}
    .skill-tag{background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:999px;font-size:.74rem;font-weight:600;}
    /* Apply button */
    .btn-apply{width:100%;padding:11px;border:none;border-radius:12px;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .25s;margin-top:14px;text-align:center;display:block;text-decoration:none;}
    .btn-apply.primary{background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;box-shadow:0 4px 14px rgba(14,165,233,.3);}
    .btn-apply.primary:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(14,165,233,.4);}
    .btn-apply.ext-link{background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#fff;box-shadow:0 4px 14px rgba(14,165,233,.3);}
    .btn-apply.ext-link:hover{transform:translateY(-2px);}
    .btn-apply.locked{background:#f1f5f9;color:#94a3b8;cursor:default;}
    /* Filters */
    .filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
    .filters input,.filters select{padding:10px 16px;border-radius:12px;border:1.5px solid #e2e8f0;font-size:.88rem;font-family:inherit;outline:none;background:#fff;transition:all .25s;}
    .filters input:focus,.filters select:focus{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
    /* Tag input */
    .tag-input-wrap{display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:6px 12px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;min-height:42px;cursor:text;min-width:200px;transition:all .25s;}
    .tag-input-wrap:focus-within{border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
    .skill-chip{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#e0f2fe,#dbeafe);color:#0369a1;border-radius:999px;padding:3px 10px;font-size:.76rem;font-weight:700;white-space:nowrap;}
    .skill-chip button{background:none;border:none;cursor:pointer;color:#0369a1;padding:0;font-size:.85rem;line-height:1;margin-left:2px;}
    .tag-inner-input{border:none;outline:none;font-size:.86rem;font-family:inherit;min-width:80px;padding:2px 0;background:transparent;}
    /* Modals */
    .modal-overlay{position:fixed;inset:0;background:rgba(10,15,30,.55);z-index:8000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);}
    .modal-box{background:#fff;border-radius:22px;padding:32px;max-width:480px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 40px 80px rgba(0,0,0,.25);}
    .cv-item{border:2px solid #e2e8f0;border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .25s;margin-bottom:10px;}
    .cv-item:hover,.cv-item.selected{border-color:#0ea5e9;background:#f0f9ff;}
    .hire-bar{height:6px;border-radius:999px;background:#e2e8f0;margin-top:7px;overflow:hidden;}
    .hire-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#a855f7);}
    .cover-input{width:100%;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px 16px;font-size:.92rem;resize:vertical;min-height:90px;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:14px;background:#f8fafc;transition:all .25s;}
    .cover-input:focus{border-color:#0ea5e9;background:#fff;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
    /* Auth banner */
    .auth-banner{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1.5px solid #bae6fd;border-radius:16px;padding:16px 22px;margin-bottom:24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
    .auth-form label{display:block;font-size:.74rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;margin-top:12px;}
    .auth-form input{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:.9rem;font-family:inherit;outline:none;box-sizing:border-box;transition:all .25s;background:#f8fafc;}
    .auth-form input:focus{border-color:#0ea5e9;background:#fff;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
  `],
  template: `
    <div class="container" style="padding-top:80px;padding-bottom:60px;">
      <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">
        <i class="fas fa-briefcase" style="color:#0ea5e9;"></i> Job Openings
      </h1>
      <p style="color:#64748b;margin-bottom:16px;">Apply in one click using your analyzed resume.</p>

      @if (!auth.isLoggedIn()) {
        <div class="auth-banner">
          <i class="fas fa-lock" style="color:#0369a1;font-size:1.2rem;"></i>
          <p style="margin:0;flex:1;font-size:.9rem;color:#0369a1;">
            <strong>Sign in</strong> to apply and use your analyzed resume.
          </p>
          <button class="btn btn-primary" style="font-size:13px;padding:8px 16px;" (click)="openLoginModal()">Sign In</button>
        </div>
      }

      <div class="filters">
        <input [(ngModel)]="searchQuery" placeholder="Job title, company..." style="min-width:200px;" (keydown.enter)="load(1)">
        <input [(ngModel)]="searchLocation" placeholder="Location..." (keydown.enter)="load(1)">
        <!-- Skills tag input -->
        <div class="tag-input-wrap" (click)="skillsInput.focus()">
          @for (tag of skillTags; track tag) {
            <span class="skill-chip">{{ tag }}<button type="button" (click)="removeSkillTag(tag)">×</button></span>
          }
          <input #skillsInput class="tag-inner-input" [(ngModel)]="skillInputVal"
            placeholder="{{ skillTags.length ? '' : 'Skills (Press Enter to add)' }}"
            (keydown.enter)="addSkillTag($event)"
            (keydown.backspace)="onSkillBackspace()">
        </div>
        <select [(ngModel)]="remoteOnly">
          <option value="">All</option>
          <option value="true">Remote Only</option>
        </select>
        <select [(ngModel)]="sourceFilter">
          <option value="">All Sources</option>
          <option value="dataset">Dataset</option>
          <option value="scraper">Web Sites (Scraped)</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button class="btn btn-primary" (click)="load(1)"><i class="fas fa-search"></i> Search</button>
      </div>

      @if (statsText()) {
        <p style="color:#64748b;font-size:.88rem;margin-bottom:16px;">{{ statsText() }}</p>
      }

      @if (loading()) {
        <div style="text-align:center;padding:60px;color:#94a3b8;"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem;"></i></div>
      } @else if (!jobs().length) {
        <div style="text-align:center;padding:60px;color:#94a3b8;">
          <i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:12px;"></i>
          No job openings found.
        </div>
      } @else {
        <div class="jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="job-card">
              <span class="source-badge" [class]="sourceBadgeClass(job.source)">
                {{ job.source === 'recruiter' ? 'Recruiter' : job.source === 'scraper' ? 'Scraped' : 'Dataset' }}
              </span>
              <h3 style="font-size:1rem;font-weight:700;margin:0 0 4px;padding-right:80px;color:#1e293b;">
                {{ job.title || job.title_short }}
              </h3>
              <div style="font-size:.88rem;color:#64748b;margin-bottom:10px;">
                <i class="fas fa-building"></i> {{ job.company_name || 'Company not specified' }}
              </div>
              <div class="job-meta">
                @if (job.location) { <span><i class="fas fa-map-marker-alt"></i> {{ job.location }}</span> }
                @if (job.country) { <span><i class="fas fa-globe"></i> {{ job.country }}</span> }
                @if (job.schedule_type) { <span><i class="fas fa-clock"></i> {{ job.schedule_type }}</span> }
                @if (job.work_from_home) { <span><i class="fas fa-home"></i> Remote</span> }
                @if (job.via) { <span><i class="fas fa-external-link-alt"></i> {{ job.via }}</span> }
              </div>
              <div class="job-badges">
                @if (job.no_degree_mention) { <span class="badge-pill badge-purple"><i class="fas fa-graduation-cap"></i> No Degree Required</span> }
                @if (job.health_insurance) { <span class="badge-pill badge-green"><i class="fas fa-heartbeat"></i> Health Insurance</span> }
              </div>
              @if (job.salary_year_avg) {
                <div style="font-size:1.05rem;font-weight:700;color:#16a34a;margin-bottom:10px;">
                  <i class="fas fa-dollar-sign"></i> {{ formatSalary(job.salary_year_avg) }}/yr
                </div>
              }
              @if (job.skills) {
                <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;">
                  @for (s of parseSkills(job.skills).slice(0,5); track s) {
                    <span class="skill-tag">{{ s }}</span>
                  }
                </div>
              }
              <!-- Apply / External link button based on source -->
              @if (job.source === 'dataset') {
                <button class="btn-apply locked">
                  <i class="fas fa-database"></i> Archived job (dataset)
                </button>
              } @else if (job.source === 'scraper') {
                @if (job.job_url) {
                  <a class="btn-apply ext-link" [href]="job.job_url" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> View Original Job
                  </a>
                } @else {
                  <button class="btn-apply locked">
                    <i class="fas fa-link"></i> Link not available
                  </button>
                }
              } @else {
                @if (auth.isCandidate()) {
                  <button class="btn-apply primary" (click)="openApply(job)">
                    <i class="fas fa-paper-plane"></i> Apply
                  </button>
                } @else if (!auth.isLoggedIn()) {
                  <button class="btn-apply locked" (click)="openLoginModal()">
                    <i class="fas fa-lock"></i> Sign In Required
                  </button>
                } @else {
                  <button class="btn-apply locked">
                    <i class="fas fa-info-circle"></i> Reserved for Candidates
                  </button>
                }
              }
            </div>
          }
        </div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:28px;">
          @if (page() > 1) {
            <button class="btn btn-outline" (click)="load(page()-1)">← Previous</button>
          }
          <button class="btn btn-primary" disabled>Page {{ page() }}</button>
          @if (jobs().length === 20) {
            <button class="btn btn-outline" (click)="load(page()+1)">Next →</button>
          }
        </div>
      }
    </div>

    <!-- Apply Modal -->
    @if (showApplyModal()) {
      <div class="modal-overlay" (click)="onOverlayClick($event, 'apply')">
        <div class="modal-box">
          <h3 style="margin:0 0 6px;font-size:1.1rem;font-weight:700;">Apply — {{ pendingJob()?.title || pendingJob()?.title_short }}</h3>
          <p style="color:#64748b;font-size:.9rem;margin-bottom:14px;">Choose the resume to attach.</p>
          @if (loadingCvs()) {
            <div style="text-align:center;padding:20px;color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i></div>
          } @else if (!cvHistory().length) {
            <div style="text-align:center;color:#94a3b8;padding:16px;">
              No resumes analyzed. <a routerLink="/analyze" style="color:#0ea5e9;" (click)="showApplyModal.set(false)">Analyze your resume</a>
            </div>
          } @else {
            @for (cv of cvHistory(); track cv.id) {
              <div class="cv-item" [class.selected]="selectedCvId() === cv.id" (click)="selectedCvId.set(cv.id)">
                <strong>{{ cv.job_role || 'CV #'+cv.id }}</strong>
                <span style="font-size:.82rem;color:#94a3b8;margin-left:6px;">#{{ cv.id }}</span>
                <p style="margin:4px 0 0;font-size:.82rem;color:#64748b;">
                  {{ cv.experience_years }} yrs · {{ cv.predicted_salary ? '$'+formatSalary(cv.predicted_salary!) : '—' }} · {{ cv.hire_probability ? (cv.hire_probability*100).toFixed(0)+'% hiring prob.' : '' }}
                </p>
                <div class="hire-bar"><div class="hire-fill" [style.width.%]="(cv.hire_probability??0)*100"></div></div>
              </div>
            }
          }
          <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin:14px 0 6px;">Cover Letter (optional)</label>
          <textarea class="cover-input" [(ngModel)]="coverLetter" placeholder="Hello, I am interested in..."></textarea>
          @if (!loadingCvs() && cvHistory().length > 0 && !selectedCvId()) {
            <p style="color:#ef4444;font-size:.82rem;margin:8px 0 0;"><i class="fas fa-exclamation-circle"></i> Please select a resume.</p>
          }
          <div style="display:flex;gap:10px;margin-top:12px;">
            <button class="btn btn-primary" (click)="confirmApply()" [disabled]="applying() || loadingCvs() || !cvHistory().length || !selectedCvId()">
              @if (applying()) { <i class="fas fa-spinner fa-spin"></i> } @else { <i class="fas fa-paper-plane"></i> }
              Send
            </button>
            <button class="btn btn-outline" (click)="showApplyModal.set(false)">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- Login Modal -->
    @if (showLoginModal()) {
      <div class="modal-overlay" (click)="onOverlayClick($event, 'login')">
        <div class="modal-box">
          <h3 style="margin:0 0 6px;font-weight:700;">Sign In Required</h3>
          <p style="color:#64748b;font-size:.9rem;margin-bottom:14px;">Sign in to apply.</p>
          <div style="display:flex;gap:6px;margin-bottom:14px;">
            <button style="flex:1;padding:8px;border-radius:8px;border:2px solid;cursor:pointer;font-weight:700;font-size:12px;"
              [style.borderColor]="loginTab()==='login'?'#0ea5e9':'#e2e8f0'"
              [style.color]="loginTab()==='login'?'#0ea5e9':'#64748b'"
              [style.background]="loginTab()==='login'?'#f0f9ff':'transparent'"
              (click)="loginTab.set('login')">Sign In</button>
            <button style="flex:1;padding:8px;border-radius:8px;border:2px solid;cursor:pointer;font-weight:700;font-size:12px;"
              [style.borderColor]="loginTab()==='register'?'#0ea5e9':'#e2e8f0'"
              [style.color]="loginTab()==='register'?'#0ea5e9':'#64748b'"
              [style.background]="loginTab()==='register'?'#f0f9ff':'transparent'"
              (click)="loginTab.set('register')">Create Account</button>
          </div>
          <div class="auth-form">
            @if (loginTab() === 'register') {
              <label>Name</label><input [(ngModel)]="regName" placeholder="John Doe">
            }
            <label>Email</label><input type="email" [(ngModel)]="loginEmail" placeholder="you@example.com">
            <label>Password</label><input type="password" [(ngModel)]="loginPwd" placeholder="••••••••">
          </div>
          @if (authError()) { <p style="color:#ef4444;font-size:12px;margin-top:8px;">{{ authError() }}</p> }
          <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" (click)="doAuth()">
              {{ loginTab() === 'login' ? 'Sign In' : 'Create Account' }}
            </button>
            <button class="btn btn-outline" (click)="showLoginModal.set(false)">Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class JobsComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  jobs        = signal<Job[]>([]);
  loading     = signal(true);
  page        = signal(1);
  statsText   = signal('');

  searchQuery    = '';
  searchLocation = '';
  searchSkills   = '';
  remoteOnly     = '';
  sourceFilter   = '';

  // Skills tag input
  skillTags: string[] = [];
  skillInputVal = '';

  // Apply modal
  showApplyModal = signal(false);
  pendingJob     = signal<Job | null>(null);
  cvHistory      = signal<CVHistory[]>([]);
  loadingCvs     = signal(false);
  selectedCvId   = signal<number | null>(null);
  coverLetter    = '';
  applying       = signal(false);

  // Login modal
  showLoginModal = signal(false);
  loginTab       = signal<'login' | 'register'>('login');
  loginEmail     = '';
  loginPwd       = '';
  regName        = '';
  authError      = signal('');

  ngOnInit(): void {
    this.load(1);
    this.api.jobsStats().subscribe(s =>
      this.statsText.set(`${s.total_jobs.toLocaleString()} jobs · ${s.remote_jobs.toLocaleString()} remote · ${s.jobs_with_salary.toLocaleString()} with salary`)
    );
  }

  load(page: number): void {
    this.loading.set(true);
    this.page.set(page);
    this.api.listJobs({
      query: this.searchQuery || undefined,
      location: this.searchLocation || undefined,
      remote_only: this.remoteOnly === 'true',
      skills: this.skillTags.length ? this.skillTags.join(',') : undefined,
      source: this.sourceFilter || undefined,
      page,
    }).subscribe({
      next: j => { this.jobs.set(j); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addSkillTag(e: Event): void {
    e.preventDefault();
    const v = this.skillInputVal.trim().toLowerCase();
    if (v && !this.skillTags.includes(v)) this.skillTags = [...this.skillTags, v];
    this.skillInputVal = '';
  }

  removeSkillTag(tag: string): void {
    this.skillTags = this.skillTags.filter(t => t !== tag);
  }

  onSkillBackspace(): void {
    if (!this.skillInputVal && this.skillTags.length) {
      this.skillTags = this.skillTags.slice(0, -1);
    }
  }

  sourceBadgeClass(source: string): string {
    return 'source-badge ' + (source === 'recruiter' ? 'sb-recruiter' : source === 'scraper' ? 'sb-scraper' : 'sb-dataset');
  }

  parseSkills(s: string): string[] {
    if (!s) return [];
    try { return JSON.parse(s.replace(/'/g, '"')); } catch { return s.split(',').map(x => x.trim()).filter(Boolean); }
  }

  formatSalary(n: number): string { return Math.round(n).toLocaleString(); }

  openApply(job: Job): void {
    this.pendingJob.set(job);
    this.selectedCvId.set(null);
    this.coverLetter = '';
    this.showApplyModal.set(true);
    this.loadingCvs.set(true);
    this.api.candidateCvHistory().subscribe({
      next: cvs => { this.cvHistory.set(cvs); this.loadingCvs.set(false); if (cvs[0]) this.selectedCvId.set(cvs[0].id); },
      error: () => { this.loadingCvs.set(false); },
    });
  }

  confirmApply(): void {
    const job = this.pendingJob();
    if (!job) return;
    this.applying.set(true);
    const body: Record<string, unknown> = {};
    if (job.source === 'recruiter') body['job_post_id'] = job.id;
    else body['job_id'] = job.id;
    if (this.selectedCvId()) body['cv_id'] = this.selectedCvId();
    if (this.coverLetter) body['cover_letter'] = this.coverLetter;
    this.api.applyToJob(body as never).subscribe({
      next: () => {
        this.showApplyModal.set(false);
        this.applying.set(false);
        this.toast.show('✅ Application sent!', 'success');
      },
      error: (e: { error?: { detail?: string } }) => {
        this.applying.set(false);
        this.toast.show('❌ ' + (e.error?.detail ?? 'Error'), 'error');
      },
    });
  }

  openLoginModal(): void { this.showLoginModal.set(true); this.authError.set(''); }

  doAuth(): void {
    this.authError.set('');
    const obs = this.loginTab() === 'login'
      ? this.auth.login(this.loginEmail, this.loginPwd)
      : this.auth.register(this.loginEmail, this.loginPwd, this.regName, 'candidate');
    obs.subscribe({
      next: () => { this.showLoginModal.set(false); this.toast.show('✅ Connected!', 'success'); },
      error: (e: { error?: { detail?: string } }) => this.authError.set(e.error?.detail ?? 'Error'),
    });
  }

  onOverlayClick(e: MouseEvent, modal: string): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      if (modal === 'apply') this.showApplyModal.set(false);
      if (modal === 'login') this.showLoginModal.set(false);
    }
  }
}
