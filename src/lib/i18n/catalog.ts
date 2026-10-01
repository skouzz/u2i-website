/**
 * Bilingual string catalog.
 *
 * French is the source language and the site default. English strings live
 * here; anything missing simply falls back to the French value, so the catalog
 * can be filled in incrementally without ever showing a blank.
 *
 * Keys are dotted paths. Add a key to both maps to mark it complete.
 */

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const SOURCE_LOCALE: Locale = "fr";
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_PREFIX: Record<Locale, string> = {
  fr: "",
  en: "/en",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

/** Full UI copy. Keys mirror the French source text structure. */
const fr = {
  // ── Global chrome ────────────────────────────────────────────────────────
  "nav.home": "Accueil",
  "nav.about": "Qui sommes-nous",
  "nav.sectors": "Secteurs",
  "nav.equipment": "Équipements",
  "nav.references": "Références",
  "nav.news": "Actualités",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.close": "Fermer",
  "nav.open": "Ouvrir le menu",
  "nav.callUs": "Appelez-nous",
  "nav.language": "Langue",
  "nav.skipToContent": "Aller au contenu",

  "common.readMore": "En savoir plus",
  "common.discover": "Découvrir",
  "common.seeAll": "Voir tout",
  "common.contactUs": "Nous contacter",
  "common.learnMore": "En savoir plus",
  "common.backHome": "Retour à l'accueil",
  "common.loading": "Chargement…",
  "common.notFound": "Page introuvable",
  "common.notFoundBody": "La page que vous cherchez n'existe pas ou a été déplacée.",
  "common.errorTitle": "Cette page n'a pas pu se charger",
  "common.errorBody":
    "Une erreur est survenue de notre côté. Réessayez ou revenez à l'accueil.",
  "common.retry": "Réessayer",
  "common.unavailable": "Contenu indisponible pour le moment",

  "footer.explore": "Navigation",
  "footer.contact": "Contact",
  "footer.followUs": "Suivez-nous",
  "footer.rights": "Tous droits réservés",
  "footer.legal": "Mentions légales",
  "footer.privacy": "Confidentialité",

  // ── Homepage ─────────────────────────────────────────────────────────────
  "home.hero.eyebrow": "Industriel & Qualification",
  "home.hero.title": "L'exigence de la tuyauterie inox process",
  "home.hero.text":
    "Conception, fabrication et qualification de circuits inox pour les industries pharmacie, agroalimentaire, chimique et cosmétique.",
  "home.hero.ctaPrimary": "Découvrir nos secteurs",
  "home.hero.ctaSecondary": "Nous contacter",
  "home.about.eyebrow": "Qui sommes-nous",
  "home.about.title": "Un partenaire industriel de confiance",
  "home.about.text":
    "U2I Process conçoit, fabrique et qualifie des installations de tuyauterie inox pour les environnements industriels les plus exigeants.",
  "home.services.title": "Nos métiers",
  "home.services.text": "Des solutions complètes, de l'étude à la qualification.",
  "home.stats.title": "U2I Process en chiffres",
  "home.projects.title": "Nos réalisations",
  "home.projects.text": "Découvrez quelques installations réalisées pour nos clients.",
  "home.testimonials.title": "Ils nous font confiance",
  "home.cta.title": "Un projet à réaliser ?",
  "home.cta.text": "Nos ingénieurs vous accompagnent de l'étude à la livraison.",
  "home.cta.button": "Demander un devis",

  // ── About ────────────────────────────────────────────────────────────────
  "about.hero.eyebrow": "Qui sommes-nous",
  "about.hero.title": "Univers Inox Industriel",
  "about.hero.text":
    "Plus de 20 ans d'expertise dans la tuyauterie inox et la soudure orbitale au service de l'industrie.",
  "about.story.title": "Notre histoire",
  "about.values.title": "Nos valeurs",
  "about.values.quality.title": "Qualité",
  "about.values.quality.text":
    "Des haut standard de qualité et un système de management QSE certifié ISO 9001.",
  "about.values.reliability.title": "Fiabilité",
  "about.values.reliability.text":
    "Des délais tenus et des engagements de livraison respectés sur chaque projet.",
  "about.values.expertise.title": "Expertise",
  "about.values.expertise.text":
    "Une équipe d'ingénieurs et de soudeurs orbitaux certifiés AXXAIR.",
  "about.values.service.title": "Service",
  "about.values.service.text":
    "Un interlocuteur dédié du premier échange jusqu'à la réception sur site.",
  "about.workshop.title": "Notre atelier",
  "about.workshop.text":
    "Un atelier intégré équipé de machines de coupe, de dressage et de soudure orbitale.",
  "about.certifications.title": "Certifications & qualifications",
  "about.partners.title": "Nos partenaires",

  // ── Sectors ──────────────────────────────────────────────────────────────
  "sectors.hero.eyebrow": "Secteurs d'activité",
  "sectors.hero.title": "Nos secteurs d'expertise",
  "sectors.hero.text":
    "Une expertise métier adaptée aux exigences de chaque industrie.",
  "sectors.pharma.title": "Industrie pharmaceutique",
  "sectors.pharma.text":
    "Circuits inox hygiéniques, qualification et respect des Bonnes Pratiques de Fabrication.",
  "sectors.food.title": "Agroalimentaire",
  "sectors.food.text":
    "Installations conformes aux exigences d'hygiène et de sécurité alimentaire.",
  "sectors.chemical.title": "Industrie chimique",
  "sectors.chemical.text":
    "Résistance à la corrosion et sécurité pour les procédés chimiques.",
  "sectors.cosmetics.title": "Cosmétique",
  "sectors.cosmetics.text":
    "Circuits inox haute finition pour les chaînes cosmétiques.",
  "sectors.metal.title": "Mobilier métallique",
  "sectors.metal.text": "Conception et fabrication sur mesure de mobilier inox.",
  "sectors.cta.title": "Votre secteur n'est pas listé ?",
  "sectors.cta.text": "Notre équipe étudie toute nouvelle application.",

  // ── Equipment ────────────────────────────────────────────────────────────
  "equipment.hero.eyebrow": "Équipements",
  "equipment.hero.title": "Nos équipements industriels",
  "equipment.hero.text":
    "Partez de notre parc machine ou de votre schéma : nous concevons et réalisons vos installations.",
  "equipment.startFromDrawing.title": "Conception & réalisation",
  "equipment.startFromDrawing.text":
    "De l'étude de votre plan à la livraison de l'installation opérationnelle.",
  "equipment.endoscope.title": "Endoscopie",
  "equipment.endoscope.text":
    "Contrôle visuel des soudures et des surfaces intérieures des circuits.",
  "equipment.cutting.title": "Machine de coupe & rectification",
  "equipment.cutting.text":
    "Découpe et dressage de tubes inox aux dimensions exactes de vos circuits.",
  "equipment.orbital.title": "Soudure orbitale",
  "equipment.orbital.text":
    "Soudure orbitale de haute qualité, reproductible et conforme aux normes du secteur.",
  "equipment.cta.title": "Un équipement spécifique ?",
  "equipment.cta.text": "Dites-nous vos contraintes, nous dliberons une solution.",

  // ── References ───────────────────────────────────────────────────────────
  "references.hero.eyebrow": "Références",
  "references.hero.title": "Nos réalisations & clients",
  "references.hero.text":
    "Un aperçu des industries et projets auxquels nous avons contribué.",
  "references.clients.title": "Nos clients",

  // ── News ─────────────────────────────────────────────────────────────────
  "news.hero.eyebrow": "Actualités",
  "news.hero.title": "Les actualités d'U2I Process",
  "news.hero.text": "Projets, certifications et vie de l'entreprise.",
  "news.list.empty": "Aucun article publié pour le moment.",
  "news.detail.back": "Retour aux actualités",
  "news.detail.publishedOn": "Publié le",
  "news.detail.readTime": "min de lecture",
  "news.detail.relatedTitle": "À lire également",
  "news.detail.notFound": "Article introuvable.",

  // ── Contact ──────────────────────────────────────────────────────────────
  "contact.hero.eyebrow": "Contact",
  "contact.hero.title": "Parlons de votre projet",
  "contact.hero.text":
    "Une question, un besoin, un devis ? Notre équipe vous répond sous 24h.",
  "contact.form.title": "Envoyez-nous un message",
  "contact.form.firstName": "Prénom",
  "contact.form.lastName": "Nom",
  "contact.form.email": "E-mail",
  "contact.form.company": "Société",
  "contact.form.subject": "Objet",
  "contact.form.message": "Votre message",
  "contact.form.required": "Champ obligatoire",
  "contact.form.submit": "Envoyer le message",
  "contact.form.sending": "Envoi en cours…",
  "contact.form.success": "Merci ! Votre message a bien été envoyé.",
  "contact.form.error": "Impossible d'envoyer le message. Merci de réessayer.",
  "contact.info.title": "Nos coordonnées",
  "contact.info.address": "Adresse",
  "contact.info.phone": "Téléphone",
  "contact.info.email": "E-mail",
  "contact.info.hours": "Horaires",
  "contact.info.hoursValue": "Du lundi au vendredi",
  "contact.info.hoursValue2": "8h00 – 17h00",

  // ── CMS pages ────────────────────────────────────────────────────────────
  "cms.notAvailable":
    "Cette page n'est pas encore disponible — elle sera visible dès sa publication dans le dashboard.",
} as const;

const en: Partial<Record<keyof typeof fr, string>> = {
  "nav.home": "Home",
  "nav.about": "About us",
  "nav.sectors": "Industries",
  "nav.equipment": "Equipment",
  "nav.references": "References",
  "nav.news": "News",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.close": "Close",
  "nav.open": "Open menu",
  "nav.callUs": "Call us",
  "nav.language": "Language",
  "nav.skipToContent": "Skip to content",

  "common.readMore": "Read more",
  "common.discover": "Discover",
  "common.seeAll": "See all",
  "common.contactUs": "Contact us",
  "common.learnMore": "Learn more",
  "common.backHome": "Back to home",
  "common.loading": "Loading…",
  "common.notFound": "Page not found",
  "common.notFoundBody": "The page you are looking for doesn't exist or has been moved.",
  "common.errorTitle": "This page failed to load",
  "common.errorBody": "Something went wrong on our end. Try again or head back home.",
  "common.retry": "Try again",
  "common.unavailable": "Content temporarily unavailable",

  "footer.explore": "Navigation",
  "footer.contact": "Contact",
  "footer.followUs": "Follow us",
  "footer.rights": "All rights reserved",
  "footer.legal": "Legal notice",
  "footer.privacy": "Privacy",

  "home.hero.eyebrow": "Industrial & Qualification",
  "home.hero.title": "The standard for process stainless steel piping",
  "home.hero.text":
    "Design, fabrication and qualification of stainless steel systems for pharmaceutical, food, chemical and cosmetic industries.",
  "home.hero.ctaPrimary": "Explore our industries",
  "home.hero.ctaSecondary": "Contact us",
  "home.about.eyebrow": "About us",
  "home.about.title": "A trusted industrial partner",
  "home.about.text":
    "U2I Process designs, fabricates and qualifies stainless steel piping systems for the most demanding industrial environments.",
  "home.services.title": "What we do",
  "home.services.text": "Complete solutions, from engineering to qualification.",
  "home.stats.title": "U2I Process by the numbers",
  "home.projects.title": "Our projects",
  "home.projects.text": "A look at installations delivered for our clients.",
  "home.testimonials.title": "Trusted by our clients",
  "home.cta.title": "Have a project in mind?",
  "home.cta.text": "Our engineers support you from design to delivery.",
  "home.cta.button": "Request a quote",

  "about.hero.eyebrow": "About us",
  "about.hero.title": "Univers Inox Industriel",
  "about.hero.text":
    "Over 20 years of expertise in stainless steel piping and orbital welding for industry.",
  "about.story.title": "Our story",
  "about.values.title": "Our values",
  "about.values.quality.title": "Quality",
  "about.values.quality.text":
    "High quality standards and a QMS certified to ISO 9001.",
  "about.values.reliability.title": "Reliability",
  "about.values.reliability.text":
    "Committed lead times and delivery deadlines honoured on every project.",
  "about.values.expertise.title": "Expertise",
  "about.values.expertise.text": "A team of engineers and AXXAIR-certified orbital welders.",
  "about.values.service.title": "Service",
  "about.values.service.text":
    "A dedicated contact from the first exchange through to on-site acceptance.",
  "about.workshop.title": "Our workshop",
  "about.workshop.text":
    "An integrated workshop with cutting, dressing and orbital welding equipment.",
  "about.certifications.title": "Certifications & qualifications",
  "about.partners.title": "Our partners",

  "sectors.hero.eyebrow": "Industries",
  "sectors.hero.title": "Our industries of expertise",
  "sectors.hero.text": "Sector expertise matched to the requirements of each industry.",
  "sectors.pharma.title": "Pharmaceutical industry",
  "sectors.pharma.text":
    "Hygienic stainless steel circuits, qualification and GMP compliance.",
  "sectors.food.title": "Food & beverage",
  "sectors.food.text":
    "Installations that meet hygiene and food safety requirements.",
  "sectors.chemical.title": "Chemical industry",
  "sectors.chemical.text":
    "Corrosion resistance and safety for chemical processes.",
  "sectors.cosmetics.title": "Cosmetics",
  "sectors.cosmetics.text": "High-finish stainless steel circuits for cosmetic production lines.",
  "sectors.metal.title": "Metal furniture",
  "sectors.metal.text": "Design and custom fabrication of stainless steel furniture.",
  "sectors.cta.title": "Don't see your industry?",
  "sectors.cta.text": "Our team studies every new application.",

  "equipment.hero.eyebrow": "Equipment",
  "equipment.hero.title": "Our industrial equipment",
  "equipment.hero.text":
    "Start from our machine park or from your drawing: we design and build your installation.",
  "equipment.startFromDrawing.title": "Design & fabrication",
  "equipment.startFromDrawing.text":
    "From reviewing your plans to delivering a fully operational installation.",
  "equipment.endoscope.title": "Endoscopy",
  "equipment.endoscope.text":
    "Visual inspection of welds and the inner surfaces of circuits.",
  "equipment.cutting.title": "Cutting & dressing machine",
  "equipment.cutting.text":
    "Cutting and dressing stainless steel tubes to your exact circuit dimensions.",
  "equipment.orbital.title": "Orbital welding",
  "equipment.orbital.text":
    "High-quality, repeatable orbital welding compliant with industry standards.",
  "equipment.cta.title": "Need specific equipment?",
  "equipment.cta.text": "Tell us your constraints and we'll propose a solution.",

  "references.hero.eyebrow": "References",
  "references.hero.title": "Our projects & clients",
  "references.hero.text": "A look at the industries and projects we contributed to.",
  "references.clients.title": "Our clients",

  "news.hero.eyebrow": "News",
  "news.hero.title": "U2I Process news",
  "news.hero.text": "Projects, certifications and company life.",
  "news.list.empty": "No articles published yet.",
  "news.detail.back": "Back to news",
  "news.detail.publishedOn": "Published on",
  "news.detail.readTime": "min read",
  "news.detail.relatedTitle": "Related articles",
  "news.detail.notFound": "Article not found.",

  "contact.hero.eyebrow": "Contact",
  "contact.hero.title": "Let's talk about your project",
  "contact.hero.text":
    "A question, a need, a quote? Our team replies within 24 hours.",
  "contact.form.title": "Send us a message",
  "contact.form.firstName": "First name",
  "contact.form.lastName": "Last name",
  "contact.form.email": "Email",
  "contact.form.company": "Company",
  "contact.form.subject": "Subject",
  "contact.form.message": "Your message",
  "contact.form.required": "Required field",
  "contact.form.submit": "Send message",
  "contact.form.sending": "Sending…",
  "contact.form.success": "Thank you! Your message has been sent.",
  "contact.form.error": "We couldn't send your message. Please try again.",
  "contact.info.title": "Contact details",
  "contact.info.address": "Address",
  "contact.info.phone": "Phone",
  "contact.info.email": "Email",
  "contact.info.hours": "Opening hours",
  "contact.info.hoursValue": "Monday to Friday",
  "contact.info.hoursValue2": "8:00 – 17:00",

  "cms.notAvailable":
    "This page is not available yet — it will appear once published from the dashboard.",
};

export type MessageKey = keyof typeof fr;

const catalog: Record<Locale, Partial<Record<MessageKey, string>>> = { fr, en };

/** Translate a key. Falls back to French, then to the key itself. */
export function translate(locale: Locale, key: MessageKey): string {
  return catalog[locale]?.[key] ?? fr[key] ?? key;
}

/** True when a key has a real value in the given locale (not a fallback). */
export function hasTranslation(locale: Locale, key: MessageKey): boolean {
  if (locale === SOURCE_LOCALE) return true;
  return typeof catalog[locale]?.[key] === "string";
}

/** Keys still missing a real value in the given locale. */
export function missingKeys(locale: Locale): MessageKey[] {
  if (locale === SOURCE_LOCALE) return [];
  return (Object.keys(fr) as MessageKey[]).filter((k) => !hasTranslation(locale, k));
}
