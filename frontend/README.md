# DIP Toolkit Frontend

## 1) Environment setup

Create `frontend/.env` and fill values:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

If Firebase values are missing, the app still runs in guest mode but sign-in/cloud progress are disabled.

## 2) Run frontend

```bash
npm install
npm run dev
```

## 3) Firebase notes

Enable:

- Authentication -> Email/Password
- Firestore Database

Collection/document structure used by the app:

- `users` (collection)
- `{uid}` (document id = Firebase Auth user uid)
- document fields:
  - `completedModules` (array of module ids)
  - `updatedAt` (timestamp)
  - `email` (string, optional)

Use the rules in `firebase/firestore.rules` so each user can access only `users/{uid}`.
