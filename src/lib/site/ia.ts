/**
 * Site information architecture — the single source of truth.
 *
 * Everything below the homepage is described exactly once, here: the top-level
 * sections, their children, and the bilingual copy each one renders. The
 * navbar, the footer, the section hubs, the detail pages and the sitemap are
 * all derived from this file, so a page can never exist without a menu entry,
 * and the menu can never point at a page that does not exist.
 *
 * Why data instead of one React component per page: the tree is ~24 pages in
 * two languages. Written as components that would be 48 near-identical route
 * files whose only difference is a slug. Here they are 24 records, and a single
 * generic renderer draws all of them. Adding a section is a data change.
 *
 * Copy lives inline (rather than in the i18n catalog) because it belongs to the
 * entry it describes: when you add "Biotechnologie" you add its French and
 * English text in the same place, and cannot ship one without the other.
 * Shared chrome (buttons, breadcrumbs, "back to section") stays in the catalog.
 */

import type { Locale } from "@/lib/i18n";

// ── Bilingual primitives ────────────────────────────────────────────────────

/** A string authored in both site languages. */
export type Localized = Record<Locale, string>;

/** A list of strings authored in both site languages. */
export type LocalizedList = Record<Locale, readonly string[]>;

/**
 * Read the active language out of a bilingual field.
 *
 * Overloaded rather than returning a union: `Localized` is always a string and
 * `LocalizedList` always a list, so the union return type would force a cast at
 * every one of the ~90 call sites and, worse, would let a list reach a prop
 * that only accepts a string without the compiler noticing.
 */
export function pick(value: Localized, locale: Locale): string;
export function pick(value: LocalizedList, locale: Locale): readonly string[];
export function pick(value: Localized | LocalizedList, locale: Locale): string | readonly string[] {
  return value[locale] ?? value.fr;
}

// ── Node shapes ─────────────────────────────────────────────────────────────

/** One child page inside a section. */
export interface SiteEntry {
  /** URL segment, shared by both languages. */
  slug: string;
  /** Short label used in menus and card headers. */
  label: Localized;
  /** Page headline. */
  title: Localized;
  /** Hero paragraph. */
  summary: Localized;
  /** Body copy — one array element per paragraph. */
  body: LocalizedList;
  /** Key points, rendered as a checklist. */
  points: LocalizedList;
  image: string;
  /** `<title>` override; falls back to `title`. */
  metaTitle?: Localized;
  metaDescription?: Localized;
}

/** Every section is a hub listing its entries, plus one page per entry. */
export type SectionKind = "hub";

export interface SiteSection {
  id: string;
  /** Locale-agnostic base path, e.g. "/industries". */
  path: string;
  kind: SectionKind;
  label: Localized;
  /** Small label above the hero title. */
  eyebrow: Localized;
  /** Hero headline. "\n" marks a line break. */
  title: Localized;
  description: Localized;
  image: string;
  metaDescription?: Localized;
  entries: SiteEntry[];
}

// ── Images ──────────────────────────────────────────────────────────────────

import pharmaImage from "@/assets/pharmaceutique.jpg";
import biotechImage from "@/assets/IMG-20240214-WA0000.jpg";
import agroImage from "@/assets/agroalimentaire.jpg";
import chemicalImage from "@/assets/chimie.jpg";
import pipingImage from "@/assets/IMG-20260408-WA0067.jpg";
import weldingImage from "@/assets/hero-welding.jpg";
import designImage from "@/assets/presentation.jpg";
import waterImage from "@/assets/IMG_2278.jpg";
import steamImage from "@/assets/IMG_1416.png";
import cipImage from "@/assets/20230329_100358.jpg";
import workshopImage from "@/assets/about-workshop.jpg";
import partnersImage from "@/assets/axxair-1.jpg";
import certificationsImage from "@/assets/iso-1.png";
import sectorHeroImage from "@/assets/hero-pharma.jpg";

// ── Section 1 — Industries ──────────────────────────────────────────────────

