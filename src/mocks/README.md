# API mocks

This project uses MSW to stub the LMS API during local development.

Run the app with mocks:

```bash
npm run dev
```

or explicitly:

```bash
npm run dev:mock
```

Run against real endpoints:

```bash
npm run dev:api
```

The mock mode is controlled by:

```env
VITE_ENABLE_API_MOCKS=true
VITE_API_BASE_URL=/api/v1
```

The handlers live in `src/mocks/handlers.ts` and seed data lives in `src/mocks/db.ts`.

You can switch mock behavior from the browser console:

```js
localStorage.setItem('mock:scenario', 'empty')
localStorage.setItem('mock:scenario', 'slow')
localStorage.setItem('mock:scenario', 'unauthorized')
localStorage.setItem('mock:scenario', 'server-error')
localStorage.setItem('mock:scenario', 'validation-error')
localStorage.removeItem('mock:scenario')
```
