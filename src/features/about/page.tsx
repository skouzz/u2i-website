import { Link } from "@tanstack/react-router";
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
            Univers Inox
            <br />
            <span>Industriel.</span>
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
              alt="Équipements process en acier inoxydable dans l’atelier U2I"
              loading="lazy"
            />
            <div className="about-story__caption">
              <span>Le savoir-faire inox, au cœur du process</span>
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
              <span>01</span> Qui nous sommes
            </p>
            <h2>Le bon geste technique commence par l’écoute.</h2>
            <p>
              Fondée en 2015 à Akouda, près de Sousse,{" "}
              <strong>Univers Inox Industriel (U2I)</strong> accompagne les industriels en
              chaudronnerie, tuyauterie process et soudure inox.
            </p>
            <p>
              {t("about.story.p1")}
            </p>
            <p>
              {t("about.story.p2")}
            </p>
            <Link className="about-text-link" to="/secteurs">
              Nos secteurs d’activité <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="about-project" aria-labelledby="about-project-title">
        <div className="wrap">
          <div className="about-project__heading">
            <div>
              <p className="about-section-label about-section-label--light">
                <span>02</span> Notre méthode
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
              <span>04</span> Nos équipes & nos moyens
            </p>
            <h2>À la bonne échelle pour vos projets.</h2>
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
          <div className="about-team-photos" aria-label="Équipe U2I et réalisations">
            <figure className="about-team-photos__main">
              <img
                src={siteImage}
                alt="Technicien U2I en intervention sur une tuyauterie inox"
                loading="lazy"
              />
              <figcaption>Intervention sur site</figcaption>
            </figure>
            <figure className="about-team-photos__secondary">
              <img
                src={inspectionImage}
                alt="Contrôle d’une soudure inox avec un équipement AXXAIR"
                loading="lazy"
              />
              <figcaption>Contrôle & précision</figcaption>
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
              alt="Soudure inox de précision réalisée en atelier"
              loading="lazy"
            />
            <div className="about-quality__image-label">
              <BadgeCheck size={17} /> Qualité & traçabilité
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
              <span>05</span> Notre exigence
            </p>
            <h2>La qualité se vérifie à chaque étape.</h2>
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
              <span>06</span> Un partenariat de confiance
            </p>
            <h2>Des équipements de référence. Un savoir-faire de terrain.</h2>
          </div>
          <div className="about-partner__detail">
            <img src={axxairLogo} alt="AXXAIR" loading="lazy" />
            <div>
              <p>Distributeur officiel AXXAIR depuis 2015</p>
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
            <p className="about-eyebrow">Votre prochain projet</p>
            <h2>Mettons votre installation en mouvement.</h2>
            <p>Parlons ensemble de vos contraintes, de vos délais et de vos objectifs.</p>
          </div>
          <div className="about-contact__actions">
            <Link to="/contact" className="about-contact__button">
              Contacter nos équipes <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/secteurs" className="about-contact__secondary">
              {t("about.cta.sectors")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
