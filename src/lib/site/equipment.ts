/**
 * Équipements — one page, seven process stages.
 *
 * Unlike the rest of the IA, equipment is not split across pages. A buyer
 * asking "how do you prepare tube?" does not want a separate site section; they
 * want one equipment page they can scroll through, with the shop's tooling
 * grouped by the stage of the process it serves. So the stages are anchors
 * within `/equipements` rather than children with their own URLs.
 *
 * Stages are ordered the way a part actually moves through the workshop, from
 * cutting to the accessories that support it. That ordering is the argument
 * the page makes: we can take a component all the way through.
 *
 * Images are shared across stages on purpose. A CNC machine genuinely appears
 * under cutting and under metrology, and pretending otherwise would leave a
 * stage with three photographs and a visibly thinner section.
 */

import type { Locale } from "@/lib/i18n";

// ── Photographs, grouped by the machine that produced them ─────────────────

import cut1 from "@/assets/equipments/Machine de coupe rectification/20200910_113443.jpg";
import cut2 from "@/assets/equipments/Machine de coupe rectification/6-CC81_850.jpg";
import cut3 from "@/assets/equipments/Machine de coupe rectification/7-CC121_850.jpg";
import cut4 from "@/assets/equipments/Machine de coupe rectification/7-coupe-tube-orbital-CC121-AXXAIR.png";
import cut5 from "@/assets/equipments/Machine de coupe rectification/8-DCPACK_850.jpg";
import cut6 from "@/assets/equipments/Machine de coupe rectification/9-dresseuse-de-face.png";

import cnc1 from "@/assets/equipments/Machine à commande numérique/20210222_093607.jpg";
import cnc2 from "@/assets/equipments/Machine à commande numérique/IMG_4259.jpg";
import cnc3 from "@/assets/equipments/Machine à commande numérique/IMG_4260.jpg";
import cnc4 from "@/assets/equipments/Machine à commande numérique/IMG_4261.jpg";
import cnc5 from "@/assets/equipments/Machine à commande numérique/IMG_4283.jpg";
import cnc6 from "@/assets/equipments/Machine à commande numérique/IMG_4292.jpg";

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

import gas1 from "@/assets/equipments/Machine de contrôle de gaz/IMG-20200912-WA0014.jpg";
import gas2 from "@/assets/equipments/Machine de contrôle de gaz/IMG-20200912-WA0016.jpg";
import gas3 from "@/assets/equipments/Machine de contrôle de gaz/IMG_2948-rotated-e1646059406575.jpg";
import gas4 from "@/assets/equipments/Machine de contrôle de gaz/IMG_3059-rotated-e1646059387145.jpg";

import endo1 from "@/assets/equipments/Endoscopie/20200910_114715.jpg";
import endo2 from "@/assets/equipments/Endoscopie/20200910_114715 (1).jpg";
import endo3 from "@/assets/equipments/Endoscopie/IMG-20200912-WA0013.jpg";
import endo4 from "@/assets/equipments/Endoscopie/IMG-20200912-WA0028.jpg";
import endo5 from "@/assets/equipments/Endoscopie/ait2013-studio-192-edit-_zf-2864-10644-1-001__2_1.jpg";

import skid1 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/20211014_090938.jpg";
import skid2 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/IMG-20200912-WA0000.jpg";
import skid3 from "@/assets/equipments/Skid de DégraissageDécapagePassivation/IMG-20200912-WA0042.jpg";

import workshopImage from "@/assets/about-workshop.jpg";
import inspectionImage from "@/assets/IMG_2278.jpg";
import processImage from "@/assets/IMG-20260408-WA0067.jpg";
import labImage from "@/assets/IMG-20240214-WA0000.jpg";
import toolImage from "@/assets/20230329_100358.jpg";
import weldingImage from "@/assets/hero-welding.jpg";

// ── Stage shape ─────────────────────────────────────────────────────────────

export interface EquipmentStage {
  /** Anchor id, also used as the tab key. */
  id: string;
  label: Record<Locale, string>;
  /** Eyebrow above the stage title. */
  tag: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  /** Three concrete applications or capabilities. */
  applications: Record<Locale, readonly string[]>;
  images: string[];
}

