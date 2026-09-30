import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  Settings,
} from "lucide-react";

import { adminApi } from "@/lib/cms";
import { PagesSection } from "./sections/pages";
import { ArticlesSection } from "./sections/articles";
import { MediaSection } from "./sections/media";
import { MessagesSection } from "./sections/messages";
import { SettingsSection } from "./sections/settings";
import { AccountSection } from "./sections/account";
import "./admin.css";

type SectionKey = "pages" | "articles" | "media" | "messages" | "settings" | "account";

const SECTIONS: { key: SectionKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "pages", label: "Pages & sections", icon: LayoutDashboard },
  { key: "articles", label: "Actualités", icon: Newspaper },
  { key: "media", label: "Médiathèque", icon: ImageIcon },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "settings", label: "Réglages", icon: Settings },
  { key: "account", label: "Mon compte", icon: KeyRound },
];

function LoginGate({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<"checking" | "login" | "setup">("checking");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi.setupStatus()
      .then((res) => setMode(res.setup ? "setup" : "login"))
      .catch(() => setMode("login"));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "setup") {
        if (password.length < 8) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
        }
        if (password !== confirm) {
          throw new Error("Les deux mots de passe ne correspondent pas.");
        }
        await adminApi.setup(username, password);
      } else {
        await adminApi.login(username, password);
      }
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "checking") {
    return <div className="admin-loading">Chargement…</div>;
  }

  const isSetup = mode === "setup";

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img src="/api/uploads/logo-u2i.png" alt="" aria-hidden="true" onError={(e) => (e.currentTarget.style.display = "none")} />
        <h1>U2I — Administration</h1>
        {isSetup ? (
          <>
            <p>
              <strong>Première utilisation :</strong> créez votre compte
              administrateur pour commencer à gérer le site.
            </p>
            <label>
              Identifiant
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </label>
            <label>
              Mot de passe (min. 8 caractères)
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
            </label>
            <label>
              Confirmer le mot de passe
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </label>
          </>
        ) : (
          <>
            <p>Connectez-vous pour gérer le contenu du site.</p>
            <label>
              Identifiant
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </label>
            <label>
              Mot de passe
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
          </>
        )}

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

        <button type="submit" disabled={busy}>
          {busy ? (isSetup ? "Création…" : "Connexion…") : isSetup ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export function AdminDashboard() {
  const [status, setStatus] = useState<"checking" | "guest" | "admin">("checking");
  const [csrf, setCsrf] = useState("");
  const [section, setSection] = useState<SectionKey>("pages");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((res) => {
        setCsrf(res.csrf);
        setStatus("admin");
      })
      .catch(() => setStatus("guest"));
  }, []);

  const context = useMemo(() => ({ csrf, notify: setNotice }), [csrf]);

  if (status === "checking") {
    return <div className="admin-loading">Chargement…</div>;
  }

  if (status === "guest") {
    return (
      <LoginGate
        onLoggedIn={() => {
          adminApi
            .me()
            .then((res) => {
              setCsrf(res.csrf);
              setStatus("admin");
            })
            .catch(() => setStatus("guest"));
        }}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span>U2I</span> Administration
        </div>
        <nav>
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={section === key ? "is-active" : ""}
              onClick={() => setSection(key)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <button
          className="admin-sidebar__logout"
          onClick={async () => {
            await adminApi.logout(csrf).catch(() => undefined);
            setStatus("guest");
          }}
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1>{SECTIONS.find((s) => s.key === section)?.label}</h1>
          <div className="admin-topbar__actions">
            {notice ? <span className="admin-topbar__notice">{notice}</span> : null}
            <a href="/" target="_blank" rel="noreferrer" className="admin-topbar__link">
              Voir le site
            </a>
          </div>
        </header>

        {section === "pages" && <PagesSection ctx={context} />}
        {section === "articles" && <ArticlesSection ctx={context} />}
        {section === "media" && <MediaSection ctx={context} />}
        {section === "messages" && <MessagesSection ctx={context} />}
        {section === "settings" && <SettingsSection ctx={context} />}
        {section === "account" && <AccountSection ctx={context} />}
      </main>
    </div>
  );
}