const INDUSTRIES: SiteEntry[] = [
  {
    slug: "pharmaceutique",
    label: { fr: "Pharmaceutique", en: "Pharmaceutical" },
    title: { fr: "Industrie pharmaceutique", en: "Pharmaceutical industry" },
    summary: {
      fr: "Lignes de fabrication, de conditionnement et de distribution d'eau purifiée pour les unités pharmaceutiques et les laboratoires.",
      en: "Manufacturing, packaging and purified water distribution lines for pharmaceutical plants and laboratories.",
    },
    metaDescription: {
      fr: "Tuyauterie inox process, eau purifiée et WFI, CIP/SIP et soudure orbitale pour l'industrie pharmaceutique : fabrication, installation et mise en service.",
      en: "Process piping, purified water and WFI, CIP/SIP and orbital welding for the pharmaceutical industry: fabrication, installation and commissioning.",
    },
    body: {
      fr: [
        "Les procédés pharmaceutiques imposent des exigences que peu d'ateliers conventionnels ne peuvent satisfaire : une géométrie de tube reproductible au micron, des soudures dont la surface interne répond aux critères d'hygiène, et une traçabilité complète de chaque lot fabriqué.",
        "Nous construisons des skids et des loops de procédé clés en main. Chaque ligne est détaillée avec votre service méthodes, puis validée en amont par un organisme de contrôle, afin que la mise en service ne révèle aucune non-conformité.",
        "Notre intervention couvre l'ensemble du cycle : la définition du besoin, la sélection des matériaux, la fabrication, le montage sur site et la qualification.",
      ],
      en: [
        "Pharmaceutical processes impose requirements few conventional workshops can meet: tube geometry reproducible to the micron, welds whose inner surface satisfies hygiene criteria, and full traceability for every batch produced.",
        "We build complete process skids and loops. Each line is detailed with your methods department, then validated upstream by an inspection body, so commissioning never reveals a non-conformance.",
        "Our involvement covers the entire cycle: defining the need, selecting materials, fabricating, installing on site and qualifying.",
      ],
    },
    points: {
      fr: [
        "Eau purifiée, WFI et vapeur pure en boucle fermée",
        "Soudage orbital avec passport de soudage numérique",
        "Dégraissage, passivation et rinçage à l'eau injectable",
        "CIP / SIP bi-zones et skids de stérilisation",
        "Documentation de lot et dossiers de qualification",
      ],
      en: [
        "Purified water, WFI and pure steam in closed loop",
        "Orbital welding with a digital weld passport",
        "Degreasing, passivation and injectable water rinsing",
        "Two-zone CIP / SIP and sterilisation skids",
        "Batch documentation and qualification dossiers",
      ],
    },
    image: pharmaImage,
  },
  {
    slug: "biotechnologie",
    label: { fr: "Biotechnologie", en: "Biotechnology" },
    title: { fr: "Industrie biotechnologique", en: "Biotechnology industry" },
    summary: {
      fr: "Cuves, bioréacteurs et lignes de traitement pour les sites de bioproduction, de fermentation et des protéines recombinantes.",
      en: "Vessels, bioreactors and treatment lines for bioproduction, fermentation and recombinant protein sites.",
    },
    metaDescription: {
      fr: "Ingénierie et fabrication inox pour la biotechnologie : cuves et bioréacteurs, lignes de traitement, tuyauterie stérile et mise en service.",
      en: "Stainless engineering and fabrication for biotechnology: vessels and bioreactors, treatment lines, sterile piping and commissioning.",
    },
    body: {
      fr: [
        "La bioproduction impose un changement d'échelle continu. Un bioréacteur validé en laboratoire doit rester reproductible à plusieurs milliers de litres, avec des temps de cycle courts et des exigences de contamination très basses.",
        "Nous accompagnons les biotechnologistes dès l'avant-projet. Nous caractérisons le procédé, dimensionnons les équipements et fabriquons les cuves en acier inoxydable avec des finitions adaptées aux exigences de stérilisation à la vapeur.",
        "Nos fabrications intègrent l'agitation, les entrées aseptiques et les instrumentations dans un ensemble cohérent, livré prêt à être raccordé à vos utilités propres.",
      ],
      en: [
        "Bioproduction demands continuous scale-up. A bioreactor validated in the laboratory must remain reproducible at several thousand litres, with short cycle times and very low contamination risk.",
        "We support biotechnology teams from pre-project stage onward: characterising the process, sizing the equipment and fabricating the vessels in stainless steel with finishes suited to steam sterilisation.",
        "Our fabrications integrate agitation, aseptic ports and instrumentation into a coherent assembly, delivered ready to connect to your clean utilities.",
      ],
    },
    points: {
      fr: [
        "Cuves et bioréacteurs inox 316L / 316Ti",
        "Entrées aseptiques et connexions prêtes à la stérilisation",
        "Changement d'échelle laboratoire vers production",
        "Lignes de traitement aval et filtration",
        "Rédaction des dossiers de qualification",
      ],
      en: [
        "316L / 316Ti stainless vessels and bioreactors",
        "Aseptic ports and sterile-ready connections",
        "Laboratory to production scale-up",
        "Downstream treatment and filtration lines",
        "Qualification dossier preparation",
      ],
    },
    image: biotechImage,
  },
  {
    slug: "agroalimentaire",
    label: { fr: "Agroalimentaire", en: "Food & beverage" },
    title: { fr: "Industrie agroalimentaire", en: "Food & beverage industry" },
    summary: {
      fr: "Lignes de production, skids de pasteurisation et installations hygiéniques pour les unités de transformation alimentaire.",
      en: "Production lines, pasteurisation skids and hygienic installations for food processing plants.",
    },
    metaDescription: {
      fr: "Solutions inox pour l'agroalimentaire : lignes de production, pasteurisation, lavage CIP et tuyauterie hygiénique pour usines de transformation.",
      en: "Stainless solutions for food and beverage: production lines, pasteurisation, CIP washing and hygienic piping for processing plants.",
    },
    body: {
      fr: [
        "L'agroalimentaire est exigeant sur un point particulier : le nettoyage. Une installation mal conçue du point de vue hygiène condamne des heures de production par semaine, et un rappel de produit ne se rattrape pas.",
        "Nous concevons des tuyauteries à joints plats, des portions droites à grand rayon et des cuves totalement drainantes, pour que rien ne reste dans les angles morts lors du lavage.",
        "Nos lignes intègrent aussi la pasteurisation, le maintien en température et la filtration, dans une logique de rendement énergétique autant que de sécurité alimentaire.",
      ],
      en: [
        "Food and beverage places one specific demand above all others: cleaning. An installation poorly conceived from a hygiene standpoint costs hours of production every week, and a product recall cannot be undone.",
        "We design flat-seal piping, long-radius straight runs and fully drainable vessels, so nothing is left in dead corners during washing.",
        "Our lines also integrate pasteurisation, hold temperature and filtration, with energy efficiency considered as seriously as food safety.",
      ],
    },
    points: {
      fr: [
        "Tuyauterie à joints plats, totalement drainable",
        "Skids de pasteurisation et de maintien",
        "Nettoyage CIP et rinçage contrôlé",
        "Cuves agitées et échangeurs",
        "Conformité aux référentiels d'hygiène",
      ],
      en: [
        "Flat-seal, fully drainable piping",
        "Pasteurisation and hold skids",
        "CIP cleaning and controlled rinsing",
        "Agitated vessels and heat exchangers",
        "Compliance with hygiene standards",
      ],
    },
    image: agroImage,
  },
  {
    slug: "chimie",
    label: { fr: "Chimie", en: "Chemical" },
    title: { fr: "Industrie chimique", en: "Chemical industry" },
    summary: {
      fr: "Tuyauterie corrosive, unités de dégraissage-passivation et systèmes de récupération pour sites chimiques et pétrochimiques.",
      en: "Corrosive piping, degreasing-passivation units and recovery systems for chemical and petrochemical sites.",
    },
    metaDescription: {
      fr: "Ingénierie et fabrication pour la chimie : tuyauterie corrosive, skids de dégraissage et passivation, systèmes de traitement et montage sur site.",
      en: "Engineering and fabrication for chemicals: corrosive piping, degreasing and passivation skids, treatment systems and on-site installation.",
    },
    body: {
      fr: [
        "En chimie, le choix du matériau n'est pas une question de marge : il détermine la durée de vie de l'installation. Nous travaillons l'inox 316L, le duplex et le titane selon la nature exacte des produits véhiculés.",
        "Nos études de compatibilité sont documentées et validées avec vos procédures. Chaque produit corrosif reçoit une solution adaptée, du schéma de principe jusqu'à la nuance de raccordement.",
        "Nous réalisons également les unités de prétraitement et de récupération qui accompagnent ces lignes, et assurons la maintenance préventive sur le long terme.",
      ],
      en: [
        "In chemicals, material selection is not a matter of margin: it determines the installation's service life. We work 316L stainless, duplex and titanium according to the exact nature of the products carried.",
        "Our compatibility studies are documented and validated with your procedures. Every corrosive product receives a suitable solution, from conceptual diagram down to connection detail.",
        "We also build the pretreatment and recovery units that accompany these lines, and handle long-term preventive maintenance.",
      ],
    },
    points: {
      fr: [
        "Inox 316L, duplex 2205 et titane grade 2",
        "Études de compatibilité des matériaux",
        "Skids de dégraissage, décapage et passivation",
        "Traitement et récupération des effluents",
        "Maintenance préventive et interventions sur site",
      ],
      en: [
        "316L stainless, 2205 duplex and grade 2 titanium",
        "Material compatibility studies",
        "Degreasing, pickling and passivation skids",
        "Effluent treatment and recovery",
        "Preventive maintenance and on-site intervention",
      ],
    },
    image: chemicalImage,
  },
];

// ── Section 2 — Expertises ──────────────────────────────────────────────────

