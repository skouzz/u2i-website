/**
 * Logo sets shipped with the bundle.
 *
 * These predate the CMS references feature: they were hardcoded in the public
 * page and rendered whenever the database had no managed rows. They are kept
 * here so both sides share one source of truth — the public pages still fall
 * back to them, and the dashboard's "importer" button seeds the editor with
 * them so the original logos become editable without being re-entered by hand.
 *
 * Split three ways, matching the three registers the site shows:
 *
 *   BUNDLED_CLIENTS       the manufacturers we built lines for. Authored
 *                         grouped by industry for provenance, but the public
 *                         page renders BUNDLED_CLIENTS_FLAT as ONE grid — a
 *                         logo already says which sector it belongs to, so
 *                         splitting them only added headings
 *   BUNDLED_PARTNERS      equipment and technology suppliers — the companies
 *                         whose machines and know-how we resell and apply
 *   BUNDLED_CERTIFICATIONS quality certificates and training diplomas
 *
 * The client/partner line is the one that matters: a buyer checking whether we
 * have done work like theirs wants the manufacturers, and a buyer checking
 * whether we can service the AXXAIR clamp on it wants the distributor.
 */
import sanofiLogoImage from "@/assets/partners/Sanofi.png";
import hikmaLogoImage from "@/assets/partners/LOGO HIKMA.jpg";
import saiphLogoImage from "@/assets/partners/LOGO SAIPH.png";
import teriakLogoImage from "@/assets/partners/LOGO TERIAK.png";
import unimedLogoImage from "@/assets/partners/UNIMED LOGO .png";
import deliceLogoImage from "@/assets/partners/LOGO DELICE.jpg";
import logoBerg from "@/assets/partners/Berg-Life-Sciences-295x300.jpg";
import logoDarEssaydali from "@/assets/partners/LOGO-DAR_ESSAYDALI_94d6073d8c-1-300x280.png";
import logoMedika from "@/assets/partners/LOGO-MEDIKA-300x269.png";
import logoMedis from "@/assets/partners/LOGO-MediS-300x264.png";
import logoCogia from "@/assets/partners/cogia-logo.png";
import logoLmp from "@/assets/partners/logo-LMP-291x300.jpg";
import logoMeva from "@/assets/partners/logo-MEVA-150x150.jpg";
import logoPharmaDearm from "@/assets/partners/logo-PHARMA-DEARM-296x300.png";
import logoAdwya from "@/assets/partners/logo-adwya--300x291.png";
import logoThera from "@/assets/partners/logo-thera-400-150x150.png";
import logoOpella from "@/assets/partners/opella-1-300x278.png";
import logoWinthrop from "@/assets/partners/winthrop-1-300x296.jpg";
import logoDorcas from "@/assets/partners/dorcas-logo-300x225.png";
import logoSteripharm from "@/assets/partners/LOGO-STERIPHARM-300x268.png";
import logoPierreFabre from "@/assets/partners/Pierre-fabre-logo-1-300x288.png";

import axxairLogo from "@/assets/partners/AXXAIR-logo.png";
import cevaLogoImage from "@/assets/partners/LOGO_CEVA_SANTE_ANIMALE.jpg";
import logoEnex from "@/assets/partners/Enex-we-know-how-logo-retina-300x262.png";
import logoAdvancs from "@/assets/partners/LOGO-ADVANCS-150x150.jpeg";
import logoSartorius from "@/assets/partners/sartorius-logo-vector-2-300x288.png";
import logoTetrapak from "@/assets/partners/tetrapak-logo-screen-400-150x150.png";
import logoBwt from "@/assets/partners/BWT.png";

import cert1 from "@/assets/certif/Certificat-de-formation-Axxair-BOUKER-AMEN-ALLAH_page-0001_001-scaled.jpg";
import cert2 from "@/assets/certif/Certificat-de-formation-Axxair-IMED-MANFOUKH_page-0001_001-scaled.jpg";
import cert3 from "@/assets/certif/Certificat-de-formation-Axxair-NABIL-SLAMA_page-0001_001-scaled.jpg";
import cert4 from "@/assets/certif/CERTIFICATE-9K-UNIVERS-U2I_001.jpg";
import cert5 from "@/assets/certif/CERTIFICATE-Official-distributor_page-0001_001-scaled.jpg";
import cert6 from "@/assets/certif/IMG_8071.jpg";
import cert7 from "@/assets/certif/iso-1.png";
import cert8 from "@/assets/certif/UIT-officiel-distributeur-_page-0001_001-1.jpg";

