// Translates an Entra ID identity (MSAL account + optional Graph profile) into
// the small user object the app uses for stamping and the header avatar:
//   { name, initials, role, email }

export function initialsFrom(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// account: MSAL AccountInfo (from instance.getActiveAccount())
// profile: optional Microsoft Graph /me response ({ displayName, jobTitle, mail, userPrincipalName })
export function toAppUser(account, profile) {
  const name =
    profile?.displayName ||
    account?.name ||
    account?.username ||
    "Unknown User";

  const email =
    profile?.mail ||
    profile?.userPrincipalName ||
    account?.username ||
    "";

  // Job title from Entra is a natural fit for the "role" line under the user's
  // name. Falls back to a generic label when the directory has none.
  const role = profile?.jobTitle || "Heritage Valley FCU";

  return {
    name,
    email,
    role,
    initials: initialsFrom(name),
  };
}