const EXPERTISES: SiteEntry[] = [
  {
    slug: "tuyauterie-process",
    label: { fr: "Tuyauterie Process", en: "Process piping" },
    title: { fr: "Tuyauterie process", en: "Process piping" },
    summary: {
      fr: "Conception, fabrication et installation de réseaux en acier inoxydable pour les procédés industriels, du dimensionnement au raccordement final.",
      en: "Design, fabrication and installation of stainless networks for industrial processes, from sizing to final connection.",
    },
    metaDescription: {
      fr: "Tuyauterie process inox : conception, calcul, fabrication, cintrage et montage de réseaux de distribution pour les industries du procédé.",
      en: "Stainless process piping: design, calculation, fabrication, bending and assembly of distribution networks for process industries.",
    },
    body: {
      fr: [
        "Une tuyauterie process n'est pas un assemblage de tubes. Elle est le résultat d'un calcul : diamètre, épaisseur, classe de pression, supports et raccords cohérents avec le procédé qu'elle dessert.",
        "Nous prenons en charge l'étude complète, du schéma de principe au plan d'implantation. Les éléments sont fabriqués dans notre atelier d'Akouda, cintrés à froid lorsque la géométrie l'impose, et livrés repérés pour un montage direct.",
        "Sur site, nos équipes montent la ligne, la raccordent aux équipements existants et la soumettent à l'épreuve avant toute mise en service.",
      ],
      en: [
        "A process line is not an assembly of tubes. It is the result of a calculation: diameter, thickness, pressure class, plus supports and fittings consistent with the process it serves.",
        "We handle the complete study, from conceptual diagram to layout plan. Components are fabricated in our Akouda workshop, cold bent when the geometry requires it, and delivered tagged for direct assembly.",
        "On site, our teams erect the line, connect it to existing equipment and pressure test it before any commissioning.",
      ],
    },
    points: {
      fr: [
        "Réseaux hygienic design et standards sanitaires",
        "Cintrage à froid, chanfrein et polissage intérieur",
        "Supports, brides et structures",
        "Test d'étanchéité et épreuve hydraulique",
        "Marquage, traçabilité et documentation",
      ],
      en: [
        "Hygienic design and sanitary standards",
        "Cold bending, bevel and internal polishing",
        "Supports, flanges and structures",
        "Leak testing and hydraulic pressure test",
        "Marking, traceability and documentation",
      ],
    },
    image: pipingImage,
  },
  {
    slug: "soudage-orbital",
    label: { fr: "Soudage Orbital", en: "Orbital welding" },
    title: { fr: "Soudage orbital", en: "Orbital welding" },
    summary: {
      fr: "Soudage orbital mécanique de tubes et raccords, certifié AXXAIR, avec enregistrement numérique de chaque soudure.",
      en: "Mechanical orbital welding of tubes and fittings, AXXAIR certified, with digital recording of every weld.",
    },
    metaDescription: {
      fr: "Soudage orbital certifié AXXAIR : répétabilité du joint, contrôle automatique des paramètres et passport de soudage numérique.",
      en: "Certified AXXAIR orbital welding: weld repeatability, automatic parameter control and a digital weld passport.",
    },
    body: {
      fr: [
        "Le soudage orbital supprime le facteur humain de la qualité du joint. La machine, étalonnée et paramétrée, applique le même cycle sur chaque soudure : le résultat ne dépend plus de la fatigue ni de l'attention de l'opérateur.",
        "Nous sommes distributeur officiel AXXAIR, et nos soudeurs sont formés et certifiés sur les machines que nous installons. Chaque soudure produite en atelier est enregistrée.",
        "Le passport de soudage numérique associe le numéro de la soudure, les paramètres appliqués, l'opérateur et le résultat du contrôle. Il est exigé lors des inspections comme lors des qualifications.",
      ],
      en: [
        "Orbital welding removes the human factor from joint quality. A calibrated, parameterised machine applies the same cycle to every weld: the result no longer depends on operator fatigue or attention.",
        "We are an official AXXAIR distributor, and our welders are trained and certified on the machines we install. Every weld produced in the workshop is recorded.",
        "The digital weld passport links the weld number, applied parameters, operator and inspection result. It is required during inspections and qualifications alike.",
      ],
    },
    points: {
      fr: [
        "Machines AXXAIR en location et en installation",
        "Soudage de tubes et de raccords",
        "Passport de soudage numérique par soudure",
        "Paramétrage et mémorisation des cycles",
        "Soudeurs formés et certifiés AXXAIR",
      ],
      en: [
        "AXXAIR machines for rental and installation",
        "Tube and fitting welding",
        "A digital weld passport per weld",
        "Cycle parameterisation and storage",
        "AXXAIR trained and certified welders",
      ],
    },
    image: weldingImage,
  },
  {
    slug: "fabrication-inox",
    label: { fr: "Fabrication Inox", en: "Stainless fabrication" },
    title: { fr: "Fabrication inox", en: "Stainless fabrication" },
    summary: {
      fr: "Cuves, récipients, skids et structures métalliques conformes à vos plans, fabriqués dans notre atelier d'Akouda.",
      en: "Vessels, receptacles, skids and metal structures built to your drawings, fabricated in our Akouda workshop.",
    },
    metaDescription: {
      fr: "Fabrication inox sur mesure : cuves, récipients, skids et structures, cintrage, polissage et soudage certifié en atelier.",
      en: "Custom stainless fabrication: vessels, receptacles, skids and structures, with bending, polishing and certified workshop welding.",
    },
    body: {
      fr: [
        "Notre atelier est équipé pour produire des ensembles complets, pas seulement des pièces. Nous disposons de machines de cintrage, de polissage, de soudage et d'assemblage pour des montants de plusieurs mètres.",
        "Les cuves sont soudées puis finies à l'intérieur jusqu'à la rugosité requise par votre procédé. Un fini Ra 0,8 micromètre et un fini électropoli Ra 0,4 micromètre ne demandent pas les mêmes opérations.",
        "Chaque commande est accompagnée d'un dossier de fabrication : plans, weld maps, matières utilisées et contrôles réalisés.",
      ],
      en: [
        "Our workshop is equipped to produce complete assemblies, not just parts. We operate bending, polishing, welding and assembly equipment for assemblies several metres tall.",
        "Vessels are welded then finished internally to the roughness your process requires. An Ra 0.8 micron finish and an electro-polished Ra 0.4 micron finish do not call for the same operations.",
        "Every order ships with a fabrication dossier: drawings, weld maps, materials used and inspections performed.",
      ],
    },
    points: {
      fr: [
        "Cuves et récipients sur mesure",
        "Skids de procédé complets",
        "Structures et charpentes métalliques",
        "Polissage et électropolissage intérieurs",
        "Dossier de fabrication complet",
      ],
      en: [
        "Custom vessels and receptacles",
        "Complete process skids",
        "Structures and metal frameworks",
        "Internal polishing and electro-polishing",
        "Complete fabrication dossier",
      ],
    },
    image: pipingImage,
  },
  {
    slug: "ingenierie-conception",
    label: { fr: "Ingénierie & Conception", en: "Engineering & design" },
    title: { fr: "Ingénierie & conception", en: "Engineering & design" },
    summary: {
      fr: "Avant-projet, études d'exécution et plans de fabrication pour transformer une exigence procédé en un ensemble constructible.",
      en: "Pre-project, detailed design and fabrication drawings that turn a process requirement into a buildable assembly.",
    },
    metaDescription: {
      fr: "Bureau d'études U2I : avant-projet, P&ID, études de structures, plans d'atelier et assistance à la maîtrise d'ouvrage.",
      en: "U2I engineering: pre-project, P&IDs, structural studies, workshop drawings and owner engineering support.",
    },
    body: {
      fr: [
        "La majorité des difficultés d'un projet apparaissent avant la première pièce fabriquée. Un coude de tuyauterie sous-dimensionné, un support mal placé, une incompatibilité de matériaux : tout cela se corrige sur une feuille, et très difficilement dans un atelier.",
        "Nos ingénieurs travaillent donc en amont avec vos équipes. Nous produisons le P&ID, les plans d'atelier, les notes de calcul et les plans de supports.",
        "Cette anticipation réduit les heures improductives sur site, qui sont de loin le poste de coût le plus lourd d'un projet de tuyauterie.",
      ],
      en: [
        "Most project difficulties appear before the first part is manufactured. An under-sized pipe bend, a badly placed support, an incompatible material: all of these are fixed on a drawing, and very awkwardly in a workshop.",
        "Our engineers therefore work upstream with your teams. We produce the P&ID, workshop drawings, calculation notes and support plans.",
        "This anticipation cuts unproductive hours on site, by far the heaviest cost item in a piping project.",
      ],
    },
    points: {
      fr: [
        "Avant-projet et analyse de faisabilité",
        "P&ID et schémas de principe",
        "Calcul de tuyauterie et vérification des contraintes",
        "Plans d'atelier et nomenclature",
        "Assistance à la maîtrise d'ouvrage",
      ],
      en: [
        "Pre-project and feasibility study",
        "P&IDs and conceptual diagrams",
        "Piping calculation and constraint verification",
        "Workshop drawings and bill of materials",
        "Owner engineering support",
      ],
    },
    image: designImage,
  },
  {
    slug: "eau-purifiee-wfi",
    label: { fr: "Eau Purifiée & WFI", en: "Purified water & WFI" },
    title: { fr: "Eau purifiée & WFI", en: "Purified water & WFI" },
    summary: {
      fr: "Génération, stockage et distribution d'eau purifiée et d'eau pour injection, en boucle fermée, du générateur aux points d'usage.",
      en: "Generation, storage and distribution of purified water and water for injection, in closed loop, from generator to point of use.",
    },
    metaDescription: {
      fr: "Eau purifiée et WFI : conception de boucle fermée, distribution sanitisée, skids de traitement et qualification IQ/OQ/PQ.",
      en: "Purified water and WFI: closed loop design, sanitised distribution, treatment skids and IQ/OQ/PQ qualification.",
    },
    body: {
      fr: [
        "La distribution d'eau purifiée est un système, pas un tuyau. La qualité de l'eau dépend autant de la manière dont le réseau est rincé et gouverné que du traitement lui-même.",
        "Nous concevons des boucles avec purge automatique, des points d'usage verrouillables et une gestion documentée de la désinfection thermique. Le réseau est livré sans bras morts, par conception.",
        "Chaque installation est accompagnée d'un programme de qualification IQ, OQ et PQ, mené avec votre équipe qualité et le laboratoire externe de votre choix.",
      ],
      en: [
        "Purified water distribution is a system, not a pipe. Water quality depends as much on how the network is rinsed and controlled as on the treatment itself.",
        "We design loops with automatic bottom draw, lockable points of use and documented thermal disinfection control. The network is delivered without dead legs, by design.",
        "Every installation ships with an IQ, OQ and PQ qualification programme, run with your quality team and the external laboratory of your choice.",
      ],
    },
    points: {
      fr: [
        "Générateurs d'eau purifiée et de WFI",
        "Boucles de distribution en acier inoxydable",
        "Purges automatiques et points d'usage verrouillables",
        "Désinfection thermique documentée",
        "Qualification IQ / OQ / PQ",
      ],
      en: [
        "Purified water and WFI generators",
        "Stainless distribution loops",
        "Automatic bottom draw and lockable points of use",
        "Documented thermal disinfection",
        "IQ / OQ / PQ qualification",
      ],
    },
    image: waterImage,
  },
  {
    slug: "vapeur-pure",
    label: { fr: "Vapeur Pure", en: "Pure steam" },
    title: { fr: "Vapeur pure", en: "Pure steam" },
    summary: {
      fr: "Réseaux de vapeur pure, générateurs et distribution vers les autoclaves, pour la stérilisation et le chauffage de procédé.",
      en: "Pure steam networks, generators and distribution to autoclaves, for sterilisation and process heating.",
    },
    metaDescription: {
      fr: "Vapeur pure : générateurs, réseau de distribution séparé et récupération de condensats pour la stérilisation et les procédés thermiquement propres.",
      en: "Pure steam: generators, separate distribution network and condensate recovery for sterilisation and thermally clean processes.",
    },
    body: {
      fr: [
        "La vapeur pure sert à la fois à stériliser et à chauffer. Sur le premier usage, sa qualité compte autant que sur le second, et les deux exigences ne sont pas identiques.",
        "Nous générons une vapeur dont la qualité est garantie, la distribuons par un réseau séparé de la vapeur utilitaire, et récupérons les condensats pour éviter tout risque de contamination en retour.",
        "Les générateurs sont choisis pour le débit réel de votre implantation, pas pour une valeur théorique : un générateur surdimensionné consomme inutilement de l'énergie à chaque cycle.",
      ],
      en: [
        "Pure steam serves both sterilisation and heating. In the first use its quality matters as much as in the second, and the two requirements are not identical.",
        "We generate steam of guaranteed quality, distribute it through a network separate from utility steam, and recover condensates to eliminate any risk of back-contamination.",
        "Generators are sized against your plant's real consumption, not a theoretical figure: an oversized generator wastes energy on every cycle.",
      ],
    },
    points: {
      fr: [
        "Générateurs de vapeur pure",
        "Réseaux séparés de la vapeur utilitaire",
        "Récupération et retour des condensats",
        "Distribution vers autoclaves et échangeurs",
        "Contrôle de la qualité vapeur",
      ],
      en: [
        "Pure steam generators",
        "Networks separate from utility steam",
        "Condensate recovery and return",
        "Distribution to autoclaves and heat exchangers",
        "Steam quality monitoring",
      ],
    },
    image: steamImage,
  },
  {
    slug: "cip-sip",
    label: { fr: "CIP / SIP", en: "CIP / SIP" },
    title: { fr: "CIP / SIP", en: "CIP / SIP" },
    summary: {
      fr: "Stations de nettoyage et de stérilisation automatiques, bi-zones ou mono-zone, pour installation et ligne de production.",
      en: "Automatic cleaning and sterilisation stations, two-zone or single-zone, for plant and production line.",
    },
    metaDescription: {
      fr: "Skids CIP et SIP : conception, fabrication et mise en service de stations de nettoyage et de stérilisation automatiques pour les procédés.",
      en: "CIP and SIP skids: design, fabrication and commissioning of automatic cleaning and sterilisation stations for process plants.",
    },
    body: {
      fr: [
        "Le CIP remplace le nettoyage manuel par un procédé contrôlé, reproductible et vérifiable. C'est un changement d'organisation autant qu'un équipement : sans discipline de production, un skid ne fait que déplacer le problème.",
        "Nous concevons des stations adaptées à votre parc, en tenant compte des machines à nettoyer, des contraintes de place et du temps d'arrêt acceptable pour la production.",
        "Les recettes de nettoyage sont développées conjointement, testées sur site, et les paramètres (concentration, température, durée) sont enregistrés à chaque cycle.",
      ],
      en: [
        "CIP replaces manual cleaning with a controlled, reproducible and verifiable process. It is an organisational change as much as an equipment change: without production discipline, a skid only moves the problem.",
        "We design stations suited to your plant, accounting for the machines to be cleaned, space constraints and the downtime acceptable to production.",
        "Cleaning recipes are developed jointly, tested on site, and parameters (concentration, temperature, duration) are recorded on every cycle.",
      ],
    },
    points: {
      fr: [
        "Stations CIP mono-zone et bi-zones",
        "Stations SIP avec validation thermique",
        "Réservoirs, échangeurs et pompes de reprise",
        "Recettes de nettoyage paramétrables",
        "Traçabilité de chaque cycle",
      ],
      en: [
        "Single-zone and two-zone CIP stations",
        "SIP stations with thermal validation",
        "Tanks, heat exchangers and transfer pumps",
        "Parameterised cleaning recipes",
        "Record of every cycle",
      ],
    },
    image: cipImage,
  },
  {
    slug: "solutions-sur-mesure",
    label: { fr: "Solutions sur mesure", en: "Custom solutions" },
    title: { fr: "Solutions sur mesure", en: "Custom solutions" },
    summary: {
      fr: "Quand le procédé n'existe pas encore au catalogue : conception et fabrication d'un ensemble conçu pour votre situation exacte.",
      en: "When the process is not off the shelf: design and fabrication of an assembly built for your exact situation.",
    },
    metaDescription: {
      fr: "Conception et fabrication sur mesure d'équipements process, cuves et skids adaptés à un besoin spécifique, avec étude et essais préalables.",
      en: "Custom design and fabrication of process equipment, vessels and skids for a specific need, with prior study and trial runs.",
    },
    body: {
      fr: [
        "Une partie de notre travail n'entre dans aucun catalogue : la ligne qui doit passer dans un passage de 1,80 mètre, la cuve qui doit recevoir un produit corrosif particulier, l'ensemble qui doit être démontable pour être nettoyé.",
        "Nous traitons ces demandes comme nos commandes standard, avec la même rigueur d'étude. Un essai en atelier précède souvent la fabrication complète.",
        "Le sur-mesure n'est pas un pis-aller : c'est parfois la seule réponse à un procédé réellement particulier. Notre atelier existe précisément pour cela.",
      ],
      en: [
        "Part of our work fits no catalogue: a line that must pass through a 1.80 metre opening, a vessel that must hold a particular corrosive product, an assembly that must be dismantlable for cleaning.",
        "We treat these requests as standard orders, with the same study rigour. A workshop trial often precedes full fabrication.",
        "Custom work is not a fallback: it is sometimes the only answer to a genuinely particular process. Our workshop exists precisely for this.",
      ],
    },
    points: {
      fr: [
        "Étude de faisabilité préalable",
        "Essais et prototypes en atelier",
        "Contraintes d'encombrement et d'accès",
        "Matériaux spécifiques (duplex, titane)",
        "Réversibilité et démontabilité",
      ],
      en: [
        "Preliminary feasibility study",
        "Workshop trials and prototypes",
        "Footprint and access constraints",
        "Specific materials (duplex, titanium)",
        "Reversibility and dismantlability",
      ],
    },
    image: workshopImage,
  },
];

