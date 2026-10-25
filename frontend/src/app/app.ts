import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AuthSessionService, Credentials } from './auth/auth-session.service';
import { ChatApiService } from './chat/chat-api.service';

type AuthMode = 'login' | 'register';

@Component({
  imports: [ReactiveFormsModule, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly chatApi = inject(ChatApiService);

  protected readonly authMode = signal<AuthMode>('login');
  protected readonly sessionState = this.authSession.state;
  protected readonly isChatLocked = computed(() => !this.authSession.isActive());
  protected readonly statusNotice = signal('');
  protected readonly authError = signal('');
  protected readonly chatError = signal('');
  protected readonly answer = signal('');
  protected readonly isSubmittingAuth = signal(false);
  protected readonly isSubmittingCode = signal(false);

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

  protected readonly codeControl = new FormControl(
    { value: '', disabled: true },
    {
      nonNullable: true,
      validators: [Validators.required],
    },
  );
  private readonly syncCodeControlState = effect(() => {
    if (this.authSession.isActive() && !this.isSubmittingCode()) {
      this.codeControl.enable({ emitEvent: false });
    } else {
      this.codeControl.disable({ emitEvent: false });
    }
  });

  protected readonly codeSample = `public sealed record AIMessage(
    string Role,
    string Content);`;

  ngOnInit(): void {
    this.authSession.checkSession();
  }

  protected readonly accountMessage = computed(() => {
    const state = this.sessionState();
    switch (state.status) {
      case 'loading':
        return 'Checking your account…';
      case 'anonymous':
        return 'Sign in to an approved account to unlock the code explainer.';
      case 'pending-approval':
        return 'Your account is waiting for approval. Chat remains locked.';
      case 'active':
        return 'Your approved account can use the code explainer.';
      case 'blocked':
        return 'This account is blocked. Contact support if you think this is a mistake.';
      case 'rejected':
        return 'This account cannot access chat.';
      case 'session-error':
        return 'We could not verify your session. The chat remains locked.';
    }
  });

  protected openAuthDialog(mode: AuthMode, dialog: HTMLDialogElement): void {
    if (this.authSession.isActive()) {
      return;
    }

    this.authMode.set(mode);
    this.authError.set('');
    this.statusNotice.set('');
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
        const state = this.sessionState();
        this.statusNotice.set(
          state.status === 'pending-approval'
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

  protected submitCode(): void {
    this.codeControl.markAsTouched();
    if (this.isChatLocked() || this.codeControl.invalid || this.isSubmittingCode()) {
      return;
    }

    this.chatError.set('');
    this.answer.set('');
    this.isSubmittingCode.set(true);
    this.chatApi.explain({ code: this.codeControl.value }).subscribe({
      next: (response) => {
        this.isSubmittingCode.set(false);
        if (response.errorMessage || !response.result) {
          this.chatError.set(response.errorMessage ?? 'The API returned no explanation.');
          return;
        }
        this.answer.set(response.result);
      },
      error: (error: unknown) => {
        this.isSubmittingCode.set(false);
        this.chatError.set(this.describeApiError(error));
      },
    });
  }

  protected logout(): void {
    this.authSession.logout().subscribe({
      next: () => {
        this.answer.set('');
        this.statusNotice.set('You have signed out.');
      },
      error: (error: unknown) => {
        this.statusNotice.set(this.describeApiError(error));
      },
    });
  }

  protected canSubmitCode(): boolean {
    return !this.isChatLocked() &&
      this.codeControl.valid &&
      !this.isSubmittingCode();
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
