import React, { useEffect, useState, useCallback } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest, graphMeEndpoint } from "./auth/authConfig";
import { toAppUser } from "./auth/userMapping";
import SignInScreen from "./components/SignInScreen";
import MarketingBizDevApp from "./MarketingBizDev";

const NAVY = "#005BBB";

function FullScreenMessage({ children }) {
  return (
    <div style={{ fontFamily: "'Archivo', system-ui, sans-serif", minHeight: "100vh", background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap');`}</style>
      {children}
    </div>
  );
}

// Renders once a user is authenticated: resolves their profile, then the app.
function ProtectedApp() {
  const { instance, accounts } = useMsal();
  const [appUser, setAppUser] = useState(null);
  const account = accounts[0];

  useEffect(() => {
    let cancelled = false;
    async function resolveUser() {
      if (!account) return;
      // Start from the ID-token account so the app can render immediately,
      // then enrich with Microsoft Graph (job title, email) when it returns.
      if (!cancelled) setAppUser(toAppUser(account, null));
      try {
        const result = await instance.acquireTokenSilent({ ...loginRequest, account });
        const res = await fetch(graphMeEndpoint, {
          headers: { Authorization: `Bearer ${result.accessToken}` },
        });
        if (res.ok) {
          const profile = await res.json();
          if (!cancelled) setAppUser(toAppUser(account, profile));
        }
      } catch (e) {
        // Non-fatal: we still have a usable identity from the account claims.
        console.warn("[auth] Graph profile fetch skipped:", e?.message || e);
      }
    }
    resolveUser();
    return () => { cancelled = true; };
  }, [account, instance]);

  const signOut = useCallback(() => {
    instance.logoutRedirect({ account });
  }, [instance, account]);

  if (!appUser) return <FullScreenMessage>Loading your profile…</FullScreenMessage>;

  return <MarketingBizDevApp authUser={appUser} onSignOut={signOut} />;
}

export default function App() {
  const { inProgress } = useMsal();

  if (inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.HandleRedirect) {
    return <FullScreenMessage>Signing you in…</FullScreenMessage>;
  }

  return (
    <>
      <AuthenticatedTemplate>
        <ProtectedApp />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignInScreen />
      </UnauthenticatedTemplate>
    </>
  );
}
