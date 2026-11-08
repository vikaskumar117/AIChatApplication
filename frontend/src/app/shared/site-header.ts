import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService, Credentials } from '../auth/auth-session.service';

type AuthMode = 'login' | 'register';

@Component({
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  selector: 'app-site-header',
  styleUrl: './site-header.css',
  templateUrl: './site-header.html',
})
export class SiteHeader implements OnInit {
  private readonly authSession = inject(AuthSessionService);

  protected readonly sessionState = this.authSession.state;
  protected readonly authMode = signal<AuthMode>('login');
  protected readonly authError = signal('');
  protected readonly accountNotice = signal('');
  protected readonly isSubmittingAuth = signal(false);

  protected readonly authForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(128)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.authSession.checkSession();
  }

  protected openAuthDialog(mode: AuthMode, dialog: HTMLDialogElement): void {
    if (this.authSession.isActive()) {
      return;
    }

    this.authMode.set(mode);
    this.authError.set('');
    this.accountNotice.set('');
    this.authForm.controls.password.reset('');
    this.authForm.controls.confirmPassword.reset('');
    this.updatePasswordValidators();
    dialog.showModal();
  }

  protected changeAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authError.set('');
    this.authForm.controls.password.reset('');
    this.authForm.controls.confirmPassword.reset('');
    this.updatePasswordValidators();
  }

  protected closeAuthDialog(dialog: HTMLDialogElement): void {
    dialog.close();
  }

  protected onDialogClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) {
      dialog.close();
    }
  }

  protected submitAuth(dialog: HTMLDialogElement): void {
    this.authForm.markAllAsTouched();
    if (this.authForm.invalid || this.isSubmittingAuth()) {
      return;
    }

    const { email, password, confirmPassword } = this.authForm.getRawValue();
    if (this.authMode() === 'register' && password !== confirmPassword) {
      this.authError.set('The passwords do not match.');
      return;
    }

    this.authError.set('');
    this.isSubmittingAuth.set(true);
    const credentials: Credentials = { email, password };
    const request = this.authMode() === 'register'
      ? this.authSession.register(credentials)
      : this.authSession.login(credentials);

    request.subscribe({
      next: () => {
        this.isSubmittingAuth.set(false);
        this.authForm.reset();
        dialog.close();
        this.accountNotice.set(
          this.sessionState().status === 'pending-approval'
            ? 'Registration complete. An administrator must approve your account before chat is available.'
            : '',
        );
      },
      error: (error: unknown) => {
        this.isSubmittingAuth.set(false);
        this.authError.set(this.describeApiError(error));
      },
    });
  }

  protected logout(): void {
    this.authSession.logout().subscribe({
      next: () => this.accountNotice.set('You have signed out.'),
      error: (error: unknown) => this.accountNotice.set(this.describeApiError(error)),
    });
  }

  protected isPasswordConfirmationInvalid(): boolean {
    return this.authMode() === 'register' &&
      this.authForm.controls.confirmPassword.touched &&
      this.authForm.controls.password.value !== this.authForm.controls.confirmPassword.value;
  }

  protected isEmailInvalid(): boolean {
    return this.authForm.controls.email.touched && this.authForm.controls.email.invalid;
  }

  protected isPasswordInvalid(): boolean {
    const control = this.authForm.controls.password;
    return control.touched && control.invalid;
  }

  private updatePasswordValidators(): void {
    const password = this.authForm.controls.password;
    const registrationRules = this.authMode() === 'register'
      ? [Validators.required, Validators.minLength(12), Validators.maxLength(128)]
      : [Validators.required, Validators.maxLength(128)];
    password.setValidators(registrationRules);
    password.updateValueAndValidity();
    this.authForm.controls.confirmPassword.updateValueAndValidity();
  }

  private describeApiError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The request could not be completed. Please try again.';
    }

    const body: unknown = error.error;
    if (typeof body === 'object' && body !== null) {
      const details = body as Record<string, unknown>;
      if (typeof details['message'] === 'string') {
        return details['message'];
      }
      if (typeof details['errorMessage'] === 'string') {
        return details['errorMessage'];
      }
      if (typeof details['title'] === 'string') {
        return details['title'];
      }
      if (typeof details['errors'] === 'object' && details['errors'] !== null) {
        const validationMessages = Object.values(details['errors'])
          .flatMap((messages) => Array.isArray(messages) ? messages : [])
          .filter((message): message is string => typeof message === 'string');
        if (validationMessages.length > 0) {
          return validationMessages.join(' ');
        }
      }
    }

    return error.status === 0
      ? 'The API could not be reached. Check that the .NET API is running.'
      : 'The request could not be completed. Please try again.';
  }
}
