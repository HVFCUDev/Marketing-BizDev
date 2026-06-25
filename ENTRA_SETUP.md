# HVFCU Marketing & Business Development — Entra ID Setup

This app authenticates users with **Microsoft Entra ID** (formerly Azure AD) using
MSAL, and is built to deploy to **Azure Static Web Apps** — the same stack as the
CU Project Tracker.

There are three things to set up: (1) an Entra app registration, (2) local
environment values, and (3) the Static Web App + its build secrets.

---

## 1. Register the app in Microsoft Entra ID

1. In the **Azure portal** → **Microsoft Entra ID** → **App registrations** → **New registration**.
2. **Name:** `HVFCU Marketing & BizDev`.
3. **Supported account types:** *Accounts in this organizational directory only* (single tenant).
4. **Redirect URI:** choose platform **Single-page application (SPA)** and enter:
   - For local dev: `http://localhost:5173`
   - You'll add the production URL after the Static Web App exists (Step 3).
5. Click **Register**.
6. On the **Overview** page, copy the **Application (client) ID** and **Directory (tenant) ID** — you need both.

### API permissions
The app reads the signed-in user's basic profile to show their name, email, and
job title. The default **`User.Read`** delegated permission (Microsoft Graph) is
already present on a new registration — no admin consent required. Leave it as is.

> Important: the redirect URI platform **must** be "Single-page application,"
> not "Web." SPA enables the PKCE auth-code flow MSAL uses in the browser.

---

## 2. Run locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your real Client ID and Tenant ID
npm run dev
```

Open the printed localhost URL. You'll see the branded "Sign in with Microsoft"
screen; signing in with a work account in your tenant loads the app.

---

## 3. Deploy to Azure Static Web Apps

1. Push this project to a **GitHub repo** (via the GitHub web editor or your normal flow).
2. In the Azure portal → **Create a resource** → **Static Web App**.
   - **Plan:** Free is fine to start.
   - **Source:** GitHub → pick your repo and the `main` branch.
   - **Build presets:** *Custom*.
     - **App location:** `/`
     - **Output location:** `dist`
   - Azure creates a GitHub Actions workflow and an `AZURE_STATIC_WEB_APPS_API_TOKEN`
     secret automatically. This repo already includes a workflow at
     `.github/workflows/azure-static-web-apps.yml`; if Azure adds its own, keep one
     and delete the other to avoid duplicate runs.
3. Note the app's URL, e.g. `https://<name>.azurestaticapps.net`.

### Add the production redirect URI
Back in your Entra app registration → **Authentication** → under the **SPA**
platform, **Add URI**: `https://<name>.azurestaticapps.net`. Save.

### Provide the build-time env values
The client/tenant IDs are injected when GitHub Actions builds the site. In your
**GitHub repo** → **Settings** → **Secrets and variables** → **Actions** → add:

- `VITE_ENTRA_CLIENT_ID` = your Application (client) ID
- `VITE_ENTRA_TENANT_ID` = your Directory (tenant) ID

(The workflow already references these. Re-run the latest workflow after adding them.)

> These are **not secrets** in the cryptographic sense — a SPA client ID and tenant
> ID are public by design and ship in the browser bundle. Storing them as Actions
> secrets just keeps them out of the committed source.

---

## How auth flows through the app

- `src/main.jsx` boots MSAL (`PublicClientApplication`) and wraps the app in `MsalProvider`.
- `src/App.jsx` uses `AuthenticatedTemplate` / `UnauthenticatedTemplate`:
  - Not signed in → `components/SignInScreen.jsx` (the "Sign in with Microsoft" button).
  - Signed in → `ProtectedApp`, which resolves the user and renders the app.
- `ProtectedApp` calls Microsoft Graph `/me` to enrich the profile (job title → the
  "role" line under the user's name), mapping it via `auth/userMapping.js` into
  `{ name, initials, role, email }`.
- That object is passed to `MarketingBizDevApp` as `authUser`, and the header's
  **Sign out** button calls MSAL `logoutRedirect`.

Interactions are still stamped with the signed-in person's name — now it's their
real Entra identity instead of a picked name.

---

## Restricting who can sign in (optional)

By default, any user in your tenant can sign in. To limit access to specific
people or a security group, use the app registration's **Enterprise application**
→ **Properties** → set *Assignment required* to **Yes**, then add users/groups
under **Users and groups**. No code change needed.

---

## What still needs a backend

Auth is now real, but the app's **data still lives in browser memory** and resets
on refresh. Persisting partners, interactions, events, budgets, and settings is the
next step — the same Azure SQL + Functions pattern as the Project Tracker. Once
that's in place, the signed-in user's identity (already available here) can stamp
and scope rows server-side, and the MSAL access token can authorize calls to your
Functions API.
