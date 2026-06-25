# HVFCU Marketing & Business Development

Internal app for Heritage Valley FCU covering partner CRM, interactions, events &
sponsorships, a calendar, marketing budget tracking, and configurable settings —
now with **Microsoft Entra ID** sign-in.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in your Entra Client ID + Tenant ID
npm run dev
```

See **ENTRA_SETUP.md** for the full Entra app registration and Azure Static Web
Apps deployment walkthrough.

## Project layout

```
src/
  main.jsx                  MSAL bootstrap + MsalProvider
  App.jsx                   Auth gate (authenticated vs. sign-in screen)
  MarketingBizDev.jsx       The application (receives authUser via props)
  auth/
    authConfig.js           MSAL config + scopes (reads VITE_ env vars)
    userMapping.js          Entra/Graph identity -> { name, initials, role, email }
  components/
    SignInScreen.jsx        Branded "Sign in with Microsoft" screen
staticwebapp.config.json    SPA routing for Azure Static Web Apps
.github/workflows/          CI/CD to Azure Static Web Apps
```

## Notes

- App data is currently in-memory and resets on refresh. Persistence (Azure SQL +
  Functions) is the planned next step.
- The signed-in user's name stamps the interactions they log.
