import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Mail, Menu, Phone, X, Youtube } from "lucide-react";
import logoImage from "@/assets/logo-u2i-removebg-preview.png";
import emailIcon from "@/assets/partners/email.png";
import { cmsApi } from "@/lib/cms";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Qui sommes-nous", href: "/about" },
  { label: "Secteurs", href: "/secteurs" },
  { label: "Equipements", href: "/equipements" },
  { label: "References", href: "/references" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [cmsLinks, setCmsLinks] = useState<{ label: string; href: string }[]>([]);

  // Pages créées dans l'admin (avec un libellé de menu) apparaissent
  // automatiquement dans la navigation, juste avant « Contact ».
  useEffect(() => {
    let alive = true;
    cmsApi
      .nav()
      .then((res) => {
        if (!alive) return;
        setCmsLinks(
          res.items
            .filter((item) => item.label)
            .map((item) => ({ label: item.label, href: `/p/${item.slug}` })),
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const before = NAV_LINKS.filter((l) => l.href !== "/contact");
  const contact = NAV_LINKS.find((l) => l.href === "/contact");
  const navLinks = [...before, ...cmsLinks, ...(contact ? [contact] : [])];

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-black shadow-lg shadow-black/20 ${
        open ? "backdrop-blur-xl" : ""
      }`}
    >
      {/* Utility bar */}
      <div
        className="hidden border-b border-white/10 py-1 text-[11px] font-semibold text-white/80 md:block"
      >
        <div className="wrap flex items-center justify-end gap-7">
          <div className="mr-auto flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-[#e0141c]" />
            <span className="font-bold tracking-wider">+216 50 191 004</span>
            <span className="text-white/20 mx-1">|</span>
            <Mail className="h-3.5 w-3.5 ml-1 text-[#e0141c]" />
            <a
              href="mailto:u2i@u2iprocess.com"
              className="ml-2 inline-block hover:opacity-90 transition-opacity"
            >
              <img src={emailIcon} alt="Email" className="h-4 w-auto object-contain inline-block" />
            </a>
            <span className="opacity-80 hidden sm:inline ml-2 border-l border-white/20 pl-4">
              Vous avez un nouveau projet ? N'hesitez pas a nous contacter !
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Facebook"
              className="opacity-80 hover:text-[#e0141c] hover:opacity-100 transition-colors"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="opacity-80 hover:text-[#e0141c] hover:opacity-100 transition-colors"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="opacity-80 hover:text-[#e0141c] hover:opacity-100 transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="py-2">
        <div className="wrap flex items-center gap-6">
          <Link to="/" aria-label="U2I" className="mr-4 shrink-0">
            <img
              src={logoImage}
              alt="Univers Inox"
              className="h-9 w-auto rounded-md object-contain sm:h-10"
            />
          </Link>

          <nav className="hidden flex-1 lg:block" aria-label="Menu principal">
            <ul className="flex gap-6 [&:hover_a]:opacity-50">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm font-bold text-white transition-opacity hover:!opacity-100 hover:text-[#e0141c] relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#e0141c] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#e0141c]/20 lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-4/5 max-w-sm bg-black backdrop-blur-xl px-8 pt-24 pb-8 transition-transform duration-300 lg:hidden border-l border-white/10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-6 right-6 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>

        <nav aria-label="Menu mobile">
          <ul className="flex flex-col gap-5">
            {navLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-bold text-white transition-colors hover:text-[#e0141c]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex items-center gap-5 border-t border-white/10 pt-6">
          <a href="#" aria-label="Facebook" className="text-white/70 hover:text-[#e0141c]">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" aria-label="YouTube" className="text-white/70 hover:text-[#e0141c]">
            <Youtube className="h-5 w-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-[#e0141c]">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
