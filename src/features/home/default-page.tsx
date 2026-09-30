import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";

import pharmaImage from "@/assets/hero-pharma.jpg";
import agroImage from "@/assets/hero-agro.jpg";
import chimieImage from "@/assets/sector-chimie.jpg";
import cosmetiqueImage from "@/assets/sector-cosmetique.jpg";
import mobilierImage from "@/assets/sector-mobilier.jpg";
import presentationImage from "@/assets/hero-pharma.jpg";
import slide1Image from "@/assets/20230329_100358.jpg";
import slide2Image from "@/assets/IMG_1416.png";
import slide4Image from "@/assets/sector-mobilier.jpg";
import presentationVideo from "@/assets/U2I video banner.mp4";
import axxairLogoImage from "@/assets/partners/AXXAIR-logo.png";
import sanofiLogoImage from "@/assets/partners/Sanofi.png";
import hikmaLogoImage from "@/assets/partners/LOGO HIKMA.jpg";
import saiphLogoImage from "@/assets/partners/LOGO SAIPH.png";
import teriakLogoImage from "@/assets/partners/LOGO TERIAK.png";
import unimedLogoImage from "@/assets/partners/UNIMED LOGO .png";
import cevaLogoImage from "@/assets/partners/LOGO_CEVA_SANTE_ANIMALE.jpg";
import deliceLogoImage from "@/assets/partners/LOGO DELICE.jpg";
import logoBerg from "@/assets/partners/Berg-Life-Sciences-295x300.jpg";
import logoEnex from "@/assets/partners/Enex-we-know-how-logo-retina-300x262.png";
import logoDarEssaydali from "@/assets/partners/LOGO-DAR_ESSAYDALI_94d6073d8c-1-300x280.png";
import logoMedika from "@/assets/partners/LOGO-MEDIKA-300x269.png";
import logoMedis from "@/assets/partners/LOGO-MediS-300x264.png";
import logoSteripharm from "@/assets/partners/LOGO-STERIPHARM-300x268.png";
import logoPierreFabre from "@/assets/partners/Pierre-fabre-logo-1-300x288.png";
import logoCogia from "@/assets/partners/cogia-logo.png";
import logoLmp from "@/assets/partners/logo-LMP-291x300.jpg";
import logoMeva from "@/assets/partners/logo-MEVA-150x150.jpg";
import logoPharmaDearm from "@/assets/partners/logo-PHARMA-DEARM-296x300.png";
import logoAdwya from "@/assets/partners/logo-adwya--300x291.png";
import logoThera from "@/assets/partners/logo-thera-400-150x150.png";
import logoOpella from "@/assets/partners/opella-1-300x278.png";
import logoSartorius from "@/assets/partners/sartorius-logo-vector-2-300x288.png";
import logoTetrapak from "@/assets/partners/tetrapak-logo-screen-400-150x150.png";
import logoWinthrop from "@/assets/partners/winthrop-1-300x296.jpg";
import logoBwt from "@/assets/partners/BWT.png";
import logoAdvancs from "@/assets/partners/LOGO-ADVANCS-150x150.jpeg";
import logoDorcas from "@/assets/partners/dorcas-logo-300x225.png";
import referencesBgImage from "@/assets/axxair-1.jpg";
import cert1 from "@/assets/certif/Certificat-de-formation-Axxair-BOUKER-AMEN-ALLAH_page-0001_001-scaled.jpg";
import cert2 from "@/assets/certif/Certificat-de-formation-Axxair-IMED-MANFOUKH_page-0001_001-scaled.jpg";
import cert3 from "@/assets/certif/Certificat-de-formation-Axxair-NABIL-SLAMA_page-0001_001-scaled.jpg";
import cert4 from "@/assets/certif/CERTIFICATE-9K-UNIVERS-U2I_001.jpg";
import cert5 from "@/assets/certif/CERTIFICATE-Official-distributor_page-0001_001-scaled.jpg";
import cert6 from "@/assets/certif/IMG_8071.jpg";
import cert7 from "@/assets/certif/iso-1.png";
import cert8 from "@/assets/certif/UIT-officiel-distributeur-_page-0001_001-1.jpg";
import u2iUpdatedVideo from "@/assets/U2I Updated.mp4";

