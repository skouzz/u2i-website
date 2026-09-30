import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  FileStack,
  FolderTree,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  ListTree,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Newspaper,
  PanelBottom,
  PanelTop,
  ScrollText,
  Settings,
  Tags,
} from "lucide-react";

import { adminApi, type CmsActivity, type CmsMessage } from "@/lib/cms";
import { BootLoader } from "@/components/loading";
import type { AdminCtx, SectionKey } from "./types";
import { DashboardHome } from "./sections/home";
import "./admin.css";

// Lazy-load every section: keeps the dashboard bundle lean.
const PagesSection = lazy(() =>
  import("./sections/pages").then((m) => ({ default: m.PagesSection })),
);
const ArticlesSection = lazy(() =>
  import("./sections/articles").then((m) => ({ default: m.ArticlesSection })),
);
const MediaSection = lazy(() =>
  import("./sections/media").then((m) => ({ default: m.MediaSection })),
);
const MessagesSection = lazy(() =>
  import("./sections/messages").then((m) => ({ default: m.MessagesSection })),
);
const SettingsSection = lazy(() =>
  import("./sections/settings").then((m) => ({ default: m.SettingsSection })),
);
const AccountSection = lazy(() =>
  import("./sections/account").then((m) => ({ default: m.AccountSection })),
);
const CategoriesSection = lazy(() =>
  import("./sections/taxonomy").then((m) => ({ default: m.CategoriesSection })),
);
const TagsSection = lazy(() =>
  import("./sections/taxonomy").then((m) => ({ default: m.TagsSection })),
);
const MenusSection = lazy(() =>
  import("./sections/menus").then((m) => ({ default: m.MenusSection })),
);
const HomepageSection = lazy(() =>
  import("./sections/homepage").then((m) => ({ default: m.HomepageSection })),
);
const WebsiteSection = lazy(() =>
  import("./sections/website").then((m) => ({ default: m.WebsiteSection })),
);

type NavGroup = {
  label: string;
  items: { key: SectionKey; label: string; icon: typeof LayoutDashboard }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ key: "home", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Contenu",
    items: [
      { key: "pages", label: "Pages", icon: FileStack },
      { key: "articles", label: "Actualités", icon: Newspaper },
      { key: "categories", label: "Catégories", icon: FolderTree },
      { key: "tags", label: "Tags", icon: Tags },
    ],
  },
  {
    label: "Médias & menus",
    items: [
      { key: "media", label: "Médiathèque", icon: ImageIcon },
      { key: "menus", label: "Menus", icon: ListTree },
    ],
  },
  {
    label: "Site web",
    items: [
      { key: "homepage", label: "Page d'accueil", icon: LayoutTemplate },
      { key: "header", label: "En-tête", icon: PanelTop },
      { key: "footer", label: "Pied de page", icon: PanelBottom },
      { key: "settings", label: "Réglages", icon: Settings },
    ],
  },
  {
    label: "Système",
    items: [
      { key: "activity", label: "Activité", icon: ScrollText },
      { key: "messages", label: "Messages", icon: Mail },
      { key: "account", label: "Mon compte", icon: KeyRound },
    ],
  },
];

const SECTION_TITLES: Record<SectionKey, string> = {
  home: "Tableau de bord",
  pages: "Pages",
  articles: "Actualités",
  categories: "Catégories",
  tags: "Tags",
  media: "Médiathèque",
  menus: "Menus",
  homepage: "Page d'accueil",
  header: "En-tête du site",
  footer: "Pied de page",
  settings: "Réglages",
  seo: "SEO",
  users: "Utilisateurs",
  activity: "Journal d'activité",
  messages: "Messages",
  account: "Mon compte",
};

