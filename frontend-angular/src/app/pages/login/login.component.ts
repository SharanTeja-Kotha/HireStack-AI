import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
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
          <h2 class="auth-headline">Welcome Back 👋<br>Sign in to <span class="gradient-text">HireStack</span></h2>
          <p class="auth-sub">Access your resume analysis, job applications, and AI-powered job matches.</p>
          <div class="auth-feats">
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/lightning.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Instant Analysis</h4><p>Hiring probability & salary estimates in 3 seconds</p></div>
            </div>
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/match.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Targeted Matches</h4><p>The best jobs matched to your professional profile</p></div>
            </div>
            <div class="auth-feat">
              <div class="auth-feat-ic"><img src="assets/icons/shield.svg" alt="" width="48" height="48"></div>
              <div class="auth-feat-txt"><h4>Secure & Private</h4><p>JWT & role-based access control</p></div>
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
          <h1>Sign In</h1>
          <p class="auth-card-sub">Enter your credentials to access your account.</p>

          <form class="auth-form" (ngSubmit)="submit()">
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
                <input [type]="showPwd() ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="••••••••" autocomplete="current-password">
                <button type="button" class="auth-pwd-toggle" (click)="showPwd.set(!showPwd())" [attr.aria-label]="showPwd() ? 'Hide' : 'Show'">
                  <i class="fas" [class.fa-eye]="!showPwd()" [class.fa-eye-slash]="showPwd()"></i>
                </button>
              </div>
            </div>

            @if (error()) {
              <div class="auth-error"><i class="fas fa-circle-exclamation"></i> {{ error() }}</div>
            }

            <button type="submit" class="auth-submit" [disabled]="loading()">
              @if (loading()) { <i class="fas fa-circle-notch fa-spin"></i> Signing In... }
              @else { <i class="fas fa-right-to-bracket"></i> Sign In }
            </button>
          </form>

          <p class="auth-switch">
            Don't have an account? <a routerLink="/register">Create Account</a>
          </p>
        </div>
      </div>

    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);

  email = '';
  password = '';
  showPwd = signal(false);
  loading = signal(false);
  error   = signal('');

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.go();
  }

  submit(): void {
    if (!this.email.trim() || !this.password) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('✅ Login successful!', 'success');
        this.go();
      },
      error: (e: { error?: { detail?: string } }) => {
        this.loading.set(false);
        this.error.set(e.error?.detail ?? 'Incorrect email or password.');
      },
    });
  }

  private go(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    if (redirect) { this.router.navigateByUrl(redirect); return; }
    const role = this.auth.user()?.role;
    const dest = role === 'admin' ? '/admin'
      : role === 'recruiter' ? '/recruiter'
      : role === 'candidate' ? '/candidate'
      : '/';
    this.router.navigate([dest]);
  }
}
