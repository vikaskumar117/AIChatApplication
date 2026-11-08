# Syntax frontend

The frontend is a strict-mode, standalone Angular application scaffolded with
Angular CLI 22.2.4. It currently provides the public landing page and a
read-only, visibly locked workspace preview. Authentication is not connected;
the sign-in buttons explain that limitation and do not unlock the composer.
The API, account status, and authenticated chat flow will be wired in their
respective feature keys.

## Requirements

- Node.js 24.22.1 (see [`.nvmrc`](.nvmrc))
- npm 11.19.1 or a compatible npm 11 release

Install and run from this folder:

```powershell
npm ci
npm start
```

The local development server is available at `http://localhost:4200/`.

## Validation commands

```powershell
npm run build
npm test -- --watch=false
```

The current component tests verify the public landing and the signed-out
locked state. They do not fake authentication or call the AI API.

## Current implementation

- [`src/app/app.ts`](src/app/app.ts) defines the access-state UI and keeps chat
  locked until real authentication exists.
- [`src/app/app.html`](src/app/app.html) renders the public experience and
  disables chat controls for anonymous visitors.
- [`src/app/app.css`](src/app/app.css) contains responsive layouts, focus
  indicators, and reduced-motion behavior.
- [`src/app/app.spec.ts`](src/app/app.spec.ts) covers the current public and
  locked behavior.

No provider keys, API credentials, or production endpoints belong in frontend
configuration. Do not treat a UI state as authorization; the API must enforce
access independently when identity is implemented.