// ── Section 3 — Projets ─────────────────────────────────────────────────────

const PROJECTS: SiteEntry[] = [
  {
    slug: "etudes-ingenierie",
    label: { fr: "Études & Ingénierie", en: "Studies & engineering" },
    title: { fr: "Études & ingénierie", en: "Studies & engineering" },
    summary: {
      fr: "L'étude qui évite les erreurs : avant-projet, P&ID, notes de calcul et plans d'atelier menés avec vos équipes méthodes.",
      en: "The study that prevents errors: pre-project, P&IDs, calculation notes and workshop drawings run with your methods teams.",
    },
    metaDescription: {
      fr: "Phase d'études d'un projet industriel U2I : avant-projet, P&ID, dimensionnement, plans d'atelier et assistance à la maîtrise d'ouvrage.",
      en: "Study phase of an industrial U2I project: pre-project, P&IDs, sizing, workshop drawings and owner engineering support.",
    },
    body: {
      fr: [
        "L'étude est la phase la moins visible et la plus déterminante d'un projet. Une heure consacrée à vérifier un dimensionnement en bureau vaut dix heures de correction sur site.",
        "Nous prenons en charge l'avant-projet, le schéma P&ID, le dimensionnement de la tuyauterie et des équipements, puis la production des plans d'atelier. Chaque document est revu avec vous avant d'être figé.",
        "Cette documentation accompagne ensuite l'ensemble du chantier et reste disponible pour la maintenance future de l'installation.",
      ],
      en: [
        "The study is the least visible and most decisive phase of a project. One hour spent verifying a dimension in the office saves ten hours of correction on site.",
        "We handle pre-project work, the P&ID, piping and equipment sizing, then production of workshop drawings. Every document is reviewed with you before it is frozen.",
        "This documentation then accompanies the whole site phase and remains available for future maintenance of the installation.",
      ],
    },
    points: {
      fr: [
        "Avant-projet et faisabilité",
        "P&ID et schémas de procédé",
        "Dimensionnement et notes de calcul",
        "Plans d'atelier, nomenclature et weld maps",
        "Révision et validation avec le client",
      ],
      en: [
        "Pre-project and feasibility",
        "P&IDs and process diagrams",
        "Sizing and calculation notes",
        "Workshop drawings, bill of materials and weld maps",
        "Review and validation with the client",
      ],
    },
    image: designImage,
  },
  {
    slug: "fabrication",
    label: { fr: "Fabrication", en: "Fabrication" },
    title: { fr: "Fabrication", en: "Fabrication" },
    summary: {
      fr: "Production en atelier des éléments de tuyauterie, cuves et skids, avec contrôle dimensionnel et soudage certifié.",
      en: "Workshop production of piping elements, vessels and skids, with dimensional inspection and certified welding.",
    },
    metaDescription: {
      fr: "Fabrication en atelier de tuyauterie inox, cuves et skids de procédé : cintrage, soudage orbital, polissage et contrôle qualité.",
      en: "Workshop fabrication of stainless piping, vessels and process skids: bending, orbital welding, polishing and quality control.",
    },
    body: {
      fr: [
        "La fabrication est le moment où la qualité se joue. Un tube mal coupé, un angle de chanfrein incorrect, une soudure non contrôlée : le défaut est encore réparable ici, il ne le sera plus sur site.",
        "Notre atelier dispose des machines de coupe, de cintrage, de polissage et de soudage nécessaires à une fabrication complète, avec les moyens de contrôle associés.",
        "Chaque élément fabriqué est identifié, pesé et marqué conformément au plan. Rien ne quitte l'atelier sans avoir été contrôlé.",
      ],
      en: [
        "Fabrication is where quality is decided. A badly cut tube, an incorrect bevel angle, an uninspected weld: the defect is still fixable here; it will not be on site.",
        "Our workshop has the cutting, bending, polishing and welding equipment needed for complete fabrication, with the associated inspection resources.",
        "Every fabricated element is identified, weighed and marked according to the drawing. Nothing leaves the workshop uninspected.",
      ],
    },
    points: {
      fr: [
        "Coupe, cintrage et préparation des tubes",
        "Soudage orbital certifié AXXAIR",
        "Soudage conventionnel qualifié",
        "Polissage et finition des surfaces",
        "Contrôle dimensionnel et marquage",
      ],
      en: [
        "Tube cutting, bending and preparation",
        "AXXAIR certified orbital welding",
        "Qualified conventional welding",
        "Polishing and surface finishing",
        "Dimensional inspection and marking",
      ],
    },
    image: workshopImage,
  },
  {
    slug: "installation",
    label: { fr: "Installation", en: "Installation" },
    title: { fr: "Installation", en: "Installation" },
    summary: {
      fr: "Montage de la ligne sur site, raccordement aux utilités et aux équipements, dans le respect de votre planning de production.",
      en: "On-site line assembly, connection to utilities and equipment, in line with your production schedule.",
    },
    metaDescription: {
      fr: "Installation et montage de tuyauteries et skids de procédé sur site, raccordement aux équipements et coordination avec les autres corps d'état.",
      en: "On-site installation and assembly of process piping and skids, equipment connection and coordination with other contractors.",
    },
    body: {
      fr: [
        "Une installation industrielle ne s'arrête pas pour une équipe de chantier. Nous planifions l'intervention en tenant compte de vos arrêts de production et de la coexistence avec les autres entreprises présentes sur le chantier.",
        "Nos équipes montent la structure, posent les supports, installent les équipements et raccordent la ligne aux utilités et aux machines existantes.",
        "Le chantier se termine par un relevé du tel que construit, qui devient la référence de l'installation pour toute intervention future.",
      ],
      en: [
        "An industrial installation does not stop for a site team. We plan the intervention around your production stoppages and coexistence with the other contractors on site.",
        "Our teams erect the structure, set the supports, install the equipment and connect the line to utilities and existing machines.",
        "The site phase ends with an as-built survey, which becomes the reference for the installation for any future intervention.",
      ],
    },
    points: {
      fr: [
        "Montage et levage des équipements",
        "Pose des supports et des structures",
        "Raccordement aux utilités et aux machines",
        "Coordination avec les autres entreprises",
        "Relevé du tel que construit",
      ],
      en: [
        "Equipment assembly and lifting",
        "Support and structure installation",
        "Connection to utilities and machines",
        "Coordination with other contractors",
        "As-built survey",
      ],
    },
    image: pipingImage,
  },
  {
    slug: "mise-en-service",
    label: { fr: "Mise en service", en: "Commissioning" },
    title: { fr: "Mise en service", en: "Commissioning" },
    summary: {
      fr: "Épreuves, rinçage, désinfection et qualification de l'installation avant son démarrage production.",
      en: "Testing, flushing, disinfection and qualification of the installation before production start-up.",
    },
    metaDescription: {
      fr: "Mise en service de lignes de procédé : épreuve hydraulique, rinçage, désinfection thermique, qualification et accompagnement au démarrage.",
      en: "Process line commissioning: pressure testing, flushing, thermal disinfection, qualification and start-up support.",
    },
    body: {
      fr: [
        "La mise en service est la période où l'on découvre si l'installation fait ce qu'on attend d'elle. Elle commence par l'épreuve hydraulique et se termine par la qualification.",
        "Nous assurons l'épreuve, le rinçage, la désinfection thermique avec enregistrement des courbes, et la qualification IQ, OQ et PQ selon le protocole convenu.",
        "Nos équipes restent sur site pendant le démarrage production : un procédé neuf se règle toujours un peu, et c'est normal.",
      ],
      en: [
        "Commissioning is the period in which you find out whether the installation does what it is expected to. It begins with the pressure test and ends with qualification.",
        "We handle the pressure test, flushing, thermal disinfection with recorded curves, and IQ, OQ and PQ qualification according to the agreed protocol.",
        "Our teams stay on site during production start-up: a new process always needs some adjustment, and that is normal.",
      ],
    },
    points: {
      fr: [
        "Épreuve hydraulique et test de fuite",
        "Rinçage des boucles et documents de purge",
        "Désinfection thermique avec courbes enregistrées",
        "Qualification IQ / OQ / PQ",
        "Accompagnement au démarrage production",
      ],
      en: [
        "Pressure test and leak test",
        "Loop flushing with flushing records",
        "Thermal disinfection with recorded curves",
        "IQ / OQ / PQ qualification",
        "Production start-up support",
      ],
    },
    image: waterImage,
  },
  {
    slug: "etudes-de-cas",
    label: { fr: "Études de cas", en: "Case studies" },
    title: { fr: "Études de cas", en: "Case studies" },
    summary: {
      fr: "Des installations réalisées, leur contrainte initiale et la solution retenue, racontées sans enrobage.",
      en: "Completed installations, their initial constraint and the solution chosen, told without embellishment.",
    },
    metaDescription: {
      fr: "Réalisations U2I en industries pharmaceutique, biotechnologique, agroalimentaire et chimique : contraintes, solutions et résultats obtenus.",
      en: "U2I projects in pharmaceutical, biotechnology, food and chemical industries: constraints, solutions and results achieved.",
    },
    body: {
      fr: [
        "Une étude de cas commence toujours par une contrainte réelle : une hauteur libre insuffisante, un produit corrosif inattendu, un arrêt de production de quarante-huit heures.",
        "Nous présentons ici le contexte, la solution retenue et ce qu'elle a permis. Lorsqu'un projet n'a pas atteint ses objectifs, nous le disons aussi.",
        "Ces réalisations sont la meilleure façon de comprendre comment nous travaillons réellement, au-delà des promesses commerciales.",
      ],
      en: [
        "A case study always starts from a real constraint: insufficient clearance height, an unexpected corrosive product, a forty-eight hour production stoppage.",
        "We present here the context, the solution chosen and what it enabled. Where a project did not meet its targets, we say so.",
        "These projects are the best way to understand how we actually work, beyond commercial promises.",
      ],
    },
    points: {
      fr: [
        "Contexte et contraintes du site",
        "Solution technique retenue",
        "Contraintes d'exploitation rencontrées",
        "Résultats et retour d'expérience",
        "Références clients correspondantes",
      ],
      en: [
        "Site context and constraints",
        "Technical solution chosen",
        "Operational constraints encountered",
        "Results and lessons learned",
        "Matching client references",
      ],
    },
    image: pipingImage,
  },
];

