import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2, X } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import { EQUIPMENT_STAGES } from "@/lib/site/equipment";
import workshopImage from "@/assets/about-workshop.jpg";
import "./equipment.css";

/**
 * Équipements — one page, seven stages.
 *
 * The catalogue used to be grouped by machine (orbital welding machine, cutting
 * machine, CNC…) which mirrors how the shop is laid out but not how a buyer
 * reads a spec sheet: they have a tube and want to know who cuts it, who welds
 * it and who inspects it. The stages below re-cut the same photographs by that
 * process order.
 *
 * Data lives in `src/lib/site/equipment.ts` rather than here, so the page stays
 * a renderer and the stage copy can be reviewed without touching JSX.
 */
export function EquipmentsPage() {
  const { locale } = useI18n();
  const [activeId, setActiveId] = useState(EQUIPMENT_STAGES[0].id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const active = EQUIPMENT_STAGES.find((stage) => stage.id === activeId) ?? EQUIPMENT_STAGES[0];

  // Close the lightbox when the stage changes: the old indices belong to the
  // previous gallery and would point at unrelated photographs.
  const selectStage = (id: string) => {
    setActiveId(id);
    setLightboxIndex(null);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") {
        setLightboxIndex((index) => (index === null ? null : (index + 1) % active.images.length));
      }
      if (event.key === "ArrowLeft") {
        setLightboxIndex((index) =>
          index === null ? null : (index - 1 + active.images.length) % active.images.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active.images.length, lightboxIndex]);

  const moveLightbox = (direction: number) => {
    setLightboxIndex((index) =>
      index === null ? null : (index + direction + active.images.length) % active.images.length,
    );
  };

  return (
    <main className="equipment-page">
      <PageHero
        id="equipment"
        breadcrumb={locale === "en" ? "Equipment" : "Équipements"}
        eyebrow={locale === "en" ? "Our workshop" : "Notre atelier"}
        title={
          <>
            {locale === "en" ? "From tube to" : "Du tube au"}
            <br />
            <span>{locale === "en" ? "finished assembly" : "montage fini"}</span>
          </>
        }
        description={
          locale === "en"
            ? "Seven stages, one workshop. Every component that leaves our shop has been through all of them."
            : "Sept étapes, un seul atelier. Chaque composant qui sort de notre atelier est passé par toutes."
        }
        linkLabel={locale === "en" ? "Discover" : "Découvrir"}
        linkHref="#catalogue"
        image={workshopImage}
        imageAlt={locale === "en" ? "U2I workshop" : "Atelier U2I"}
      />

      <section className="equipment-catalogue" id="catalogue">
        <div className="equipment-wrap">
          <header className="equipment-section-heading">
            <div>
              <span className="equipment-eyebrow equipment-eyebrow--dark">
                {locale === "en" ? "Manufacturing stages" : "Les étapes de fabrication"}
              </span>
              <h2>
                {locale === "en" ? (
                  <>
                    Seven stages,
                    <br />
                    one workshop
                  </>
                ) : (
                  <>
                    Sept étapes,
                    <br />
                    un seul atelier
                  </>
                )}
              </h2>
            </div>
          </header>

          {/* Stage jump list — the same seven items as the tabs below, exposed
              as real links so the stages are deep-linkable and reachable on a
              phone where the tab strip scrolls horizontally. */}
          <ol className="equipment-stage-nav" aria-label={locale === "en" ? "Stages" : "Étapes"}>
            {EQUIPMENT_STAGES.map((stage, index) => (
              <li key={stage.id}>
                <a
                  href={`#stage-${stage.id}`}
                  className={active.id === stage.id ? "is-active" : undefined}
                  aria-current={active.id === stage.id ? "true" : undefined}
                  onClick={() => selectStage(stage.id)}
                >
                  <span className="equipment-stage-nav__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {stage.label[locale] ?? stage.label.fr}
                </a>
              </li>
            ))}
          </ol>

          <div
            className="equipment-selector"
            role="tablist"
            aria-label={locale === "en" ? "Manufacturing stages" : "Étapes de fabrication"}
          >
            {EQUIPMENT_STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                role="tab"
                id={`equipment-tab-${stage.id}`}
                aria-controls="equipment-panel"
                aria-selected={active.id === stage.id}
                tabIndex={active.id === stage.id ? 0 : -1}
                className={`equipment-selector__item${active.id === stage.id ? " is-active" : ""}`}
                onClick={() => selectStage(stage.id)}
                onKeyDown={(event) => {
                  const currentIndex = EQUIPMENT_STAGES.findIndex((item) => item.id === active.id);
                  let nextIndex = currentIndex;
                  if (event.key === "ArrowRight" || event.key === "ArrowDown")
                    nextIndex = (currentIndex + 1) % EQUIPMENT_STAGES.length;
                  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                    nextIndex =
                      (currentIndex - 1 + EQUIPMENT_STAGES.length) % EQUIPMENT_STAGES.length;
                  else if (event.key === "Home") nextIndex = 0;
                  else if (event.key === "End") nextIndex = EQUIPMENT_STAGES.length - 1;
                  else return;
                  event.preventDefault();
                  const next = EQUIPMENT_STAGES[nextIndex];
                  selectStage(next.id);
                  document.getElementById(`equipment-tab-${next.id}`)?.focus();
                }}
              >
                <img src={stage.images[0]} alt="" loading="lazy" />
                <span className="equipment-selector__title">
                  {stage.label[locale] ?? stage.label.fr}
                </span>
                <ArrowUpRight className="equipment-selector__arrow" size={18} aria-hidden="true" />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {/* The wrapper carries the deep-link anchor; the section inside keeps
                the stable id that every tab's aria-controls points at, because
                one element can only have one id. */}
            <div key={active.id} id={`stage-${active.id}`} className="equipment-stage">
              <motion.section
                id="equipment-panel"
                role="tabpanel"
                aria-labelledby={`equipment-tab-${active.id}`}
                className="equipment-detail"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <div className="equipment-detail__intro">
                  <div>
                    <span className="equipment-detail__tag">
                      {active.tag[locale] ?? active.tag.fr}
                    </span>
                    <h3>{active.title[locale] ?? active.title.fr}</h3>
                    <p>{active.description[locale] ?? active.description.fr}</p>
                    <ul className="equipment-applications">
                      {(active.applications[locale] ?? active.applications.fr).map(
                        (application) => (
                          <li key={application}>{application}</li>
                        ),
                      )}
                    </ul>
                    <LocalizedLink className="equipment-contact-link" to="/contact">
                      {locale === "en" ? "Ask about this stage" : "Nous consulter sur cette étape"}{" "}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </LocalizedLink>
                  </div>
                </div>

                <div
                  className="equipment-gallery"
                  aria-label={active.title[locale] ?? active.title.fr}
                >
                  {active.images.map((image, index) => (
                    <motion.button
                      key={image}
                      type="button"
                      className={`equipment-gallery__item${index === 0 ? " equipment-gallery__item--lead" : ""}`}
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`${locale === "en" ? "View" : "Voir"} ${index + 1} ${
                        locale === "en" ? "of" : "sur"
                      } ${active.images.length} : ${active.title[locale] ?? active.title.fr}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.35),
                        duration: 0.35,
                      }}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                    >
                      <img
                        src={image}
                        alt={`${active.title[locale] ?? active.title.fr} — ${
                          locale === "en" ? "view" : "vue"
                        } ${index + 1}`}
                        loading={index < 4 ? "eager" : "lazy"}
                      />
                      <span className="equipment-gallery__expand" aria-hidden="true">
                        <Maximize2 size={17} />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            </div>
          </AnimatePresence>
        </div>
      </section>

      <section className="equipment-cta">
        <div className="equipment-wrap equipment-cta__inner">
          <div>
            <span>{locale === "en" ? "Next step" : "La suite"}</span>
            <h2>
              {locale === "en" ? (
                <>
                  Tell us what
                  <br />
                  you need to build
                </>
              ) : (
                <>
                  Dites-nous ce que
                  <br />
                  vous devez fabriquer
                </>
              )}
            </h2>
          </div>
          <LocalizedLink
            to="/contact"
            aria-label={locale === "en" ? "Contact us" : "Nous contacter"}
          >
            <ArrowUpRight size={23} />
          </LocalizedLink>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="equipment-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={active.title[locale] ?? active.title.fr}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setLightboxIndex(null);
            }}
          >
            <header className="equipment-lightbox__header">
              <div>
                <span>{active.tag[locale] ?? active.tag.fr}</span>
                <h2>{active.title[locale] ?? active.title.fr}</h2>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label={locale === "en" ? "Close" : "Fermer"}
              >
                <X size={22} />
              </button>
            </header>
            <div className="equipment-lightbox__stage">
              <button
                type="button"
                onClick={() => moveLightbox(-1)}
                aria-label={locale === "en" ? "Previous photo" : "Photo précédente"}
              >
                <ArrowLeft />
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={active.images[lightboxIndex]}
                  src={active.images[lightboxIndex]}
                  alt={`${active.title[locale] ?? active.title.fr} — ${
                    locale === "en" ? "photo" : "photo"
                  } ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                />
              </AnimatePresence>
              <button
                type="button"
                onClick={() => moveLightbox(1)}
                aria-label={locale === "en" ? "Next photo" : "Photo suivante"}
              >
                <ArrowRight />
              </button>
            </div>
            <div className="equipment-lightbox__footer">
              <span>
                {String(lightboxIndex + 1).padStart(2, "0")} <i>/</i>{" "}
                {String(active.images.length).padStart(2, "0")}
              </span>
              <div>
                {active.images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setLightboxIndex(index)}
                    className={index === lightboxIndex ? "is-active" : ""}
                    aria-label={`${locale === "en" ? "Show photo" : "Afficher la photo"} ${index + 1}`}
                    aria-current={index === lightboxIndex ? "true" : undefined}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
