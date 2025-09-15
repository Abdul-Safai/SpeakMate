import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import type { UserRole } from '../../core/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const p = group.get('password')?.value;
  const c = group.get('confirmPassword')?.value;
  return p && c && p !== c ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css', '../home/home.css'],
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  submitting = false;
  serverError = '';

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    this.form = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['student' as UserRole, Validators.required],
        secretCode: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        agree: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.form.get('role')!.valueChanges.subscribe((role) => {
      const sc = this.form.get('secretCode')!;
      if (role === 'student') { sc.clearValidators(); sc.setValue(''); }
      else { sc.setValidators([Validators.required, Validators.minLength(4)]); }
      sc.updateValueAndValidity();
    });
  }

  get showSecret(): boolean {
    const role = this.form.get('role')!.value as UserRole;
    return role === 'instructor' || role === 'admin';
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  async onSubmit(): Promise<void> {
    this.serverError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { fullName, email, password, role, secretCode } = this.form.value as {
      fullName: string; email: string; password: string; role: UserRole; secretCode?: string;
    };

    this.submitting = true;
    try {
      await this.auth.register({ fullName, email, password, role, secretCode });
      this.router.navigate(['/login']);
    } catch (e: any) {
      const status = e?.status;
      const code = e?.error?.code;
      if (status === 403 && code === 'INVALID_SECRET') {
        this.form.get('secretCode')!.setErrors({ invalidSecret: true });
      } else if (status === 409 && code === 'EMAIL_TAKEN') {
        this.serverError = 'That email is already registered.';
      } else {
        this.serverError = e?.error?.message || 'Registration failed. Please try again.';
      }
    } finally {
      this.submitting = false;
    }
  }
}