export const EQUIPMENT_STAGES: EquipmentStage[] = [
  {
    id: "coupe-preparation",
    label: { fr: "Coupe & Préparation", en: "Cutting & preparation" },
    tag: { fr: "Étape 01", en: "Stage 01" },
    title: {
      fr: "Coupe, cintrage et préparation des tubes",
      en: "Tube cutting, bending and preparation",
    },
    description: {
      fr: "Tout commence par une coupe droite et un chanfrein exact. C'est le geste le moins spectaculaire de l'atelier et celui qui décide de la qualité de la soudure qui suivra.",
      en: "Everything starts with a straight cut and an exact bevel. It is the least spectacular operation in the workshop and the one that decides the quality of the weld that follows.",
    },
    applications: {
      fr: [
        "Coupes automatique et semi-automatique sur tubes inox",
        "Cintrage à froid au vector et au mandrin",
        "Chanfreinage interne calibré pour soudure orbitale",
        "Dresseuse de faces et ébavurage",
      ],
      en: [
        "Automatic and semi-automatic cutting of stainless tubes",
        "Cold bending to a vector and mandrel",
        "Calibrated internal bevel for orbital welding",
        "Facing and deburring",
      ],
    },
    images: [cut1, cut2, cut3, cut4, cut5, cut6, cnc1, cnc2, cnc3],
  },
  {
    id: "soudage",
    label: { fr: "Soudage", en: "Welding" },
    tag: { fr: "Étape 02", en: "Stage 02" },
    title: {
      fr: "Soudage orbital et conventionnel",
      en: "Orbital and conventional welding",
    },
    description: {
      fr: "Douze machines AXXAIR de la coupelle 65 mm au plein diamètre, et des postes conventionnels qualifiés pour les geometries que l'orbital ne sait pas faire.",
      en: "Twelve AXXAIR machines from the 65 mm clamp to full diameter, plus qualified conventional stations for the geometries orbital welding cannot handle.",
    },
    applications: {
      fr: [
        "Soudage orbital de tubes et raccords jusqu'au plein diamètre",
        "Têtes fermées et têtes ouvertes AXXAIR",
        "Soudage conventionnel qualifié (TIG, MIG)",
        "Enregistrement numérique de chaque soudure",
      ],
      en: [
        "Orbital welding of tubes and fittings up to full diameter",
        "AXXAIR closed and open clamps",
        "Qualified conventional welding (TIG, MIG)",
        "Digital recording of every weld",
      ],
    },
    images: [weld1, weld2, weld3, weld4, weld5, weld6, weld7, weld8, weld9, weld10, weld11, weld12],
  },
  {
    id: "finition-polissage",
    label: { fr: "Finition & Polissage", en: "Finishing & polishing" },
    tag: { fr: "Étape 03", en: "Stage 03" },
    title: {
      fr: "Finition interne et polissage des surfaces",
      en: "Internal finishing and surface polishing",
    },
    description: {
      fr: "Une paroi intérieure laissée à la sortie du chalumeau n'est pas prête à l'usage. Le polissage descend la rugosité jusqu'à la valeur que votre procédé exige, et pas une de moins.",
      en: "An inner wall left as it comes off the burner is not ready to be used. Polishing takes the roughness down to the value your process requires, and not one step further.",
    },
    applications: {
      fr: [
        "Polissage mécanique jusqu'à Ra 0,8 µm",
        "Électropolissage jusqu'à Ra 0,4 µm",
        "Déburrage et ébavurage des raccords soudés",
        "Finition des tubes cintrés et des fonds de cuve",
      ],
      en: [
        "Mechanical polishing down to Ra 0.8 µm",
        "Electro-polishing down to Ra 0.4 µm",
        "Deburring of welded fittings",
        "Finishing of bent tubes and vessel heads",
      ],
    },
    images: [cnc4, cnc5, cnc6, processImage, inspectionImage, workshopImage],
  },
  {
    id: "passivation",
    label: { fr: "Passivation", en: "Passivation" },
    tag: { fr: "Étape 04", en: "Stage 04" },
    title: {
      fr: "Dégraissage, décapage et passivation",
      en: "Degreasing, pickling and passivation",
    },
    description: {
      fr: "La soudure laisse une couche d'oxyde de chrome qu'il faut retirer. Le bain de passivation la dissout sans attaquer le métal, et c'est ce qui donne à l'inox sa résistance à la corrosion.",
      en: "The weld leaves a chromium oxide layer that has to be removed. The passivation bath dissolves it without attacking the metal, and that is what gives stainless its corrosion resistance.",
    },
    applications: {
      fr: [
        "Skids de dégraissage et décapage",
        "Passivation chimique et électropolissage",
        "Rinçage à l'eau déminéralisée contrôlé",
        "Contrôle de la teinte de la surface traitée",
      ],
      en: [
        "Degreasing and pickling skids",
        "Chemical passivation and electro-polishing",
        "Controlled rinsing with demineralised water",
        "Inspection of the treated surface colour",
      ],
    },
    images: [skid1, skid2, skid3, labImage, processImage],
  },
  {
    id: "controle-inspection",
    label: { fr: "Contrôle & Inspection", en: "Control & inspection" },
    tag: { fr: "Étape 05", en: "Stage 05" },
    title: {
      fr: "Contrôle visuel et inspection interne",
      en: "Visual control and internal inspection",
    },
    description: {
      fr: "Ce que l'œil ne voit pas sur une soudure, un endoscope le voit. L'inspection interne est la seule façon de savoir ce qu'il reste réellement dans le joint.",
      en: "What the eye cannot see on a weld, an endoscope sees. Internal inspection is the only way to know what actually remains inside the joint.",
    },
    applications: {
      fr: [
        "Endoscopie industrielle avec enregistrement",
        "Contrôle visuel par des inspecteurs qualifiés",
        "Contrôle radiographique via organismes agréés",
        "Rapport d'inspection joint au dossier",
      ],
      en: [
        "Industrial endoscopy with recording",
        "Visual control by qualified inspectors",
        "Radiographic inspection through approved bodies",
        "Inspection report supplied with the dossier",
      ],
    },
    images: [endo1, endo2, endo3, endo4, endo5, gas1, gas2],
  },
  {
    id: "mesure-metrologie",
    label: { fr: "Mesure & Métrologie", en: "Measurement & metrology" },
    tag: { fr: "Étape 06", en: "Stage 06" },
    title: {
      fr: "Mesure, contrôle de gaz et métrologie",
      en: "Measurement, gas testing and metrology",
    },
    description: {
      fr: "Une ligne qui ne se mesure pas ne se qualifie pas. Nous contrôlons la géométrie, la planéité et les paramètres atmosphériques qui comptent pour votre procédé.",
      en: "A line that is not measured cannot be qualified. We check geometry, flatness and the atmospheric parameters that matter to your process.",
    },
    applications: {
      fr: [
        "Contrôle de gaz (O₂, N₂, CO₂, point de rosée)",
        "Métrologie dimensionnelle et planéité",
        "Vérification des jeux et interstices",
        "PV de mesure remis par installation",
      ],
      en: [
        "Gas testing (O2, N2, CO2, dew point)",
        "Dimensional metrology and flatness",
        "Clearance and gap verification",
        "Measurement report issued per installation",
      ],
    },
    images: [gas3, gas4, cnc1, cnc2, labImage, inspectionImage],
  },
  {
    id: "outillage-accessoires",
    label: { fr: "Outillage & Accessoires", en: "Tooling & accessories" },
    tag: { fr: "Étape 07", en: "Stage 07" },
    title: {
      fr: "Outillage, supports et accessoires",
      en: "Tooling, supports and accessories",
    },
    description: {
      fr: "Une ligne se soutient. Supports, brides, colliers, joints et consommables font partie de la livraison au même titre que les tubes eux-mêmes.",
      en: "A line has to be supported. Supports, flanges, clamps, gaskets and consumables are delivered just like the tubes themselves.",
    },
    applications: {
      fr: [
        "Supports et structures métalliques",
        "Brides, colliers et fixations sanitaires",
        "Joints plats, mécaniques et FDA",
        "Consommables de soudure et de polissage",
      ],
      en: [
        "Supports and metal structures",
        "Flanges, clamps and sanitary fixings",
        "Flat, mechanical and FDA gaskets",
        "Welding and polishing consumables",
      ],
    },
    images: [toolImage, workshopImage, weldingImage, labImage, cut6, weld6],
  },
];

/** The stage with this anchor id, or undefined. */
export function findStage(id: string): EquipmentStage | undefined {
  return EQUIPMENT_STAGES.find((stage) => stage.id === id);
}
