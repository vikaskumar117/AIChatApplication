import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthSessionService } from './auth/auth-session.service';
import { ChatApiService } from './chat/chat-api.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-home-page',
  styleUrl: './home-page.css',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly authSession = inject(AuthSessionService);
  private readonly chatApi = inject(ChatApiService);

  protected readonly sessionState = this.authSession.state;
  protected readonly isChatLocked = computed(() => !this.authSession.isActive());
  protected readonly chatError = signal('');
  protected readonly answer = signal('');
  protected readonly isSubmittingCode = signal(false);

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

  protected canSubmitCode(): boolean {
    return !this.isChatLocked() &&
      this.codeControl.valid &&
      !this.isSubmittingCode();
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
