import React, { useState, useMemo } from "react";
import {
  Building2, Users, Calendar, Handshake, Plus, Search, X,
  TrendingUp, Clock, MapPin, DollarSign, Phone, Mail, Edit2,
  Trash2, ChevronDown, ChevronRight, MessageSquare, Filter, ArrowUpRight, Bell, CheckCircle2,
  ChevronLeft, CalendarDays, LogOut, UserCircle, Wallet, PieChart, AlertTriangle, Download, CalendarPlus,
  LayoutGrid, List, Settings as SettingsIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 *  HVFCU Marketing & Business Development
 *  Self-contained single-file app. No backend; state lives in memory.
 *  Tracks: Partners, Interactions, Events & Sponsorships, Calendar, Budget.
 * ------------------------------------------------------------------ */

// Official Heritage Valley FCU brand palette (Brand & Style Guide, Rev. 2024)
// Primary:   #005BBB (blue), #7AB800 (green)
// Secondary: #005B9A (dark blue), #00BFF3 (cyan)
// Key names kept for compatibility: navy=brand blue, navyDark=dark blue,
// teal=cyan, green=brand green, gold=amber accent for at-risk/pending states.
const BRAND = {
  navy: "#005BBB",
  navyDark: "#005B9A",
  teal: "#00BFF3",
  gold: "#7AB800",
  green: "#7AB800",
  amber: "#005B9A",
  red: "#c0392b",
  bg: "#f3f6fa",
  card: "#ffffff",
  line: "#dde6ef",
  ink: "#16324f",
  sub: "#5a7088",
};

// Default option lists. These seed the editable Settings; the live lists live in app state.
const DEFAULT_STAGES = ["Prospect", "Initial Contact", "In Discussion", "Active Partner", "Dormant"];
const DEFAULT_PARTNER_TYPES = ["Employer (SEG)", "Local Business", "Nonprofit", "Chamber / Association", "School / University", "Municipality"];
const DEFAULT_INTERACTION_TYPES = ["Meeting", "Call", "Email", "Site Visit", "Tabling Event", "Lunch & Learn"];
const DEFAULT_EVENT_TYPES = ["Community Event", "Financial Literacy", "Member Drive", "Sponsorship Activation", "Networking"];
const DEFAULT_EVENT_STATUSES = ["Planning", "Confirmed", "Completed", "Cancelled"];

const DEFAULT_SETTINGS = {
  stages: DEFAULT_STAGES,
  partnerTypes: DEFAULT_PARTNER_TYPES,
  interactionTypes: DEFAULT_INTERACTION_TYPES,
  eventTypes: DEFAULT_EVENT_TYPES,
  eventStatuses: DEFAULT_EVENT_STATUSES,
};

// Automatic color assignment: a label gets a stable brand color based on its
// position in its own list, so colors stay consistent and new entries pull
// from the palette automatically.
const STATUS_PALETTE = ["#005B9A", "#7AB800", "#00BFF3", "#005BBB", "#8a93a0", "#c0392b", "#e08a1e", "#6a4fb3", "#2a9d8f", "#b0b8c1"];
const colorForIndex = (i) => STATUS_PALETTE[((i % STATUS_PALETTE.length) + STATUS_PALETTE.length) % STATUS_PALETTE.length];
const colorInList = (list, label) => {
  const i = list.indexOf(label);
  return i === -1 ? "#8a93a0" : colorForIndex(i);
};

// Standalone components (rendered outside the main component tree's props) read
// the current option lists through this module-level holder, kept in sync each render.
let LIVE_SETTINGS = DEFAULT_SETTINGS;
const stageColorOf = (label) => colorInList(LIVE_SETTINGS.stages, label);
const statusColorOf = (label) => colorInList(LIVE_SETTINGS.eventStatuses, label);
// Build a select's option list from a settings list, always including the
// record's current value even if that option was later removed in Settings.
const optsWith = (list, current) => (current && !list.includes(current) ? [current, ...list] : list);

// Self-contained user list (no real auth). Swap for MSAL/Entra later if needed.
const USERS = [
  { id: "u1", name: "Jeremey Smith", initials: "JS", role: "Business Development" },
  { id: "u2", name: "Dana Whitfield", initials: "DW", role: "Member Relations" },
  { id: "u3", name: "Luis Romero", initials: "LR", role: "Community Outreach" },
  { id: "u4", name: "Patrice Long", initials: "PL", role: "Branch Manager" },
];

/* ----------------------------- seed data ----------------------------- */
const seedPartners = [
  { id: "p1", name: "York Manufacturing Co.", type: "Employer (SEG)", stage: "Active Partner", contact: "Dana Whitfield", email: "dwhitfield@yorkmfg.com", phone: "(717) 555-0182", employees: 340, notes: "Payroll deduction onboarding complete. Quarterly check-ins." },
  { id: "p2", name: "Greater York Chamber", type: "Chamber / Association", stage: "Active Partner", contact: "Luis Romero", email: "lromero@yorkchamber.org", phone: "(717) 555-0144", employees: 0, notes: "Co-host two networking mixers per year." },
  { id: "p3", name: "Riverside Health Clinic", type: "Nonprofit", stage: "In Discussion", contact: "Patrice Long", email: "plong@riversideclinic.org", phone: "(717) 555-0199", employees: 85, notes: "Exploring SEG agreement for staff." },
  { id: "p4", name: "East York Tech Park", type: "Local Business", stage: "Initial Contact", contact: "Sam Okafor", email: "sokafor@eytechpark.com", phone: "(717) 555-0120", employees: 0, notes: "Multi-tenant; potential for several SEGs." },
  { id: "p5", name: "Lincoln Charter School", type: "School / University", stage: "Prospect", contact: "Renee Castillo", email: "rcastillo@lincolncharter.edu", phone: "(717) 555-0166", employees: 60, notes: "Interested in financial literacy sessions." },
];

const seedInteractions = [
  { id: "i1", partnerId: "p1", type: "Meeting", date: "2026-06-15", summary: "Q2 review. Discussed adding HSA promotion to next payroll cycle.", followUp: "2026-07-10", followUpNote: "Send HSA flyer set", createdBy: "Jeremey Smith", createdAt: "2026-06-15T14:32:00" },
  { id: "i2", partnerId: "p3", type: "Site Visit", date: "2026-06-12", summary: "Toured clinic, met HR director. Strong interest in SEG.", followUp: "2026-06-26", followUpNote: "Draft SEG agreement", createdBy: "Jeremey Smith", createdAt: "2026-06-12T10:15:00" },
  { id: "i3", partnerId: "p2", type: "Lunch & Learn", date: "2026-06-08", summary: "Presented auto-loan refi to 22 chamber members.", followUp: "", followUpNote: "", createdBy: "Luis Romero", createdAt: "2026-06-08T13:05:00" },
  { id: "i4", partnerId: "p4", type: "Call", date: "2026-06-18", summary: "Intro call with property manager. Wants tenant roster before proceeding.", followUp: "2026-06-30", followUpNote: "Follow up on roster", createdBy: "Dana Whitfield", createdAt: "2026-06-18T09:48:00" },
];

const seedEvents = [
  { id: "e1", name: "York Summer Street Fair", type: "Community Event", date: "2026-07-19", location: "Continental Square, York", sponsorAmount: 2500, partnerId: "p2", status: "Confirmed", notes: "Branded booth + giveaway. Need 4 staff volunteers." },
  { id: "e2", name: "Lincoln Charter Money Smarts Day", type: "Financial Literacy", date: "2026-09-12", location: "Lincoln Charter School", sponsorAmount: 0, partnerId: "p5", status: "Planning", notes: "Two 45-min sessions for grades 9-10." },
  { id: "e3", name: "Chamber Fall Networking Mixer", type: "Networking", date: "2026-10-03", location: "Yorktowne Hotel", sponsorAmount: 1500, partnerId: "p2", status: "Confirmed", notes: "Co-branded. We provide appetizers." },
];

// Budget — categories and line items transcribed from the 2025 Marketing Budget Proposal.
// "remaining" is always computed as annual - spent, never stored.
const BUDGET_CATEGORIES = ["Media & Advertising", "3rd Party Partner Companies", "Content Creation", "Events & Sponsorships"];
const seedBudget = [
  // Media & Advertising
  { id: "b1", category: "Media & Advertising", name: "Billboards - Bus Shelters - Radio", annual: 8300, spent: 8340, notes: "Billboards - Trone (12 months at $695) $4,170" },
  { id: "b2", category: "Media & Advertising", name: "Digital Advertising", annual: 1000, spent: 123.60, notes: "Includes Social Media Advertising Fees, Carly Money Talk Videos" },
  { id: "b3", category: "Media & Advertising", name: "Printed Marketing Pieces", annual: 1000, spent: 468.63, notes: "Branch posters, rack cards, business cards, signage (Holiday Signs)" },
  { id: "b4", category: "Media & Advertising", name: "Promotional Items", annual: 2750, spent: 2417.12, notes: "Swag - staff swag, event, kids' branded give away (green notebook, keychains, pint glasses, comics, pens)" },
  // 3rd Party Partner Companies
  { id: "b5", category: "3rd Party Partner Companies", name: "Swaystack/Datatrack", annual: 36000, spent: 18910.71, notes: "Datatrack ($11,325 paid in August) Swaystack ($1,999/mo)" },
  { id: "b6", category: "3rd Party Partner Companies", name: "Website Maintenance - Nicely Done Sites", annual: 1500, spent: 500, notes: "$125 a month" },
  { id: "b7", category: "3rd Party Partner Companies", name: "Hip Brand Group", annual: 130000, spent: 56250, notes: "Billed @ $11,250 monthly" },
  { id: "b8", category: "3rd Party Partner Companies", name: "Q1 Media", annual: 44150, spent: 11530.88, notes: "45,400.01 - updated in April" },
  { id: "b9", category: "3rd Party Partner Companies", name: "Hanover Chamber of Commerce", annual: 775, spent: 775, notes: "HV Annual membership dues - sent check request 1/20" },
  { id: "b10", category: "3rd Party Partner Companies", name: "Women Network of York", annual: 100, spent: 0, notes: "Annual membership dues (Sept)" },
  { id: "b11", category: "3rd Party Partner Companies", name: "Women in Manufacturing", annual: 135, spent: 135, notes: "Annual membership dues" },
  { id: "b12", category: "3rd Party Partner Companies", name: "American Marketing Association", annual: 199, spent: 0, notes: "Annual membership dues (August)" },
  { id: "b13", category: "3rd Party Partner Companies", name: "Southern York County Business Association", annual: 0, spent: 0, notes: "Normally $400 - Free membership for 2026" },
  { id: "b14", category: "3rd Party Partner Companies", name: "YCEA & WBCO Membership", annual: 640, spent: 640, notes: "YCEA HV Membership Dues / WBCO Annual membership dues (2025: $250 / 2026: $390)" },
  { id: "b15", category: "3rd Party Partner Companies", name: "Buy Local Coalition", annual: 75, spent: 0, notes: "Yearly Membership ($75) Advertising/Sponsorships" },
  // Content Creation
  { id: "b16", category: "Content Creation", name: "Adobe Creative Cloud", annual: 600, spent: 600, notes: "Design and production programs - automatically renews in March" },
].map((b) => ({ ...b, year: 2025 }));

const seedBudgetMeta = { fiscalYear: 2025 };

/* ----------------------------- helpers ----------------------------- */
const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};
const currency = (n) => (n ? `$${n.toLocaleString()}` : "—");
const money = (n) => `$${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const uid = () => Math.random().toString(36).slice(2, 9);

/* ----------------------------- UI atoms ----------------------------- */
function Pill({ label, color }) {
  return (
    <span style={{
      background: `${color}1a`, color, border: `1px solid ${color}40`,
      borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function StatCard({ icon: Icon, label, value, accent, onClick }) {
  const [hover, setHover] = useState(false);
  const clickable = !!onClick;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      role={clickable ? "button" : undefined} tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      style={{
        background: BRAND.card, border: `1px solid ${hover && clickable ? accent : BRAND.line}`, borderRadius: 14,
        padding: "18px 20px", flex: "1 1 0", minWidth: 0,
        cursor: clickable ? "pointer" : "default",
        boxShadow: hover && clickable ? `0 4px 14px ${accent}22` : "none",
        transform: hover && clickable ? "translateY(-1px)" : "none",
        transition: "transform .12s, box-shadow .12s, border-color .12s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: BRAND.sub, fontSize: 13, fontWeight: 600 }}>
        <Icon size={16} color={accent} /> {label}
        {clickable && <ArrowUpRight size={14} color={accent} style={{ marginLeft: "auto", opacity: hover ? 1 : 0.4, transition: "opacity .12s" }} />}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: BRAND.ink, marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: BRAND.sub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 9,
  border: `1px solid ${BRAND.line}`, fontSize: 14, color: BRAND.ink, background: "#fff", outline: "none",
};

function Modal({ title, onClose, children, onSave, saveLabel = "Save" }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(18,41,63,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${BRAND.line}` }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: BRAND.navy }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: BRAND.sub }}><X size={20} /></button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: `1px solid ${BRAND.line}` }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 9, border: `1px solid ${BRAND.line}`, background: "#fff", color: BRAND.sub, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onSave} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: BRAND.navy, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- main app ----------------------------- */
export default function MarketingBizDevApp() {
  const [currentUser, setCurrentUser] = useState(null); // null until signed in
  const [tab, setTab] = useState("dashboard");
  const [partners, setPartners] = useState(seedPartners);
  const [interactions, setInteractions] = useState(seedInteractions);
  const [events, setEvents] = useState(seedEvents);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [modal, setModal] = useState(null); // {kind, data}
  const [expandedPartner, setExpandedPartner] = useState(null); // partner id with open history
  const [expandedEvents, setExpandedEvents] = useState(null); // partner id with open events
  const [partnerView, setPartnerView] = useState("card"); // "card" | "list"
  const [eventView, setEventView] = useState("card");
  const [calAnchor, setCalAnchor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [calDay, setCalDay] = useState(null); // selected YYYY-MM-DD in calendar
  const [budget, setBudget] = useState(seedBudget);
  const [fiscalYear, setFiscalYear] = useState(seedBudgetMeta.fiscalYear);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  LIVE_SETTINGS = settings; // keep module-level color lookups in sync for standalone components

  // Color accessors driven by the live settings lists.
  const stageColor = stageColorOf;
  const statusColor = statusColorOf;

  const partnerName = (id) => partners.find((p) => p.id === id)?.name || "—";
  const interactionsFor = (id) =>
    interactions.filter((i) => i.partnerId === id).sort((a, b) => b.date.localeCompare(a.date));
  const eventsFor = (id) => {
    const mine = events.filter((e) => e.partnerId === id);
    const t = todayStr();
    return {
      upcoming: mine.filter((e) => e.date >= t).sort((a, b) => a.date.localeCompare(b.date)),
      past: mine.filter((e) => e.date < t).sort((a, b) => b.date.localeCompare(a.date)),
    };
  };

  /* --------- derived metrics --------- */
  const ACTIVE_STAGE = "Active Partner";
  const PIPELINE_STAGES = ["Initial Contact", "In Discussion"];

  const metrics = useMemo(() => {
    const active = partners.filter((p) => p.stage === ACTIVE_STAGE).length;
    const pipeline = partners.filter((p) => PIPELINE_STAGES.includes(p.stage)).length;
    const sponsorTotal = events.reduce((s, e) => s + (e.sponsorAmount || 0), 0);
    const openFollowUps = interactions.filter((i) => i.followUp && i.followUp >= todayStr()).length;
    return { active, pipeline, sponsorTotal, openFollowUps };
  }, [partners, events, interactions]);

  const upcoming = useMemo(() => {
    const fu = interactions
      .filter((i) => i.followUp)
      .map((i) => ({ kind: "follow-up", date: i.followUp, label: i.followUpNote || "Follow up", who: partnerName(i.partnerId), id: "fu-" + i.id, ref: i }));
    const ev = events
      .filter((e) => e.date >= todayStr() && e.status !== "Completed" && e.status !== "Cancelled")
      .map((e) => ({ kind: "event", date: e.date, label: e.name, who: e.location, id: "ev-" + e.id, ref: e }));
    return [...fu, ...ev].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  }, [interactions, events, partners]);

  // All dated entries (events, interactions, follow-ups) grouped by YYYY-MM-DD
  const calItemsByDay = useMemo(() => {
    const map = {};
    const push = (date, item) => { if (!date) return; (map[date] = map[date] || []).push(item); };
    events.forEach((e) => push(e.date, { kind: "event", date: e.date, title: e.name, sub: e.location, ref: e, id: "ev-" + e.id }));
    interactions.forEach((i) => {
      push(i.date, { kind: "interaction", date: i.date, title: `${i.type} — ${partnerName(i.partnerId)}`, sub: i.summary, ref: i, id: "in-" + i.id });
      if (i.followUp) push(i.followUp, { kind: "follow-up", date: i.followUp, title: `Follow up — ${partnerName(i.partnerId)}`, sub: i.followUpNote, ref: i, id: "fu-" + i.id });
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.kind.localeCompare(b.kind)));
    return map;
  }, [events, interactions, partners]);

  const CAL_KIND = {
    event: { color: BRAND.green, label: "Event" },
    interaction: { color: BRAND.teal, label: "Interaction" },
    "follow-up": { color: BRAND.navyDark, label: "Follow-up" },
  };

  const budgetYears = useMemo(() => {
    const ys = Array.from(new Set(budget.map((b) => b.year))).sort((a, b) => b - a);
    return ys.length ? ys : [fiscalYear];
  }, [budget, fiscalYear]);

  const budgetTotals = useMemo(() => {
    const byCat = {};
    let annual = 0, spent = 0;
    budget.filter((b) => b.year === fiscalYear).forEach((b) => {
      const a = Number(b.annual) || 0, s = Number(b.spent) || 0;
      annual += a; spent += s;
      const c = (byCat[b.category] = byCat[b.category] || { annual: 0, spent: 0, items: [] });
      c.annual += a; c.spent += s; c.items.push(b);
    });
    return { byCat, annual, spent, remaining: annual - spent };
  }, [budget, fiscalYear]);

  const filteredPartners = useMemo(() => {
    const q = search.toLowerCase();
    const stageMatch = (p) =>
      stageFilter === "All" ||
      (stageFilter === "In Pipeline" ? PIPELINE_STAGES.includes(p.stage) : p.stage === stageFilter);
    return partners.filter((p) =>
      stageMatch(p) &&
      (!q || p.name.toLowerCase().includes(q) || p.contact.toLowerCase().includes(q))
    );
  }, [partners, search, stageFilter]);

  /* --------- save handlers --------- */
  const savePartner = (d) => {
    setPartners((prev) => d.id ? prev.map((p) => (p.id === d.id ? d : p)) : [...prev, { ...d, id: uid() }]);
    setModal(null);
  };
  const saveInteraction = (d) => {
    setInteractions((prev) => d.id
      ? prev.map((i) => (i.id === d.id ? d : i))
      : [...prev, { ...d, id: uid(), createdBy: currentUser?.name || "Unknown", createdAt: new Date().toISOString() }]);
    setModal(null);
  };
  const saveEvent = (d) => {
    setEvents((prev) => d.id ? prev.map((e) => (e.id === d.id ? d : e)) : [...prev, { ...d, id: uid() }]);
    setModal(null);
  };
  const saveBudgetLine = (d) => {
    const clean = { ...d, annual: Number(d.annual) || 0, spent: Number(d.spent) || 0 };
    setBudget((prev) => d.id
      ? prev.map((b) => (b.id === d.id ? clean : b))
      : [...prev, { ...clean, id: uid(), year: fiscalYear }]);
    setModal(null);
  };

  // Create a budget for a new year. mode: "carry" copies current-year line items
  // (annual kept, spent reset to 0); "blank" starts empty.
  const startNewYear = (newYear, mode) => {
    const yr = Number(newYear);
    if (!yr || budget.some((b) => b.year === yr)) { setFiscalYear(yr); setModal(null); return; }
    if (mode === "carry") {
      const carried = budget
        .filter((b) => b.year === fiscalYear)
        .map((b) => ({ ...b, id: uid(), year: yr, spent: 0 }));
      setBudget((prev) => [...prev, ...carried]);
    }
    setFiscalYear(yr);
    setModal(null);
  };

  const exportBudgetCSV = () => {
    const rows = budget.filter((b) => b.year === fiscalYear);
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Category", "Line Item", "Annual Budget", "Spent", "Remaining", "Notes"];
    const lines = [header.join(",")];
    BUDGET_CATEGORIES.filter((c) => rows.some((r) => r.category === c)).forEach((cat) => {
      rows.filter((r) => r.category === cat).forEach((r) => {
        const annual = Number(r.annual) || 0, spent = Number(r.spent) || 0;
        lines.push([esc(r.category), esc(r.name), annual.toFixed(2), spent.toFixed(2), (annual - spent).toFixed(2), esc(r.notes)].join(","));
      });
      const ca = rows.filter((r) => r.category === cat).reduce((s, r) => s + (Number(r.annual) || 0), 0);
      const cs = rows.filter((r) => r.category === cat).reduce((s, r) => s + (Number(r.spent) || 0), 0);
      lines.push([esc(cat + " — Total"), "", ca.toFixed(2), cs.toFixed(2), (ca - cs).toFixed(2), ""].join(","));
    });
    const ta = rows.reduce((s, r) => s + (Number(r.annual) || 0), 0);
    const ts = rows.reduce((s, r) => s + (Number(r.spent) || 0), 0);
    lines.push(["GRAND TOTAL", "", ta.toFixed(2), ts.toFixed(2), (ta - ts).toFixed(2), ""].join(","));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HVFCU_Marketing_Budget_${fiscalYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dashboard card navigation: jump to a tab, optionally with a stage filter, clearing search.
  const gotoPartners = (stage) => { setStageFilter(stage); setSearch(""); setTab("partners"); };
  const gotoTab = (t) => { setSearch(""); setTab(t); };

  // Open an upcoming item in its editor.
  const openUpcoming = (u) => {
    if (u.kind === "event") setModal({ kind: "event", data: { ...u.ref } });
    else setModal({ kind: "interaction", data: { ...u.ref } });
  };
  // Mark an upcoming item complete: clear a follow-up, or set an event to Completed.
  const completeUpcoming = (u) => {
    if (u.kind === "follow-up") {
      setInteractions((prev) => prev.map((i) => i.id === u.ref.id ? { ...i, followUp: "", followUpNote: "" } : i));
    } else {
      setEvents((prev) => prev.map((e) => e.id === u.ref.id ? { ...e, status: "Completed" } : e));
    }
  };

  const del = (kind, id) => {
    if (kind === "partner") setPartners((p) => p.filter((x) => x.id !== id));
    if (kind === "interaction") setInteractions((p) => p.filter((x) => x.id !== id));
    if (kind === "event") setEvents((p) => p.filter((x) => x.id !== id));
    if (kind === "budget") setBudget((p) => p.filter((x) => x.id !== id));
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "partners", label: "Partners", icon: Building2 },
    { id: "interactions", label: "Interactions", icon: Users },
    { id: "events", label: "Events & Sponsorships", icon: Calendar },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // Sign-in gate — pick a user before the app loads
  if (!currentUser) {
    return <SignIn onPick={setCurrentUser} />;
  }

  return (
    <div style={{ fontFamily: "'Archivo', 'Segoe UI', system-ui, sans-serif", background: BRAND.bg, minHeight: "100vh", color: BRAND.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600&display=swap');`}</style>
      {/* header */}
      <header style={{ background: BRAND.navy, color: "#fff", padding: "16px 26px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontStyle: "italic", fontSize: 18, color: "#fff", letterSpacing: -1 }}>hv</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>Heritage Valley FCU</div>
          <div style={{ fontSize: 12.5, color: "#c5e3f7", fontWeight: 500 }}>Marketing & Business Development</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.25 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{currentUser.name}</div>
            <div style={{ fontSize: 11.5, color: "#c5e3f7" }}>{currentUser.role}</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff" }}>{currentUser.initials}</div>
          <button onClick={() => setCurrentUser(null)} title="Switch user"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            <LogOut size={14} /> Switch
          </button>
        </div>
      </header>

      {/* tabs */}
      <nav style={{ background: "#fff", borderBottom: `1px solid ${BRAND.line}`, padding: "0 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              border: "none", background: "none", padding: "14px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600,
              color: on ? BRAND.navy : BRAND.sub, borderBottom: `3px solid ${on ? BRAND.gold : "transparent"}`,
            }}>
              <t.icon size={16} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "24px 18px 60px" }}>
        {/* ----------------- DASHBOARD ----------------- */}
        {tab === "dashboard" && (
          <>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              <StatCard icon={Handshake} label="Active Partners" value={metrics.active} accent={BRAND.green} onClick={() => gotoPartners(ACTIVE_STAGE)} />
              <StatCard icon={TrendingUp} label="In Pipeline" value={metrics.pipeline} accent={BRAND.teal} onClick={() => gotoPartners("In Pipeline")} />
              <StatCard icon={DollarSign} label="Sponsorship $ (YTD)" value={currency(metrics.sponsorTotal)} accent={BRAND.gold} onClick={() => gotoTab("events")} />
              <StatCard icon={Bell} label="Open Follow-ups" value={metrics.openFollowUps} accent={BRAND.red} onClick={() => gotoTab("interactions")} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <section style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: BRAND.navy, display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={17} color={BRAND.teal} /> Upcoming
                </h3>
                {upcoming.length === 0 && <p style={{ color: BRAND.sub, fontSize: 14 }}>Nothing scheduled. Add a follow-up or event to get started.</p>}
                {upcoming.map((u, idx) => {
                  const overdue = u.kind === "follow-up" && u.date < todayStr();
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: idx < upcoming.length - 1 ? `1px solid ${BRAND.line}` : "none" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: u.kind === "event" ? BRAND.gold : BRAND.teal, flexShrink: 0 }} />
                      <div onClick={() => openUpcoming(u)} title="Open"
                        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.label}</div>
                        <div style={{ fontSize: 12.5, color: BRAND.sub }}>{u.who || (u.kind === "follow-up" ? "Follow-up" : "Event")}</div>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: overdue ? BRAND.red : BRAND.sub, whiteSpace: "nowrap" }}>{fmtDate(u.date)}</div>
                      <button onClick={() => completeUpcoming(u)} title={u.kind === "follow-up" ? "Mark follow-up complete" : "Mark event completed"}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 7, border: `1px solid ${BRAND.line}`, background: "#fff", color: BRAND.green, cursor: "pointer", flexShrink: 0 }}>
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </section>

              <section style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: BRAND.navy, display: "flex", alignItems: "center", gap: 8 }}>
                  <Filter size={17} color={BRAND.teal} /> Pipeline by Stage
                </h3>
                {settings.stages.map((s) => {
                  const count = partners.filter((p) => p.stage === s).length;
                  const pct = partners.length ? (count / partners.length) * 100 : 0;
                  return (
                    <div key={s} onClick={() => gotoPartners(s)} title={`View ${s} partners`}
                      onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.bg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ marginBottom: 4, padding: "8px 8px", margin: "0 -8px 4px", borderRadius: 8, cursor: "pointer", transition: "background .12s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: BRAND.ink }}>{s}</span>
                        <span style={{ color: BRAND.sub, fontWeight: 700 }}>{count}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: BRAND.line }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: stageColor(s), transition: "width .3s" }} />
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          </>
        )}

        {/* ----------------- PARTNERS ----------------- */}
        {tab === "partners" && (
          <>
            <Toolbar
              onAdd={() => setModal({ kind: "partner", data: { name: "", type: settings.partnerTypes[0] || "", stage: settings.stages[0] || "", contact: "", email: "", phone: "", employees: 0, notes: "" } })}
              addLabel="Add Partner" search={search} setSearch={setSearch}
              filter={stageFilter} setFilter={setStageFilter} filterOptions={["All", "In Pipeline", ...settings.stages]}
              view={partnerView} setView={setPartnerView}
            />
            {partnerView === "list" ? (
              <PartnerList
                partners={filteredPartners}
                interactionsFor={interactionsFor} eventsFor={eventsFor}
                onEdit={(p) => setModal({ kind: "partner", data: { ...p } })}
                onDelete={(id) => del("partner", id)}
              />
            ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 14 }}>
              {filteredPartners.map((p) => (
                <div key={p.id} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: BRAND.navy }}>{p.name}</div>
                      <div style={{ fontSize: 12.5, color: BRAND.sub, marginTop: 2 }}>{p.type}</div>
                    </div>
                    <Pill label={p.stage} color={stageColor(p.stage)} />
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13.5, color: BRAND.ink, lineHeight: 1.7 }}>
                    <div style={{ fontWeight: 600 }}>{p.contact}</div>
                    {p.email && <div style={{ display: "flex", alignItems: "center", gap: 6, color: BRAND.sub }}><Mail size={13} />{p.email}</div>}
                    {p.phone && <div style={{ display: "flex", alignItems: "center", gap: 6, color: BRAND.sub }}><Phone size={13} />{p.phone}</div>}
                    {p.employees > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, color: BRAND.sub }}><Users size={13} />{p.employees} employees</div>}
                  </div>
                  {p.notes && <p style={{ marginTop: 10, fontSize: 13, color: BRAND.sub, lineHeight: 1.5 }}>{p.notes}</p>}

                  {(() => {
                    const hist = interactionsFor(p.id);
                    const open = expandedPartner === p.id;
                    const nextFu = hist.find((i) => i.followUp && i.followUp >= todayStr());
                    return (
                      <div style={{ marginTop: 12, borderTop: `1px solid ${BRAND.line}`, paddingTop: 12 }}>
                        <button
                          onClick={() => setExpandedPartner(open ? null : p.id)}
                          style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0, color: BRAND.navy, fontSize: 13.5, fontWeight: 700 }}>
                          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          <MessageSquare size={14} color={BRAND.teal} />
                          {hist.length} interaction{hist.length === 1 ? "" : "s"}
                          {nextFu && !open && (
                            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: BRAND.green }}>
                              <Bell size={11} />{fmtDate(nextFu.followUp)}
                            </span>
                          )}
                        </button>

                        {open && (
                          <div style={{ marginTop: 10 }}>
                            {hist.length === 0 && <div style={{ fontSize: 13, color: BRAND.sub, paddingBottom: 8 }}>No interactions logged yet.</div>}
                            {hist.map((i) => (
                              <div key={i.id} style={{ padding: "9px 0", borderTop: `1px dashed ${BRAND.line}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                  <Pill label={i.type} color={BRAND.teal} />
                                  <span style={{ fontSize: 12, color: BRAND.sub, fontWeight: 600 }}>{fmtDate(i.date)}</span>
                                  <button onClick={() => setModal({ kind: "interaction", data: { ...i } })} title="Edit" style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: BRAND.sub, padding: 2 }}><Edit2 size={13} /></button>
                                </div>
                                <div style={{ fontSize: 13, color: BRAND.ink, lineHeight: 1.5 }}>{i.summary}</div>
                                {i.followUp && (
                                  <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: BRAND.navyDark }}>
                                    <Bell size={11} color={BRAND.green} /> Follow up {fmtDate(i.followUp)}{i.followUpNote ? ` — ${i.followUpNote}` : ""}
                                  </div>
                                )}
                                {i.createdBy && <div style={{ marginTop: 4, fontSize: 11, color: BRAND.sub }}>By {i.createdBy} · {fmtDateTime(i.createdAt)}</div>}
                              </div>
                            ))}
                            <button
                              onClick={() => setModal({ kind: "interaction", data: { partnerId: p.id, type: settings.interactionTypes[0] || "", date: todayStr(), summary: "", followUp: "", followUpNote: "" } })}
                              style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px dashed ${BRAND.navy}`, background: `${BRAND.navy}0d`, color: BRAND.navy, fontSize: 12.5, fontWeight: 700, cursor: "pointer", width: "100%", justifyContent: "center" }}>
                              <Plus size={14} /> Log interaction for {p.name}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {(() => {
                    const evs = eventsFor(p.id);
                    const count = evs.upcoming.length + evs.past.length;
                    const open = expandedEvents === p.id;
                    const nextUp = evs.upcoming[0];
                    return (
                      <div style={{ marginTop: 10, borderTop: `1px solid ${BRAND.line}`, paddingTop: 12 }}>
                        <button
                          onClick={() => setExpandedEvents(open ? null : p.id)}
                          style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0, color: BRAND.navy, fontSize: 13.5, fontWeight: 700 }}>
                          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          <Calendar size={14} color={BRAND.green} />
                          {count} event{count === 1 ? "" : "s"}
                          {nextUp && !open && (
                            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: BRAND.green }}>
                              Next {fmtDate(nextUp.date)}
                            </span>
                          )}
                        </button>
                        {open && (
                          <div style={{ marginTop: 10 }}>
                            <PartnerEvents events={evs} onOpen={(e) => setModal({ kind: "event", data: { ...e } })} />
                            <button
                              onClick={() => setModal({ kind: "event", data: { name: "", type: settings.eventTypes[0] || "", date: todayStr(), location: "", sponsorAmount: 0, partnerId: p.id, status: settings.eventStatuses[0] || "", notes: "" } })}
                              style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: `1px dashed ${BRAND.navy}`, background: `${BRAND.navy}0d`, color: BRAND.navy, fontSize: 12.5, fontWeight: 700, cursor: "pointer", width: "100%", justifyContent: "center" }}>
                              <Plus size={14} /> Add event for {p.name}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <RowActions
                    onEdit={() => setModal({ kind: "partner", data: { ...p } })}
                    onDelete={() => del("partner", p.id)}
                  />
                </div>
              ))}
              {filteredPartners.length === 0 && <Empty msg="No partners match your filters." />}
            </div>
            )}
          </>
        )}

        {/* ----------------- INTERACTIONS ----------------- */}
        {tab === "interactions" && (
          <>
            <Toolbar
              onAdd={() => setModal({ kind: "interaction", data: { partnerId: partners[0]?.id || "", type: settings.interactionTypes[0] || "", date: todayStr(), summary: "", followUp: "", followUpNote: "" } })}
              addLabel="Log Interaction" search={search} setSearch={setSearch}
            />
            <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, overflow: "hidden" }}>
              {interactions
                .filter((i) => !search || partnerName(i.partnerId).toLowerCase().includes(search.toLowerCase()) || i.summary.toLowerCase().includes(search.toLowerCase()))
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((i, idx, arr) => (
                  <div key={i.id} style={{ padding: "16px 20px", borderBottom: idx < arr.length - 1 ? `1px solid ${BRAND.line}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Pill label={i.type} color={BRAND.teal} />
                        <span style={{ fontWeight: 800, color: BRAND.navy, fontSize: 15 }}>{partnerName(i.partnerId)}</span>
                      </div>
                      <span style={{ fontSize: 13, color: BRAND.sub, fontWeight: 600 }}>{fmtDate(i.date)}</span>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 14, color: BRAND.ink, lineHeight: 1.55 }}>{i.summary}</p>
                    {i.followUp && (
                      <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 7, background: `${BRAND.gold}14`, border: `1px solid ${BRAND.gold}40`, borderRadius: 8, padding: "5px 10px", fontSize: 12.5, color: BRAND.navyDark, fontWeight: 600 }}>
                        <Bell size={13} color={BRAND.gold} /> Follow up {fmtDate(i.followUp)}{i.followUpNote ? ` — ${i.followUpNote}` : ""}
                      </div>
                    )}
                    {i.createdBy && (
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: BRAND.sub }}>
                        <UserCircle size={13} /> Logged by <span style={{ fontWeight: 700, color: BRAND.ink }}>{i.createdBy}</span> · {fmtDateTime(i.createdAt)}
                      </div>
                    )}
                    <RowActions
                      onEdit={() => setModal({ kind: "interaction", data: { ...i } })}
                      onDelete={() => del("interaction", i.id)}
                    />
                  </div>
                ))}
              {interactions.length === 0 && <Empty msg="No interactions logged yet." />}
            </div>
          </>
        )}

        {/* ----------------- EVENTS ----------------- */}
        {tab === "events" && (() => {
          const shownEvents = events
            .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => a.date.localeCompare(b.date));
          return (
          <>
            <Toolbar
              onAdd={() => setModal({ kind: "event", data: { name: "", type: settings.eventTypes[0] || "", date: todayStr(), location: "", sponsorAmount: 0, partnerId: "", status: settings.eventStatuses[0] || "", notes: "" } })}
              addLabel="Add Event" search={search} setSearch={setSearch}
              view={eventView} setView={setEventView}
            />
            {eventView === "list" ? (
              <EventList
                events={shownEvents} partnerName={partnerName}
                onEdit={(e) => setModal({ kind: "event", data: { ...e } })}
                onDelete={(id) => del("event", id)}
              />
            ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {shownEvents
                .map((e) => (
                  <div key={e.id} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: BRAND.navy }}>{e.name}</div>
                        <div style={{ fontSize: 12.5, color: BRAND.sub, marginTop: 2 }}>{e.type}</div>
                      </div>
                      <Pill label={e.status} color={statusColor(e.status)} />
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.8, color: BRAND.sub }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={13} />{fmtDate(e.date)}</div>
                      {e.location && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={13} />{e.location}</div>}
                      {e.partnerId && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Handshake size={13} />{partnerName(e.partnerId)}</div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: e.sponsorAmount ? BRAND.green : BRAND.sub, fontWeight: e.sponsorAmount ? 700 : 400 }}>
                        <DollarSign size={13} />{e.sponsorAmount ? `${currency(e.sponsorAmount)} sponsorship` : "No sponsorship"}
                      </div>
                    </div>
                    {e.notes && <p style={{ marginTop: 10, fontSize: 13, color: BRAND.sub, lineHeight: 1.5 }}>{e.notes}</p>}
                    <RowActions
                      onEdit={() => setModal({ kind: "event", data: { ...e } })}
                      onDelete={() => del("event", e.id)}
                    />
                  </div>
                ))}
              {shownEvents.length === 0 && <Empty msg="No events scheduled." />}
            </div>
            )}
          </>
          );
        })()}

        {/* ----------------- CALENDAR ----------------- */}
        {tab === "calendar" && (
          <CalendarView
            anchor={calAnchor} setAnchor={setCalAnchor}
            selected={calDay} setSelected={setCalDay}
            itemsByDay={calItemsByDay} kindMeta={CAL_KIND}
            onOpen={(item) => {
              if (item.kind === "event") setModal({ kind: "event", data: { ...item.ref } });
              else setModal({ kind: "interaction", data: { ...item.ref } });
            }}
            onAddEvent={(date) => setModal({ kind: "event", data: { name: "", type: settings.eventTypes[0] || "", date, location: "", sponsorAmount: 0, partnerId: "", status: settings.eventStatuses[0] || "", notes: "" } })}
          />
        )}

        {/* ----------------- BUDGET ----------------- */}
        {tab === "budget" && (
          <BudgetView
            totals={budgetTotals} fiscalYear={fiscalYear} setFiscalYear={setFiscalYear}
            years={budgetYears} onExport={exportBudgetCSV}
            onNewYear={() => setModal({ kind: "newYear", data: { year: Math.max(...budgetYears) + 1, mode: "carry" } })}
            onAdd={(category) => setModal({ kind: "budget", data: { category: category || BUDGET_CATEGORIES[0], name: "", annual: 0, spent: 0, notes: "" } })}
            onEdit={(b) => setModal({ kind: "budget", data: { ...b } })}
            onDelete={(id) => del("budget", id)}
          />
        )}

        {/* ----------------- SETTINGS ----------------- */}
        {tab === "settings" && (
          <SettingsView
            settings={settings} setSettings={setSettings}
            usage={{
              stages: (label) => partners.filter((p) => p.stage === label).length,
              partnerTypes: (label) => partners.filter((p) => p.type === label).length,
              interactionTypes: (label) => interactions.filter((i) => i.type === label).length,
              eventTypes: (label) => events.filter((e) => e.type === label).length,
              eventStatuses: (label) => events.filter((e) => e.status === label).length,
            }}
          />
        )}
      </main>

      {/* ----------------- MODALS ----------------- */}
      {modal?.kind === "partner" && (
        <PartnerModal data={modal.data} history={modal.data.id ? interactionsFor(modal.data.id) : []} events={modal.data.id ? eventsFor(modal.data.id) : { upcoming: [], past: [] }} onClose={() => setModal(null)} onSave={savePartner} />
      )}
      {modal?.kind === "interaction" && (
        <InteractionModal data={modal.data} partners={partners} onClose={() => setModal(null)} onSave={saveInteraction} />
      )}
      {modal?.kind === "event" && (
        <EventModal data={modal.data} partners={partners} onClose={() => setModal(null)} onSave={saveEvent} />
      )}
      {modal?.kind === "budget" && (
        <BudgetModal data={modal.data} onClose={() => setModal(null)} onSave={saveBudgetLine} />
      )}
      {modal?.kind === "newYear" && (
        <NewYearModal data={modal.data} existingYears={budgetYears} sourceYear={fiscalYear} onClose={() => setModal(null)} onCreate={startNewYear} />
      )}
    </div>
  );
}

/* ----------------------------- sign-in ----------------------------- */
function SignIn({ onPick }) {
  return (
    <div style={{ fontFamily: "'Archivo', 'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: BRAND.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600&display=swap');`}</style>
      <div style={{ background: "#fff", borderRadius: 18, padding: 34, width: "100%", maxWidth: 420, boxShadow: "0 24px 70px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: BRAND.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontStyle: "italic", fontSize: 20, color: "#fff", letterSpacing: -1 }}>hv</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.navy }}>Heritage Valley FCU</div>
            <div style={{ fontSize: 12.5, color: BRAND.sub, fontWeight: 500 }}>Marketing & Business Development</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: BRAND.sub, margin: "16px 0 18px" }}>Select your name to sign in. Interactions you log will be stamped with your name and the date and time.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {USERS.map((u) => (
            <button key={u.id} onClick={() => onPick(u)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, border: `1px solid ${BRAND.line}`, background: "#fff", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: BRAND.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{u.initials}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.ink }}>{u.name}</div>
                <div style={{ fontSize: 12.5, color: BRAND.sub }}>{u.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- shared bits ----------------------------- */
function ViewToggle({ value, onChange }) {
  const opt = (mode, Icon, label) => {
    const on = value === mode;
    return (
      <button onClick={() => onChange(mode)} title={label} aria-label={label} aria-pressed={on}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "none", cursor: "pointer",
          background: on ? BRAND.navy : "transparent", color: on ? "#fff" : BRAND.sub, fontSize: 13, fontWeight: 700 }}>
        <Icon size={15} /> {label}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", border: `1px solid ${BRAND.line}`, borderRadius: 9, overflow: "hidden", background: "#fff" }}>
      {opt("card", LayoutGrid, "Cards")}
      {opt("list", List, "List")}
    </div>
  );
}

function Toolbar({ onAdd, addLabel, search, setSearch, filter, setFilter, filterOptions, view, setView }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ position: "relative", flex: "1 1 220px", minWidth: 0 }}>
        <Search size={16} color={BRAND.sub} style={{ position: "absolute", left: 12, top: 11 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
          style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>
      {filterOptions && (
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160 }}>
          {filterOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      )}
      {setView && <ViewToggle value={view} onChange={setView} />}
      <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 9, border: "none", background: BRAND.navy, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
      <button onClick={onEdit} style={iconBtn}><Edit2 size={14} /> Edit</button>
      <button onClick={onDelete} style={{ ...iconBtn, color: BRAND.red }}><Trash2 size={14} /> Delete</button>
    </div>
  );
}
const iconBtn = {
  display: "flex", alignItems: "center", gap: 5, padding: "6px 11px", borderRadius: 8,
  border: `1px solid ${BRAND.line}`, background: "#fff", color: BRAND.sub, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
};

function Empty({ msg }) {
  return <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: BRAND.sub, fontSize: 14 }}>{msg}</div>;
}

// Upcoming + past events tied to a partner. Used on the partner card and edit modal.
function PartnerEvents({ events, onOpen }) {
  const total = events.upcoming.length + events.past.length;
  if (total === 0) return <div style={{ fontSize: 13, color: BRAND.sub }}>No events linked to this partner yet.</div>;

  const Row = ({ e, dim }) => {
    const statusColor = statusColorOf(e.status);
    return (
      <div onClick={onOpen ? () => onOpen(e) : undefined}
        style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderTop: `1px dashed ${BRAND.line}`, cursor: onOpen ? "pointer" : "default", opacity: dim ? 0.78 : 1 }}>
        <Calendar size={13} color={BRAND.sub} style={{ marginTop: 3, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: BRAND.ink }}>{e.name}</div>
          <div style={{ fontSize: 12, color: BRAND.sub }}>{fmtDate(e.date)}{e.location ? ` · ${e.location}` : ""}</div>
        </div>
        {e.sponsorAmount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, whiteSpace: "nowrap" }}>{money(e.sponsorAmount)}</span>}
        <span style={{ fontSize: 10.5, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap", marginTop: 2 }}>{e.status}</span>
      </div>
    );
  };

  return (
    <div>
      {events.upcoming.length > 0 && (
        <div style={{ marginBottom: events.past.length ? 12 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.green, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>Upcoming ({events.upcoming.length})</div>
          {events.upcoming.map((e) => <Row key={e.id} e={e} />)}
        </div>
      )}
      {events.past.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>Past ({events.past.length})</div>
          {events.past.map((e) => <Row key={e.id} e={e} dim />)}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- list views ----------------------------- */
const listWrap = { background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, overflow: "hidden" };
const thStyle = { padding: "11px 16px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 16px", fontSize: 13.5, color: BRAND.ink, verticalAlign: "middle" };
const listIconBtn = {
  border: `1px solid ${BRAND.line}`, background: "#fff", borderRadius: 7, padding: 6, cursor: "pointer", color: BRAND.sub, marginLeft: 6,
};

function PartnerList({ partners, interactionsFor, eventsFor, onEdit, onDelete }) {
  if (partners.length === 0) return <div style={listWrap}><Empty msg="No partners match your filters." /></div>;
  return (
    <div style={{ ...listWrap, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BRAND.line}`, background: "#fafbfc" }}>
            <th style={thStyle}>Partner</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Stage</th>
            <th style={thStyle}>Contact</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Interactions</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Events</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p, idx) => {
            const evs = eventsFor(p.id);
            return (
              <tr key={p.id} style={{ borderBottom: idx < partners.length - 1 ? `1px solid ${BRAND.line}` : "none" }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: BRAND.navy }}>{p.name}</td>
                <td style={{ ...tdStyle, color: BRAND.sub }}>{p.type}</td>
                <td style={tdStyle}><Pill label={p.stage} color={stageColorOf(p.stage)} /></td>
                <td style={tdStyle}>{p.contact || "—"}{p.email && <div style={{ fontSize: 12, color: BRAND.sub }}>{p.email}</div>}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{interactionsFor(p.id).length}</td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{evs.upcoming.length + evs.past.length}</td>
                <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                  <button onClick={() => onEdit(p)} title="Edit" style={listIconBtn}><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(p.id)} title="Delete" style={{ ...listIconBtn, color: BRAND.red }}><Trash2 size={14} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EventList({ events, partnerName, onEdit, onDelete }) {
  if (events.length === 0) return <div style={listWrap}><Empty msg="No events scheduled." /></div>;
  const today = todayStr();
  return (
    <div style={{ ...listWrap, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BRAND.line}`, background: "#fafbfc" }}>
            <th style={thStyle}>Event</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Partner</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Sponsorship</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, idx) => {
            const past = e.date < today;
            const statusColor = statusColorOf(e.status);
            return (
              <tr key={e.id} style={{ borderBottom: idx < events.length - 1 ? `1px solid ${BRAND.line}` : "none", opacity: past ? 0.72 : 1 }}>
                <td style={{ ...tdStyle, fontWeight: 700, color: BRAND.navy }}>{e.name}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
                <td style={{ ...tdStyle, color: BRAND.sub }}>{e.type}</td>
                <td style={{ ...tdStyle, color: BRAND.sub }}>{e.partnerId ? partnerName(e.partnerId) : "—"}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: e.sponsorAmount ? 700 : 400, color: e.sponsorAmount ? BRAND.green : BRAND.sub, fontVariantNumeric: "tabular-nums" }}>{e.sponsorAmount ? money(e.sponsorAmount) : "—"}</td>
                <td style={tdStyle}><span style={{ fontSize: 11.5, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: 0.3 }}>{e.status}</span></td>
                <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                  <button onClick={() => onEdit(e)} title="Edit" style={listIconBtn}><Edit2 size={14} /></button>
                  <button onClick={() => onDelete(e.id)} title="Delete" style={{ ...listIconBtn, color: BRAND.red }}><Trash2 size={14} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------- settings ----------------------------- */
const SETTING_SECTIONS = [
  { key: "stages", group: "Partners", label: "Partner Stages", help: "Pipeline stages a partner can move through.", colored: true },
  { key: "partnerTypes", group: "Partners", label: "Partner Types", help: "Categories of partner organizations.", colored: false },
  { key: "interactionTypes", group: "Interactions", label: "Interaction Types", help: "Kinds of interactions you can log.", colored: false },
  { key: "eventTypes", group: "Events & Sponsorships", label: "Event Types", help: "Categories of events and sponsorships.", colored: false },
  { key: "eventStatuses", group: "Events & Sponsorships", label: "Event Statuses", help: "Lifecycle states for an event.", colored: true },
];

function SettingsView({ settings, setSettings, usage }) {
  const [draft, setDraft] = useState({}); // key -> new item text
  const [editing, setEditing] = useState(null); // { key, index, value }

  const update = (key, nextList) => setSettings((s) => ({ ...s, [key]: nextList }));

  const add = (key) => {
    const val = (draft[key] || "").trim();
    if (!val) return;
    if (settings[key].some((x) => x.toLowerCase() === val.toLowerCase())) { setDraft((d) => ({ ...d, [key]: "" })); return; }
    update(key, [...settings[key], val]);
    setDraft((d) => ({ ...d, [key]: "" }));
  };

  const saveEdit = () => {
    if (!editing) return;
    const val = editing.value.trim();
    const { key, index } = editing;
    if (val && !settings[key].some((x, i) => i !== index && x.toLowerCase() === val.toLowerCase())) {
      const next = [...settings[key]]; next[index] = val; update(key, next);
    }
    setEditing(null);
  };

  const remove = (key, index) => {
    const label = settings[key][index];
    const count = usage[key] ? usage[key](label) : 0;
    if (settings[key].length <= 1) { alert("Keep at least one option in this list."); return; }
    if (count > 0 && !window.confirm(`"${label}" is used by ${count} record${count === 1 ? "" : "s"}. Those records keep the label, but it won't be selectable for new ones. Remove it?`)) return;
    update(key, settings[key].filter((_, i) => i !== index));
  };

  const move = (key, index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= settings[key].length) return;
    const next = [...settings[key]];
    [next[index], next[j]] = [next[j], next[index]];
    update(key, next);
  };

  const groups = ["Partners", "Interactions", "Events & Sponsorships"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: BRAND.navy }}>Settings</h2>
      </div>
      <p style={{ fontSize: 13.5, color: BRAND.sub, margin: "0 0 20px", maxWidth: 620, lineHeight: 1.5 }}>
        Manage the dropdown options used across the app. Colors for stages and statuses are assigned automatically. Reordering a stage changes where it sits in the pipeline.
      </p>

      {groups.map((g) => (
        <div key={g} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.green, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{g}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {SETTING_SECTIONS.filter((sec) => sec.group === g).map((sec) => {
              const list = settings[sec.key];
              return (
                <div key={sec.key} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: BRAND.navy }}>{sec.label}</div>
                  <div style={{ fontSize: 12.5, color: BRAND.sub, marginTop: 2, marginBottom: 12, lineHeight: 1.45 }}>{sec.help}</div>

                  <div>
                    {list.map((item, i) => {
                      const isEditing = editing && editing.key === sec.key && editing.index === i;
                      const count = usage[sec.key] ? usage[sec.key](item) : 0;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: i === 0 ? "none" : `1px solid ${BRAND.line}` }}>
                          {sec.colored && <span style={{ width: 12, height: 12, borderRadius: 4, background: colorForIndex(i), flexShrink: 0 }} />}
                          {isEditing ? (
                            <input autoFocus value={editing.value}
                              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                              onBlur={saveEdit}
                              style={{ ...inputStyle, padding: "5px 8px", flex: 1 }} />
                          ) : (
                            <span style={{ flex: 1, fontSize: 13.5, color: BRAND.ink, fontWeight: 600 }}>{item}
                              {count > 0 && <span style={{ marginLeft: 7, fontSize: 11.5, color: BRAND.sub, fontWeight: 500 }}>· {count} in use</span>}
                            </span>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <button onClick={() => move(sec.key, i, -1)} disabled={i === 0} title="Move up" style={{ ...settingsMini, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                            <button onClick={() => move(sec.key, i, 1)} disabled={i === list.length - 1} title="Move down" style={{ ...settingsMini, opacity: i === list.length - 1 ? 0.3 : 1 }}>↓</button>
                            <button onClick={() => setEditing({ key: sec.key, index: i, value: item })} title="Rename" style={settingsMini}><Edit2 size={13} /></button>
                            <button onClick={() => remove(sec.key, i)} title="Remove" style={{ ...settingsMini, color: BRAND.red }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <input value={draft[sec.key] || ""} placeholder={`Add ${sec.label.toLowerCase().replace(/s$/, "")}…`}
                      onChange={(e) => setDraft((d) => ({ ...d, [sec.key]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") add(sec.key); }}
                      style={{ ...inputStyle, padding: "8px 11px", flex: 1 }} />
                    <button onClick={() => add(sec.key)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 9, border: "none", background: BRAND.navy, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
const settingsMini = {
  border: "none", background: "none", cursor: "pointer", color: BRAND.sub, padding: 4, fontSize: 13, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center",
};

/* ----------------------------- calendar ----------------------------- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ymd = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function CalendarView({ anchor, setAnchor, selected, setSelected, itemsByDay, kindMeta, onOpen, onAddEvent }) {
  const { y, m } = anchor;
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = todayStr();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const move = (delta) => {
    let nm = m + delta, ny = y;
    if (nm < 0) { nm = 11; ny -= 1; }
    if (nm > 11) { nm = 0; ny += 1; }
    setAnchor({ y: ny, m: nm });
    setSelected(null);
  };
  const goToday = () => { const t = new Date(); setAnchor({ y: t.getFullYear(), m: t.getMonth() }); setSelected(today); };

  const selItems = selected ? (itemsByDay[selected] || []) : [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <button onClick={() => move(-1)} style={navBtn} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: BRAND.navy, minWidth: 200 }}>{MONTHS[m]} {y}</h2>
        <button onClick={() => move(1)} style={navBtn} aria-label="Next month"><ChevronRight size={18} /></button>
        <button onClick={goToday} style={{ ...navBtn, width: "auto", padding: "0 14px", fontSize: 13, fontWeight: 700, color: BRAND.navy }}>Today</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries(kindMeta).map(([k, meta]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: BRAND.sub, fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: meta.color }} /> {meta.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${BRAND.line}` }}>
          {DOW.map((d) => (
            <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.4 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((d, idx) => {
            if (d === null) return <div key={idx} style={{ background: "#fafbfc", borderRight: `1px solid ${BRAND.line}`, borderBottom: `1px solid ${BRAND.line}`, minHeight: 104 }} />;
            const date = ymd(y, m, d);
            const items = itemsByDay[date] || [];
            const isToday = date === today;
            const isSel = date === selected;
            return (
              <div key={idx} onClick={() => setSelected(date)}
                style={{
                  minHeight: 104, padding: 6, cursor: "pointer", borderRight: `1px solid ${BRAND.line}`, borderBottom: `1px solid ${BRAND.line}`,
                  background: isSel ? `${BRAND.navy}0d` : "#fff", outline: isSel ? `2px solid ${BRAND.navy}` : "none", outlineOffset: -2,
                }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%", background: isToday ? BRAND.navy : "transparent", color: isToday ? "#fff" : BRAND.ink,
                  }}>{d}</span>
                </div>
                {items.slice(0, 3).map((it) => (
                  <div key={it.id} onClick={(e) => { e.stopPropagation(); onOpen(it); }}
                    title={it.title}
                    style={{
                      fontSize: 11, fontWeight: 600, color: "#fff", background: kindMeta[it.kind].color,
                      borderRadius: 5, padding: "2px 6px", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{it.title}</div>
                ))}
                {items.length > 3 && <div style={{ fontSize: 10.5, color: BRAND.sub, fontWeight: 700, paddingLeft: 4 }}>+{items.length - 3} more</div>}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 18, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: BRAND.navy }}>{fmtDate(selected)}</h3>
            <button onClick={() => onAddEvent(selected)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, border: "none", background: BRAND.navy, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <Plus size={14} /> Add event
            </button>
          </div>
          {selItems.length === 0 && <p style={{ color: BRAND.sub, fontSize: 14, margin: 0 }}>Nothing scheduled. Add an event or log an interaction for this day.</p>}
          {selItems.map((it) => (
            <div key={it.id} onClick={() => onOpen(it)}
              style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 0", borderTop: `1px solid ${BRAND.line}`, cursor: "pointer" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: kindMeta[it.kind].color, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink }}>{it.title}</div>
                {it.sub && <div style={{ fontSize: 13, color: BRAND.sub, lineHeight: 1.5 }}>{it.sub}</div>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: kindMeta[it.kind].color, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{kindMeta[it.kind].label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const navBtn = {
  width: 38, height: 38, borderRadius: 9, border: `1px solid ${BRAND.line}`, background: "#fff",
  color: BRAND.sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};

/* ----------------------------- budget ----------------------------- */
function BudgetBar({ annual, spent }) {
  const a = Number(annual) || 0, s = Number(spent) || 0;
  const pct = a > 0 ? Math.min((s / a) * 100, 100) : (s > 0 ? 100 : 0);
  const over = s > a;
  const color = over ? BRAND.red : pct >= 90 ? "#e08a1e" : BRAND.green;
  return (
    <div style={{ height: 8, borderRadius: 99, background: BRAND.bg, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: color, transition: "width .3s" }} />
    </div>
  );
}

function BudgetView({ totals, fiscalYear, setFiscalYear, years, onExport, onNewYear, onAdd, onEdit, onDelete }) {
  const pctSpent = totals.annual > 0 ? (totals.spent / totals.annual) * 100 : 0;
  const hasItems = Object.keys(totals.byCat).length > 0;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: BRAND.navy }}>Marketing Budget</h2>
        <select value={fiscalYear} onChange={(e) => setFiscalYear(Number(e.target.value))} title="Fiscal year"
          style={{ ...inputStyle, width: "auto", minWidth: 100, fontWeight: 700 }}>
          {years.map((y) => <option key={y} value={y}>FY {y}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={onNewYear} style={ghostBtn} title="Start a budget for a new year">
            <CalendarPlus size={15} /> New Year
          </button>
          <button onClick={onExport} disabled={!hasItems} style={{ ...ghostBtn, opacity: hasItems ? 1 : 0.5, cursor: hasItems ? "pointer" : "not-allowed" }} title="Export this year's budget to CSV">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => onAdd()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 9, border: "none", background: BRAND.navy, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            <Plus size={16} /> Add Line Item
          </button>
        </div>
      </div>

      {!hasItems && (
        <div style={{ background: "#fff", border: `1px dashed ${BRAND.line}`, borderRadius: 14, padding: 40, textAlign: "center", color: BRAND.sub }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.ink, marginBottom: 6 }}>No line items for FY {fiscalYear}</div>
          <div style={{ fontSize: 13.5 }}>Add a line item to start building this year's budget.</div>
        </div>
      )}

      {hasItems && <>
      {/* summary cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <StatCard icon={Wallet} label="Total Budget" value={money(totals.annual)} accent={BRAND.navy} />
        <StatCard icon={TrendingUp} label="Spent to Date" value={money(totals.spent)} accent={BRAND.teal} />
        <StatCard icon={PieChart} label="Remaining" value={money(totals.remaining)} accent={totals.remaining < 0 ? BRAND.red : BRAND.green} />
      </div>

      {/* overall progress */}
      <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
          <span style={{ fontWeight: 700, color: BRAND.ink }}>{pctSpent.toFixed(1)}% of budget spent</span>
          <span style={{ color: BRAND.sub, fontWeight: 600 }}>{money(totals.spent)} of {money(totals.annual)}</span>
        </div>
        <BudgetBar annual={totals.annual} spent={totals.spent} />
      </div>

      {/* per-category tables */}
      {BUDGET_CATEGORIES.filter((c) => totals.byCat[c]).map((cat) => {
        const c = totals.byCat[cat];
        const rem = c.annual - c.spent;
        return (
          <div key={cat} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: BRAND.green, color: "#fff", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{cat}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{money(c.spent)} spent · {money(rem)} remaining</span>
            </div>
            {/* header row */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2.4fr) 1fr 1fr 1fr 90px", gap: 10, padding: "9px 18px", borderBottom: `1px solid ${BRAND.line}`, fontSize: 11.5, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.3 }}>
              <span>Line Item</span>
              <span style={{ textAlign: "right" }}>Annual</span>
              <span style={{ textAlign: "right" }}>Spent</span>
              <span style={{ textAlign: "right" }}>Remaining</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {c.items.map((b) => {
              const r = (Number(b.annual) || 0) - (Number(b.spent) || 0);
              const over = r < 0;
              return (
                <div key={b.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${BRAND.line}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2.4fr) 1fr 1fr 1fr 90px", gap: 10, alignItems: "center" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink, display: "flex", alignItems: "center", gap: 6 }}>
                        {b.name}{over && <AlertTriangle size={13} color={BRAND.red} />}
                      </div>
                    </div>
                    <span style={{ textAlign: "right", fontSize: 13.5, color: BRAND.ink, fontVariantNumeric: "tabular-nums" }}>{money(b.annual)}</span>
                    <span style={{ textAlign: "right", fontSize: 13.5, color: BRAND.ink, fontVariantNumeric: "tabular-nums" }}>{money(b.spent)}</span>
                    <span style={{ textAlign: "right", fontSize: 13.5, fontWeight: 700, color: over ? BRAND.red : BRAND.green, fontVariantNumeric: "tabular-nums" }}>{money(r)}</span>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => onEdit(b)} title="Edit" style={{ border: `1px solid ${BRAND.line}`, background: "#fff", borderRadius: 7, padding: 5, cursor: "pointer", color: BRAND.sub }}><Edit2 size={13} /></button>
                      <button onClick={() => onDelete(b.id)} title="Delete" style={{ border: `1px solid ${BRAND.line}`, background: "#fff", borderRadius: 7, padding: 5, cursor: "pointer", color: BRAND.red }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{ marginTop: 7 }}><BudgetBar annual={b.annual} spent={b.spent} /></div>
                  {b.notes && <div style={{ marginTop: 6, fontSize: 12.5, color: BRAND.sub, lineHeight: 1.5 }}>{b.notes}</div>}
                </div>
              );
            })}
            <div style={{ padding: "10px 18px" }}>
              <button onClick={() => onAdd(cat)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 8, border: `1px dashed ${BRAND.navy}`, background: `${BRAND.navy}0d`, color: BRAND.navy, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={13} /> Add to {cat}
              </button>
            </div>
          </div>
        );
      })}
      </>}
    </div>
  );
}

const ghostBtn = {
  display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 9,
  border: `1px solid ${BRAND.line}`, background: "#fff", color: BRAND.navy, fontWeight: 700, fontSize: 13.5, cursor: "pointer",
};

/* ----------------------------- modals ----------------------------- */
function PartnerModal({ data, history = [], events = { upcoming: [], past: [] }, onClose, onSave }) {
  const [f, setF] = useState(data);
  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={data.id ? "Edit Partner" : "Add Partner"} onClose={onClose} onSave={() => f.name.trim() && onSave(f)}>
      <Field label="Organization name"><input style={inputStyle} value={f.name} onChange={(e) => up("name", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => up("type", e.target.value)}>{optsWith(LIVE_SETTINGS.partnerTypes, f.type).map((t) => <option key={t}>{t}</option>)}</select></Field></div>
        <div style={{ flex: 1 }}><Field label="Stage"><select style={inputStyle} value={f.stage} onChange={(e) => up("stage", e.target.value)}>{optsWith(LIVE_SETTINGS.stages, f.stage).map((t) => <option key={t}>{t}</option>)}</select></Field></div>
      </div>
      <Field label="Primary contact"><input style={inputStyle} value={f.contact} onChange={(e) => up("contact", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Email"><input style={inputStyle} value={f.email} onChange={(e) => up("email", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Phone"><input style={inputStyle} value={f.phone} onChange={(e) => up("phone", e.target.value)} /></Field></div>
      </div>
      <Field label="Employees (if SEG)"><input type="number" style={inputStyle} value={f.employees} onChange={(e) => up("employees", Number(e.target.value))} /></Field>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={f.notes} onChange={(e) => up("notes", e.target.value)} /></Field>

      {data.id && (
        <div style={{ marginTop: 4, borderTop: `1px solid ${BRAND.line}`, paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, fontSize: 12, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.4 }}>
            <MessageSquare size={14} color={BRAND.teal} /> Interaction history ({history.length})
          </div>
          {history.length === 0 && <div style={{ fontSize: 13, color: BRAND.sub }}>No interactions logged yet.</div>}
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {history.map((i) => (
              <div key={i.id} style={{ padding: "9px 0", borderTop: `1px dashed ${BRAND.line}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <Pill label={i.type} color={BRAND.teal} />
                  <span style={{ fontSize: 12, color: BRAND.sub, fontWeight: 600 }}>{fmtDate(i.date)}</span>
                </div>
                <div style={{ fontSize: 13, color: BRAND.ink, lineHeight: 1.5 }}>{i.summary}</div>
                {i.followUp && (
                  <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: BRAND.navyDark }}>
                    <Bell size={11} color={BRAND.green} /> Follow up {fmtDate(i.followUp)}{i.followUpNote ? ` — ${i.followUpNote}` : ""}
                  </div>
                )}
                {i.createdBy && <div style={{ marginTop: 4, fontSize: 11, color: BRAND.sub }}>By {i.createdBy} · {fmtDateTime(i.createdAt)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.id && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${BRAND.line}`, paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, fontSize: 12, fontWeight: 700, color: BRAND.sub, textTransform: "uppercase", letterSpacing: 0.4 }}>
            <Calendar size={14} color={BRAND.green} /> Events & sponsorships ({events.upcoming.length + events.past.length})
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            <PartnerEvents events={events} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function InteractionModal({ data, partners, onClose, onSave }) {
  const [f, setF] = useState(data);
  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={data.id ? "Edit Interaction" : "Log Interaction"} onClose={onClose} onSave={() => f.partnerId && onSave(f)}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Partner"><select style={inputStyle} value={f.partnerId} onChange={(e) => up("partnerId", e.target.value)}>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field></div>
        <div style={{ flex: 1 }}><Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => up("type", e.target.value)}>{optsWith(LIVE_SETTINGS.interactionTypes, f.type).map((t) => <option key={t}>{t}</option>)}</select></Field></div>
      </div>
      <Field label="Date"><input type="date" style={inputStyle} value={f.date} onChange={(e) => up("date", e.target.value)} /></Field>
      <Field label="Summary"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={f.summary} onChange={(e) => up("summary", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Follow-up date"><input type="date" style={inputStyle} value={f.followUp} onChange={(e) => up("followUp", e.target.value)} /></Field></div>
        <div style={{ flex: 1.4 }}><Field label="Follow-up note"><input style={inputStyle} value={f.followUpNote} onChange={(e) => up("followUpNote", e.target.value)} /></Field></div>
      </div>
      {f.createdBy && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: BRAND.sub, background: BRAND.bg, borderRadius: 8, padding: "8px 11px" }}>
          <UserCircle size={14} /> Logged by <span style={{ fontWeight: 700, color: BRAND.ink }}>{f.createdBy}</span> · {fmtDateTime(f.createdAt)}
        </div>
      )}
    </Modal>
  );
}

function EventModal({ data, partners, onClose, onSave }) {
  const [f, setF] = useState(data);
  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={data.id ? "Edit Event" : "Add Event"} onClose={onClose} onSave={() => f.name.trim() && onSave(f)}>
      <Field label="Event name"><input style={inputStyle} value={f.name} onChange={(e) => up("name", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => up("type", e.target.value)}>{optsWith(LIVE_SETTINGS.eventTypes, f.type).map((t) => <option key={t}>{t}</option>)}</select></Field></div>
        <div style={{ flex: 1 }}><Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => up("status", e.target.value)}>{optsWith(LIVE_SETTINGS.eventStatuses, f.status).map((t) => <option key={t}>{t}</option>)}</select></Field></div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Date"><input type="date" style={inputStyle} value={f.date} onChange={(e) => up("date", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Sponsorship $"><input type="number" style={inputStyle} value={f.sponsorAmount} onChange={(e) => up("sponsorAmount", Number(e.target.value))} /></Field></div>
      </div>
      <Field label="Location"><input style={inputStyle} value={f.location} onChange={(e) => up("location", e.target.value)} /></Field>
      <Field label="Associated partner (optional)"><select style={inputStyle} value={f.partnerId} onChange={(e) => up("partnerId", e.target.value)}><option value="">— None —</option>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={f.notes} onChange={(e) => up("notes", e.target.value)} /></Field>
    </Modal>
  );
}

function BudgetModal({ data, onClose, onSave }) {
  const [f, setF] = useState(data);
  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const remaining = (Number(f.annual) || 0) - (Number(f.spent) || 0);
  return (
    <Modal title={data.id ? "Edit Line Item" : "Add Line Item"} onClose={onClose} onSave={() => f.name.trim() && onSave(f)}>
      <Field label="Line item name"><input style={inputStyle} value={f.name} onChange={(e) => up("name", e.target.value)} /></Field>
      <Field label="Category"><select style={inputStyle} value={f.category} onChange={(e) => up("category", e.target.value)}>{BUDGET_CATEGORIES.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Annual budget ($)"><input type="number" step="0.01" style={inputStyle} value={f.annual} onChange={(e) => up("annual", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Spent to date ($)"><input type="number" step="0.01" style={inputStyle} value={f.spent} onChange={(e) => up("spent", e.target.value)} /></Field></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: BRAND.bg, borderRadius: 9, padding: "10px 13px", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.sub }}>Remaining (auto-calculated)</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: remaining < 0 ? BRAND.red : BRAND.green }}>{money(remaining)}</span>
      </div>
      <Field label="Notes"><textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={f.notes} onChange={(e) => up("notes", e.target.value)} /></Field>
    </Modal>
  );
}

function NewYearModal({ data, existingYears, sourceYear, onClose, onCreate }) {
  const [f, setF] = useState(data);
  const up = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const yr = Number(f.year);
  const exists = existingYears.includes(yr);
  return (
    <Modal title="Start a New Budget Year" onClose={onClose} saveLabel={exists ? "Switch to Year" : "Create Budget"}
      onSave={() => yr && onCreate(yr, f.mode)}>
      <Field label="Budget year"><input type="number" style={inputStyle} value={f.year} onChange={(e) => up("year", e.target.value)} /></Field>
      {exists ? (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, background: `${BRAND.teal}14`, border: `1px solid ${BRAND.teal}40`, borderRadius: 9, padding: "11px 13px", fontSize: 13, color: BRAND.ink, lineHeight: 1.5 }}>
          <AlertTriangle size={16} color={BRAND.teal} style={{ flexShrink: 0, marginTop: 1 }} />
          FY {yr} already exists. Saving will simply switch you to that year — nothing will be overwritten.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>How should it start?</div>
          {[
            { v: "carry", t: `Copy line items from FY ${sourceYear}`, d: "Keeps every line item and its annual budget; resets spent to $0." },
            { v: "blank", t: "Start with an empty budget", d: "No line items — you'll add them from scratch." },
          ].map((opt) => (
            <button key={opt.v} onClick={() => up("mode", opt.v)} style={{
              display: "flex", gap: 11, width: "100%", textAlign: "left", marginBottom: 9, padding: "12px 13px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${f.mode === opt.v ? BRAND.navy : BRAND.line}`, background: f.mode === opt.v ? `${BRAND.navy}0d` : "#fff",
            }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${f.mode === opt.v ? BRAND.navy : BRAND.line}`, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.mode === opt.v && <div style={{ width: 9, height: 9, borderRadius: "50%", background: BRAND.navy }} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.ink }}>{opt.t}</div>
                <div style={{ fontSize: 12.5, color: BRAND.sub, lineHeight: 1.45, marginTop: 2 }}>{opt.d}</div>
              </div>
            </button>
          ))}
        </>
      )}
    </Modal>
  );
}
