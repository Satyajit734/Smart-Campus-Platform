# Smart Campus — Frontend Only

This final package contains the Smart Campus frontend UI only.

## What was removed

- No MongoDB connection
- No Express/API connection
- No backend authentication
- No `.env` requirement
- No database reads/writes
- No server-side logic

The existing liquid-glass UI is preserved. The frontend now uses local React state only until the backend is connected later.

## Frontend features

- Liquid-glass responsive interface
- Bold, high-readability typography
- Frontend role selector for Admin, Professor, and Student
- Sidebar navigation
- Working sidebar Logout button
- Working Posts / Academic / Events quick navigation
- Responsive mobile layout
- Reduced-motion accessibility support
- Comments throughout the source explaining the main parts

## Run the frontend

```bash
npm install
npm run dev
```

Then open the Vite development URL shown in the terminal.

## Backend connection later

When the backend is ready, the frontend login, authentication, academic data, accounts, faculty data, and other server-backed features can be connected without replacing the liquid-glass UI.

The current Logout button is intentionally frontend-only: it returns the user to the login screen by resetting React state.
