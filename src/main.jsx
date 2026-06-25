import React from "react";
import { createRoot } from "react-dom/client";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/authConfig";
import App from "./App";

const msalInstance = new PublicClientApplication(msalConfig);

// Set the active account on sign-in so acquireTokenSilent has a default account.
const existing = msalInstance.getAllAccounts();
if (existing.length > 0) {
  msalInstance.setActiveAccount(existing[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

// initialize() must resolve before rendering (required by msal-browser v3+).
msalInstance.initialize().then(() => {
  return msalInstance.handleRedirectPromise();
}).then(() => {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );
}).catch((e) => {
  console.error("[auth] MSAL initialization failed", e);
});
