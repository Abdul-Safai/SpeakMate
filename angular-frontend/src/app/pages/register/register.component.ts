import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css', '../home/home.css'], // keep header/footer consistent
})
export class RegisterComponent {
  submitting = false;
  serverError = '';
  form!: FormGroup;

  // UI toggles
  showPassword = false;
  showConfirm = false;
  showSecretText = false;

  // Demo secrets. Replace with server-side validation in production.
  private readonly SECRET_MAP: Record<'instructor' | 'admin', string> = {
    instructor: 'INSTRUCTOR-123',
    admin: 'ADMIN-123',
  };

  constructor(private fb: FormBuilder, private router: Router) {
    // Initialize AFTER fb is injected
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['student', [Validators.required]],
        secretCode: [''], // validators applied conditionally
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agree: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Toggle secretCode required based on role
    this.form.get('role')!.valueChanges.subscribe(() => {
      const secret = this.form.get('secretCode')!;
      if (this.showSecret) {
        secret.setValidators([Validators.required]);
      } else {
        secret.clearValidators();
        secret.setValue('');
        secret.setErrors(null);
      }
      secret.updateValueAndValidity({ emitEvent: false });
    });
  }

  get showSecret(): boolean {
    const role = this.form.get('role')?.value;
    return role === 'instructor' || role === 'admin';
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  fieldValid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.valid && (c.touched || c.dirty);
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass && confirm && pass !== confirm ? { passwordMismatch: true } : null;
  }

  private validateSecret(): boolean {
    if (!this.showSecret) return true;
    const role = this.form.get('role')!.value as 'instructor' | 'admin';
    const input = (this.form.get('secretCode')!.value || '').trim();
    const ok = input && input === this.SECRET_MAP[role];
    if (!ok) {
      this.form.get('secretCode')!.setErrors({
        ...(this.form.get('secretCode')!.errors || {}),
        invalidSecret: true,
      });
    }
    return ok;
    }

  async onSubmit(): Promise<void> {
    this.serverError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (!this.validateSecret()) return;

    try {
      this.submitting = true;
      // TODO: call your real register API here with this.form.value
      await new Promise((r) => setTimeout(r, 400)); // demo delay
      this.router.navigate(['/login']);
    } catch (e: any) {
      this.serverError = e?.error?.message || 'Registration failed. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
