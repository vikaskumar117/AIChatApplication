import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthSessionService } from '../auth/auth-session.service';

export interface ExplainRequest {
  code: string;
}

export interface ExplainResponse {
  statusCode: number;
  errorMessage: string | null;
  result: string | null;
  detailErrorMessage?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);

  explain(request: ExplainRequest): Observable<ExplainResponse> {
    if (!this.authSession.isActive()) {
      return throwError(() => new Error('An active approved account is required.'));
    }

    return this.http.post<ExplainResponse>('/api/chat/explain', request);
  }
}
