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
  "about.story.p1":
    "Nos ingénieurs et techniciens mettent leur expérience des secteurs pharmaceutique, agroalimentaire et chimique au service de projets aux exigences élevées. Nous adaptons chaque intervention aux besoins du client et aux réalités de son site.",
  "about.story.p2":
    "De l’étude initiale à la maintenance, une même équipe peut suivre les différentes étapes et garder le fil de votre projet.",
  "about.method.titleLine1": "Du premier plan",
  "about.method.titleLine2": "à la mise en service.",
  "about.workshop.text":
    "Un bureau d’études, un atelier de préfabrication et des moyens de contrôle réunis autour de vos installations.",
  "about.location": "Sousse, Tunisie",
  "about.quality.text":
    "Nos interventions s’appuient sur une démarche documentaire et des contrôles adaptés aux exigences de vos installations, notamment dans le secteur pharmaceutique.",
  "about.partner.title": "Un partenariat de confiance",
  "about.partner.text":
    "Des solutions de coupe et de soudure orbitale, accompagnées par une équipe technique spécialisée.",
  "about.cta.sectors": "Explorer nos secteurs",
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
  "about.workshop.intro":
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
  "equipment.cta.title": "Un équipement spécifique ?",
  "equipment.hero.eyebrow2": "Notre parc machines",
  "equipment.hero.titleLine1": "La précision",
  "equipment.hero.titleLine2": "en action.",
  "equipment.hero.alt": "Atelier de fabrication U2I",
  "equipment.section.eyebrow": "Parc technique",
  "equipment.section.titleLine1": "Les équipements,",
  "equipment.section.titleLine2": "dans le détail.",
  "equipment.section.aria": "Familles d’équipements",
  "equipment.cta.text": "Dites-nous vos contraintes, nous vous proposerons une solution.",

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

  // ── Home — hero slides ───────────────────────────────────────────────────
  "home.slide1.label": "Tuyauterie & Soudure",
  "home.slide1.title":
    "La précision continue de guider l'ambition de Groupe Univers Inox",
  "home.slide2.label": "Soudure Orbitale",
  "home.slide2.title":
    "Partenaire officiel AXXAIR — une solution complète au service des industries à haute exigence.",
  "home.slide2.date": "Depuis 2015",
  "home.slide3.label": "Agroalimentaire",
  "home.slide3.title":
    "Tuyauteries inox conçues pour les normes d'hygiène les plus strictes.",
  "home.slide3.date": "Pharma · Agro · Chimie",
  "home.slide4.label": "Nouvel Atelier",
  "home.slide4.title":
    "Un nouvel atelier de préfabrication pour accélérer nos projets industriels.",
  "home.slide4.date": "Akouda, Tunisie",
  "home.alt.logo": "Univers Inox Industriel",
  "home.alt.axxair": "AXXAIR",

  // ── Home — sectors tiles ─────────────────────────────────────────────────
  "home.sector.pharma.tag": "Exigence Pharma",
  "home.sector.pharma.title": "Pharmaceutique",
  "home.sector.food.tag": "Qualité Alimentaire",
  "home.sector.food.title": "Agroalimentaire",
  "home.sector.chemical.tag": "Procédés Sensibles",
  "home.sector.chemical.title": "Chimique",
  "home.sector.cosmetics.tag": "Lignes Propres",
  "home.sector.cosmetics.title": "Cosmétique",
  "home.sector.furniture.tag": "Sur Mesure",
  "home.sector.furniture.title": "Mobilier inox",

  // ── Home — section copy ──────────────────────────────────────────────────
  "home.process.title": "Nos processus de bout en bout",
  "home.process.text":
    "Découvrez nos processus de bout en bout, garantissant la qualité, la précision et la traçabilité de chaque installation.",
  "home.who.title": "Qui sommes nous",
  "home.who.text1":
    "Tunisie. Nous sommes spécialisés en chaudronnerie, travaux de soudure et tuyauterie industrielle pour les secteurs les plus exigeants.",
  "home.who.text2":
    "Notre personnel constitué d'équipe d'ingénieurs et des techniciens spécialisés et formés vous accompagne à chaque étape.",
  "home.who.text3":
    "Nous assurons l'études, la préfabrication en atelier, les travaux sur site, la mise en service, la maintenance et l'assistance.",
  "home.who.cta": "Nous contacter",
  "home.expertise.title": "Nos Domaines d'Expertise",
  "home.expertise.text":
    "Découvrez nos solutions industrielles adaptées à chaque secteur, alliant haute technicité et respect des normes.",
  "home.expertise.cta": "Voir nos réalisations",
  "home.precision.title": "Haute Précision",
  "home.machines.title": "Notre Parc Machines",
  "home.machines.text":
    "Découvrez nos équipements de dernière génération, conçus pour répondre aux exigences les plus strictes de l'industrie.",
  "home.machines.cta": "Voir tout notre parc machines",
  "home.axxair": "Partenaire officiel AXXAIR depuis 2015",
  "home.certs.title": "Certifications",
  "home.certs.text":
    "Nos attestations officielles, formations et homologations qui garantissent la conformité de nos prestations.",
  "home.certs.official": "Certification Officielle",
  "home.certs.label": "Certification",
  "home.presentation.title": "Présentation",
  "home.groupName": "Groupe Univers Inox",
  "home.certs.zoom": "Cliquer pour agrandir",
  "home.refs.cta": "Découvrir toutes nos références",
  "home.aria.previous": "Précédent",
  "home.aria.next": "Suivant",

  // ── Equipment catalogue ──────────────────────────────────────────────────
  "equipment.item.endoscopie": "Endoscopie",
  "equipment.item.controleGaz": "Contrôle de gaz",
  "equipment.item.coupe": "Coupe rectification",
  "equipment.item.orbital": "Soudure orbitale",
  "equipment.item.commande": "Commande numérique",
  "equipment.item.skid": "Skid Dégraissage",
  "equipment.precision": "Haute précision",
  "equipment.expertise": "Expertise",
  "equipment.orbital.title": "Soudure orbitale",
  "equipment.orbital.tag": "Assemblage de précision",
  "equipment.orbital.desc":
    "Un parc de générateurs et de têtes de soudage orbitale pour réaliser des assemblages réguliers sur les réseaux inox. Le procédé est adapté aux lignes process qui demandent maîtrise du geste, répétabilité et traçabilité.",
  "equipment.orbital.app1": "Assemblage de tubes inox",
  "equipment.orbital.app2": "Têtes ouvertes et fermées",
  "equipment.orbital.app3": "Réseaux process et fluides propres",
  "equipment.cutting.title": "Coupe & rectification",
  "equipment.cutting.tag": "Préparation des tubes",
  "equipment.cutting.desc":
    "Des machines dédiées à la coupe orbitale et au dressage de face préparent les extrémités avant assemblage. Une coupe régulière et des faces bien préparées facilitent l’alignement et la qualité de la soudure.",
  "equipment.cutting.app1": "Coupe orbitale de tubes",
  "equipment.cutting.app2": "Dressage des extrémités",
  "equipment.cutting.app3": "Préparation avant soudage",
  "equipment.cnc.title": "Commande numérique",
  "equipment.cnc.tag": "Usinage en atelier",
  "equipment.cnc.desc":
    "Les équipements à commande numérique accompagnent la préparation et la fabrication de pièces en atelier. Ils contribuent à produire des éléments adaptés aux dimensions et à la géométrie attendues sur chaque installation.",
  "equipment.cnc.app1": "Préparation de pièces",
  "equipment.cnc.app2": "Fabrication en atelier",
  "equipment.cnc.app3": "Répétabilité des opérations",
  "equipment.gas.title": "Contrôle de gaz",
  "equipment.gas.tag": "Maîtrise de l’inertage",
  "equipment.gas.desc":
    "Les analyseurs de gaz servent à vérifier l’atmosphère de protection pendant les opérations de soudage. Le suivi de l’oxygène résiduel aide à maîtriser l’inertage et à préserver les surfaces internes des tubes.",
  "equipment.gas.app1": "Vérification de l’inertage",
  "equipment.gas.app2": "Mesure de l’oxygène résiduel",
  "equipment.gas.app3": "Contrôle pendant le soudage",
  "equipment.endoscope.title": "Endoscopie",
  "equipment.endoscope.tag": "Inspection visuelle",
  "equipment.endoscope.desc":
    "L’inspection endoscopique permet d’observer l’intérieur des zones difficiles d’accès après fabrication. Elle complète le contrôle visuel des soudures et apporte un regard direct sur les surfaces internes des réseaux.",
  "equipment.endoscope.app1": "Inspection de zones internes",
  "equipment.endoscope.app2": "Contrôle visuel des soudures",
  "equipment.endoscope.app3": "Accès aux géométries difficiles",
  "equipment.skid.title": "Skid de traitement",
  "equipment.skid.tag": "Nettoyage & passivation",
  "equipment.skid.desc":
    "Les skids de circulation accompagnent les opérations de dégraissage, de décapage et de passivation des réseaux inox. Le traitement de surface contribue à la propreté des installations et à la restauration de leur couche passive.",
  "equipment.skid.app1": "Dégraissage des réseaux",
  "equipment.skid.app2": "Décapage et passivation",
  "equipment.skid.app3": "Circulation des solutions de traitement",

  // ── About ────────────────────────────────────────────────────────────────
  "about.hero.eyebrow2": "Univers Inox Industriel · depuis 2015",
  "about.story.text":
    "Une équipe de terrain, des moyens dédiés et une exigence constante, de l'étude à la mise en service.",
  "about.svc.engineering.title": "Études & ingénierie",
  "about.svc.engineering.text":
    "Analyse de vos besoins, conception 3D et notes de calcul.",
  "about.svc.fabrication.title": "Fabrication & installation",
  "about.svc.fabrication.text":
    "Préfabrication en atelier, cintrage, soudure et montage sur site.",
  "about.svc.control.title": "Contrôle & maintenance",
  "about.svc.control.text":
    "Endoscopie, essais de pression et maintenance préventive.",
  "about.who.text1":
    "Basés en Tunisie, nous sommes spécialisés en chaudronnerie, travaux de soudure et tuyauterie industrielle pour les secteurs les plus exigeants.",
  "about.who.text2":
    "Notre personnel, constitué d'ingénieurs et de techniciens spécialisés et formés, vous accompagne à chaque étape.",
  "about.who.text3":
    "Nous assurons l'étude, la préfabrication en atelier, les travaux sur site, la mise en service, la maintenance et l'assistance.",
  "about.step.study.title": "Étudier",
  "about.step.study.text": "Vos besoins, vos plans et les contraintes du process.",
  "about.step.prefab.title": "Préfabriquer",
  "about.step.prefab.text": "Les ensembles inox préparés et contrôlés en atelier.",
  "about.step.install.title": "Installer",
  "about.step.install.text": "Le montage et le raccordement sur votre site industriel.",
  "about.step.qualify.title": "Qualifier",
  "about.step.qualify.text": "Les contrôles, la mise en service et le dossier technique.",
  "about.stat.sales.title": "Chargés d'affaires",
  "about.stat.sales.text": "Un suivi de projet au plus près du terrain.",
  "about.stat.design.title": "Postes de conception 3D",
  "about.stat.design.text": "Un bureau d'études intégré.",
  "about.stat.area.title": "m² d'atelier",
  "about.stat.area.text": "Un espace dédié à la préfabrication inox.",
  "about.cert.lab.title": "Laboratoires & essais",
  "about.cert.lab.text": "Mise au point et vidéo-endoscopie.",
  "about.cert.machines.title": "Parc machines intégré",
  "about.cert.machines.text": "Coupe, dressage et soudure orbitale.",
  "about.cap.engineering.title": "Études & ingénierie",
  "about.cap.engineering.intro":
    "Dimensionner juste, anticiper les contraintes et préparer un chantier maîtrisé.",
  "about.cap.engineering.i1": "Études, conseils et analyse P&ID",
  "about.cap.engineering.i2": "Plans 2D AutoCAD et conception 3D SolidWorks",
  "about.cap.engineering.i3": "Dimensionnements et notes de calcul",
  "about.cap.fabrication.title": "Fabrication & installation",
  "about.cap.fabrication.intro":
    "Un savoir-faire inox mobilisé en atelier et directement sur votre site.",
  "about.cap.fabrication.i1": "Tuyauterie process et chaudronnerie inox",
  "about.cap.fabrication.i2": "Préfabrication, soudure et montage sur site",
  "about.cap.fabrication.i3": "Conformité aux normes et règles de sécurité",
  "about.cap.fabrication.i4": "Dégraissage, décapage et passivation",
  "about.cap.control.title": "Contrôle & maintenance",
  "about.cap.control.intro":
    "Des équipements et des équipes pour vérifier, qualifier et faire durer vos réseaux.",
  "about.cap.control.i1": "Électrotechnique et automatismes",
  "about.cap.control.i2": "Contrôle visuel et vidéo-endoscopique",
  "about.cap.control.i3": "Mise en service et qualification",
  "about.cap.control.i4": "Maintenance des réseaux inox et assistance technique",
  "about.res.machines.text": "Découpe laser, coupe orbitale et plieuses.",
  "about.section.services": "Ce que nous faisons",
  "about.section.services.title": "Une expertise, à chaque étape.",
  "about.check.1": "Contrôle des fournitures à réception",
  "about.check.2": "Suivi des opérations et de la sous-traitance (FAT / SAT)",
  "about.check.3": "Traçabilité documentaire des matériaux et des soudures",
  "about.check.4": "Contrôles visuels et vidéo-endoscopiques",
  "about.check.5": "Remise du dossier technique de l’installation",

  // ── Sectors ──────────────────────────────────────────────────────────────
  "sectors.item.pharma.title": "Pharmaceutique",
  "sectors.item.food.title": "Agroalimentaire",
  "sectors.item.chemical.title": "Chimie",
  "sectors.item.cosmetics.title": "Cosmétique",
  "sectors.item.furniture.title": "Mobilier inox",
  "sectors.item.service.title": "Interventions industrielles",
  "sectors.details": "Détails",
  "sectors.matchTitle": "Nos réalisations",
  "sectors.hero.line2a": "qui font avancer",
  "sectors.hero.line1": "Des savoir-faire",
  "sectors.hero.line2b": "l'industrie.",
  "sectors.intro.aria": "Notre expertise",
  "sectors.intro.label": "Nos domaines d’activité",
  "sectors.intro.line1": "La bonne expertise.",
  "sectors.intro.line2": "Au bon endroit.",
  "sectors.gallery.empty": "De nouvelles réalisations arrivent bientôt.",
  "sectors.pharma.tag": "01 / Procédés stériles",
  "sectors.pharma.desc":
    "Des réseaux de fluides conçus pour les environnements où chaque détail compte. U2I réalise des lignes process en inox, soudées avec précision et pensées pour faciliter le nettoyage, la qualification et la traçabilité.",
  "sectors.pharma.focus": "Soudure orbitale · Réseaux process · Traçabilité",
  "sectors.food.tag": "02 / Hygiène maîtrisée",
  "sectors.food.desc":
    "Des installations fiables pour transporter et transformer les produits alimentaires. Les matériaux, les soudures et les finitions sont sélectionnés pour répondre aux exigences d’hygiène et aux cycles de nettoyage en place.",
  "sectors.food.focus": "Réseaux inox · NEP / CIP · Finitions sanitaires",
  "sectors.chemical.tag": "03 / Fluides exigeants",
  "sectors.chemical.desc":
    "Pour les procédés chimiques, la maîtrise des fluides et la robustesse des installations sont essentielles. Nous adaptons les réseaux, les assemblages et les matériaux aux contraintes spécifiques de chaque process.",
  "sectors.chemical.focus": "Transfert de fluides · Inox · Sécurité process",
  "sectors.cosmetics.tag": "04 / Pureté du produit",
  "sectors.cosmetics.desc":
    "Des lignes de fabrication soignées pour les produits sensibles. La qualité des états de surface, la régularité des soudures et la facilité d’entretien accompagnent la pureté du produit à chaque étape.",
  "sectors.cosmetics.focus": "Surfaces maîtrisées · Lignes propres · Inox",
  "sectors.furniture.tag": "05 / Fabrication sur mesure",
  "sectors.furniture.desc":
    "Du mobilier pensé pour le quotidien des laboratoires et des zones de production : tables, chariots, supports et structures inox conçus selon vos espaces, vos usages et vos contraintes de nettoyage.",
  "sectors.furniture.focus": "Tables · Chariots · Structures sur mesure",
  "sectors.service.tag": "06 / Du terrain à l’atelier",
  "sectors.service.desc":
    "De la préparation en atelier à l’intervention sur site, nos équipes mobilisent leur savoir-faire en tuyauterie, soudure et équipements spécialisés pour accompagner vos projets industriels de bout en bout.",
  "sectors.service.focus": "Tuyauterie · Soudage · Contrôle · Mise en service",

  // ── References ───────────────────────────────────────────────────────────
  "references.certs.title": "Certifications",
  "references.certs.text":
    "Des partenaires de confiance et des certifications qui témoignent de notre engagement qualité.",
  "references.certs.cta": "Découvrir nos partenaires",
  "references.partners.eyebrow": "Nos partenaires",
  "references.partners.title": "Des relations durables",
  "references.partners.text":
    "Des acteurs reconnus de l'industrie et de la santé nous confient leurs projets.",
  "references.quality.eyebrow": "Qualité & conformité",
  "references.quality.title": "Certifications",
  "references.quality.text":
    "Formations, attestations et homologations au service de réalisations fiables.",

  // ── Contact form ─────────────────────────────────────────────────────────
  "contact.form.legend": "Coordonnées",
  "contact.form.note": "Les champs marqués d'un astérisque sont obligatoires.",
  "contact.form.honeypot": "Ne pas remplir ce champ",
  "contact.info.addressLabel": "Adresse",
  "contact.info.heading": "Contact direct",
  "contact.info.titleLine1": "Le bon contact,",
  "contact.info.titleLine2": "au bon moment.",
  "contact.info.hq": "Siège social",
  "contact.info.hqValue": "Akouda, Sousse",
  "contact.form.eyebrow": "01 / NOUVELLE DEMANDE",
  "contact.form.heading": "Dites-nous tout.",
  "contact.form.phFirst": "Votre prénom",
  "contact.form.phLast": "Votre nom",
  "contact.form.emailLabel": "E-mail professionnel",
  "contact.form.phEmail": "nom@entreprise.com",
  "contact.form.phCompany": "Nom de la société",
  "contact.form.phSubject": "En quelques mots",
  "contact.form.messageLabel": "Votre message",
  "contact.form.phMessage": "Parlez-nous de votre besoin…",
  "contact.location.eyebrow": "Nous trouver",
  "contact.location.title": "Localisation d’Univers Inox Industriel à Akouda, Sousse",
  "contact.location.caption": "U2I · Akouda, Sousse",
  "contact.info.mapCta": "Voir sur la carte",
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
  "about.story.p1":
    "Our engineers and technicians bring experience from the pharmaceutical, food and chemical industries to high-exigence projects. We adapt every intervention to the client's needs and the reality of their site.",
  "about.story.p2":
    "From initial study to maintenance, the same team can follow each stage and keep your project on track.",
  "about.method.titleLine1": "From the first drawing",
  "about.method.titleLine2": "to commissioning.",
  "about.workshop.text":
    "A design office, a prefabrication workshop and inspection resources brought together around your installations.",
  "about.location": "Sousse, Tunisia",
  "about.quality.text":
    "Our work relies on a documented process and inspections matched to your installation requirements, particularly in the pharmaceutical sector.",
  "about.partner.title": "A trusted partnership",
  "about.partner.text":
    "Cutting and orbital welding solutions, backed by a specialist technical team.",
  "about.cta.sectors": "Explore our industries",
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
  "about.workshop.intro":
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
  "equipment.cta.title": "Need specific equipment?",
  "equipment.hero.eyebrow2": "Our machine park",
  "equipment.hero.titleLine1": "Precision",
  "equipment.hero.titleLine2": "in action.",
  "equipment.hero.alt": "U2I manufacturing workshop",
  "equipment.section.eyebrow": "Technical park",
  "equipment.section.titleLine1": "Our equipment,",
  "equipment.section.titleLine2": "in detail.",
  "equipment.section.aria": "Equipment families",
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

  "home.slide1.label": "Piping & Welding",
  "home.slide1.title":
    "Precision continues to drive the ambition of the Univers Inox group",
  "home.slide2.label": "Orbital Welding",
  "home.slide2.title":
    "Official AXXAIR partner — a complete solution for high-exigence industries.",
  "home.slide2.date": "Since 2015",
  "home.slide3.label": "Food & beverage",
  "home.slide3.title":
    "Stainless steel piping designed for the strictest hygiene standards.",
  "home.slide3.date": "Pharma · Food · Chemical",
  "home.slide4.label": "New workshop",
  "home.slide4.title":
    "A new prefabrication workshop to speed up our industrial projects.",
  "home.slide4.date": "Akouda, Tunisia",
  "home.alt.logo": "Univers Inox Industriel",
  "home.alt.axxair": "AXXAIR",

  "home.sector.pharma.tag": "Pharma standard",
  "home.sector.pharma.title": "Pharmaceutical",
  "home.sector.food.tag": "Food quality",
  "home.sector.food.title": "Food & beverage",
  "home.sector.chemical.tag": "Sensitive processes",
  "home.sector.chemical.title": "Chemical",
  "home.sector.cosmetics.tag": "Clean lines",
  "home.sector.cosmetics.title": "Cosmetics",
  "home.sector.furniture.tag": "Bespoke",
  "home.sector.furniture.title": "Steel furniture",

  "home.process.title": "Our end-to-end processes",
  "home.process.text":
    "Discover our end-to-end processes, guaranteeing the quality, precision and traceability of every installation.",
  "home.who.title": "About us",
  "home.who.text1":
    "Based in Tunisia, we specialise in sheet metal work, welding and industrial piping for the most demanding industries.",
  "home.who.text2":
    "Our team of qualified engineers and technicians supports you at every step.",
  "home.who.text3":
    "We handle engineering, workshop prefabrication, on-site works, commissioning, maintenance and support.",
  "home.who.cta": "Contact us",
  "home.expertise.title": "Our areas of expertise",
  "home.expertise.text":
    "Discover industrial solutions tailored to each sector, combining high technical skill with full standards compliance.",
  "home.expertise.cta": "See our projects",
  "home.precision.title": "High precision",
  "home.machines.title": "Our machine park",
  "home.machines.text":
    "Discover our latest-generation equipment, built to meet the strictest industrial requirements.",
  "home.machines.cta": "View the full machine park",
  "home.axxair": "Official AXXAIR partner since 2015",
  "home.certs.title": "Certifications",
  "home.certs.text":
    "Our official certificates, training and accreditations that guarantee the compliance of our work.",
  "home.certs.official": "Official certification",
  "home.certs.label": "Certification",
  "home.presentation.title": "Company overview",
  "home.groupName": "Univers Inox Group",
  "home.certs.zoom": "Click to enlarge",
  "home.refs.cta": "Discover all our references",
  "home.aria.previous": "Previous",
  "home.aria.next": "Next",

  "equipment.item.endoscopie": "Endoscopy",
  "equipment.item.controleGaz": "Gas testing",
  "equipment.item.coupe": "Cutting & dressing",
  "equipment.item.orbital": "Orbital welding",
  "equipment.item.commande": "CNC machine",
  "equipment.item.skid": "Pickling skid",
  "equipment.precision": "High precision",
  "equipment.expertise": "Expertise",
  "equipment.orbital.title": "Orbital welding",
  "equipment.orbital.tag": "Precision assembly",
  "equipment.orbital.desc":
    "A fleet of orbital welding generators and heads for consistent joints across stainless networks. The process suits process lines that demand control, repeatability and traceability.",
  "equipment.orbital.app1": "Stainless tube assembly",
  "equipment.orbital.app2": "Open and closed heads",
  "equipment.orbital.app3": "Process and clean-fluid networks",
  "equipment.cutting.title": "Cutting & dressing",
  "equipment.cutting.tag": "Tube preparation",
  "equipment.cutting.desc":
    "Machines dedicated to orbital cutting and face dressing prepare pipe ends before assembly. A clean cut and well-prepared faces make alignment easier and improve weld quality.",
  "equipment.cutting.app1": "Orbital tube cutting",
  "equipment.cutting.app2": "End dressing",
  "equipment.cutting.app3": "Preparation before welding",
  "equipment.cnc.title": "CNC machining",
  "equipment.cnc.tag": "Workshop machining",
  "equipment.cnc.desc":
    "CNC equipment supports the preparation and manufacture of parts in the workshop. It helps produce elements matched to the dimensions and geometry expected on each installation.",
  "equipment.cnc.app1": "Part preparation",
  "equipment.cnc.app2": "Workshop manufacturing",
  "equipment.cnc.app3": "Repeatable operations",
  "equipment.gas.title": "Gas testing",
  "equipment.gas.tag": "Inerting control",
  "equipment.gas.desc":
    "Gas analysers verify the shielding atmosphere during welding operations. Monitoring residual oxygen helps control inerting and preserve the inner surfaces of tubes.",
  "equipment.gas.app1": "Inerting verification",
  "equipment.gas.app2": "Residual oxygen measurement",
  "equipment.gas.app3": "In-process welding control",
  "equipment.endoscope.title": "Endoscopy",
  "equipment.endoscope.tag": "Visual inspection",
  "equipment.endoscope.desc":
    "Endoscopic inspection allows observation of hard-to-reach areas after fabrication. It complements visual weld inspection and gives a direct view of internal network surfaces.",
  "equipment.endoscope.app1": "Internal area inspection",
  "equipment.endoscope.app2": "Visual weld inspection",
  "equipment.endoscope.app3": "Access to difficult geometries",
  "equipment.skid.title": "Treatment skid",
  "equipment.skid.tag": "Cleaning & passivation",
  "equipment.skid.desc":
    "Circulation skids support degreasing, pickling and passivation of stainless networks. Surface treatment contributes to installation cleanliness and restores the passive layer.",
  "equipment.skid.app1": "Network degreasing",
  "equipment.skid.app2": "Pickling and passivation",
  "equipment.skid.app3": "Treatment solution circulation",

  "about.hero.eyebrow2": "Univers Inox Industriel · since 2015",
  "about.story.text":
    "A hands-on team, dedicated resources and constant rigour, from engineering to commissioning.",
  "about.svc.engineering.title": "Engineering & design",
  "about.svc.engineering.text":
    "Needs analysis, 3D design and engineering calculations.",
  "about.svc.fabrication.title": "Fabrication & installation",
  "about.svc.fabrication.text":
    "Workshop prefabrication, bending, welding and on-site assembly.",
  "about.svc.control.title": "Inspection & maintenance",
  "about.svc.control.text":
    "Endoscopy, pressure testing and preventive maintenance.",
  "about.who.text1":
    "Based in Tunisia, we specialise in sheet metal work, welding and industrial piping for the most demanding industries.",
  "about.who.text2":
    "Our team of qualified engineers and technicians supports you at every step.",
  "about.who.text3":
    "We handle engineering, workshop prefabrication, on-site works, commissioning, maintenance and support.",
  "about.step.study.title": "Study",
  "about.step.study.text": "Your needs, your plans and your process constraints.",
  "about.step.prefab.title": "Prefabricate",
  "about.step.prefab.text": "Stainless assemblies prepared and checked in the workshop.",
  "about.step.install.title": "Install",
  "about.step.install.text": "Assembly and connection on your industrial site.",
  "about.step.qualify.title": "Qualify",
  "about.step.qualify.text": "Inspections, commissioning and the technical file.",
  "about.stat.sales.title": "Account managers",
  "about.stat.sales.text": "Project follow-up close to the field.",
  "about.stat.design.title": "3D design workstations",
  "about.stat.design.text": "An integrated design office.",
  "about.stat.area.title": "m² of workshop",
  "about.stat.area.text": "A space dedicated to stainless prefabrication.",
  "about.cert.lab.title": "Laboratories & testing",
  "about.cert.lab.text": "Commissioning and video endoscopy.",
  "about.cert.machines.title": "Integrated machine park",
  "about.cert.machines.text": "Cutting, dressing and orbital welding.",
  "about.cap.engineering.title": "Engineering & design",
  "about.cap.engineering.intro":
    "Size things correctly, anticipate constraints and prepare a well-managed site.",
  "about.cap.engineering.i1": "Studies, consulting and P&ID analysis",
  "about.cap.engineering.i2": "AutoCAD 2D plans and SolidWorks 3D design",
  "about.cap.engineering.i3": "Sizing and engineering calculations",
  "about.cap.fabrication.title": "Fabrication & installation",
  "about.cap.fabrication.intro":
    "Stainless expertise applied in the workshop and directly on your site.",
  "about.cap.fabrication.i1": "Process piping and stainless fabrication",
  "about.cap.fabrication.i2": "Prefabrication, welding and on-site assembly",
  "about.cap.fabrication.i3": "Compliance with standards and safety rules",
  "about.cap.fabrication.i4": "Degreasing, pickling and passivation",
  "about.cap.control.title": "Inspection & maintenance",
  "about.cap.control.intro":
    "Equipment and teams to verify, qualify and keep your networks running.",
  "about.cap.control.i1": "Electrical engineering and automation",
  "about.cap.control.i2": "Visual and video-endoscopic inspection",
  "about.cap.control.i3": "Commissioning and qualification",
  "about.cap.control.i4": "Stainless network maintenance and technical support",
  "about.res.machines.text": "Laser cutting, orbital cutting and press brakes.",
  "about.section.services": "What we do",
  "about.section.services.title": "Expertise at every step.",
  "about.check.1": "Inspection of supplies on receipt",
  "about.check.2": "Follow-up of operations and subcontracting (FAT / SAT)",
  "about.check.3": "Documentary traceability of materials and welds",
  "about.check.4": "Visual and video-endoscopic checks",
  "about.check.5": "Handover of the installation technical file",

  "sectors.item.pharma.title": "Pharmaceutical",
  "sectors.item.food.title": "Food & beverage",
  "sectors.item.chemical.title": "Chemical",
  "sectors.item.cosmetics.title": "Cosmetics",
  "sectors.item.furniture.title": "Steel furniture",
  "sectors.item.service.title": "Industrial services",
  "sectors.details": "Details",
  "sectors.matchTitle": "Our projects",
  "sectors.hero.line2a": "that move",
  "sectors.hero.line1": "Know-how",
  "sectors.hero.line2b": "industry forward.",
  "sectors.intro.aria": "Our expertise",
  "sectors.intro.label": "Our areas of activity",
  "sectors.intro.line1": "The right expertise.",
  "sectors.intro.line2": "In the right place.",
  "sectors.gallery.empty": "New projects coming soon.",
  "sectors.pharma.tag": "01 / Sterile processes",
  "sectors.pharma.desc":
    "Fluid networks designed for environments where every detail matters. U2I builds stainless process lines, precisely welded and engineered to make cleaning, qualification and traceability easier.",
  "sectors.pharma.focus": "Orbital welding · Process networks · Traceability",
  "sectors.food.tag": "02 / Controlled hygiene",
  "sectors.food.desc":
    "Reliable installations to transport and process food products. Materials, welds and finishes are selected to meet hygiene requirements and clean-in-place cycles.",
  "sectors.food.focus": "Stainless networks · CIP / SIP · Sanitary finishes",
  "sectors.chemical.tag": "03 / Demanding fluids",
  "sectors.chemical.desc":
    "For chemical processes, fluid control and installation robustness are essential. We adapt networks, assemblies and materials to the specific constraints of each process.",
  "sectors.chemical.focus": "Fluid transfer · Stainless · Process safety",
  "sectors.cosmetics.tag": "04 / Product purity",
  "sectors.cosmetics.desc":
    "Carefully finished production lines for sensitive products. Surface quality, weld consistency and ease of cleaning protect product purity at every step.",
  "sectors.cosmetics.focus": "Controlled surfaces · Clean lines · Stainless",
  "sectors.furniture.tag": "05 / Bespoke manufacturing",
  "sectors.furniture.desc":
    "Furniture designed for day-to-day use in laboratories and production areas: tables, trolleys, supports and stainless structures built for your spaces, uses and cleaning constraints.",
  "sectors.furniture.focus": "Tables · Trolleys · Custom structures",
  "sectors.service.tag": "06 / From site to workshop",
  "sectors.service.desc":
    "From workshop preparation to on-site intervention, our teams bring their piping, welding and specialist-equipment expertise to support your industrial projects end to end.",
  "sectors.service.focus": "Piping · Welding · Inspection · Commissioning",

  "references.certs.title": "Certifications",
  "references.certs.text":
    "Trusted partners and certifications that reflect our quality commitment.",
  "references.certs.cta": "Discover our partners",
  "references.partners.eyebrow": "Our partners",
  "references.partners.title": "Lasting relationships",
  "references.partners.text":
    "Recognised players in industry and healthcare trust us with their projects.",
  "references.quality.eyebrow": "Quality & compliance",
  "references.quality.title": "Certifications",
  "references.quality.text":
    "Training, certificates and accreditations in support of reliable work.",

  "contact.form.legend": "Contact details",
  "contact.form.note": "Fields marked with an asterisk are required.",
  "contact.form.honeypot": "Leave this field empty",
  "contact.info.addressLabel": "Address",
  "contact.info.heading": "Direct contact",
  "contact.info.titleLine1": "The right contact,",
  "contact.info.titleLine2": "at the right time.",
  "contact.info.hq": "Head office",
  "contact.info.hqValue": "Akouda, Sousse",
  "contact.form.eyebrow": "01 / NEW REQUEST",
  "contact.form.heading": "Tell us everything.",
  "contact.form.phFirst": "Your first name",
  "contact.form.phLast": "Your last name",
  "contact.form.emailLabel": "Professional email",
  "contact.form.phEmail": "name@company.com",
  "contact.form.phCompany": "Company name",
  "contact.form.phSubject": "In a few words",
  "contact.form.messageLabel": "Your message",
  "contact.form.phMessage": "Tell us about your needs…",
  "contact.location.eyebrow": "Find us",
  "contact.location.title": "Location of Univers Inox Industriel in Akouda, Sousse",
  "contact.location.caption": "U2I · Akouda, Sousse",
  "contact.info.mapCta": "View on map",
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
