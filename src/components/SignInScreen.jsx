import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/authConfig";

const NAVY = "#005BBB";
const GREEN = "#7AB800";
const SUB = "#5a7088";
const INK = "#16324f";

// Full-screen branded sign-in shown when no user is authenticated.
export default function SignInScreen({ error }) {
  const { instance } = useMsal();

  const signIn = () => {
    instance.loginRedirect(loginRequest).catch((e) => console.error("[auth] loginRedirect failed", e));
  };

  return (
    <div style={{ fontFamily: "'Archivo', 'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600&display=swap');`}</style>
      <div style={{ background: "#fff", borderRadius: 18, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontStyle: "italic", fontSize: 21, color: "#fff", letterSpacing: -1 }}>hv</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>Heritage Valley FCU</div>
            <div style={{ fontSize: 12.5, color: SUB, fontWeight: 500 }}>Marketing &amp; Business Development</div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: SUB, lineHeight: 1.55, margin: "0 0 22px" }}>
          Sign in with your Heritage Valley FCU work account to continue. Your name is recorded on the interactions and updates you log.
        </p>

        <button onClick={signIn}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px 16px", borderRadius: 10, border: "none", background: NAVY, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          <MicrosoftMark /> Sign in with Microsoft
        </button>

        {error && (
          <div style={{ marginTop: 16, fontSize: 13, color: "#b4231a", background: "#fdecea", border: "1px solid #f3c6c1", borderRadius: 9, padding: "10px 12px", lineHeight: 1.45 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 11.5, color: SUB, textAlign: "center" }}>
          Access is managed through your organization's Microsoft Entra ID.
        </div>
      </div>
    </div>
  );
}

function MicrosoftMark() {
  // Simple 4-square Microsoft logo.
  return (
    <span style={{ display: "inline-grid", gridTemplateColumns: "9px 9px", gridTemplateRows: "9px 9px", gap: 2 }}>
      <span style={{ background: "#f25022" }} />
      <span style={{ background: "#7fba00" }} />
      <span style={{ background: "#00a4ef" }} />
      <span style={{ background: "#ffb900" }} />
    </span>
  );
}
