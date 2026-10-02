import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  DraftingCompass,
  Factory,
  ScanEye,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { LocalizedLink } from "@/lib/i18n/LocalizedLink";
import workshopImage from "@/assets/about-workshop.jpg";
import processImage from "@/assets/IMG-20240214-WA0000.jpg";
import siteImage from "@/assets/IMG-20260408-WA0067.jpg";
import inspectionImage from "@/assets/IMG_2278.jpg";
import weldingImage from "@/assets/hero-welding.jpg";
import axxairLogo from "@/assets/partners/AXXAIR-logo.png";
import "./about.css";

type Capability = {
  number: string;
  icon: LucideIcon;
  titleKey: MessageKey;
  introKey: MessageKey;
  itemKeys: MessageKey[];
};

const capabilities: Capability[] = [
  {
    number: "01",
    icon: DraftingCompass,
    titleKey: "about.cap.engineering.title",
    introKey: "about.cap.engineering.intro",
    itemKeys: [
      "about.cap.engineering.i1",
      "about.cap.engineering.i2",
      "about.cap.engineering.i3",
    ],
  },
  {
    number: "02",
    icon: Wrench,
    titleKey: "about.cap.fabrication.title",
    introKey: "about.cap.fabrication.intro",
    itemKeys: [
      "about.cap.fabrication.i1",
      "about.cap.fabrication.i2",
      "about.cap.fabrication.i3",
      "about.cap.fabrication.i4",
    ],
  },
  {
    number: "03",
    icon: ScanEye,
    titleKey: "about.cap.control.title",
    introKey: "about.cap.control.intro",
    itemKeys: [
      "about.cap.control.i1",
      "about.cap.control.i2",
      "about.cap.control.i3",
      "about.cap.control.i4",
    ],
  },
];

const projectSteps: { titleKey: MessageKey; textKey: MessageKey }[] = [
  { titleKey: "about.step.study.title", textKey: "about.step.study.text" },
  { titleKey: "about.step.prefab.title", textKey: "about.step.prefab.text" },
  { titleKey: "about.step.install.title", textKey: "about.step.install.text" },
  { titleKey: "about.step.qualify.title", textKey: "about.step.qualify.text" },
];

const resources: { value: string; titleKey: MessageKey; textKey: MessageKey }[] = [
  { value: "07", titleKey: "about.stat.sales.title", textKey: "about.stat.sales.text" },
  { value: "02", titleKey: "about.stat.design.title", textKey: "about.stat.design.text" },
  { value: "1 000", titleKey: "about.stat.area.title", textKey: "about.stat.area.text" },
  { value: "01", titleKey: "about.cert.lab.title", textKey: "about.cert.lab.text" },
  { value: "01", titleKey: "about.cert.machines.title", textKey: "about.res.machines.text" },
];

const qualityChecks: MessageKey[] = [
  "about.check.1",
  "about.check.2",
  "about.check.3",
  "about.check.4",
  "about.check.5",
];

