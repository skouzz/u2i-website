import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { cmsApi, type CmsReference } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import referencesHeroImage from "@/assets/axxair-1.jpg";
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

import cert1 from "@/assets/certif/Certificat-de-formation-Axxair-BOUKER-AMEN-ALLAH_page-0001_001-scaled.jpg";
import cert2 from "@/assets/certif/Certificat-de-formation-Axxair-IMED-MANFOUKH_page-0001_001-scaled.jpg";
import cert3 from "@/assets/certif/Certificat-de-formation-Axxair-NABIL-SLAMA_page-0001_001-scaled.jpg";
import cert4 from "@/assets/certif/CERTIFICATE-9K-UNIVERS-U2I_001.jpg";
import cert5 from "@/assets/certif/CERTIFICATE-Official-distributor_page-0001_001-scaled.jpg";
import cert6 from "@/assets/certif/IMG_8071.jpg";
import cert7 from "@/assets/certif/iso-1.png";
import cert8 from "@/assets/certif/UIT-officiel-distributeur-_page-0001_001-1.jpg";

/** Logos coded into the bundle — used until an admin saves references. */
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

/** Certificates coded into the bundle — same fallback rule as above. */
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

export function ReferencesPage() {
  const { locale, t } = useI18n();

  // Admin-managed references take over as soon as any are saved; until then the
  // bundle's logo list renders, so the page is never empty.
  const { data } = useQuery({
    queryKey: ["cms", "references", locale],
    queryFn: () => cmsApi.references(locale),
    staleTime: 60_000,
  });

  const managed = data?.items ?? [];
  const managedPartners = managed.filter((r) => r.kind === "partner" && r.imageUrl);
  const managedCertifications = managed.filter((r) => r.kind === "certification" && r.imageUrl);

  const partners =
    managedPartners.length > 0
      ? managedPartners.map((r: CmsReference) => ({ title: r.title, image: r.imageUrl as string }))
      : PARTNER_LOGOS;

  const certifications =
    managedCertifications.length > 0
      ? managedCertifications.map((r: CmsReference) => ({
          title: r.title,
          image: r.imageUrl as string,
        }))
      : CERTIFICATIONS;

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      <PageHero
        id="references"
        breadcrumb={t("references.hero.eyebrow")}
        eyebrow={t("references.hero.eyebrow2")}
        title={
          <>
            {t("references.hero.titleLine1")}
            <br />
            <span>{t("references.hero.titleLine2")}</span>
          </>
        }
        description={t("references.hero.text")}
        linkLabel={t("common.discover")}
        linkHref="#partenaires"
        image={referencesHeroImage}
        imageAlt={t("references.alt.hero")}
        imagePosition="center 52%"
      />

      <main>
        <section className="py-12 sm:py-16" id="partenaires">
          <div className="wrap">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0141c]">
                  {t("references.partners.eyebrow")}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {t("references.partners.title")}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                {t("references.partners.text")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {partners.map((partner) => (
                <div
                  key={partner.title}
                  className="group flex h-28 items-center justify-center border border-slate-200 bg-white p-4 transition duration-200 hover:border-[#e0141c]/50 hover:shadow-md sm:h-32"
                >
                  <img
                    src={partner.image}
                    alt={partner.title}
                    loading="lazy"
                    className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12 sm:py-16">
          <div className="wrap">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e0141c]">
                  {t("references.quality.eyebrow")}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {t("references.quality.title")}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                {t("references.quality.text")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certifications.map((cert, index) => (
                <article
                  key={cert.title}
                  className="group overflow-hidden border border-slate-200 bg-[#f8fafb] transition-shadow hover:shadow-lg"
                >
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-white p-4 sm:h-64">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center bg-white text-xs font-bold text-slate-600 shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <BadgeCheck className="absolute right-3 top-3 h-5 w-5 text-[#e0141c]" />
                  </div>
                  <div className="flex min-h-14 items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-semibold leading-5 text-slate-800">{cert.title}</h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#e0141c]" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
