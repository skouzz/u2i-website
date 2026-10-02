import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, X } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n, type MessageKey } from "@/lib/i18n";
import "./sectors.css";

type Photo = { src: string; path: string };
type Sector = {
  id: string;
  titleKey: MessageKey;
  tagKey: MessageKey;
  descKey: MessageKey;
  focusKey: MessageKey;
  match: string[];
  photos: Photo[];
};

const SECTORS: Omit<Sector, "photos">[] = [
  {
    id: "pharmaceutique",
    titleKey: "sectors.item.pharma.title",
    tagKey: "sectors.pharma.tag",
    descKey: "sectors.pharma.desc",
    focusKey: "sectors.pharma.focus",
    match: ["pharma"],
  },
  {
    id: "agroalimentaire",
    titleKey: "sectors.item.food.title",
    tagKey: "sectors.food.tag",
    descKey: "sectors.food.desc",
    focusKey: "sectors.food.focus",
    match: ["agro", "aliment"],
  },
  {
    id: "chimique",
    titleKey: "sectors.item.chemical.title",
    tagKey: "sectors.chemical.tag",
    descKey: "sectors.chemical.desc",
    focusKey: "sectors.chemical.focus",
    match: ["chimie", "chimique", "degraissage", "passivation"],
  },
  {
    id: "cosmetique",
    titleKey: "sectors.item.cosmetics.title",
    tagKey: "sectors.cosmetics.tag",
    descKey: "sectors.cosmetics.desc",
    focusKey: "sectors.cosmetics.focus",
    match: ["cosmetique"],
  },
  {
    id: "mobilier-inox",
    titleKey: "sectors.item.furniture.title",
    tagKey: "sectors.furniture.tag",
    descKey: "sectors.furniture.desc",
    focusKey: "sectors.furniture.focus",
    match: ["mobilier"],
  },
  {
    id: "interventions",
    titleKey: "sectors.item.service.title",
    tagKey: "sectors.service.tag",
    descKey: "sectors.service.desc",
    focusKey: "sectors.service.focus",
    match: ["intervention", "atelier", "welding"],
  },
];

const PHOTO_MODULES = import.meta.glob<string>("../../assets/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

function cleanPath(path: string) {
  return path
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const PHOTO_FILES = Object.entries(PHOTO_MODULES)
  .filter(([path]) => {
    const normalized = cleanPath(path);
    return (
      !normalized.includes("/partners/") &&
      !normalized.includes("/certif/") &&
      !normalized.includes("logo") &&
      !normalized.includes("removebg") &&
      !normalized.includes("redredred") &&
      !normalized.includes("iso-1")
    );
  })
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, "fr"));

const allPhotos: Photo[] = PHOTO_FILES.map(([path, src]) => ({
  path,
  src,
}));

const sectorPhotoSets = SECTORS.map((sector) => {
  const photos = allPhotos.filter((photo) => {
    const path = cleanPath(photo.path);
    return sector.match.some((term) => path.includes(term));
  });
  return { ...sector, photos };
});

const assignedPhotos = new Set(sectorPhotoSets.flatMap((sector) => sector.photos));
const generalPhotos = allPhotos.filter((photo) => !assignedPhotos.has(photo));
generalPhotos.forEach((photo, index) => {
  sectorPhotoSets[index % sectorPhotoSets.length].photos.push(photo);
});

const HERO_PHOTO =
  allPhotos.find((photo) => cleanPath(photo.path).includes("hero-welding")) ?? allPhotos[0];