function LoginGate({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<"checking" | "login" | "setup">("checking");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi
      .setupStatus()
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
    return <BootLoader label="Vérification de la session" />;
  }

  const isSetup = mode === "setup";

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <img
          src="/api/uploads/logo-u2i.png"
          alt=""
          aria-hidden="true"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <h1>U2I — Administration</h1>
        {isSetup ? (
          <>
            <p>
              <strong>Première utilisation :</strong> créez votre compte administrateur pour
              commencer à gérer le site.
            </p>
            <label>
              Identifiant
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Mot de passe (min. 8 caractères)
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirmer le mot de passe
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          </>
        ) : (
          <>
            <p>Connectez-vous pour gérer le contenu du site.</p>
            <label>
              Identifiant
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          </>
        )}

        {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}

        <button type="submit" disabled={busy}>
          {busy
            ? isSetup
              ? "Création…"
              : "Connexion…"
            : isSetup
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="admin-section">
      <div className="admin-stats">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="admin-stat" aria-hidden="true">
            <strong style={{ color: "#d7dcda" }}>—</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [status, setStatus] = useState<"checking" | "guest" | "admin">("checking");
  const [csrf, setCsrf] = useState("");
  const [username, setUsername] = useState("");
  const [section, setSection] = useState<SectionKey>("home");
  const [notice, setNotice] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true])),
  );

  const refreshUnread = useCallback(() => {
    adminApi
      .messages(csrf)
      .then((res: { items: CmsMessage[] }) => setUnread(res.items.filter((m) => !m.is_read).length))
      .catch(() => undefined);
  }, [csrf]);

  const loadSession = useCallback(() => {
    adminApi
      .me()
      .then((res) => {
        setCsrf(res.csrf);
        setUsername(res.username ?? "");
        setStatus("admin");
      })
      .catch(() => setStatus("guest"));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (status === "admin" && csrf) {
      refreshUnread();
    }
  }, [status, csrf, refreshUnread]);

  const notify = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3500);
  }, []);

  const context = useMemo<AdminCtx>(() => ({ csrf, notify, username }), [csrf, notify, username]);

  const navigate = useCallback((key: SectionKey) => {
    setSection(key);
    setMobileNavOpen(false);
  }, []);

  if (status === "checking") {
    return <BootLoader label="Ouverture du tableau de bord" />;
  }

  if (status === "guest") {
    return <LoginGate onLoggedIn={loadSession} />;
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <span>U2I</span> Administration
        </div>
        <nav aria-label="Navigation admin">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label || `group-${gi}`} className="admin-nav-group">
              {group.label ? (
                <button
                  type="button"
                  className="admin-nav-group__toggle"
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))
                  }
                  aria-expanded={openGroups[group.label]}
                >
                  {group.label}
                  <ChevronDown
                    size={13}
                    className={openGroups[group.label] ? "" : "admin-chevron--closed"}
                  />
                </button>
              ) : null}
              {(openGroups[group.label] ?? true) && (
                <div className="admin-nav-group__items">
                  {group.items.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      className={section === key ? "is-active" : ""}
                      onClick={() => navigate(key)}
                    >
                      <Icon size={16} /> {label}
                      {key === "messages" && unread > 0 ? (
                        <span className="admin-badge-dot">{unread}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <button
          className="admin-sidebar__logout"
          onClick={async () => {
            await adminApi.logout(csrf).catch(() => undefined);
            setStatus("guest");
            setCsrf("");
          }}
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="admin-topbar__burger"
              aria-label="Ouvrir la navigation"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <MenuIcon size={18} />
            </button>
            <h1>{SECTION_TITLES[section]}</h1>
          </div>
          <div className="admin-topbar__actions">
            {notice ? <span className="admin-topbar__notice">{notice}</span> : null}
            <a href="/" target="_blank" rel="noreferrer" className="admin-topbar__link">
              Voir le site
            </a>
            {username ? <span className="admin-topbar__user">{username}</span> : null}
          </div>
        </header>

        <Suspense fallback={<SectionSkeleton />}>
          {section === "home" && <DashboardHome ctx={context} onNavigate={navigate} />}
          {section === "pages" && <PagesSection ctx={context} />}
          {section === "articles" && <ArticlesSection ctx={context} />}
          {section === "categories" && <CategoriesSection ctx={context} />}
          {section === "tags" && <TagsSection ctx={context} />}
          {section === "media" && <MediaSection ctx={context} />}
          {section === "menus" && <MenusSection ctx={context} />}
          {section === "homepage" && <HomepageSection ctx={context} />}
          {section === "header" && <WebsiteSection ctx={context} variant="header" />}
          {section === "footer" && <WebsiteSection ctx={context} variant="footer" />}
          {section === "settings" && <SettingsSection ctx={context} />}
          {section === "activity" && <ActivitySection ctx={context} />}
          {section === "messages" && (
            <MessagesSection ctx={context} onUnreadChange={refreshUnread} />
          )}
          {section === "account" && <AccountSection ctx={context} />}
        </Suspense>
      </main>
    </div>
  );
}

// ── Activity section (small enough to inline here) ───────────────────────────

function ActivitySection({ ctx }: { ctx: AdminCtx }) {
  const [items, setItems] = useState<CmsActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    adminApi
      .activity(ctx.csrf)
      .then((res) => alive && setItems(res.items))
      .catch((err) => alive && setError(err instanceof Error ? err.message : "Erreur"));
    return () => {
      alive = false;
    };
  }, [ctx.csrf]);

  const describe = (action: string): string => {
    const map: Record<string, string> = {
      "page.create": "Page créée",
      "page.update": "Page modifiée",
      "page.delete": "Page supprimée",
      "page.publish": "Page publiée",
      "page.unpublish": "Page dépubliée",
      "page.duplicate": "Page dupliquée",
      "page.restore": "Page restaurée",
      "article.create": "Article créé",
      "article.update": "Article modifié",
      "article.delete": "Article supprimé",
      "article.publish": "Article publié",
      "article.unpublish": "Article dépublié",
      "article.duplicate": "Article dupliqué",
      "article.restore": "Article restauré",
      "media.upload": "Image envoyée",
      "media.delete": "Image supprimée",
      "menu.create": "Menu créé",
      "menu.update": "Menu modifié",
      "menu.delete": "Menu supprimé",
      "category.create": "Catégorie créée",
      "category.update": "Catégorie modifiée",
      "category.delete": "Catégorie supprimée",
      "tag.create": "Tag créé",
      "tag.update": "Tag modifié",
      "tag.delete": "Tag supprimé",
      "home.update": "Page d'accueil mise à jour",
      "settings.update": "Réglages enregistrés",
      "account.password_change": "Mot de passe changé",
    };

    return map[action] ?? action;
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>100 dernières actions</h2>
      </div>
      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
      <div className="admin-list">
        {items.length === 0 ? (
          <p className="admin-hint">Aucune activité enregistrée pour le moment.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="admin-row">
              <span className="admin-row__title">{describe(item.action)}</span>
              {item.detail ? <span className="admin-row__meta">{item.detail}</span> : null}
              <span className="admin-row__spacer" />
              <span className="admin-row__meta">{item.actor}</span>
              <span className="admin-row__meta">
                {new Date(item.created_at.replace(" ", "T")).toLocaleString("fr-FR")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
