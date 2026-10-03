# AgroVision Deployment

## Vercel

Import this repository as a Next.js project using the repository root. The
root `vercel.json` configures the build command and Next.js output.

Add these environment variables in Vercel for every environment you use
(Development, Preview, and Production):

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. Keep `/test` as the database name in the URI; `test` is the active user database. |
| `JWT_SECRET` | Yes | Long, random secret used to sign login tokens. |
| `GEMINI_API_KEY` | Recommended | Enables Gemini-powered farming chat. |
| `RESEND_API_KEY` | For password recovery | Resend API key used to deliver one-time recovery codes. |
| `RESEND_FROM_EMAIL` | For password recovery | Sender address verified in Resend, for example `AgroVision <no-reply@your-verified-domain.com>`. |
| `PASSWORD_RESET_SECRET` | For password recovery | Separate long, random secret used to hash recovery codes. |
| `NEXT_PUBLIC_AI_SERVER_URL` | Optional | External AI server URL, if one is configured. |

Do not set `NEXT_PUBLIC_API_URL` to an external backend for this deployment:
the frontend calls the same-origin Next.js API routes. Leave it unset or empty.
Never add `.env.local`, database credentials, API keys, or real secrets to Git.

After setting the variables, redeploy from the `master` branch and check the
Vercel deployment logs if a route reports a configuration error. Password
recovery codes expire after 10 minutes and are limited to five attempts.

## Local development

Copy `.env.example` to `.env.local`, then fill in the real values. Keep the
MongoDB URI pointed at `/test` to use the active account database. Start the
app from the repository root with:

```sh
npm install
npm run dev
```

The local app runs at `http://localhost:3000`.