// ── Section 4 — U2I ─────────────────────────────────────────────────────────

const U2I: SiteEntry[] = [
  {
    slug: "a-propos",
    label: { fr: "À propos", en: "About" },
    title: { fr: "À propos d'U2I", en: "About U2I" },
    summary: {
      fr: "Univers Inox Industriel : un atelier tunisien de tuyauterie de procédé, soudure orbitale et fabrication inox au service des industries du procédé.",
      en: "Univers Inox Industriel: a Tunisian workshop for process piping, orbital welding and stainless fabrication, serving process industries.",
    },
    metaDescription: {
      fr: "U2I Process, fabricant tunisien de tuyauterie de procédé inox, soudure orbitale et équipements pour le pharmaceutique, la biotechnologie et l'agroalimentaire.",
      en: "U2I Process, a Tunisian manufacturer of stainless process piping, orbital welding and equipment for pharmaceutical, biotechnology and food industries.",
    },
    body: {
      fr: [
        "Univers Inox Industriel est né d'un constat simple : la Tunisie dispose d'une agroalimentaire et d'une pharmacie exigeantes, mais peu d'ateliers capables de leur fournir des équipements de procédé conformes à leurs standards.",
        "Installés à Akouda, dans la région de Sousse, nous avons bâti un atelier équipé pour la tuyauterie inox et la soudure orbitale, et une équipe d'ingénieurs capable de concevoir le procédé autant que de le fabriquer.",
        "Nous travaillons pour des groupes pharmaceutiques et agroalimentaires tunisiens, algériens et français, sur des installations qui doivent fonctionner plusieurs années sans interruption.",
      ],
      en: [
        "Univers Inox Industriel began with a simple observation: Tunisia has a demanding food and pharmaceutical industry, but few workshops capable of supplying it with process equipment matching its standards.",
        "Based in Akouda, in the Sousse region, we built a workshop equipped for stainless piping and orbital welding, and an engineering team able to design the process as well as manufacture it.",
        "We work for Tunisian, Algerian and French pharmaceutical and food groups, on installations that must run for years without interruption.",
      ],
    },
    points: {
      fr: [
        "Atelier de tuyauterie et de soudage orbital à Akouda",
        "Bureau d'études intégré",
        "Distributeur officiel AXXAIR",
        "Équipes d'installation mobiles",
        "Qualité certifiée ISO 9001",
      ],
      en: [
        "Piping and orbital welding workshop in Akouda",
        "Integrated engineering office",
        "Official AXXAIR distributor",
        "Mobile installation teams",
        "ISO 9001 certified quality",
      ],
    },
    image: workshopImage,
  },
  {
    slug: "points-forts",
    label: { fr: "Points forts", en: "Key strengths" },
    title: { fr: "Nos points forts", en: "Our key strengths" },
    summary: {
      fr: "Ce qui distingue U2I des autres prestataires : réactivité, maîtrise interne de la chaîne et documentation de niveau industriel.",
      en: "What sets U2I apart: responsiveness, in-house control of the chain and industrial-grade documentation.",
    },
    metaDescription: {
      fr: "Les points forts d'U2I : atelier intégré, bureau d'études, soudage orbital certifié AXXAIR, délais maîtrisés et documentation complète.",
      en: "U2I's strengths: integrated workshop, in-house engineering, AXXAIR certified orbital welding, controlled lead times and complete documentation.",
    },
    body: {
      fr: [
        "Un prestataire qui sous-traite tout ne maîtrise ni ses délais ni ses coûts. Notre chaîne est volontairement intégrée : l'étude, la fabrication et le montage sont réalisés par nos propres équipes.",
        "Cela se traduit par une disponibilité rare dans cette industrie. Quand un problème apparaît sur site, l'équipe qui a fabriqué la pièce est celle qui intervient.",
        "Nous documentons systématiquement. Les dossiers de fabrication, weld maps, passports de soudage et protocoles d'essai sont remis avec l'installation, pas demandés séparément.",
      ],
      en: [
        "A contractor who subcontracts everything controls neither its lead times nor its costs. Our chain is deliberately integrated: design, fabrication and assembly are performed by our own teams.",
        "That translates into availability that is uncommon in this industry. When a problem appears on site, the team that made the part is the one that intervenes.",
        "We document systematically. Fabrication dossiers, weld maps, weld passports and test protocols are handed over with the installation, not requested separately.",
      ],
    },
    points: {
      fr: [
        "Chaîne intégrée : étude, fabrication, montage",
        "Délais tenus et arbitrages transparents",
        "Soudage orbital certifié et tracé",
        "Documentation remise avec l'installation",
        "Réactivité sur les arrêts de production",
      ],
      en: [
        "Integrated chain: design, fabrication, assembly",
        "Lead times met, transparent trade-offs",
        "Certified and traceable orbital welding",
        "Documentation handed over with the installation",
        "Responsiveness around production stoppages",
      ],
    },
    image: designImage,
  },
  {
    slug: "savoir-faire",
    label: { fr: "Savoir Faire", en: "Know-how" },
    title: { fr: "Notre savoir-faire", en: "Our know-how" },
    summary: {
      fr: "Les compétences techniques concrètes que nous mettons en œuvre : soudage, cintrage, polissage, passivation et intégration de systèmes.",
      en: "The concrete technical skills we bring to bear: welding, bending, polishing, passivation and systems integration.",
    },
    metaDescription: {
      fr: "Savoir-faire U2I : soudage orbital et conventionnel, cintrage, polissage, passivation, montage et intégration de systèmes de procédé.",
      en: "U2I know-how: orbital and conventional welding, bending, polishing, passivation, assembly and process systems integration.",
    },
    body: {
      fr: [
        "Le savoir-faire se mesure sur des gestes, pas sur des déclarations. Le nôtre repose sur des qualifications de soudeurs, des machines étalonnées et des procédures écrites qui ne laissent rien à l'improvisation.",
        "Nos soudeurs sont certifiés sur les machines AXXAIR que nous installons, et nos cintreurs et polisseurs travaillent selon des paramètres vérifiés plutôt qu'à l'expérience.",
        "Ce niveau d'exigence n'a pas d'intérêt en soi : il existe pour que votre installation passe les inspections et continue de fonctionner après nous.",
      ],
      en: [
        "Know-how is measured in gestures, not declarations. Ours rests on welder qualifications, calibrated machines and written procedures that leave nothing to improvisation.",
        "Our welders are certified on the AXXAIR machines we install, and our benders and polishers work to verified parameters rather than by feel.",
        "This level of rigour is not an end in itself: it exists so that your installation passes inspection and keeps running after we leave.",
      ],
    },
    points: {
      fr: [
        "Soudeurs certifiés AXXAIR et procédures écrites",
        "Cintrage à froid sur tubes inox",
        "Polissage et électropolissage de précision",
        "Dégraissage, décapage et passivation chimique",
        "Intégration de systèmes et de skids",
      ],
      en: [
        "AXXAIR certified welders and written procedures",
        "Cold bending of stainless tubes",
        "Precision polishing and electro-polishing",
        "Degreasing, pickling and chemical passivation",
        "Systems and skid integration",
      ],
    },
    image: weldingImage,
  },
];

