import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    :host { display: block; }
  `],
  template: `
    <div class="auth-wrap">

      <!-- Brand panel -->
      <aside class="auth-aside">
        <div class="auth-orb auth-orb-1"></div>
        <div class="auth-orb auth-orb-2"></div>
        <div class="auth-aside-inner">
          <div class="auth-brand-row">
            <div class="brand-icon">HS</div>
            <strong>HireStack</strong>
          </div>
          <h2 class="auth-headline">Join <span class="gradient-text">HireStack</span><br>in seconds</h2>
          <p class="auth-sub">Create your free account and accelerate your job search with Machine Learning.</p>
          <div class="auth-feats">
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/cv-upload.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Analyze Resumes</h4><p>Upload PDF or use the interactive form</p></div>
            </div>
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/chart.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Track Your Progress</h4><p>History & hiring probability metrics</p></div>
            </div>
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/star.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Recommended Jobs</h4><p>AI matching across thousands of live postings</p></div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Form panel -->
      <div class="auth-main">
        <div class="auth-card">
          <div class="auth-mini-brand">
            <div class="brand-icon">HS</div><strong>HireStack</strong>
          </div>
          <a routerLink="/" class="auth-back"><i class="fas fa-arrow-left"></i> Back to Home</a>
          <h1>Create Account</h1>
          <p class="auth-card-sub">Choose your profile and create your free account.</p>

          <!-- Role selection -->
          <div class="auth-role-tabs">
            <div class="auth-role-tab" [class.active]="role()==='candidate'" (click)="role.set('candidate')">
              <i class="fas fa-user"></i>
              <span>Candidate</span>
              <small>Analyze my CV</small>
            </div>
            <div class="auth-role-tab" [class.active]="role()==='recruiter'" (click)="role.set('recruiter')">
              <i class="fas fa-briefcase"></i>
              <span>Recruiter</span>
              <small>Post job openings</small>
            </div>
          </div>

          <form class="auth-form" (ngSubmit)="submit()">
            <div class="auth-field">
              <label>Full Name</label>
              <div class="auth-input-wrap">
                <i class="fas fa-id-card"></i>
                <input type="text" name="fullName" [(ngModel)]="fullName" placeholder="John Doe" autocomplete="name">
              </div>
            </div>

            @if (role() === 'recruiter') {
              <div class="auth-field">
                <label>Company</label>
                <div class="auth-input-wrap">
                  <i class="fas fa-building"></i>
                  <input type="text" name="company" [(ngModel)]="company" placeholder="Your company name" autocomplete="organization">
                </div>
              </div>
            }

            <div class="auth-field">
              <label>Email Address</label>
              <div class="auth-input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" name="email" [(ngModel)]="email" placeholder="you@example.com" autocomplete="email">
              </div>
            </div>

            <div class="auth-field">
              <label>Password</label>
              <div class="auth-input-wrap">
                <i class="fas fa-lock"></i>
                <input [type]="showPwd() ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="Min. 6 characters" autocomplete="new-password">
                <button type="button" class="auth-pwd-toggle" (click)="showPwd.set(!showPwd())" [attr.aria-label]="showPwd() ? 'Hide' : 'Show'">
                  <i class="fas" [class.fa-eye]="!showPwd()" [class.fa-eye-slash]="showPwd()"></i>
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="auth-error"><i class="fas fa-circle-exclamation"></i> {{ error() }}</div>
            }

            <button type="submit" class="auth-submit" [disabled]="loading()">
              @if (loading()) { <i class="fas fa-circle-notch fa-spin"></i> Creating... }
              @else { <i class="fas fa-user-plus"></i> Create Account }
            </button>
          </form>

          <p class="auth-switch">
            Already have an account? <a routerLink="/login">Sign In</a>
          </p>
        </div>
      </div>

    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  role     = signal<'candidate' | 'recruiter'>('candidate');
  fullName = '';
  email    = '';
  password = '';
  company  = '';
  showPwd  = signal(false);
  loading  = signal(false);
  error    = signal('');

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.go();
  }

  submit(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters long.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.email.trim(), this.password, this.fullName.trim(), this.role(), this.company.trim() || undefined).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('🎉 Account created successfully!', 'success');
        this.go();
      },
      error: (e: { error?: { detail?: string } }) => {
        this.loading.set(false);
        this.error.set(e.error?.detail ?? 'An error occurred during account creation.');
      },
    });
  }

  private go(): void {
    const role = this.auth.user()?.role;
    const dest = role === 'admin' ? '/admin'
      : role === 'recruiter' ? '/recruiter'
      : '/candidate';
    this.router.navigate([dest]);
  }
}
