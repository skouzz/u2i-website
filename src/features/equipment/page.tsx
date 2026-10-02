import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Maximize2, X } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import workshopImage from "@/assets/about-workshop.jpg";
import endo1 from "@/assets/equipments/Endoscopie/20200910_114715.jpg";
import endo2 from "@/assets/equipments/Endoscopie/20200910_114715 (1).jpg";
import endo3 from "@/assets/equipments/Endoscopie/IMG-20200912-WA0013.jpg";
import endo4 from "@/assets/equipments/Endoscopie/IMG-20200912-WA0028.jpg";
import endo5 from "@/assets/equipments/Endoscopie/ait2013-studio-192-edit-_zf-2864-10644-1-001__2_1.jpg";
import gas1 from "@/assets/equipments/Machine de contrôle de gaz/IMG-20200912-WA0014.jpg";
import gas2 from "@/assets/equipments/Machine de contrôle de gaz/IMG-20200912-WA0016.jpg";
import gas3 from "@/assets/equipments/Machine de contrôle de gaz/IMG_2948-rotated-e1646059406575.jpg";
import gas4 from "@/assets/equipments/Machine de contrôle de gaz/IMG_3059-rotated-e1646059387145.jpg";
import cut1 from "@/assets/equipments/Machine de coupe rectification/20200910_113443.jpg";
import cut2 from "@/assets/equipments/Machine de coupe rectification/6-CC81_850.jpg";
import cut3 from "@/assets/equipments/Machine de coupe rectification/7-CC121_850.jpg";
import cut4 from "@/assets/equipments/Machine de coupe rectification/7-coupe-tube-orbital-CC121-AXXAIR.png";
import cut5 from "@/assets/equipments/Machine de coupe rectification/8-DCPACK_850.jpg";
import cut6 from "@/assets/equipments/Machine de coupe rectification/9-dresseuse-de-face.png";
import weld1 from "@/assets/equipments/Machine de soudure orbitale/2-SATF-65ND_850.jpg";
import weld2 from "@/assets/equipments/Machine de soudure orbitale/2-tetes-fermees-axxair.jpg";
import weld3 from "@/assets/equipments/Machine de soudure orbitale/20200617_113315.jpg";
import weld4 from "@/assets/equipments/Machine de soudure orbitale/20200910_123556.jpg";
import weld5 from "@/assets/equipments/Machine de soudure orbitale/3-SATF-115ND_850.jpg";
import weld6 from "@/assets/equipments/Machine de soudure orbitale/IMG_20170403_102322.jpg";
import weld7 from "@/assets/equipments/Machine de soudure orbitale/IMG_20170403_143150.jpg";
import weld8 from "@/assets/equipments/Machine de soudure orbitale/IMG_2945-1-rotated.jpg";
import weld9 from "@/assets/equipments/Machine de soudure orbitale/IMG_2951.jpg";
import weld10 from "@/assets/equipments/Machine de soudure orbitale/SATFX-76.jpg";
import weld11 from "@/assets/equipments/Machine de soudure orbitale/SATO-115E43.jpg";
import weld12 from "@/assets/equipments/Machine de soudure orbitale/SAXX-200.jpg";
import cnc1 from "@/assets/equipments/Machine à commande numérique/20210222_093607.jpg";
import cnc2 from "@/assets/equipments/Machine à commande numérique/IMG_4259.jpg";
import cnc3 from "@/assets/equipments/Machine à commande numérique/IMG_4260.jpg";
import cnc4 from "@/assets/equipments/Machine à commande numérique/IMG_4261.jpg";
import cnc5 from "@/assets/equipments/Machine à commande numérique/IMG_4283.jpg";
import cnc6 from "@/assets/equipments/Machine à commande numérique/IMG_4292.jpg";
import skid1 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/20211014_090938.jpg";
import skid2 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/IMG-20200912-WA0000.jpg";
import skid3 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/IMG-20200912-WA0042.jpg";

import "./equipment.css";

type Equipment = {
  id: string;
  /** Catalog keys — resolved through t() so the card renders in either language. */
  titleKey: MessageKey;
  tagKey: MessageKey;
  descKey: MessageKey;
  appKeys: MessageKey[];
  images: string[];
};