export function AboutPage() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? false : { opacity: 0, y: 28 };

  return (
    <main className="about-page">
      <PageHero
        id="about"
        breadcrumb={t("about.hero.eyebrow")}
        eyebrow={t("about.hero.eyebrow")}
        title={
          <>
            {t("about.hero.titleLine1")}
            <br />
            <span>{t("about.hero.titleLine2")}</span>
          </>
        }
        description={t("about.hero.text")}
        linkLabel={t("common.discover")}
        linkHref="#notre-histoire"
        image={workshopImage}
      />

      <section className="about-story" id="notre-histoire">
        <div className="wrap about-story__layout">
          <motion.div
            className="about-story__visual"
            initial={reveal}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <img
              src={processImage}
              alt={t("about.alt.workshop")}
              loading="lazy"
            />
            <div className="about-story__caption">
              <span>{t("about.story.caption")}</span>
              <span>01 / U2I PROCESS</span>
            </div>
          </motion.div>
          <motion.div
            className="about-story__copy"
            initial={reveal}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <p className="about-section-label">
              <span>01</span> {t("about.section.who")}
            </p>
            <h2>{t("about.story.heading")}</h2>
            <p>{t("about.story.intro")}</p>
            <p>
              {t("about.story.p1")}
            </p>
            <p>
              {t("about.story.p2")}
            </p>
            <LocalizedLink className="about-text-link" to="/secteurs">
              {t("about.story.sectorsCta")} <ArrowUpRight size={17} aria-hidden="true" />
            </LocalizedLink>
          </motion.div>
        </div>
      </section>

      <section className="about-project" aria-labelledby="about-project-title">
        <div className="wrap">
          <div className="about-project__heading">
            <div>
              <p className="about-section-label about-section-label--light">
                <span>02</span> {t("about.section.method")}
              </p>
              <h2 id="about-project-title">
                {t("about.method.titleLine1")}
                <br />
                {t("about.method.titleLine2")}
              </h2>
            </div>
          </div>
          <div className="about-steps">
            {projectSteps.map((step, index) => (
              <motion.div
                className="about-step"
                key={step.titleKey}
                initial={reveal}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.09 }}
              >
                <span className="about-step__number">0{index + 1}</span>
                <span className="about-step__mark" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.textKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-services">
        <div className="wrap">
          <div className="about-services__heading">
            <div>
              <p className="about-section-label">
                <span>03</span> {t("about.section.services")}
              </p>
              <h2>{t("about.section.services.title")}</h2>
            </div>
          </div>
          <div className="about-capabilities">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <motion.article
                  className="about-capability"
                  key={capability.number}
                  initial={reveal}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="about-capability__top">
                    <span>{capability.number}</span>
                    <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <h3>{t(capability.titleKey)}</h3>
                  <p className="about-capability__intro">{t(capability.introKey)}</p>
                  <ul>
                    {capability.itemKeys.map((key) => (
                      <li key={key}>
                        <Check size={15} aria-hidden="true" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-resources">
        <div className="wrap about-resources__layout">
          <div className="about-resources__copy">
            <p className="about-section-label">
              <span>04</span> {t("about.section.resources")}
            </p>
            <h2>{t("about.resources.title")}</h2>
            <p className="about-resources__intro">
              {t("about.workshop.text")}
            </p>
            <div className="about-resource-list">
              {resources.map((resource, index) => (
                <motion.div
                  className="about-resource"
                  key={resource.titleKey}
                  initial={reveal}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                >
                  <strong>{resource.value}</strong>
                  <div>
                    <h3>{t(resource.titleKey)}</h3>
                    <p>{t(resource.textKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="about-team-photos" aria-label={t("about.alt.team")}>
            <figure className="about-team-photos__main">
              <img
                src={siteImage}
                alt={t("about.alt.onsite")}
                loading="lazy"
              />
              <figcaption>{t("about.resources.onsite")}</figcaption>
            </figure>
            <figure className="about-team-photos__secondary">
              <img
                src={inspectionImage}
                alt={t("about.alt.inspection")}
                loading="lazy"
              />
              <figcaption>{t("about.resources.inspection")}</figcaption>
            </figure>
            <div className="about-team-photos__note">
              <Factory size={20} aria-hidden="true" />
              <span>
                Akouda
                <br />
                {t("about.location")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-quality">
        <div className="wrap about-quality__layout">
          <motion.div
            className="about-quality__visual"
            initial={reveal}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <img
              src={weldingImage}
              alt={t("about.alt.welding")}
              loading="lazy"
            />
            <div className="about-quality__image-label">
              <BadgeCheck size={17} /> {t("about.quality.badge")}
            </div>
          </motion.div>
          <motion.div
            className="about-quality__copy"
            initial={reveal}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <p className="about-section-label about-section-label--light">
              <span>05</span> {t("about.section.quality")}
            </p>
            <h2>{t("about.quality.title")}</h2>
            <p>
              {t("about.quality.text")}
            </p>
            <div className="about-quality__standard">
              <ClipboardCheck size={19} aria-hidden="true" />
              <span>BPF · QI · QO · FAT / SAT</span>
            </div>
            <ul>
              {qualityChecks.map((item) => (
                <li key={item}>
                  <Check size={15} aria-hidden="true" />
                  {t(item)}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="about-partner">
        <div className="wrap about-partner__inner">
          <div className="about-partner__identity">
            <p className="about-section-label">
              <span>06</span> {t("about.section.partner")}
            </p>
            <h2>{t("about.partner.heading")}</h2>
          </div>
          <div className="about-partner__detail">
            <img src={axxairLogo} alt="AXXAIR" loading="lazy" />
            <div>
              <p>{t("about.partner.badge")}</p>
              <span>
                {t("about.partner.text")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-contact">
        <div className="wrap about-contact__inner">
          <div>
            <p className="about-eyebrow">{t("about.cta.eyebrow")}</p>
            <h2>{t("about.cta.title")}</h2>
            <p>{t("about.cta.text")}</p>
          </div>
          <div className="about-contact__actions">
            <LocalizedLink to="/contact" className="about-contact__button">
              {t("about.cta.contact")} <ArrowUpRight size={18} aria-hidden="true" />
            </LocalizedLink>
            <LocalizedLink to="/secteurs" className="about-contact__secondary">
              {t("about.cta.sectors")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
