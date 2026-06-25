// MSAL / Entra ID configuration.
//
// Values are read from Vite env vars at build time. Set these in:
//   - .env.local            (local dev)
//   - Azure Static Web Apps  → Configuration → Application settings (production)
//
// Required env vars:
//   VITE_ENTRA_CLIENT_ID   = the Application (client) ID from your Entra app registration
//   VITE_ENTRA_TENANT_ID   = your Directory (tenant) ID
//   VITE_REDIRECT_URI      = (optional) override; defaults to window.location.origin
//
// See ENTRA_SETUP.md for step-by-step registration instructions.

import { LogLevel } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;

if (!clientId || !tenantId) {
  // Surface misconfiguration early and clearly rather than failing deep inside MSAL.
  console.error(
    "[auth] Missing VITE_ENTRA_CLIENT_ID or VITE_ENTRA_TENANT_ID. " +
      "Copy .env.example to .env.local and fill in your Entra app registration values."
  );
}

export const msalConfig = {
  auth: {
    clientId: clientId || "MISSING_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${tenantId || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    // sessionStorage keeps tokens scoped to the tab and clears on close; use
    // "localStorage" instead if you want sign-in to persist across browser sessions.
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error("[msal]", message);
      },
    },
  },
};

// Scopes requested at sign-in. "User.Read" lets us read the signed-in user's
// basic profile from Microsoft Graph (name, email, job title).
export const loginRequest = {
  scopes: ["User.Read"],
};

// Microsoft Graph endpoint for the signed-in user's profile.
export const graphMeEndpoint = "https://graph.microsoft.com/v1.0/me";