import equip1 from "@/assets/equipments/Endoscopie/20200910_114715 (1).jpg";
import equip2 from "@/assets/equipments/Machine de contrôle de gaz/IMG-20200912-WA0014.jpg";
import equip3 from "@/assets/equipments/Machine de coupe rectification/20200910_113443.jpg";
import equip4 from "@/assets/equipments/Machine de soudure orbitale/2-SATF-65ND_850.jpg";
import equip5 from "@/assets/equipments/Machine à commande numérique/20210222_093607.jpg";
import equip6 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/20211014_090938.jpg";

const HERO_SLIDES = [
  {
    label: "Tuyauterie & Soudure",
    title: "La précision continue de guider l'ambition de Groupe Univers Inox",
    date: "08.07.2026",
    image: slide1Image,
  },
  {
    label: "Soudure Orbitale",
    title:
      "Partenaire officiel AXXAIR — une solution complète au service des industries à haute exigence.",
    date: "Depuis 2015",
    image: slide2Image,
  },
  {
    label: "Agroalimentaire",
    title: "Tuyauteries inox conçues pour les normes d'hygiène les plus strictes.",
    date: "Pharma · Agro · Chimie",
    image: slide4Image,
  },
  {
    label: "Nouvel Atelier",
    title: "Un nouvel atelier de préfabrication pour accélérer nos projets industriels.",
    date: "Akouda, Tunisie",
    image: slide4Image,
  },
] as const;

const SECTORS = [
  { tag: "Exigence Pharma", title: "Pharmaceutique", image: pharmaImage },
  { tag: "Qualité Alimentaire", title: "Agroalimentaire", image: agroImage },
  { tag: "Procédés Sensibles", title: "Chimique", image: chimieImage },
  { tag: "Lignes Propres", title: "Cosmétique", image: cosmetiqueImage },
  { tag: "Sur Mesure", title: "Mobilier inox", image: mobilierImage },
] as const;

const EQUIPMENTS = [
  { id: "endoscopie", title: "Endoscopie", image: equip1 },
  { id: "controle-gaz", title: "Contrôle de gaz", image: equip2 },
  { id: "coupe-rectification", title: "Coupe rectification", image: equip3 },
  { id: "soudure-orbitale", title: "Soudure orbitale", image: equip4 },
  { id: "commande-numerique", title: "Commande numérique", image: equip5 },
  { id: "skid-degraissage", title: "Skid Dégraissage", image: equip6 },
] as const;

const PARTNER_LOGOS = [
  { title: "Sanofi", image: sanofiLogoImage },
  { title: "Hikma", image: hikmaLogoImage },
  { title: "Saiph", image: saiphLogoImage },
  { title: "Teriak", image: teriakLogoImage },
  { title: "UNIMED", image: unimedLogoImage },
  { title: "CEVA Santé Animale", image: cevaLogoImage },
  { title: "Délice", image: deliceLogoImage },
  { title: "Berg Life Sciences", image: logoBerg },
  { title: "Enex", image: logoEnex },
  { title: "Dar Essaydali", image: logoDarEssaydali },
  { title: "Medika", image: logoMedika },
  { title: "MediS", image: logoMedis },
  { title: "Cogia", image: logoCogia },
  { title: "LMP", image: logoLmp },
  { title: "MEVA", image: logoMeva },
  { title: "Pharma Dearm", image: logoPharmaDearm },
  { title: "Adwya", image: logoAdwya },
  { title: "Thera", image: logoThera },
  { title: "Opella", image: logoOpella },
  { title: "Sartorius", image: logoSartorius },
  { title: "Tetrapak", image: logoTetrapak },
  { title: "Winthrop", image: logoWinthrop },
  { title: "BWT", image: logoBwt },
  { title: "Advancs", image: logoAdvancs },
  { title: "Dorcas", image: logoDorcas },
  { title: "Steripharm", image: logoSteripharm },
  { title: "Pierre Fabre", image: logoPierreFabre },
] as const;

const CERTIFICATIONS = [
  { title: "Certificat Axxair - Bouker Amen Allah", image: cert1 },
  { title: "Certificat Axxair - Imed Manfoukh", image: cert2 },
  { title: "Certificat Axxair - Nabil Slama", image: cert3 },
  { title: "Certificat 9K Univers U2I", image: cert4 },
  { title: "Official Distributor Certificate", image: cert5 },
  { title: "Certification IMG_8071", image: cert6 },
  { title: "ISO 9001", image: cert7 },
  { title: "Official Distributor UIT", image: cert8 },
] as const;