const EQUIPMENTS: Equipment[] = [
  {
    id: "soudure-orbitale",
    titleKey: "equipment.orbital.title",
    tagKey: "equipment.orbital.tag",
    descKey: "equipment.orbital.desc",
    appKeys: [
      "equipment.orbital.app1",
      "equipment.orbital.app2",
      "equipment.orbital.app3",
    ],
    images: [weld1, weld2, weld3, weld4, weld5, weld6, weld7, weld8, weld9, weld10, weld11, weld12],
  },
  {
    id: "coupe-rectification",
    titleKey: "equipment.cutting.title",
    tagKey: "equipment.cutting.tag",
    descKey: "equipment.cutting.desc",
    appKeys: [
      "equipment.cutting.app1",
      "equipment.cutting.app2",
      "equipment.cutting.app3",
    ],
    images: [cut1, cut2, cut3, cut4, cut5, cut6],
  },
  {
    id: "commande-numerique",
    titleKey: "equipment.cnc.title",
    tagKey: "equipment.cnc.tag",
    descKey: "equipment.cnc.desc",
    appKeys: ["equipment.cnc.app1", "equipment.cnc.app2", "equipment.cnc.app3"],
    images: [cnc1, cnc2, cnc3, cnc4, cnc5, cnc6],
  },
  {
    id: "controle-gaz",
    titleKey: "equipment.gas.title",
    tagKey: "equipment.gas.tag",
    descKey: "equipment.gas.desc",
    appKeys: ["equipment.gas.app1", "equipment.gas.app2", "equipment.gas.app3"],
    images: [gas1, gas2, gas3, gas4],
  },
  {
    id: "endoscopie",
    titleKey: "equipment.endoscope.title",
    tagKey: "equipment.endoscope.tag",
    descKey: "equipment.endoscope.desc",
    appKeys: [
      "equipment.endoscope.app1",
      "equipment.endoscope.app2",
      "equipment.endoscope.app3",
    ],
    images: [endo1, endo2, endo3, endo4, endo5],
  },
  {
    id: "skid-traitement",
    titleKey: "equipment.skid.title",
    tagKey: "equipment.skid.tag",
    descKey: "equipment.skid.desc",
    appKeys: ["equipment.skid.app1", "equipment.skid.app2", "equipment.skid.app3"],
    images: [skid1, skid2, skid3],
  },
];