export interface BundledReference {
  title: string;
  image: string;
}

/**
 * Client logos grouped by industry.
 *
 * The group key is an industry slug from `src/lib/site/ia.ts`, so the grouping
 * stays in step with the navigation without duplicating slugs here. The public
 * page no longer renders per group — it uses BUNDLED_CLIENTS_FLAT — but the
 * grouping is kept because it documents where each logo came from and keeps the
 * list readable while editing it.
 */
export interface BundledClientGroup {
  /** Matches a section entry slug in the Industries IA. */
  industrySlug: string;
  label: string;
  clients: BundledReference[];
}

/** Manufacturers we have built process lines for, grouped by sector. */
export const BUNDLED_CLIENTS: BundledClientGroup[] = [
  {
    industrySlug: "pharmaceutique",
    label: "Pharmaceutique",
    clients: [
      { title: "Sanofi", image: sanofiLogoImage },
      { title: "Hikma", image: hikmaLogoImage },
      { title: "Saiph", image: saiphLogoImage },
      { title: "Teriak", image: teriakLogoImage },
      { title: "UNIMED", image: unimedLogoImage },
      { title: "Berg Life Sciences", image: logoBerg },
      { title: "Medika", image: logoMedika },
      { title: "MediS", image: logoMedis },
      { title: "Pharma Dearm", image: logoPharmaDearm },
      { title: "Adwya", image: logoAdwya },
      { title: "Thera", image: logoThera },
      { title: "Opella", image: logoOpella },
      { title: "Winthrop", image: logoWinthrop },
      { title: "Steripharm", image: logoSteripharm },
      { title: "Pierre Fabre", image: logoPierreFabre },
    ],
  },
  {
    industrySlug: "agroalimentaire",
    label: "Agroalimentaire",
    clients: [
      { title: "Délice", image: deliceLogoImage },
      { title: "Cogia", image: logoCogia },
      { title: "Dorcas", image: logoDorcas },
      { title: "Dar Essaydali", image: logoDarEssaydali },
      { title: "MEVA", image: logoMeva },
      { title: "LMP", image: logoLmp },
    ],
  },
];

/**
 * Every bundled client logo, flattened.
 *
 * This is what the public clients grid and the dashboard importer both consume;
 * the industry grouping above is provenance, not presentation.
 */
export const BUNDLED_CLIENTS_FLAT: BundledReference[] = BUNDLED_CLIENTS.flatMap(
  (group) => group.clients,
);

/** Technology suppliers, equipment makers and official distributors. */
export const BUNDLED_PARTNERS: BundledReference[] = [
  { title: "AXXAIR", image: axxairLogo },
  { title: "Enex", image: logoEnex },
  { title: "BWT", image: logoBwt },
  { title: "Tetra Pak", image: logoTetrapak },
  { title: "Sartorius", image: logoSartorius },
  { title: "CEVA Santé Animale", image: cevaLogoImage },
  { title: "Advancs", image: logoAdvancs },
];

/** Certificates shown in the “Certifications” grid. */
export const BUNDLED_CERTIFICATIONS: BundledReference[] = [
  { title: "Certificat Axxair - Bouker Amen Allah", image: cert1 },
  { title: "Certificat Axxair - Imed Manfoukh", image: cert2 },
  { title: "Certificat Axxair - Nabil Slama", image: cert3 },
  { title: "Certificat 9K Univers U2I", image: cert4 },
  { title: "Official Distributor Certificate", image: cert5 },
  { title: "Certification IMG_8071", image: cert6 },
  { title: "ISO 9001", image: cert7 },
  { title: "Official Distributor UIT", image: cert8 },
];

/**
 * Build an editable title from an image path.
 *
 * An admin who uploads a logo and saves without typing a name used to lose the
 * row entirely, because the API rejects title-less entries. Deriving a readable
 * label from the filename keeps the upload instead of silently dropping it.
 */
export function titleFromImageUrl(url: string): string {
  const withoutQuery = url.split("?")[0].split("#")[0];
  const file = withoutQuery.split("/").pop() ?? "";
  const stem = file.replace(/\.[a-z0-9]+$/i, "");
  // Drop the "-300x200" style suffix Vite/media tooling appends, plus any
  // hash fragment, then normalise separators into spaces.
  const cleaned = stem
    .replace(/-[a-z0-9]{2,4}x[a-z0-9]{2,4}$/i, "")
    .replace(/_[a-z0-9]{8}$/i, "")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Sans titre";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