export function SectorsPage() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [activePhoto, setActivePhoto] = useState<{
    sector: Sector;
    index: number;
  } | null>(null);
  const [activeSector, setActiveSector] = useState(SECTORS[0].id);

  useEffect(() => {
    if (!activePhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhoto(null);
      if (event.key === "ArrowRight") {
        setActivePhoto((current) => {
          if (!current) return current;
          const { sector, index } = current;
          return { sector, index: (index + 1) % sector.photos.length };
        });
      }
      if (event.key === "ArrowLeft") {
        setActivePhoto((current) => {
          if (!current) return current;
          const { sector, index } = current;
          return { sector, index: (index - 1 + sector.photos.length) % sector.photos.length };
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activePhoto]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-sector-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSector(visible.target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.15, 0.4] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="sectors-page">
      <PageHero
        id="sectors"
        breadcrumb={t("sectors.hero.eyebrow")}
        eyebrow={t("sectors.hero.eyebrow")}
        title={
          <>
            {t("sectors.hero.line1")}
            <br />
            <span>{t("sectors.hero.line2a")}</span> {t("sectors.hero.line2b")}
          </>
        }
        description={t("sectors.hero.text")}
        linkLabel={t("common.discover")}
        linkHref="#catalogue-secteurs"
        image={HERO_PHOTO?.src ?? ""}
        imagePosition="center 48%"
      />

      <nav className="sectors-nav" id="catalogue-secteurs" aria-label="Explorer un secteur">
        <div className="wrap sectors-nav__inner">
          <span className="sectors-nav__label">Explorer</span>
          <div className="sectors-nav__links">
            {sectorPhotoSets.map((sector) => (
              <a
                key={sector.id}
                href={`#${sector.id}`}
                className={activeSector === sector.id ? "is-active" : ""}
                aria-current={activeSector === sector.id ? "location" : undefined}
              >
                {t(sector.titleKey)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section className="sectors-intro wrap" aria-label={t("sectors.intro.aria")}>
        <p className="sectors-intro__label">{t("sectors.intro.label")}</p>
        <div className="sectors-intro__body">
          <h2>
            {t("sectors.intro.line1")}
            <br />
            {t("sectors.intro.line2")}
          </h2>
        </div>
      </section>

      <div className="sectors-list">
        {sectorPhotoSets.map((sector, sectorIndex) => (
          <motion.section
            key={sector.id}
            id={sector.id}
            data-sector-section
            className={`sector-block ${sectorIndex % 2 === 1 ? "sector-block--alternate" : ""}`}
            initial={reduceMotion ? false : { opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="wrap sector-block__layout">
              <div className="sector-copy">
                <div className="sector-copy__topline">
                  <span>{t(sector.tagKey).split("/ ")[1]}</span>
                </div>                  <h2>{t(sector.titleKey)}</h2>
                  <p className="sector-copy__description">{t(sector.descKey)}</p>
                <div className="sector-copy__focus">
                  <Check size={16} aria-hidden="true" />
                  <span>{t(sector.focusKey)}</span>
                </div>
                <Link to="/contact" className="sector-copy__cta">
                  Parler de votre projet <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>

              <div className="sector-gallery" aria-label={`Galerie ${t(sector.titleKey)}`}>
                {sector.photos.length > 0 ? (
                  <div className="sector-gallery__grid">
                    {sector.photos.map((photo, photoIndex) => {
                      const photoLabel = `${t(sector.titleKey)} · réalisation ${String(photoIndex + 1).padStart(2, "0")}`;
                      return (
                        <motion.button
                          key={photo.path}
                          type="button"
                          className={`sector-photo ${photoIndex === 0 ? "sector-photo--feature" : ""}`}
                          onClick={() => setActivePhoto({ sector, index: photoIndex })}
                          aria-label={`Agrandir ${photoLabel}, ${photoIndex + 1} sur ${sector.photos.length}`}
                          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{ duration: 0.4, delay: Math.min(photoIndex % 6, 4) * 0.055 }}
                        >
                          <img src={photo.src} alt={photoLabel} loading="lazy" decoding="async" />
                          <span className="sector-photo__overlay">
                            <span>{photoLabel}</span>
                            <span className="sector-photo__open" aria-hidden="true">
                              <ArrowUpRight size={18} />
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="sector-gallery__empty">
                    {t("sectors.gallery.empty")}
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        ))}
      </div>

      <section className="sectors-contact">
        <div className="wrap sectors-contact__inner">
          <div>
            <p className="sectors-eyebrow">Un projet industriel en vue ?</p>
            <h2>Parlons de votre prochain défi.</h2>
          </div>
          <Link to="/contact" className="sectors-contact__button">
            Contacter nos équipes <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="sector-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Galerie ${t(activePhoto.sector.titleKey)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActivePhoto(null);
            }}
          >
            <div className="sector-lightbox__topbar">
              <p>
                <span>{t(activePhoto.sector.titleKey)}</span> /{" "}
                {String(activePhoto.index + 1).padStart(2, "0")}{" "}
                <span className="sector-lightbox__muted">
                  sur {String(activePhoto.sector.photos.length).padStart(2, "0")}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Fermer la galerie"
              >
                <X size={22} />
              </button>
            </div>
            <button
              type="button"
              className="sector-lightbox__arrow sector-lightbox__arrow--prev"
              aria-label="Photo précédente"
              onClick={() =>
                setActivePhoto((current) => {
                  if (!current) return current;
                  const { sector, index } = current;
                  return {
                    sector,
                    index: (index - 1 + sector.photos.length) % sector.photos.length,
                  };
                })
              }
            >
              <ArrowLeft size={22} />
            </button>
            <AnimatePresence mode="wait">
              <motion.figure
                key={activePhoto.sector.photos[activePhoto.index]?.path}
                className="sector-lightbox__figure"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={activePhoto.sector.photos[activePhoto.index]?.src}
                  alt={`${t(activePhoto.sector.titleKey)} · réalisation ${String(activePhoto.index + 1).padStart(2, "0")}`}
                />
                <figcaption>
                  {t(activePhoto.sector.titleKey)} · réalisation{" "}
                  {String(activePhoto.index + 1).padStart(2, "0")}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <button
              type="button"
              className="sector-lightbox__arrow sector-lightbox__arrow--next"
              aria-label="Photo suivante"
              onClick={() =>
                setActivePhoto((current) => {
                  if (!current) return current;
                  const { sector, index } = current;
                  return { sector, index: (index + 1) % sector.photos.length };
                })
              }
            >
              <ArrowRight size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
