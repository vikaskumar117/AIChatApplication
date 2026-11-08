import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { CsrfTokenStore } from './csrf-token.store';

export type AccountStatus = 'PendingApproval' | 'Active' | 'Blocked' | 'Rejected';

export interface AccountSessionResponse {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  accountStatus: AccountStatus | null;
  roles: string[];
  antiforgeryToken: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export type AccountSessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'pending-approval'; email: string }
  | { status: 'active'; email: string; roles: string[] }
  | { status: 'blocked'; email: string }
  | { status: 'rejected'; email: string }
  | { status: 'session-error' };

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly csrfTokenStore = inject(CsrfTokenStore);

  readonly state = signal<AccountSessionState>({ status: 'loading' });
  readonly isActive = computed(() => this.state().status === 'active');

  checkSession(): void {
    this.state.set({ status: 'loading' });
    this.http.get<AccountSessionResponse>('/api/auth/session').subscribe({
      next: (response) => this.applySession(response),
      error: () => this.state.set({ status: 'session-error' }),
    });
  }

  login(credentials: Credentials): Observable<AccountSessionResponse> {
    return this.http.post<AccountSessionResponse>('/api/auth/login', credentials)
      .pipe(tap((response) => this.applySession(response)));
  }

  register(credentials: Credentials): Observable<AccountSessionResponse> {
    return this.http.post<AccountSessionResponse>('/api/auth/register', credentials)
      .pipe(tap((response) => this.applySession(response)));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      switchMap(() => this.http.get<AccountSessionResponse>('/api/auth/session')),
      tap((response) => this.applySession(response)),
      map(() => undefined),
    );
  }

  private applySession(response: AccountSessionResponse): void {
    if (response.antiforgeryToken) {
      this.csrfTokenStore.set(response.antiforgeryToken);
    }

    if (!response.isAuthenticated || !response.email || !response.accountStatus) {
      this.state.set({ status: 'anonymous' });
      return;
    }

    switch (response.accountStatus) {
      case 'Active':
        this.state.set({
          status: 'active',
          email: response.email,
          roles: response.roles,
        });
        break;
      case 'PendingApproval':
        this.state.set({ status: 'pending-approval', email: response.email });
        break;
      case 'Blocked':
        this.state.set({ status: 'blocked', email: response.email });
        break;
      case 'Rejected':
        this.state.set({ status: 'rejected', email: response.email });
        break;
      default:
        this.state.set({ status: 'session-error' });
    }
  }
}
