# Product Creation Wizard Architecture (App Router)

## Goals
- Keep route files thin and mostly server-rendered.
- Fetch initial read data on the server in `layout`/`page`.
- Keep interactive form UI in colocated client components.
- Keep write operations behind route handlers (or server actions later).

## Recommended Structure

```text
app/store/dashboard/products/new/
  layout.jsx                     # Server: auth + bootstrap data
  page.js                        # Server: redirects to step-1
  ARCHITECTURE.md
  _lib/
    draft.server.js              # Server-only draft bootstrap query
    draft-client.js              # (optional) client fetch helpers
    validators.js                # Shared form validation rules
  _components/
    Step1Screen.jsx              # Client UI for step 1
    Step2Screen.jsx
    ...
  step-1/
    page.js                      # Server wrapper importing Step1Screen
  step-2/
    page.js
  ...
```

## Rendering + Data Fetching Pattern
- `layout.jsx` is the bootstrap boundary:
  - `requireStorePage()`
  - load draft from DB (`_lib/draft.server.js`)
  - pass to `WizardProvider` as initial props
- `WizardProvider` hydrates from server props, not initial client fetch.
- Step pages are server wrappers; step UI is client-only in `_components`.

## Why This Scales Better
- One less client round-trip before usable UI.
- Better first paint and less hydration complexity.
- Clear ownership:
  - server files handle auth/data reads
  - client files handle interactions
  - API routes handle persistence

## Next Refactor Steps
1. Move remaining step UIs (`step-2` to `step-5`) into `_components`.
2. Extract field validation from components to `_lib/validators.js`.
3. Move wizard constants into a feature folder (`features/product-wizard`) and keep `lib` for app-wide utilities only.
4. Optionally replace draft autosave `fetch` calls with server actions once file upload approach is finalized.
