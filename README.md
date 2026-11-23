# LinguaForge

## Deployment configuration

`scripts/validate-env.mjs` runs before `next build`. Vercel Production and Preview builds require every variable in the table. Use the Production Firebase project and canonical origin in Production. Give Preview its own Firebase project, credentials, and origin when enabling it. For local development, use a gitignored `.env.local` with development credentials. The standalone validator reads the process environment.

| Variable | Visibility | Value source |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Browser | Firebase web app SDK configuration |
| `NEXT_PUBLIC_APP_URL` | Browser | Canonical origin, `https://linguaforge-opal.vercel.app` in Production |
| `FIREBASE_ADMIN_PROJECT_ID` | Server | Same Firebase project as the browser configuration for this environment |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server | Approved Firebase service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server secret | Private key for that service account, with PEM line breaks or escaped `\n` |
| `OPENROUTER_API_KEY` | Server secret | Approved OpenRouter key for this environment |

Store server secrets in Vercel as Secret variables. Keep credential files and values out of Git. Set the variables before deploying so the build receives that environment's values.

In Firebase Authentication, enable Email/Password and add the deployment hostname to Authorized Domains. The Production hostname is `linguaforge-opal.vercel.app`. Google and Apple buttons are hidden by default. Set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` or `NEXT_PUBLIC_AUTH_APPLE_ENABLED` to `true` in the matching environment after configuring the provider in Firebase and verifying sign-in on that hostname. Rebuild to apply changes to browser variables.

Before a production release, verify a test account can sign in, complete a Spanish exercise and its review, and still see its progress after reload.
