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
  title: string;
  intro: string;
  items: string[];
};

const capabilities: Capability[] = [
  {
    number: "01",
    icon: DraftingCompass,
    title: "Études & ingénierie",
    intro: "Dimensionner juste, anticiper les contraintes et préparer un chantier maîtrisé.",
    items: [
      "Études, conseils et analyse P&ID",
      "Plans 2D AutoCAD et conception 3D SolidWorks",
      "Dimensionnements et notes de calcul",
    ],
  },
  {
    number: "02",
    icon: Wrench,
    title: "Fabrication & installation",
    intro: "Un savoir-faire inox mobilisé en atelier et directement sur votre site.",
    items: [
      "Tuyauterie process et chaudronnerie inox",
      "Préfabrication, soudure et montage sur site",
      "Conformité aux normes et règles de sécurité",
      "Dégraissage, décapage et passivation",
    ],
  },
  {
    number: "03",
    icon: ScanEye,
    title: "Contrôle & maintenance",
    intro: "Des équipements et des équipes pour vérifier, qualifier et faire durer vos réseaux.",
    items: [
      "Électrotechnique et automatismes",
      "Contrôle visuel et vidéo-endoscopique",
      "Mise en service et qualification",
      "Maintenance des réseaux inox et assistance technique",
    ],
  },
];

const projectSteps = [
  { title: "Étudier", text: "Vos besoins, vos plans et les contraintes du process." },
  { title: "Préfabriquer", text: "Les ensembles inox préparés et contrôlés en atelier." },
  { title: "Installer", text: "Le montage et le raccordement sur votre site industriel." },
  { title: "Qualifier", text: "Les contrôles, la mise en service et le dossier technique." },
];

const resources = [
  { value: "07", title: "Chargés d’affaires", text: "Un suivi de projet au plus près du terrain." },
  { value: "02", title: "Postes de conception 3D", text: "Un bureau d’études intégré." },
  { value: "1 000", title: "m² d’atelier", text: "Un espace dédié à la préfabrication inox." },
  {
    value: "01",
    title: "Laboratoires & essais",
    text: "Mise au point et vidéo-endoscopie.",
  },
  {
    value: "01",
    title: "Parc machines intégré",
    text: "Découpe laser, coupe orbitale et plieuses.",
  },
];

const qualityChecks = [
  "Contrôle des fournitures à réception",
  "Suivi des opérations et de la sous-traitance (FAT / SAT)",
  "Traçabilité documentaire des matériaux et des soudures",
  "Contrôles visuels et vidéo-endoscopiques",
  "Remise du dossier technique de l’installation",
];

export function AboutPage() {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? false : { opacity: 0, y: 28 };

  return (
    <main className="about-page">
      <PageHero
        id="about"
        breadcrumb="Qui sommes-nous"
        eyebrow="Univers Inox Industriel · depuis 2015"
        title={
          <>
            Univers Inox
            <br />
            <span>Industriel.</span>
          </>
        }
        description="Une équipe de terrain, des moyens dédiés et une exigence constante, de l’étude à la mise en service."
        linkLabel="Découvrir notre entreprise"
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
              Nos ingénieurs et techniciens mettent leur expérience des secteurs pharmaceutique,
              agroalimentaire et chimique au service de projets aux exigences élevées. Nous adaptons
              chaque intervention aux besoins du client et aux réalités de son site.
            </p>
            <p>
              De l’étude initiale à la maintenance, une même équipe peut suivre les différentes
              étapes et garder le fil de votre projet.
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
                Du premier plan
                <br />à la mise en service.
              </h2>
            </div>
          </div>
          <div className="about-steps">
            {projectSteps.map((step, index) => (
              <motion.div
                className="about-step"
                key={step.title}
                initial={reveal}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.09 }}
              >
                <span className="about-step__number">0{index + 1}</span>
                <span className="about-step__mark" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
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
                <span>03</span> Ce que nous faisons
              </p>
              <h2>Une expertise, à chaque étape.</h2>
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
                  <h3>{capability.title}</h3>
                  <p className="about-capability__intro">{capability.intro}</p>
                  <ul>
                    {capability.items.map((item) => (
                      <li key={item}>
                        <Check size={15} aria-hidden="true" />
                        {item}
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
              Un bureau d’études, un atelier de préfabrication et des moyens de contrôle réunis
              autour de vos installations.
            </p>
            <div className="about-resource-list">
              {resources.map((resource, index) => (
                <motion.div
                  className="about-resource"
                  key={resource.title}
                  initial={reveal}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                >
                  <strong>{resource.value}</strong>
                  <div>
                    <h3>{resource.title}</h3>
                    <p>{resource.text}</p>
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
                Sousse, Tunisie
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
              Nos interventions s’appuient sur une démarche documentaire et des contrôles adaptés
              aux exigences de vos installations, notamment dans le secteur pharmaceutique.
            </p>
            <div className="about-quality__standard">
              <ClipboardCheck size={19} aria-hidden="true" />
              <span>BPF · QI · QO · FAT / SAT</span>
            </div>
            <ul>
              {qualityChecks.map((item) => (
                <li key={item}>
                  <Check size={15} aria-hidden="true" />
                  {item}
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
                Des solutions de coupe et de soudure orbitale, accompagnées par une équipe technique
                spécialisée.
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
              Explorer nos secteurs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
