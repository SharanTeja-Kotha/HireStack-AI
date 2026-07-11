import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { Application, CVHistory, Notification } from '../../core/models';

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .portal-tabs{display:flex;gap:4px;margin-bottom:28px;border-bottom:2px solid #e8edf2;padding-bottom:0;}
    .ptab{padding:12px 22px;border:none;background:transparent;font-weight:700;font-size:.9rem;cursor:pointer;color:#64748b;border-bottom:2px solid transparent;transition:all .25s;margin-bottom:-2px;}
    .ptab:hover{color:#0ea5e9;}
    .ptab.active{color:#0ea5e9;border-bottom-color:#0ea5e9;}
    .app-card{background:#fff;border:1.5px solid rgba(226,232,240,.7);border-radius:18px;padding:22px;transition:all .3s;box-shadow:0 2px 12px rgba(0,0,0,.04);}
    .app-card:hover{box-shadow:0 10px 28px rgba(0,0,0,.08);transform:translateY(-2px);}
    .status-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:.7rem;font-weight:800;letter-spacing:.03em;}
    .status-pending{background:#fef9c3;color:#854d0e;}
    .status-accepted{background:#dcfce7;color:#15803d;}
    .status-rejected{background:#fee2e2;color:#dc2626;}
    .status-reviewed{background:#dbeafe;color:#1d4ed8;}
    .cv-card{background:#fff;border:1.5px solid rgba(226,232,240,.7);border-radius:18px;padding:22px;transition:all .3s;box-shadow:0 2px 12px rgba(0,0,0,.04);}
    .cv-card:hover{box-shadow:0 10px 28px rgba(0,0,0,.08);transform:translateY(-3px);border-color:rgba(56,189,248,.25);}
    .hire-bar{height:8px;border-radius:999px;background:#e2e8f0;margin-top:10px;overflow:hidden;}
    .hire-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#38bdf8,#a855f7);}
    .auth-box{max-width:440px;margin:60px auto;background:#fff;border:1.5px solid rgba(226,232,240,.6);border-radius:24px;padding:36px;box-shadow:0 8px 40px rgba(0,0,0,.08);}
    .form-group label{display:block;font-size:.74rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;margin-top:14px;}
    .form-group input{width:100%;padding:11px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:.92rem;font-family:inherit;outline:none;box-sizing:border-box;background:#f8fafc;transition:all .25s;}
    .form-group input:focus{border-color:#0ea5e9;background:#fff;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
    .role-tabs{display:flex;gap:8px;margin-bottom:16px;}
    .rtab{flex:1;padding:10px;border-radius:12px;border:1.5px solid #e2e8f0;background:transparent;font-weight:700;font-size:.8rem;cursor:pointer;transition:all .25s;color:#64748b;}
    .rtab.active{border-color:#0ea5e9;color:#0ea5e9;background:#f0f9ff;box-shadow:0 0 0 3px rgba(14,165,233,.08);}
    .notif-item{background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:14px 18px;cursor:pointer;transition:all .25s;}
    .notif-item:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);}
    .notif-item.unread{border-left:4px solid #0ea5e9;background:#f0f9ff;}
    .notif-icon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
    .ni-application_confirmed{background:#e0f2fe;color:#0369a1;}
    .ni-accepted{background:#dcfce7;color:#15803d;}
    .ni-rejected{background:#fee2e2;color:#dc2626;}
    .ni-application_received{background:#f3e8ff;color:#7c3aed;}
    .ni-default{background:#f1f5f9;color:#64748b;}
    .meeting-box{background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-top:12px;}
    .rejection-box{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:12px 16px;margin-top:12px;font-size:.85rem;color:#9a3412;}

    .dash-overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:24px;margin-top:12px;}
    .space-card{background:#fff;border:1.5px solid rgba(226,232,240,.7);border-radius:20px;padding:24px;box-shadow:0 8px 24px rgba(15,23,42,.03);transition:all .3s;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;box-sizing:border-box;}
    .space-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(15,23,42,.06);border-color:rgba(56,189,248,.25);}
    .card-header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;}
    .card-header-row h3{font-size:1.02rem;font-weight:800;color:#0f172a;margin:0;display:flex;align-items:center;gap:8px;}
    .status-tag{padding:4px 10px;border-radius:999px;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.02em;}
    .status-comp{background:#dcfce7;color:#15803d;}
    .status-none{background:#f1f5f9;color:#64748b;}
    .resume-info-item{display:flex;gap:12px;align-items:center;background:#f8fafc;padding:12px 16px;border-radius:14px;border:1px solid #e2e8f0;}
    .resume-icon-circle{width:42px;height:42px;border-radius:50%;background:#fee2e2;color:#ef4444;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
    .resume-filename{font-size:0.9rem;font-weight:700;color:#1e293b;margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;}
    .resume-meta{font-size:0.75rem;color:#64748b;margin:2px 0 0;}
    .analysis-status-row{display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:0.85rem;color:#475569;}
    .insight-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:0.88rem;color:#475569;}
    .insight-row strong{color:#0f172a;font-weight:700;}
    .skill-badge-purple{display:inline-block;padding:4px 10px;font-size:0.7rem;font-weight:700;color:#6d28d9;background:#f3e8ff;border:1px solid #e9d5ff;border-radius:999px;text-transform:uppercase;}
    .badge-count{background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:999px;font-size:0.75rem;font-weight:800;}
    .empty-state-small{text-align:center;padding:16px 0;color:#94a3b8;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;}
    .empty-state-small i{font-size:1.8rem;margin-bottom:8px;display:block;color:#cbd5e1;}
    .empty-state-small p{font-size:0.8rem;margin:0 0 10px;}
    .btn-primary-small{display:inline-block;padding:6px 12px;font-size:0.75rem;font-weight:700;color:#fff;background:#0ea5e9;border:none;border-radius:8px;cursor:pointer;text-decoration:none;transition:all 0.2s;}
    .btn-primary-small:hover{background:#0284c7;}
    .btn-secondary-small{display:inline-block;padding:6px 12px;font-size:0.75rem;font-weight:700;color:#0ea5e9;background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.15);border-radius:8px;cursor:pointer;text-decoration:none;transition:all 0.2s;}
    .btn-secondary-small:hover{background:rgba(14,165,233,0.12);}
    .summary-para{font-size:0.88rem;color:#475569;line-height:1.6;margin:0;}
    .empty-state-card{background:#fff;border:1.5px solid rgba(226,232,240,.7);border-radius:24px;padding:48px 32px;text-align:center;box-shadow:0 8px 24px rgba(15,23,42,.03);max-width:540px;margin:24px auto;}
    .empty-state-icon{width:56px;height:56px;border-radius:50%;background:rgba(14,165,233,0.08);color:#0ea5e9;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 16px;box-shadow:0 4px 12px rgba(14,165,233,0.12);}
    .empty-state-card h3{font-size:1.15rem;font-weight:800;color:#0f172a;margin:0 0 8px;}
    .empty-state-card p{font-size:0.88rem;color:#64748b;line-height:1.5;margin:0 0 20px;}
    .btn-primary-glow{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;font-size:0.88rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#0ea5e9,#38bdf8);border:none;border-radius:12px;cursor:pointer;text-decoration:none;transition:all 0.2s;box-shadow:0 4px 12px rgba(14,165,233,0.25);}
    .btn-primary-glow:hover{box-shadow:0 6px 16px rgba(14,165,233,0.35);transform:translateY(-1px);}
  `],
  template: `
    <div class="container" style="padding-top:40px;max-width:900px;">
      @if (!auth.isLoggedIn()) {
        <!-- Auth Gate -->
        <div class="auth-box">
          <div style="font-size:2.5rem;text-align:center;margin-bottom:12px;">👤</div>
          <h2 style="text-align:center;font-size:1.4rem;font-weight:800;margin-bottom:6px;">My Candidate Space</h2>
          <p style="text-align:center;color:#64748b;font-size:.9rem;margin-bottom:20px;">Sign in to access your applications and resumes.</p>
          <div class="role-tabs">
            <button class="rtab" [class.active]="authTab()==='login'" (click)="authTab.set('login')">Sign In</button>
            <button class="rtab" [class.active]="authTab()==='register'" (click)="authTab.set('register')">Sign Up</button>
          </div>
          @if (authTab() === 'register') {
            <div class="form-group"><label>Full Name</label><input [(ngModel)]="regName" placeholder="John Doe"></div>
          }
          <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="loginEmail" placeholder="you@example.com"></div>
          <div class="form-group"><label>Password</label><input type="password" [(ngModel)]="loginPwd" placeholder="••••••••"></div>
          @if (authError()) { <p style="color:#ef4444;font-size:12px;margin-top:8px;">{{ authError() }}</p> }
          <button class="btn btn-primary" style="width:100%;margin-top:14px;" (click)="doAuth()">
            {{ authTab() === 'login' ? 'Sign In' : 'Create Account' }}
          </button>
        </div>
      } @else if (auth.isAdmin() || auth.isRecruiter()) {
        <div style="text-align:center;padding:60px;color:#94a3b8;">
          <i class="fas fa-ban" style="font-size:3rem;display:block;margin-bottom:12px;color:#ef4444;"></i>
          <h2 style="font-size:1.4rem;color:#1e293b;margin-bottom:8px;">Access Denied</h2>
          <p>The candidate space is reserved for candidates.</p>
          <button class="btn btn-primary" style="margin-top:16px;" (click)="auth.logout()">Logout</button>
        </div>
      } @else {
        <!-- Dashboard -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:1.8rem;font-weight:800;margin:0;"><i class="fas fa-user-circle" style="color:#0ea5e9;"></i> My Space</h1>
            <p style="color:#64748b;margin:4px 0 0;">{{ auth.user()?.full_name || auth.user()?.email }}</p>
          </div>
        </div>

        <div class="portal-tabs">
          <button class="ptab" [class.active]="portalTab()==='dashboard'" (click)="switchTab('dashboard')">
            <i class="fas fa-columns"></i> Dashboard
          </button>
          <button class="ptab" [class.active]="portalTab()==='apps'" (click)="switchTab('apps')">
            <i class="fas fa-paper-plane"></i> My Applications ({{ applications().length }})
          </button>
          <button class="ptab" [class.active]="portalTab()==='cvs'" (click)="switchTab('cvs')">
            <i class="fas fa-file-alt"></i> Resume History ({{ cvHistory().length }})
          </button>
          <button class="ptab" [class.active]="portalTab()==='notifs'" (click)="switchTab('notifs')">
            <i class="fas fa-bell"></i> Notifications
            @if (unreadCount() > 0) { <span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:999px;font-size:.7rem;margin-left:4px;">{{ unreadCount() }}</span> }
          </button>
        </div>

        @if (loading()) {
          <div style="text-align:center;padding:60px;color:#94a3b8;"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem;"></i></div>
        }

        <!-- Dashboard Overview Tab -->
        @if (portalTab() === 'dashboard' && !loading()) {
          <div class="dash-overview-grid">
            
            <!-- Resume History Card -->
            <div class="space-card">
              <div class="card-header-row">
                <h3><i class="fas fa-history" style="color:#0ea5e9;"></i> Resume History</h3>
                @if (latestCv()) {
                  <span class="status-tag status-comp">Active</span>
                } @else {
                  <span class="status-tag status-none">None</span>
                }
              </div>
              <div class="card-body-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                @if (latestCv()) {
                  <div class="resume-info-item">
                    <div class="resume-icon-circle"><i class="fas fa-file-pdf"></i></div>
                    <div style="min-width:0;flex:1;">
                      <h4 class="resume-filename">Resume_{{ latestCv()!.id }}.pdf</h4>
                      <p class="resume-meta">Uploaded on {{ formatDate(latestCv()!.created_at) }}</p>
                    </div>
                  </div>
                  <div class="analysis-status-row">
                    <span>Analysis Status:</span>
                    <strong style="color:#10b981;"><i class="fas fa-check-circle"></i> Completed</strong>
                  </div>
                } @else {
                  <div class="empty-state-small">
                    <i class="fas fa-file-invoice"></i>
                    <p>No resume uploaded yet.</p>
                    <a routerLink="/analyze" class="btn btn-primary-small"><i class="fas fa-upload"></i> Upload Resume</a>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Analysis Card -->
            <div class="space-card">
              <div class="card-header-row">
                <h3><i class="fas fa-robot" style="color:#a855f7;"></i> Recent Analysis</h3>
              </div>
              <div class="card-body-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                @if (latestCv()) {
                  <div class="insight-row">
                    <span>Predicted Role:</span>
                    <strong>{{ latestCv()!.job_role || 'N/A' }}</strong>
                  </div>
                  <div class="insight-row">
                    <span>Candidate Cluster:</span>
                    <strong style="color:#8b5cf6;">{{ clusterName(latestCv()!.candidate_cluster) }}</strong>
                  </div>
                  <div class="insight-row" style="flex-direction:column; align-items:flex-start; gap:8px; border-top:1px solid #f1f5f9; padding-top:14px; margin-top:14px;">
                    <span style="font-weight:600; color:#475569;">Top Skills Detected:</span>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                      @if (latestCv()!.skills) {
                        @for (skill of latestCv()!.skills!.split(',').slice(0, 5); track skill) {
                          <span class="skill-badge-purple">{{ skill.trim() }}</span>
                        }
                      } @else {
                        <span style="color:#94a3b8; font-size:0.8rem;">No skills detected</span>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="empty-state-small">
                    <i class="fas fa-circle-nodes" style="color:#cbd5e1;"></i>
                    <p>No analysis results available.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Saved Jobs Card -->
            <div class="space-card">
              <div class="card-header-row">
                <h3><i class="fas fa-bookmark" style="color:#eab308;"></i> Saved Jobs</h3>
                <span class="badge-count">{{ savedJobsCount() }}</span>
              </div>
              <div class="card-body-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                @if (savedJobsCount() > 0) {
                  <p style="color:#475569; font-size:0.88rem; margin-bottom:14px; text-align:center;">You have {{ savedJobsCount() }} job(s) bookmarked for review.</p>
                  <div style="text-align:center;">
                    <a routerLink="/jobs" class="btn btn-secondary-small">View Saved Jobs</a>
                  </div>
                } @else {
                  <div class="empty-state-small">
                    <i class="fas fa-bookmark" style="color:#cbd5e1;"></i>
                    <p>No bookmarked jobs yet.</p>
                    <a routerLink="/jobs" class="btn btn-secondary-small">Explore Jobs</a>
                  </div>
                }
              </div>
            </div>

            <!-- Profile Summary / Recommendation Box -->
            @if (latestCv()) {
              <div class="space-card" style="grid-column: 1 / -1; min-height: auto;">
                <div class="card-header-row" style="margin-bottom: 12px;">
                  <h3><i class="fas fa-lightbulb" style="color:#10b981;"></i> Profile Recommendation Summary</h3>
                </div>
                <div class="card-body-content">
                  <p class="summary-para">{{ latestCv()!.recommendation || 'No recommendation summary generated.' }}</p>
                </div>
              </div>
            }

          </div>
        }

        <!-- Applications Tab -->
        @if (portalTab() === 'apps' && !loading()) {
          @if (!applications().length) {
            <div class="empty-state-card">
              <div class="empty-state-icon">
                <i class="fas fa-paper-plane"></i>
              </div>
              <h3>No Applications Yet</h3>
              <p>You haven't submitted any job applications yet. Upload your resume and browse recommended job openings to start your career journey.</p>
              <a routerLink="/jobs" class="btn-primary-glow"><i class="fas fa-search"></i> Discover Job Openings</a>
            </div>
          } @else {
            <div style="display:flex;flex-direction:column;gap:14px;">
              @for (app of applications(); track app.id) {
                <div class="app-card">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                    <div>
                      <h3 style="font-size:1rem;font-weight:700;margin:0 0 4px;">{{ app.job_title || 'Role #'+app.job_post_id }}</h3>
                      <div style="font-size:.85rem;color:#64748b;">
                        @if (app.company_name) { <span><i class="fas fa-building"></i> {{ app.company_name }}</span> }
                        @if (app.job_location) { <span style="margin-left:10px;"><i class="fas fa-map-marker-alt"></i> {{ app.job_location }}</span> }
                      </div>
                    </div>
                    <span class="status-badge status-{{ app.status }}">{{ statusLabel(app.status) }}</span>
                  </div>
                  @if (app.cover_letter) {
                    <p style="font-size:.82rem;color:#64748b;margin:8px 0 0;background:#f8fafc;padding:8px 12px;border-radius:8px;">
                      {{ app.cover_letter }}
                    </p>
                  }
                  @if (app.status === 'accepted') {
                    <div class="meeting-box">
                      <div style="font-weight:700;font-size:.9rem;color:#15803d;margin-bottom:10px;"><i class="fas fa-check-circle"></i> Congratulations! Your application has been accepted</div>
                      @if (app.meeting_type) {
                        <div style="font-size:.85rem;color:#166534;margin-bottom:6px;"><i class="fas fa-video" style="width:18px;"></i> Interview Type: <strong>{{ meetingTypeLabel(app.meeting_type) }}</strong></div>
                      }
                      @if (app.meeting_slots?.length) {
                        <div style="margin-bottom:8px;">
                          <div style="font-size:.75rem;font-weight:700;color:#166534;text-transform:uppercase;margin-bottom:4px;"><i class="fas fa-calendar"></i> Proposed Slots</div>
                          @for (slot of app.meeting_slots!; track slot) {
                            <div style="font-size:.85rem;color:#166534;padding:4px 0;">• {{ slot }}</div>
                          }
                        </div>
                      }
                      @if (app.meeting_link) {
                        <div style="font-size:.85rem;margin-bottom:4px;"><i class="fas fa-link" style="width:18px;color:#166534;"></i> <a [href]="app.meeting_link" target="_blank" style="color:#0369a1;font-weight:600;">Join Video Call</a></div>
                      }
                      @if (app.meeting_location) {
                        <div style="font-size:.85rem;color:#166534;margin-bottom:4px;"><i class="fas fa-map-marker-alt" style="width:18px;"></i> {{ app.meeting_location }}</div>
                      }
                      @if (app.recruiter_contact) {
                        <div style="font-size:.85rem;color:#166534;margin-bottom:4px;"><i class="fas fa-envelope" style="width:18px;"></i> {{ app.recruiter_contact }}</div>
                      }
                      @if (app.preparation_notes) {
                        <div style="font-size:.82rem;color:#166534;margin-top:8px;padding-top:8px;border-top:1px solid #bbf7d0;">
                          <div style="font-weight:700;margin-bottom:4px;"><i class="fas fa-lightbulb"></i> Preparation Instructions</div>
                          {{ app.preparation_notes }}
                        </div>
                      }
                    </div>
                  }
                  @if (app.status === 'rejected' && app.rejection_reason) {
                    <div class="rejection-box">
                      <div style="font-weight:700;margin-bottom:4px;"><i class="fas fa-info-circle"></i> Feedback from Recruiter</div>
                      {{ app.rejection_reason }}
                    </div>
                  }
                  <div style="font-size:.78rem;color:#94a3b8;margin-top:8px;">
                    <i class="fas fa-clock"></i> Applied on {{ formatDate(app.created_at) }}
                    @if (app.updated_at && app.updated_at !== app.created_at) {
                      · Updated on {{ formatDate(app.updated_at) }}
                    }
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- CV History Tab -->
        @if (portalTab() === 'cvs' && !loading()) {
          @if (!cvHistory().length) {
            <div style="text-align:center;padding:60px;color:#94a3b8;">
              <i class="fas fa-file-alt" style="font-size:2.5rem;display:block;margin-bottom:12px;"></i>
              <p>No resumes analyzed with this account.</p>
              <a routerLink="/analyze" class="btn btn-primary" style="margin-top:12px;"><i class="fas fa-plus"></i> Analyze a Resume</a>
            </div>
          } @else {
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
              @for (cv of cvHistory(); track cv.id) {
                <div class="cv-card">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    <h3 style="font-size:1rem;font-weight:700;margin:0 0 4px;color:#1e293b;">{{ cv.job_role || 'CV #'+cv.id }}</h3>
                    <span style="font-size:.75rem;color:#94a3b8;">#{{ cv.id }}</span>
                  </div>
                  <div style="font-size:.82rem;color:#64748b;margin-bottom:10px;">
                    <i class="fas fa-briefcase"></i> {{ cv.experience_years }} yrs exp.
                    @if (cv.education) { · <i class="fas fa-graduation-cap"></i> {{ cv.education }} }
                  </div>
                  @if (cv.hire_probability !== null && cv.hire_probability !== undefined) {
                    <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px;">
                      <span style="color:#64748b;font-weight:600;">Hiring Probability</span>
                      <strong [style.color]="probColor(cv.hire_probability)">{{ (cv.hire_probability*100).toFixed(0) }}%</strong>
                    </div>
                    <div class="hire-bar"><div class="hire-fill" [style.width.%]="cv.hire_probability*100"></div></div>
                  }
                  @if (cv.predicted_salary) {
                    <div style="font-size:.88rem;font-weight:700;color:#16a34a;margin-top:8px;">
                      <i class="fas fa-dollar-sign"></i> {{ formatSalary(cv.predicted_salary) }}/yr
                    </div>
                  }
                  @if (cv.skills) {
                    <div style="font-size:.78rem;color:#64748b;margin-top:8px;">
                      <i class="fas fa-code"></i> {{ cv.skills.split(',').slice(0,4).join(', ') }}
                    </div>
                  }
                  <div style="font-size:.75rem;color:#94a3b8;margin-top:8px;">
                    <i class="fas fa-calendar"></i> {{ formatDate(cv.created_at) }}
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- Notifications Tab -->
        @if (portalTab() === 'notifs' && !loading()) {
          @if (!notifications().length) {
            <div style="text-align:center;padding:60px;color:#94a3b8;">
              <i class="fas fa-bell" style="font-size:2.5rem;display:block;margin-bottom:12px;"></i>
              <p>No notifications at the moment.</p>
            </div>
          } @else {
            <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
              @if (unreadCount() > 0) {
                <button (click)="markAllRead()" style="background:none;border:1.5px solid #0ea5e9;color:#0ea5e9;padding:6px 14px;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;">
                  <i class="fas fa-check-double"></i> Mark All as Read
                </button>
              }
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              @for (n of notifications(); track n.id) {
                <div class="notif-item" [class.unread]="!n.is_read" (click)="readNotif(n)">
                  <div style="display:flex;gap:14px;align-items:flex-start;">
                    <div class="notif-icon ni-{{ n.type }}">
                      <i class="fas {{ notifIcon(n.type) }}"></i>
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                        <div style="font-weight:700;font-size:.9rem;color:#1e293b;">{{ n.title }}</div>
                        <div style="font-size:.72rem;color:#94a3b8;white-space:nowrap;">{{ formatNotifTime(n.created_at) }}</div>
                      </div>
                      <div style="font-size:.85rem;color:#64748b;margin-top:2px;line-height:1.4;">{{ n.message }}</div>
                      @if (!n.is_read) {
                        <span style="display:inline-block;margin-top:4px;background:#0ea5e9;color:#fff;padding:1px 8px;border-radius:999px;font-size:.7rem;font-weight:700;">New</span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
})
export class CandidatePortalComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  authTab   = signal<'login' | 'register'>('login');
  portalTab = signal<'dashboard' | 'apps' | 'cvs' | 'notifs'>('dashboard');
  loading   = signal(false);

  applications  = signal<Application[]>([]);
  cvHistory     = signal<CVHistory[]>([]);
  notifications = signal<Notification[]>([]);
  unreadCount   = computed(() => this.notifications().filter(n => !n.is_read).length);
  savedJobsCount = signal(0);
  latestCv      = computed(() => this.cvHistory()[0] || null);

  readonly CLUSTER_NAMES: Record<string, string> = {
    '0': 'Software Development',
    '1': 'Data Analytics',
    '2': 'Machine Learning',
    '3': 'Engineering & Infrastructure',
  };

  loginEmail = ''; loginPwd = ''; regName = '';
  authError = signal('');

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadData();
  }

  switchTab(tab: 'dashboard' | 'apps' | 'cvs' | 'notifs'): void {
    this.portalTab.set(tab);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_jobs') || '[]');
      this.savedJobsCount.set(saved.length);
    } catch {
      this.savedJobsCount.set(0);
    }

    Promise.all([
      new Promise<void>(res => this.api.candidateApplications().subscribe({ next: d => { this.applications.set(d); res(); }, error: () => res() })),
      new Promise<void>(res => this.api.candidateCvHistory().subscribe({ next: d => { this.cvHistory.set(d); res(); }, error: () => res() })),
      new Promise<void>(res => this.api.getNotifications().subscribe({ next: d => { this.notifications.set(d); res(); }, error: () => res() })),
    ]).then(() => this.loading.set(false));
  }

  readNotif(n: Notification): void {
    if (n.is_read) return;
    this.api.markNotificationRead(n.id).subscribe({
      next: () => this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, is_read: true } : x)),
    });
  }

  markAllRead(): void {
    this.api.markAllNotificationsRead().subscribe({
      next: () => this.notifications.update(list => list.map(x => ({ ...x, is_read: true }))),
    });
  }

  doAuth(): void {
    this.authError.set('');
    const obs = this.authTab() === 'login'
      ? this.auth.login(this.loginEmail, this.loginPwd)
      : this.auth.register(this.loginEmail, this.loginPwd, this.regName, 'candidate');
    obs.subscribe({
      next: () => { this.loadData(); this.toast.show('✅ Connected!', 'success'); },
      error: (e: { error?: { detail?: string } }) => this.authError.set(e.error?.detail ?? 'Error'),
    });
  }

  notifIcon(type: string): string {
    const m: Record<string, string> = {
      application_confirmed: 'fa-paper-plane',
      application_received: 'fa-inbox',
      accepted: 'fa-check-circle',
      rejected: 'fa-times-circle',
    };
    return m[type] ?? 'fa-bell';
  }

  meetingTypeLabel(t: string): string {
    const m: Record<string, string> = { video: 'Video call', phone: 'Phone call', 'in-person': 'In-person interview' };
    return m[t] ?? t;
  }

  formatNotifTime(d: string): string {
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    return new Date(d).toLocaleDateString('en-US');
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { pending:'Pending', reviewed:'Reviewed', accepted:'Accepted ✅', rejected:'Rejected ❌' };
    return map[s] ?? s;
  }
  probColor(p: number): string { return p >= 0.7 ? '#16a34a' : p >= 0.5 ? '#f59e0b' : '#ef4444'; }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  formatSalary(n: number): string { return Math.round(n).toLocaleString(); }
  clusterName(c?: number): string {
    if (c === undefined || c === null) return 'N/A';
    return this.CLUSTER_NAMES[c.toString()] ?? `Cluster ${c}`;
  }
}