export function EquipmentsPage() {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState(EQUIPMENTS[0].id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const activeEquipment =
    EQUIPMENTS.find((equipment) => equipment.id === activeId) ?? EQUIPMENTS[0];

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") {
        setLightboxIndex((index) =>
          index === null ? null : (index + 1) % activeEquipment.images.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setLightboxIndex((index) =>
          index === null
            ? null
            : (index - 1 + activeEquipment.images.length) % activeEquipment.images.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeEquipment.images.length, lightboxIndex]);

  const selectEquipment = (id: string) => {
    setActiveId(id);
    setLightboxIndex(null);
  };

  const moveLightbox = (direction: number) => {
    setLightboxIndex((index) =>
      index === null
        ? null
        : (index + direction + activeEquipment.images.length) % activeEquipment.images.length,
    );
  };

  return (
    <main className="equipment-page">
      <PageHero
        id="equipment"
        breadcrumb={t("equipment.hero.eyebrow")}
        eyebrow={t("equipment.hero.eyebrow2")}
        title={
          <>
            {t("equipment.hero.titleLine1")}
            <br />
            <span>{t("equipment.hero.titleLine2")}</span>
          </>
        }
        description={t("equipment.hero.text")}
        linkLabel={t("common.discover")}
        linkHref="#catalogue"
        image={workshopImage}
        imageAlt={t("equipment.hero.alt")}
      />

      <section className="equipment-catalogue" id="catalogue">
        <div className="equipment-wrap">
          <header className="equipment-section-heading">
            <div>
              <span className="equipment-eyebrow equipment-eyebrow--dark">
                {t("equipment.section.eyebrow")}
              </span>
              <h2>
                {t("equipment.section.titleLine1")}
                <br />
                {t("equipment.section.titleLine2")}
              </h2>
            </div>
          </header>

          <div
            className="equipment-selector"
            role="tablist"
            aria-label={t("equipment.section.aria")}
          >
            {EQUIPMENTS.map((equipment) => (
              <button
                key={equipment.id}
                type="button"
                role="tab"
                id={`equipment-tab-${equipment.id}`}
                aria-controls="equipment-panel"
                aria-selected={activeEquipment.id === equipment.id}
                tabIndex={activeEquipment.id === equipment.id ? 0 : -1}
                className={`equipment-selector__item${activeEquipment.id === equipment.id ? " is-active" : ""}`}
                onClick={() => selectEquipment(equipment.id)}
                onKeyDown={(event) => {
                  const currentIndex = EQUIPMENTS.findIndex(
                    (item) => item.id === activeEquipment.id,
                  );
                  let nextIndex = currentIndex;
                  if (event.key === "ArrowRight" || event.key === "ArrowDown")
                    nextIndex = (currentIndex + 1) % EQUIPMENTS.length;
                  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
                    nextIndex = (currentIndex - 1 + EQUIPMENTS.length) % EQUIPMENTS.length;
                  else if (event.key === "Home") nextIndex = 0;
                  else if (event.key === "End") nextIndex = EQUIPMENTS.length - 1;
                  else return;
                  event.preventDefault();
                  const nextEquipment = EQUIPMENTS[nextIndex];
                  selectEquipment(nextEquipment.id);
                  document.getElementById(`equipment-tab-${nextEquipment.id}`)?.focus();
                }}
              >
                <img src={equipment.images[0]} alt="" loading="lazy" />
                <span className="equipment-selector__title">{t(equipment.titleKey)}</span>
                <ArrowUpRight className="equipment-selector__arrow" size={18} aria-hidden="true" />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={activeEquipment.id}
              id="equipment-panel"
              role="tabpanel"
              aria-labelledby={`equipment-tab-${activeEquipment.id}`}
              className="equipment-detail"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="equipment-detail__intro">
                <div>
                  <span className="equipment-detail__tag">{t(activeEquipment.tagKey)}</span>
                  <h3>{t(activeEquipment.titleKey)}</h3>
                  <p>{t(activeEquipment.descKey)}</p>
                  <ul className="equipment-applications">
                    {activeEquipment.appKeys.map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                  <LocalizedLink className="equipment-contact-link" to="/contact">
                    {t("equipment.detail.cta")} <ArrowUpRight size={16} aria-hidden="true" />
                  </LocalizedLink>
                </div>
              </div>

              <div
                className="equipment-gallery"
                aria-label={`${t("equipment.gallery.aria")} ${t(activeEquipment.titleKey)}`}
              >
                {activeEquipment.images.map((image, index) => (
                  <motion.button
                    key={image}
                    type="button"
                    className={`equipment-gallery__item${index === 0 ? " equipment-gallery__item--lead" : ""}`}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`${t("equipment.gallery.zoom")} ${index + 1} ${t("equipment.gallery.of")} ${activeEquipment.images.length} : ${t(activeEquipment.titleKey)}`}
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
                      alt={`${t(activeEquipment.titleKey)} — ${t("equipment.gallery.view")} ${index + 1}`}
                      loading={index < 4 ? "eager" : "lazy"}
                    />
                    <span className="equipment-gallery__expand" aria-hidden="true">
                      <Maximize2 size={17} />
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>
      </section>

      <section className="equipment-cta">
        <div className="equipment-wrap equipment-cta__inner">
          <div>
            <span>{t("about.cta.eyebrow")}</span>
            <h2>
              {t("equipment.cta.line1")}<br />
              {t("equipment.cta.line2")}
            </h2>
          </div>
          <LocalizedLink to="/contact" aria-label={t("equipment.cta.aria")}>
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
            aria-label={`${t("equipment.gallery.aria")} ${t(activeEquipment.titleKey)}`}
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
                <span>{t("equipment.gallery.label")}</span>
                <h2>{t(activeEquipment.titleKey)}</h2>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label={t("equipment.gallery.close")}
              >
                <X size={22} />
              </button>
            </header>
            <div className="equipment-lightbox__stage">
              <button type="button" onClick={() => moveLightbox(-1)} aria-label={t("equipment.gallery.prev")}>
                <ArrowLeft />
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeEquipment.images[lightboxIndex]}
                  src={activeEquipment.images[lightboxIndex]}
                  alt={`${t(activeEquipment.titleKey)} — ${t("equipment.gallery.photo")} ${lightboxIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                />
              </AnimatePresence>
              <button type="button" onClick={() => moveLightbox(1)} aria-label={t("equipment.gallery.next")}>
                <ArrowRight />
              </button>
            </div>
            <div className="equipment-lightbox__footer">
              <span>
                {String(lightboxIndex + 1).padStart(2, "0")} <i>/</i>{" "}
                {String(activeEquipment.images.length).padStart(2, "0")}
              </span>
              <div>
                {activeEquipment.images.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setLightboxIndex(index)}
                    className={index === lightboxIndex ? "is-active" : ""}
                    aria-label={`Afficher la photo ${index + 1}`}
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