// ── Section 5 — Références ──────────────────────────────────────────────────
//
// Rendered by dedicated pages (see features/site/references-page.tsx): these
// children draw live CMS data and bundled logo sets rather than prose.
//
// Clients and partners share ONE page, drawn as ONE grid under one neutral
// heading. They answer the same question — "who do you work with?" — and
// splitting them by register only made visitors hunt through two nearly
// identical logo walls, while naming the register made the page read as if one
// group were missing. The section root (/references) draws that unified page
// directly rather than an index of cards, so the logos are what a visitor lands
// on, and neither its hero nor its heading names a register. The slug
// `clients-partenaires` is kept so existing links still resolve, but its label
// and title are neutral for the same reason. Certifications stays on its own
// page because a certificate is a different kind of evidence from a logo.

const REFERENCES: SiteEntry[] = [
  {
    slug: "clients-partenaires",
    label: { fr: "Références", en: "References" },
    title: { fr: "Nos références", en: "Our references" },
    summary: {
      fr: "Les industriels qui nous ont confié leurs lignes de procédé, et les partenaires technologiques dont nous appliquons les technologies.",
      en: "The manufacturers who entrusted their process lines to us, and the technology partners whose technologies we apply.",
    },
    metaDescription: {
      fr: "Références clients et partenaires d'U2I : industriels du pharmaceutique, de l'agroalimentaire et de la chimie, et distributeurs comme AXXAIR pour la soudure orbitale.",
      en: "U2I's client and partner references: manufacturers in pharmaceuticals, food and chemicals, and distributors such as AXXAIR for orbital welding.",
    },
    body: { fr: [], en: [] },
    points: { fr: [], en: [] },
    image: partnersImage,
  },
  {
    slug: "certifications",
    label: { fr: "Certifications", en: "Certifications" },
    title: { fr: "Nos certifications", en: "Our certifications" },
    summary: {
      fr: "Certifications qualité et habilitations de nos équipes, consultables sur demande.",
      en: "Quality certifications and our teams' qualifications, available on request.",
    },
    metaDescription: {
      fr: "Certifications U2I : ISO 9001, formation et habilitation des soudeurs à la soudure orbitale AXXAIR.",
      en: "U2I certifications: ISO 9001, and training and qualification of welders for AXXAIR orbital welding.",
    },
    body: { fr: [], en: [] },
    points: { fr: [], en: [] },
    image: certificationsImage,
  },
];

