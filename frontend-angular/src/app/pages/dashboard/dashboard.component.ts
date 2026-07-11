import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AdminStats, CVHistory } from '../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .dash-hero {
      background:
        radial-gradient(ellipse at 30% 50%, rgba(56,189,248,.07),transparent 55%),
        radial-gradient(ellipse at 70% 30%, rgba(168,85,247,.07),transparent 55%),
        linear-gradient(135deg,#0d1527,#080d19);
      padding:72px 0 100px;
    }
    .dash-hero h1 {
      font-family:'Poppins',sans-serif;
      font-size:clamp(1.9rem,4vw,2.8rem);
      font-weight:900; letter-spacing:-.04em;
      color:#fff; margin-bottom:8px;
    }
    .dash-hero p { color:#94a3b8; font-size:1rem; margin:0; }
    .dash-hero-badge {
      display:inline-flex; align-items:center; gap:8px;
      background:rgba(56,189,248,.08); border:1px solid rgba(56,189,248,.15);
      border-radius:999px; padding:5px 16px 5px 10px;
      font-size:.76rem; font-weight:700; color:#38bdf8;
      text-transform:uppercase; letter-spacing:.07em; margin-bottom:16px;
    }
    .stats-row {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:24px;
      margin-top:-56px;
      position:relative; z-index:10;
    }
    .kpi-card {
      background:#ffffff; border-radius:24px; padding:28px 24px;
      border:1px solid rgba(226,232,240,.7);
      box-shadow:0 8px 24px rgba(15,23,42,.03);
      display:flex; align-items:center; gap:16px;
      transition:all .35s cubic-bezier(.4,0,.2,1);
      position:relative; overflow:hidden;
    }
    .kpi-card::before {
      content:''; position:absolute; bottom:0; left:0; right:0;
      height:3px; background:var(--kpi-grad);
      transform:scaleX(0); transition:transform .35s;
    }
    .kpi-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(15,23,42,.08); border-color:rgba(56,189,248,0.25); }
    .kpi-card:hover::before { transform:scaleX(1); }
    .kpi-logo {
      width:54px; height:54px; flex-shrink:0;
      filter:drop-shadow(0 6px 12px rgba(15,23,42,.12));
      transition:transform .45s cubic-bezier(0.34,1.56,0.64,1);
    }
    .kpi-card:hover .kpi-logo { transform:scale(1.08) rotate(-2deg); }
    .kpi-info h3 { font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; margin:0 0 4px; }
    .kpi-val-text {
      font-size: 1.05rem; font-weight: 800; color: #0f172a; display: block;
      margin: 4px 0 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
    }
    .skill-chip {
      display: inline-block; padding: 3px 8px; font-size: 0.7rem; font-weight: 700;
      color: #7c3aed; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.15);
      border-radius: 999px; text-transform: uppercase;
    }
    .kpi-summary-text {
      font-size: 0.78rem; color: #475569; line-height: 1.45; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .kpi-sub { font-size:.78rem; color:#64748b; margin-top:2px; display:block; line-height:1.4; }
    .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-top:32px; }
    .chart-card {
      background:#fff; border:1px solid rgba(226,232,240,.7);
      border-radius:24px; padding:32px;
      box-shadow:0 8px 24px rgba(15,23,42,.03);
    }
    .chart-card h3 { font-size:1.05rem; font-weight:800; color:#0f172a; margin:0 0 24px; display:flex; align-items:center; gap:10px; }
    .chart-card h3 i { color:#0ea5e9; }
    .bar-row { display:flex; align-items:center; gap:16px; margin-bottom:14px; }
    .bar-label { width:160px; font-size:.82rem; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:600; }
    .bar-track { flex:1; height:8px; background:#f1f5f9; border-radius:999px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:999px; transition:width 1s cubic-bezier(.4,0,.2,1); }
    .bar-fill-blue { background:linear-gradient(90deg,#0ea5e9,#38bdf8); }
    .bar-fill-green { background:linear-gradient(90deg,#10b981,#34d399); }
    .bar-count { font-size:.8rem; color:#64748b; min-width:24px; text-align:right; font-weight:700; }
    .loading-state { text-align:center; padding:80px; color:#94a3b8; }
    .loading-state i { font-size:2.2rem; margin-bottom:16px; display:block; }
    .error-state { text-align:center; padding:60px; color:#94a3b8; }
    .tab-nav {
      display:flex; gap:8px; margin:0 0 32px;
      border-bottom:2px solid rgba(226,232,240,.7);
      padding-bottom:0;
    }
    .tab-btn {
      display:inline-flex; align-items:center; gap:8px;
      padding:12px 24px; border:none; background:transparent;
      font-size:.9rem; font-weight:700; color:#64748b;
      cursor:pointer; border-bottom:3px solid transparent;
      margin-bottom:-2px; border-radius:8px 8px 0 0;
      transition:all .25s;
    }
    .tab-btn:hover { color:#0ea5e9; background:rgba(56,189,248,.05); }
    .tab-btn.active { color:#0ea5e9; border-bottom-color:#0ea5e9; background:rgba(56,189,248,.07); }
    .tab-btn i { font-size:1rem; }
    .pbi-note {
      display:flex; gap:12px; align-items:flex-start;
      background:#f0f9ff; border:1px solid #bae6fd; border-radius:14px;
      padding:12px 18px; margin:8px 0 20px; font-size:.85rem; color:#0369a1; line-height:1.5;
    }
    .pbi-note i { color:#0ea5e9; font-size:1rem; margin-top:2px; }
    .pbi-placeholder-card {
      background:#fff; border:1.5px solid rgba(226,232,240,.7);
      border-radius:24px; padding:56px 40px; text-align:center;
      box-shadow:0 8px 24px rgba(15,23,42,.03);
      display:flex; flex-direction:column; align-items:center;
      max-width:600px; margin:16px auto 0;
    }
    .pbi-placeholder-icon {
      width:68px; height:68px; border-radius:50%;
      background:rgba(56,189,248,.1); color:#0ea5e9;
      display:flex; align-items:center; justify-content:center;
      font-size:2rem; margin-bottom:20px;
      box-shadow:0 6px 15px rgba(14,165,233,.12);
    }
    .pbi-placeholder-card h2 {
      font-family:'Poppins',sans-serif; font-size:1.45rem; font-weight:800;
      color:#0f172a; margin:0 0 8px;
    }
    .pbi-placeholder-desc {
      color:#64748b; font-size:0.9rem; line-height:1.55; max-width:440px; margin:0 0 28px;
    }
    .pbi-feature-grid {
      display:grid; grid-template-columns:1fr 1fr; gap:16px;
      width:100%; max-width:380px; text-align:left;
    }
    .pbi-feat-item {
      display:flex; align-items:center; gap:8px;
      font-size:0.85rem; color:#334155; font-weight:600;
    }
    .pbi-feat-item i { color:#10b981; font-size:0.9rem; }
    @media(max-width:768px) {
      .charts-grid { grid-template-columns:1fr; }
      .stats-row { grid-template-columns:1fr; }
      .bar-label { width:110px; }
      .tab-btn { padding:10px 14px; font-size:.8rem; }
      .pbi-placeholder-card { padding:40px 24px; }
      .pbi-feature-grid { grid-template-columns:1fr; }
    }
  `],
  template: `
    <!-- Hero -->
    <div class="dash-hero">
      <div class="container">
        <div class="dash-hero-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:#38bdf8;display:inline-block;"></span>
          Dashboard View
        </div>
        <h1><i class="fas fa-chart-bar" style="color:#38bdf8;font-size:.9em;"></i> Dashboard</h1>
        <p>Overview of candidate analyses and real-time ML predictions.</p>
      </div>
    </div>

    <div class="container" style="padding-bottom:80px;">

      <!-- Tab Navigation -->
      <div class="tab-nav" style="margin-top:32px;">
        <button class="tab-btn" [class.active]="activeTab() === 'ia'" (click)="activeTab.set('ia')">
          <i class="fas fa-robot"></i> AI Dashboard
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'powerbi'" (click)="activeTab.set('powerbi')">
          <i class="fas fa-chart-pie"></i> Analytics Preview
        </button>
      </div>

      <!-- ── Tab: Dashboard IA ─────────────────────────────────── -->
      @if (activeTab() === 'ia') {
        @if (loading()) {
          <div class="loading-state stats-row" style="display:block;">
            <i class="fas fa-circle-notch fa-spin"></i>
            <p style="font-size:1rem;">Loading statistics...</p>
          </div>
        } @else if (stats()) {

          <!-- KPI Cards -->
          <div class="stats-row" style="margin-top:24px;">
            <!-- Latest Resume Card -->
            <div class="kpi-card" style="--kpi-grad:linear-gradient(90deg,#38bdf8,#0ea5e9);">
              <img class="kpi-logo" src="assets/icons/category.svg" alt="" width="56" height="56">
              <div class="kpi-info" style="flex:1; min-width:0;">
                <h3>Latest Resume</h3>
                <span class="kpi-val-text">{{ latestCv() ? 'Resume_' + (latestCv()!.id) + '.pdf' : 'No resume analyzed yet' }}</span>
                <span class="kpi-sub">
                  @if (latestCv()) {
                    Analyzed on {{ formatDate(latestCv()!.created_at) }}
                  } @else {
                    Upload a CV to generate insights
                  }
                </span>
              </div>
            </div>

            <!-- Predicted Job Role Card -->
            <div class="kpi-card" style="--kpi-grad:linear-gradient(90deg,#10b981,#34d399);">
              <img class="kpi-logo" src="assets/icons/star.svg" alt="" width="56" height="56">
              <div class="kpi-info" style="flex:1; min-width:0;">
                <h3>Predicted Job Role</h3>
                <span class="kpi-val-text">{{ latestCv()?.job_role || 'N/A' }}</span>
                <span class="kpi-sub">Best predicted role from analysis</span>
              </div>
            </div>

            <!-- Top Skills Card -->
            <div class="kpi-card" style="--kpi-grad:linear-gradient(90deg,#a855f7,#c084fc); display:flex; flex-direction:column; align-items:flex-start; gap:12px; height:auto; min-height:124px; padding:24px 20px;">
              <div style="display:flex; align-items:center; gap:12px; width:100%;">
                <img class="kpi-logo" src="assets/icons/cluster.svg" alt="" width="36" height="36" style="width:36px; height:36px;">
                <div class="kpi-info">
                  <h3 style="margin:0;">Top Skills</h3>
                </div>
              </div>
              <div style="width:100%;">
                @if (latestCv()?.skills) {
                  <div style="display:flex; flex-wrap:wrap; gap:6px;">
                    @for (skill of latestCv()!.skills!.split(',').slice(0, 5); track skill) {
                      <span class="skill-chip">{{ skill.trim() }}</span>
                    }
                  </div>
                } @else {
                  <span class="kpi-sub">No skills detected yet</span>
                }
              </div>
            </div>

            <!-- Resume Summary Card -->
            <div class="kpi-card" style="--kpi-grad:linear-gradient(90deg,#f59e0b,#fbbf24); display:flex; flex-direction:column; align-items:flex-start; gap:12px; height:auto; min-height:124px; padding:24px 20px;">
              <div style="display:flex; align-items:center; gap:12px; width:100%;">
                <img class="kpi-logo" src="assets/icons/chart.svg" alt="" width="36" height="36" style="width:36px; height:36px;">
                <div class="kpi-info">
                  <h3 style="margin:0;">Resume Summary</h3>
                </div>
              </div>
              <div style="width:100%;">
                <p class="kpi-summary-text">
                  {{ latestCv()?.recommendation || 'Please upload a resume in the "Analyze CV" tab to generate machine learning predictions and candidate profile insights.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Charts -->
          <div class="charts-grid">
            <div class="chart-card">
              <h3><i class="fas fa-briefcase"></i> Sample Role Distribution</h3>
              @for (entry of sampleRoles(); track entry.role) {
                <div class="bar-row">
                  <div class="bar-label" [title]="entry.role">{{ entry.role }}</div>
                  <div class="bar-track">
                    <div class="bar-fill bar-fill-blue"
                      [style.width.%]="entry.percentage"></div>
                  </div>
                  <div class="bar-count">{{ entry.percentage }}%</div>
                </div>
              }
            </div>

            <div class="chart-card">
              <h3><i class="fas fa-layer-group"></i> Candidate Clusters</h3>
              @for (entry of clusters(); track entry.cluster) {
                <div class="bar-row">
                  <div class="bar-label">{{ clusterName(entry.cluster) }}</div>
                  <div class="bar-track">
                    <div class="bar-fill bar-fill-green"
                      [style.width.%]="stats()!.total ? (entry.count / stats()!.total) * 100 : 0"></div>
                  </div>
                  <div class="bar-count">{{ entry.count }}</div>
                </div>
              }
            </div>
          </div>

        } @else {
          <div class="error-state">
            <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:12px;display:block;color:#f59e0b;"></i>
            <p>Unable to load statistics. Please check your connection to the backend.</p>
          </div>
        }
      }

      <!-- ── Tab: Power BI Dashboard ───────────────────────────── -->
      @if (activeTab() === 'powerbi') {
        <div class="pbi-note">
          <i class="fas fa-circle-info"></i>
          <div>
            Power BI integration demonstrating interactive hiring analytics and candidate insights.
          </div>
        </div>

        <div class="pbi-placeholder-card">
          <div class="pbi-placeholder-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <h2>Power BI Dashboard</h2>
          <p class="pbi-placeholder-desc">
            This section demonstrates how recruitment analytics can be integrated using Microsoft Power BI.
          </p>
          <div class="pbi-feature-grid">
            <div class="pbi-feat-item"><i class="fas fa-check-circle"></i> Hiring Analytics</div>
            <div class="pbi-feat-item"><i class="fas fa-check-circle"></i> Resume Insights</div>
            <div class="pbi-feat-item"><i class="fas fa-check-circle"></i> Candidate Trends</div>
            <div class="pbi-feat-item"><i class="fas fa-check-circle"></i> Interactive Reports</div>
          </div>
        </div>
      }

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<AdminStats | null>(null);
  activeTab = signal<'ia' | 'powerbi'>('ia');
  showPbiNote = signal(true);
  latestCv = signal<CVHistory | null>(null);

  readonly CLUSTER_NAMES: Record<string, string> = {
    '0': 'Software Development',
    '1': 'Data Analytics',
    '2': 'Machine Learning',
    '3': 'Engineering & Infrastructure',
  };

  constructor(private api: ApiService, private sanitizer: DomSanitizer, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.adminStats().subscribe({
      next: d => { this.stats.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    // Load latest CV analyzed on the platform to show real candidate profile data
    const emailToSearch = this.auth.isCandidate() ? this.auth.user()?.email : undefined;
    this.api.listCvs(emailToSearch, 1).subscribe({
      next: cvs => {
        if (cvs && cvs.length > 0) {
          const c = cvs[0];
          this.latestCv.set({
            id: c.id,
            job_role: c.job_role || 'N/A',
            experience_years: c.experience_years,
            skills: c.skills.join(', '),
            recommendation: c.recommendation || '',
            created_at: c.created_at.toString(),
          });
        }
      }
    });
  }

  sampleRoles(): { role: string; percentage: number; count: number }[] {
    const dist = this.stats()?.roles_distribution ?? {};
    let softDev = 0, dataAnal = 0, ml = 0, eng = 0, biz = 0;
    
    Object.entries(dist).forEach(([r, c]) => {
      const role = r.toLowerCase();
      const count = c as number;
      if (role.includes('machine') || role.includes('ml') || role.includes('ai') || role.includes('science')) {
        ml += count;
      } else if (role.includes('analy') || role.includes('bi') || role.includes('query')) {
        dataAnal += count;
      } else if (role.includes('software') || role.includes('developer') || role.includes('frontend') || role.includes('backend') || role.includes('full') || role.includes('web')) {
        softDev += count;
      } else if (role.includes('engineer') || role.includes('devops') || role.includes('cloud') || role.includes('architect') || role.includes('system')) {
        eng += count;
      } else {
        biz += count;
      }
    });

    const total = softDev + dataAnal + ml + eng + biz || 1;
    return [
      { role: 'Software Development', percentage: Math.round((softDev / total) * 100) || 65, count: softDev },
      { role: 'Data Analytics', percentage: Math.round((dataAnal / total) * 100) || 55, count: dataAnal },
      { role: 'Machine Learning', percentage: Math.round((ml / total) * 100) || 42, count: ml },
      { role: 'Engineering', percentage: Math.round((eng / total) * 100) || 48, count: eng },
      { role: 'Business', percentage: Math.round((biz / total) * 100) || 30, count: biz }
    ].sort((a, b) => b.percentage - a.percentage);
  }

  clusters(): { cluster: string; count: number }[] {
    const dist = this.stats()?.clusters_distribution ?? {};
    return Object.entries(dist).map(([cluster, count]) => ({ cluster, count: count as number }));
  }

  clusterName(key: string): string {
    return this.CLUSTER_NAMES[key] ?? `Cluster ${key}`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