/** The original designed homepage (shown when no CMS sections are configured). */
export function DefaultHomePage() {
  return (
    <main id="main">
      <Hero />
      <VideoBanner />
      <Presentation />
      <Sectors />
      <Equipments />
      <References />
      <CertificationsSection />
    </main>
  );
}

/* --------------------------------- Hero --------------------------------- */

function Hero() {
  const [i, setI] = useState(0);
  const total = HERO_SLIDES.length;
  const SLIDE_DURATION = 5000;
  const activeSlide = HERO_SLIDES[i];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setI((p) => (p + 1) % total);
    }, SLIDE_DURATION);
    return () => window.clearTimeout(timeout);
  }, [i, total]);

  return (
    <section className="hero-section relative h-[calc(100svh-56px)] min-h-[540px] overflow-hidden bg-black md:h-[calc(100svh-80px)]">
      <div className="hero-grain" aria-hidden="true" />

      {HERO_SLIDES.map((s, idx) => (
        <motion.img
          key={s.label}
          src={s.image}
          alt=""
          initial={idx === 0 ? { y: 40, scale: 1.05, opacity: 0 } : { opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: idx === i ? 1 : 0 }}
          transition={{
            opacity: { duration: 1.1, ease: "easeInOut" },
            y: { duration: 1.5, ease: "easeOut" },
            scale: { duration: 1.5, ease: "easeOut" },
          }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: idx === i ? 10 : 0 }}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="hero-red-bar" aria-hidden="true" />

      <div className="wrap relative z-10 flex h-full items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="hero-slide-meta" aria-live="polite">
            <span>{activeSlide.label}</span>
            <span className="hero-slide-meta__line" aria-hidden="true" />
            <span className="hero-slide-meta__date">{activeSlide.date}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="hero-home-title mb-8 text-white"
            style={{
              fontSize: "clamp(3rem, 7vw, 5.8rem)",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.025em",
            }}
          >
            Pourquoi la <span className="text-[#e0141c]">précision</span>
            <br />
            continue de guider l'ambition de
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              Groupe Univers Inox
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <a
              href="#presentation"
              className="group inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-[#e0141c]"
            >
              Découvrir
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-[#e0141c] group-hover:bg-[#e0141c]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom partner marquee */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col">
        <div className="border-t border-white/[0.05] py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-hero-marquee">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
              <div
                key={`${logo.title}-${index}`}
                className="flex items-center justify-center mx-8 sm:mx-12 lg:mx-16 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={logo.image}
                  alt={logo.title}
                  className="h-8 md:h-10 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .animate-hero-marquee {
          animation: heroMarquee 30s linear infinite;
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-grain {
          position: absolute; inset: 0; z-index: 5; pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          mix-blend-mode: overlay;
        }
        .hero-red-bar {
          position: absolute; top: 0; bottom: 0; left: 36%; z-index: 4; pointer-events: none;
          width: 3px;
          background: linear-gradient(to bottom, transparent 5%, #e0141c 25%, #e0141c 75%, transparent 95%);
          opacity: 0.45;
          transform: skewX(-8deg);
        }
        .hero-slide-meta {
          display: flex;
          align-items: center;
          gap: .75rem;
          margin-bottom: 1.15rem;
          color: rgba(255,255,255,.9);
          font-size: .7rem;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .hero-slide-meta__line {
          width: 2.5rem;
          height: 1px;
          background: #e0141c;
        }
        .hero-slide-meta__date {
          color: rgba(255,255,255,.58);
          font-weight: 600;
          letter-spacing: .12em;
        }
        @media (max-width: 760px) {
          .hero-home-title {
            max-width: calc(100vw - 36px);
            font-size: clamp(2.2rem, 7.8vw, 4.4rem) !important;
            line-height: 1.02 !important;
            letter-spacing: 0 !important;
          }
          .hero-slide-meta {
            gap: .5rem;
            margin-bottom: .85rem;
            font-size: .56rem;
            letter-spacing: .1em;
          }
          .hero-slide-meta__line {
            width: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}

/* ----------------------------- Video Banner ----------------------------- */

function VideoBanner() {
  return (
    <section className="relative w-screen h-[70svh] ml-[calc(-50vw+50%)] overflow-hidden bg-black">
      <video
        src={presentationVideo}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

      <div className="absolute inset-0 flex items-center">
        <div className="wrap">
          <div className="max-w-4xl">
            <div className="flex gap-8 items-stretch">
              <div className="w-1 bg-gradient-to-b from-[#e0141c] to-[#e0141c]/30 flex-shrink-0" />
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                  L'exigence à chaque étape
                </h2>
                <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed mb-8 max-w-2xl">
                  Découvrez nos processus de bout en bout, garantissant la qualité, la précision et
                  la sécurité de chaque intervention industrielle.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-[#e0141c]/10 border border-[#e0141c]/30 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-[#e0141c]">Qualité Certifiée</p>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white/70">Précision Industrielle</p>
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white/70">Sécurité Garantie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Presentation ----------------------------- */

function Presentation() {
  return (
    <section id="presentation" className="section-paper overflow-hidden relative">
      <div className="wrap">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative group mx-auto w-full max-w-md lg:max-w-none hidden lg:block"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-[#e0141c]/20 to-transparent rounded-[2rem] blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-70" />

            <div className="relative overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={presentationImage}
                alt="Univers Inox Industriel"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              <div className="absolute inset-0 border-[3px] border-white/20 pointer-events-none mix-blend-overlay" />
            </div>

            <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 bg-white p-5 rounded-2xl shadow-xl border border-black/5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col justify-center items-center h-12 w-12 lg:h-14 lg:w-14 bg-[#e0141c] text-white rounded-full font-black text-lg lg:text-xl">
                  10+
                </div>
                <div>
                  <div className="text-xs lg:text-sm font-bold text-neutral-900 leading-tight">
                    Années
                  </div>
                  <div className="text-xs lg:text-sm font-medium text-neutral-500 leading-tight">
                    d'expérience
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:py-10 mt-12 lg:mt-0"
          >
            <h3 className="mb-4 text-xs lg:text-sm font-bold uppercase tracking-widest text-[#e0141c] italic">
              Qui sommes nous
            </h3>

            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
              Présentation
            </h2>

            <div className="h-1 w-16 bg-[#e0141c] mb-8" />

            <div className="space-y-6 text-sm md:text-base text-neutral-600 leading-relaxed font-medium">
              <p>
                Fondée en 2015, la société{" "}
                <strong className="text-neutral-900 font-bold">Univers inox industriel</strong> est
                basée à Akouda une ville située à quelques kilomètres au nord-ouest de Sousse en
                Tunisie. Nous sommes spécialisés en chaudronnerie, travaux de soudure et tuyauterie
                industrielle spécialement dans les domaines de haute exigence notamment le secteurs
                pharmaceutique, alimentaires et chimique.
              </p>
              <p>
                Notre personnel constitué d'équipe d'ingénieurs et des techniciens spécialisés et
                expérimentés issue d'une expérience de plus que 10 ans dans le domaine
                pharmaceutique, peut contrôler toutes les phases de la réalisation d'un projet : les
                études, la préfabrication en atelier, les travaux sur site, la mise en service, la
                qualification de l'installation, la maintenance sur site. Le personnel U2I
                spécialiste de la tuyauterie process est avant tout à l'écoute des besoins
                spécifiques de ses clients.
              </p>
            </div>

            <div className="mt-8 mb-8 lg:hidden">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="relative overflow-hidden shadow-xl">
                  <img
                    src={presentationImage}
                    alt="Univers Inox Industriel"
                    className="w-full h-auto object-cover aspect-[4/5]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/about"
                className="btn btn-red px-8 py-3.5 shadow-lg shadow-red-500/25 group"
              >
                Lire plus{" "}
                <span className="ml-1 tracking-normal font-normal transition-transform group-hover:translate-x-1">
                  »
                </span>
              </a>
              <a href="/contact" className="btn btn-red px-8 py-3.5 shadow-lg shadow-red-500/25">
                Nous contacter
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Sectors ------------------------------- */

function Sectors() {
  return (
    <section id="secteurs" className="bg-white relative py-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neutral-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#e0141c]/[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="wrap relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#e0141c] italic">
            Savoir-Faire
          </h3>
          <h2
            className="text-neutral-950 font-black mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Nos Domaines d'Expertise
          </h2>
          <p className="max-w-2xl text-neutral-500 text-lg font-medium">
            Découvrez nos solutions industrielles adaptées à chaque secteur, alliant haute
            précision, respect des normes et innovation constante.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
            }}
            className="relative overflow-hidden rounded-[2.5rem] bg-black shadow-2xl group md:col-span-2 md:row-span-2 flex flex-col justify-end min-h-[400px] lg:min-h-0"
          >
            <video
              src={u2iUpdatedVideo}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e0141c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e0141c]"></span>
              </span>
              <span className="text-white text-[11px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                U2I en action
              </span>
            </div>

            <div className="relative z-10 p-8 md:p-12">
              <h3 className="text-white font-black text-3xl md:text-5xl mb-4 leading-tight">
                L'excellence <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  industrielle
                </span>
              </h3>
              <div className="flex items-center gap-4">
                <a
                  href="/secteurs"
                  className="inline-flex items-center gap-2 bg-[#e0141c] text-white px-6 py-3 rounded-full font-bold text-sm transition-all hover:bg-[#c01018] hover:shadow-lg hover:-translate-y-0.5"
                >
                  Voir nos réalisations
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {SECTORS.map((s) => (
            <motion.a
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              key={s.title}
              href="/secteurs"
              className="group relative overflow-hidden rounded-[2rem] bg-white border border-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col p-2 h-[300px] sm:h-[320px]"
            >
              <div className="relative w-full flex-1 rounded-[1.5rem] overflow-hidden shrink-0">
                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-neutral-900 uppercase tracking-widest shadow-sm">
                  {s.tag}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between shrink-0">
                <h4 className="text-neutral-900 font-bold text-[1.15rem] leading-tight transition-colors group-hover:text-[#e0141c]">
                  {s.title}
                </h4>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-400 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-[#e0141c] group-hover:border-[#e0141c] group-hover:text-white group-hover:shadow-md ml-2">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:rotate-45" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------ Equipments ------------------------------ */

function Equipments() {
  return (
    <section id="equipements" className="section-dark overflow-hidden relative py-24">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[#e0141c]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[#e0141c]/5 blur-[100px] pointer-events-none" />

      <div className="wrap mb-16 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#e0141c] italic">
            Haute Précision
          </h3>
          <h2
            className="text-white font-black mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Notre Parc Machines
          </h2>
          <p className="max-w-2xl text-white/60 text-sm md:text-base font-medium">
            Découvrez nos équipements de dernière génération, conçus pour répondre aux exigences les
            plus strictes de l'industrie avec une précision absolue.
          </p>
        </div>
      </div>

      <div className="wrap relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {EQUIPMENTS.map((eq, i) => (
            <motion.a
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
              key={eq.id}
              href={`/equipements#${eq.id}`}
              className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(224,20,28,0.15)]"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={eq.image}
                alt={eq.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <div className="transform md:translate-y-8 md:transition-transform md:duration-500 md:group-hover:translate-y-0">
                  <div className="w-10 h-10 mb-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white group-hover:bg-[#e0141c] group-hover:border-[#e0141c] transition-colors duration-500">
                    <span className="font-mono text-xs font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight mb-2 drop-shadow-md">
                    {eq.title}
                  </h3>
                  <div className="h-auto opacity-100 md:h-0 md:opacity-0 md:overflow-hidden md:transition-all md:duration-500 md:group-hover:h-8 md:group-hover:opacity-100">
                    <p className="text-[#e0141c] text-sm mt-2 flex items-center gap-2 font-bold uppercase tracking-wider">
                      Découvrir <ArrowUpRight className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 bg-[#e0141c] w-0 transition-all duration-500 group-hover:w-full" />
            </motion.a>
          ))}
        </motion.div>

        <div className="mt-14 flex justify-center">
          <a
            href="/equipements"
            className="group flex items-center gap-2 rounded-full bg-[#e0141c] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#c01118] hover:shadow-[0_0_20px_rgba(224,20,28,0.4)]"
          >
            Voir tout notre parc machines
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#e0141c] transition-transform group-hover:translate-x-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- References ------------------------------ */

function References() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <img
        src={referencesBgImage}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80 blur-sm"
      />

      <div className="relative wrap">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-white/60">Références</p>
          <div className="flex justify-center mb-6">
            <img
              src={axxairLogoImage}
              alt="AXXAIR"
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h2 className="mb-4 text-white" style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)" }}>
            Partenaire officiel AXXAIR depuis 2015
          </h2>
        </motion.div>

        <div className="mt-14 text-center">
          <h3 className="mb-6 text-xl font-semibold uppercase tracking-[0.22em] text-white/80">
            Partenaires
          </h3>
          <div className="overflow-hidden rounded-[2rem] p-4">
            <div className="marquee">
              <div className="marquee-track flex items-center gap-6">
                {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((partner, idx) => (
                  <div
                    key={`${partner.title}-${idx}`}
                    className="flex h-24 min-w-[160px] items-center justify-center rounded-3xl bg-white/10 p-4 shadow-inner shadow-black/10"
                  >
                    <img
                      src={partner.image}
                      alt={partner.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Certifications --------------------------- */

function CertLightbox({
  certs,
  index,
  onClose,
  onNav,
}: {
  certs: typeof CERTIFICATIONS;
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const cert = certs[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % certs.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + certs.length) % certs.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, certs.length, onClose, onNav]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/20 transition-all"
      >
        <X className="h-4 w-4" /> Fermer
      </button>

      <div className="absolute top-5 left-5 z-10 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs font-mono text-white/50">
        {String(index + 1).padStart(2, "0")} / {String(certs.length).padStart(2, "0")}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNav((index - 1 + certs.length) % certs.length);
        }}
        className="absolute left-4 md:left-8 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-[#e0141c] hover:border-[#e0141c] transition-all duration-300"
        aria-label="Précédent"
      >
        ‹
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNav((index + 1) % certs.length);
        }}
        className="absolute right-4 md:right-8 z-10 w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-[#e0141c] hover:border-[#e0141c] transition-all duration-300"
        aria-label="Suivant"
      >
        ›
      </button>

      <motion.div
        key={index}
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-white/10">
          <img
            src={cert.image}
            alt={cert.title}
            className="w-full h-auto object-contain max-h-[75vh]"
          />
        </div>
        <div className="mt-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#e0141c] font-bold mb-1">
            Certification
          </p>
          <h3 className="text-white font-bold text-base md:text-lg">{cert.title}</h3>
        </div>

        <div className="flex items-center gap-2 mt-5">
          {certs.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onNav(i);
              }}
              className={`rounded-full transition-all duration-300 ${i === index ? "w-6 h-2 bg-[#e0141c]" : "w-2 h-2 bg-white/25 hover:bg-white/50"}`}
              aria-label={`Aller à ${i + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CertificationsSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const featured = CERTIFICATIONS[0];
  const rest = CERTIFICATIONS.slice(1);

  return (
    <section className="section-paper">
      <div className="wrap">
        <div className="mx-auto max-w-3xl text-center mb-10 md:mb-16">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-black/40">
            Certifications
          </h3>
          <p className="text-base leading-relaxed text-slate-600">
            Nos attestations officielles, formations et homologations qui garantissent la conformité
            et la qualité de nos équipements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative cursor-pointer"
            onClick={() => setLightboxIndex(0)}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-lg transition-all duration-700 hover:shadow-[0_12px_36px_rgba(224,20,28,0.14)] hover:border-[#e0141c]/40 h-full min-h-[500px] lg:min-h-0">
              <img
                src={featured.image}
                alt={featured.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

              <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-white/70 font-mono">01</span>
              </div>

              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#e0141c] flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-[#e0141c]/40">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#e0141c] font-bold mb-2">
                  Certification Officielle
                </p>
                <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-4">
                  {featured.title}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-white/40 text-xs uppercase tracking-wider">
                    Cliquer pour agrandir
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 auto-rows-[200px] md:auto-rows-[220px]"
          >
            {rest.map((cert, idx) => {
              const i = idx + 1;
              const isTall = idx === 1 || idx === 4;
              return (
                <motion.div
                  key={cert.title}
                  variants={{
                    hidden: { opacity: 0, y: 25, scale: 0.96 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#e0141c]/40 hover:shadow-[0_20px_40px_rgba(224,20,28,0.15)] ${isTall ? "row-span-2" : "row-span-1"}`}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={cert.image}
                    alt={cert.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/70 font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#e0141c] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-lg shadow-[#e0141c]/40">
                    <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#e0141c] font-bold mb-1">
                      Certification
                    </p>
                    <h4 className="text-white font-bold text-xs md:text-sm leading-tight line-clamp-2">
                      {cert.title}
                    </h4>
                  </div>

                  <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#e0141c] to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="/references"
            className="group flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-lg"
          >
            Découvrir toutes nos références
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e0141c] text-white transition-transform group-hover:translate-x-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>

      {lightboxIndex !== null && (
        <CertLightbox
          certs={CERTIFICATIONS}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={(i) => setLightboxIndex(i)}
        />
      )}
    </section>
  );
}

// Keep React import used (JSX transform).
void React;