// ── The tree ────────────────────────────────────────────────────────────────

export const SITE_SECTIONS: SiteSection[] = [
  {
    id: "industries",
    path: "/industries",
    kind: "hub",
    label: { fr: "Industries", en: "Industries" },
    eyebrow: { fr: "Nos secteurs d'activité", en: "Our industries" },
    title: {
      fr: "Des industries exigeantes,\ndes solutions adaptées",
      en: "Demanding industries,\ntailored solutions",
    },
    description: {
      fr: "Quatre secteurs aux exigences réglementaires différentes, une même exigence de fabrication. Nos installations sont conçues pour durer, dans des environnements où l'arrêt de production n'est pas une option.",
      en: "Four sectors with different regulatory requirements, one same demand for manufacturing. Our installations are designed to last, in environments where production downtime is not an option.",
    },
    metaDescription: {
      fr: "U2I intervient dans quatre industries : pharmaceutique, biotechnologie, agroalimentaire et chimie. Tuyauterie de procédé et équipements inox.",
      en: "U2I works across four industries: pharmaceutical, biotechnology, food and chemical. Process piping and stainless equipment.",
    },
    image: sectorHeroImage,
    entries: INDUSTRIES,
  },
  {
    id: "expertises",
    path: "/expertises",
    kind: "hub",
    label: { fr: "Expertises", en: "Expertises" },
    eyebrow: { fr: "Nos savoir-faire techniques", en: "Our technical skills" },
    title: {
      fr: "Huit expertises,\nun seul interlocuteur",
      en: "Eight expertises,\none single partner",
    },
    description: {
      fr: "De l'étude de conception à la mise en service, nous couvrons la chaîne complète. Vous ne coordonnez pas cinq prestataires : vous travaillez avec une équipe qui connaît votre installation dans son ensemble.",
      en: "From design study to commissioning, we cover the complete chain. You do not coordinate five contractors: you work with one team that knows your installation as a whole.",
    },
    metaDescription: {
      fr: "Expertises U2I : tuyauterie de procédé, soudage orbital, fabrication inox, ingénierie, eau purifiée et WFI, vapeur pure, CIP/SIP et solutions sur mesure.",
      en: "U2I expertises: process piping, orbital welding, stainless fabrication, engineering, purified water and WFI, pure steam, CIP/SIP and custom solutions.",
    },
    image: weldingImage,
    entries: EXPERTISES,
  },
  {
    id: "projets",
    path: "/projets",
    kind: "hub",
    label: { fr: "Projets", en: "Projects" },
    eyebrow: { fr: "Notre façon de travailler", en: "How we work" },
    title: {
      fr: "Un projet,\ncinq étapes maîtrisées",
      en: "One project,\nfive mastered stages",
    },
    description: {
      fr: "Chaque projet suit le même chemin, du premier cahier des charges à la qualification finale. Ce cadre nous permet d'anticiper les problèmes au lieu de les découvrir sur site.",
      en: "Every project follows the same path, from the first specification to final qualification. This framework lets us anticipate problems rather than discover them on site.",
    },
    metaDescription: {
      fr: "Les cinq étapes d'un projet U2I : études et ingénierie, fabrication, installation, mise en service et études de cas.",
      en: "The five stages of a U2I project: studies and engineering, fabrication, installation, commissioning and case studies.",
    },
    image: workshopImage,
    entries: PROJECTS,
  },
  {
    id: "references",
    path: "/references",
    kind: "hub",
    label: { fr: "Références", en: "References" },
    eyebrow: { fr: "Ils nous font confiance", en: "They trust us" },
    title: {
      fr: "Nos références",
      en: "Our references",
    },
    description: {
      fr: "Les industriels qui nous ont confié leurs lignes de procédé, et les partenaires technologiques dont nous appliquons les technologies.",
      en: "The manufacturers who entrusted their process lines to us, and the technology partners whose technologies we apply.",
    },
    metaDescription: {
      fr: "Références U2I : clients, partenaires et certifications de l'atelier de tuyauterie de procédé et de soudure orbitale.",
      en: "U2I references: clients, partners and certifications of the process piping and orbital welding workshop.",
    },
    image: partnersImage,
    entries: REFERENCES,
  },
  {
    id: "u2i",
    path: "/u2i",
    kind: "hub",
    label: { fr: "U2I", en: "U2I" },
    eyebrow: { fr: "Qui sommes-nous", en: "Who we are" },
    title: { fr: "Univers Inox Industriel", en: "Univers Inox Industriel" },
    description: {
      fr: "Atelier de tuyauterie de procédé et de soudure orbitale installé à Akouda, en Tunisie, au service des industries du procédé depuis plus de dix ans.",
      en: "A process piping and orbital welding workshop in Akouda, Tunisia, serving process industries for over a decade.",
    },
    metaDescription: {
      fr: "U2I Process : atelier de fabrication à Akouda, Tunisie — tuyauterie inox, soudure orbitale et bureau d'études intégré.",
      en: "U2I Process: manufacturing workshop in Akouda, Tunisia — stainless piping, orbital welding and integrated engineering.",
    },
    image: workshopImage,
    entries: U2I,
  },
];

// ── Lookups ─────────────────────────────────────────────────────────────────

/** The section owning `path`, or undefined. */
export function findSection(path: string): SiteSection | undefined {
  return SITE_SECTIONS.find((section) => section.path === path);
}

/**
 * The entry at `sectionPath/slug`, or undefined.
 *
 * Slugs are shared across languages, so this resolves both /industries/… and
 * /en/industries/… with the same call.
 */
export function findEntry(sectionPath: string, slug: string): SiteEntry | undefined {
  return findSection(sectionPath)?.entries.find((entry) => entry.slug === slug);
}

/** Every (section, entry) pair — used by the sitemap and the prerenderer. */
export function allEntries(): { section: SiteSection; entry: SiteEntry }[] {
  return SITE_SECTIONS.flatMap((section) => section.entries.map((entry) => ({ section, entry })));
}
