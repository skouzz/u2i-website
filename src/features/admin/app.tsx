import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Newspaper,
  RefreshCw,
  Settings,
} from "lucide-react";

import { adminApi } from "@/lib/cms";
import { PagesSection } from "./sections/pages";
import { ArticlesSection } from "./sections/articles";
import { MediaSection } from "./sections/media";
import { MessagesSection } from "./sections/messages";
import { SettingsSection } from "./sections/settings";
import "./admin.css";

type SectionKey = "pages" | "articles" | "media" | "messages" | "settings";

const SECTIONS: { key: SectionKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "pages", label: "Pages & sections", icon: LayoutDashboard },
  { key: "articles", label: "Actualités", icon: Newspaper },
  { key: "media", label: "Médiathèque", icon: ImageIcon },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "settings", label: "Réglages", icon: Settings },
];

function LoginGate({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.login(username, password);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img src="/api/uploads/logo-u2i.png" alt="" aria-hidden="true" onError={(e) => (e.currentTarget.style.display = "none")} />
        <h1>U2I — Administration</h1>
        <p>Connectez-vous pour gérer le contenu du site.</p>

        <label>
          Identifiant
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

        <button type="submit" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
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
      </main>
    </div>
  );
}
