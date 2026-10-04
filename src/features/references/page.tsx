import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { cmsApi, type CmsReference } from "@/lib/cms";
import { useI18n } from "@/lib/i18n";
import {
  BUNDLED_CERTIFICATIONS,
  BUNDLED_PARTNERS,
  type BundledReference,
} from "@/lib/references-bundled";
import referencesHeroImage from "@/assets/axxair-1.jpg";

export function ReferencesPage() {
  const { locale, t } = useI18n();

  // Admin-managed references take over as soon as any are saved; until then the
  // bundled logo list renders, so the page is never empty.
  const { data } = useQuery({
    queryKey: ["cms", "references", locale],
    queryFn: () => cmsApi.references(locale),
    staleTime: 60_000,
  });

  const managed = data?.items ?? [];

  /**
   * Managed rows and the logos bundled in the JS are MERGED, not alternatives.
   *
   * An earlier version returned the managed list whenever it was non-empty and
   * fell back to the bundled logos only when it was empty — so adding a single
   * new reference made every pre-existing logo disappear.
   *
   * A managed row shadows the bundled logo carrying the same image, whether it
   * is visible or hidden: that is what lets an admin hide or retitle a logo
   * that came from the bundle instead of having it silently reappear.
   */
  const toGrid = (kind: CmsReference["kind"], fallback: BundledReference[]): BundledReference[] => {
    const ofKind = managed.filter((r) => r.kind === kind);
    const shadowed = new Set(ofKind.map((r) => r.imageUrl).filter(Boolean) as string[]);

    const rows: BundledReference[] = ofKind
      .filter((r) => r.isVisible !== false && r.imageUrl)
      .map((r) => ({ title: r.title, image: r.imageUrl as string }));

    for (const bundled of fallback) {
      if (!shadowed.has(bundled.image)) rows.push(bundled);
    }
    return rows;
  };

  const partners = toGrid("partner", BUNDLED_PARTNERS);
  const certifications = toGrid("certification", BUNDLED_CERTIFICATIONS);

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
              {partners.map((partner, index) => (
                <div
                  // Managed rows share no id here, so index the key to survive
                  // duplicates without React key collisions between the two
                  // data sources.
                  key={`${partner.title}-${index}`}
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
                  key={`${cert.title}-${index}`}
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
