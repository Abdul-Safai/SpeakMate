// src/app/pages/register/register.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css', '../home/home.css'],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // visibility flags used in the HTML
  showPassword = false;
  showConfirm = false;
  showSecretText = false;

  submitting = false;
  serverError = '';

  form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['student' as UserRole, [Validators.required]],
      secretCode: [''], // conditionally required for instructor/admin
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agree: [false, [Validators.requiredTrue]],
    },
    {
      validators: (group) => {
        const p = group.get('password')?.value || '';
        const c = group.get('confirmPassword')?.value || '';
        return p && c && p !== c ? { passwordMismatch: true } : null;
      },
    }
  );

  ngOnInit(): void {
    // Ensure user is logged OUT while registering
    if (this.auth.isLoggedIn) {
      this.auth.logout();
    }

    // Make secretCode required only for instructor/admin
    const roleCtrl = this.form.get('role')!;
    const secretCtrl = this.form.get('secretCode')!;
    roleCtrl.valueChanges.subscribe((role) => {
      if (role === 'instructor' || role === 'admin') {
        secretCtrl.addValidators([Validators.required]);
      } else {
        secretCtrl.clearValidators();
        secretCtrl.setErrors(null);
      }
      secretCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  // used by *ngIf in template
  get showSecret() {
    const role = this.form.get('role')?.value;
    return role === 'instructor' || role === 'admin';
  }

  // used by [class.invalid]/[class.valid] bindings
  fieldInvalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }
  fieldValid(name: string) {
    const c = this.form.get(name);
    return !!c && c.valid && (c.dirty || c.touched);
  }

  // used by (click) on the show/hide buttons
  toggle(which: 'password' | 'confirm' | 'secret') {
    if (which === 'password') this.showPassword = !this.showPassword;
    if (which === 'confirm')  this.showConfirm  = !this.showConfirm;
    if (which === 'secret')   this.showSecretText = !this.showSecretText;
  }

  async onSubmit() {
    this.serverError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const role = this.form.get('role')!.value as UserRole;
    const fullName = this.form.get('fullName')!.value!.toString().trim();
    const email = this.form.get('email')!.value!.toString().trim();
    const password = this.form.get('password')!.value!.toString();
    const secretCtrl = this.form.get('secretCode')!;
    const rawSecret = (secretCtrl.value || '') as string;

    try {
      this.submitting = true;

      // 1) Verify secret only for instructor/admin
      if (this.showSecret) {
        const code = rawSecret.trim().toUpperCase();
        if (!code) {
          secretCtrl.setErrors({ required: true });
          return;
        }
        const res = await this.auth.verifySecret(role, code);
        if (!res.ok) {
          secretCtrl.setErrors({ invalidSecret: true });
          this.serverError = res.error || 'Incorrect secret code.';
          return;
        }
        // Clear any previous error on success
        secretCtrl.setErrors(null);
        secretCtrl.updateValueAndValidity({ emitEvent: false });
      }

      // 2) Register (AuthService.register does NOT auto-login)
      await this.auth.register({
        fullName,
        email,
        password,
        role,
        secretCode: this.showSecret ? rawSecret.trim().toUpperCase() : undefined,
      });

      // 3) Go to LOGIN and show a friendly banner
      this.router.navigate(['/login'], {
        queryParams: { registered: '1' },
        state: { flash: 'Account created! Please log in.' }
      });
    } catch (e: any) {
      this.serverError = e?.message || 'Registration failed.';
    } finally {
      this.submitting = false;
    }
  }
}
