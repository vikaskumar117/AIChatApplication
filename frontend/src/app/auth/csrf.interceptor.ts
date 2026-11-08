import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfTokenStore } from './csrf-token.store';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (safeMethods.has(request.method.toUpperCase())) {
    return next(request);
  }

  const token = inject(CsrfTokenStore).token();
  if (!token || !request.url.startsWith('/api/')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { 'X-CSRF-TOKEN': token },
  }));
};
