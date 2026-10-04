import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Clock3, Loader2, Mail, MapPin, Phone } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { useI18n } from "@/lib/i18n";
import workshopImage from "@/assets/about-workshop.jpg";

import "./contact.css";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const CONTACT_ENDPOINT = "/api/contact.php";

export function ContactPage() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          company: formData.get("company"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          // Honeypot: humans never see or fill this field.
          website: "",
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (response.ok && payload?.ok) {
        setSubmitState({
          status: "success",
          message: payload.message ?? t("contact.form.success"),
        });
        form.reset();
      } else {
        setSubmitState({
          status: "error",
          message: payload?.message ?? t("contact.form.error"),
        });
      }
    } catch {
      setSubmitState({
        status: "error",
        message: t("contact.form.offline"),
      });
    }
  };

  return (
    <main className="contact-page">
      <PageHero
        id="contact"
        breadcrumb={t("contact.hero.eyebrow")}
        eyebrow={t("contact.hero.eyebrow2")}
        title={
          <>
            {t("contact.hero.titleLine1")}
            <br />
            <span>{t("contact.hero.titleLine2")}</span>
          </>
        }
        description={t("contact.hero.text")}
        linkLabel={t("contact.info.title")}
        linkHref="#coordonnees"
        image={workshopImage}
        imageAlt={t("contact.alt.workshop")}
      />

      <section className="contact-main" id="coordonnees">
        <div className="contact-wrap">
          <div className="contact-main__heading">
            <span className="contact-eyebrow contact-eyebrow--dark">
              {t("contact.info.heading")}
            </span>
            <h2>
              {t("contact.info.titleLine1")}
              <br />
              {t("contact.info.titleLine2")}
            </h2>
          </div>

          <div className="contact-columns">
            <motion.section
              className="contact-details"
              aria-labelledby="contact-details-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <h3 id="contact-details-title">{t("contact.info.title")}</h3>
              <a className="contact-detail" href="tel:+21650191004">
                <span className="contact-detail__icon">
                  <Phone size={19} aria-hidden="true" />
                </span>
                <span>
                  <small>{t("contact.info.phone")}</small>
                  <strong>+216 50 191 004</strong>
                  <em>
                    {t("contact.info.callTeam")} <ArrowUpRight size={13} aria-hidden="true" />
                  </em>
                </span>
              </a>
              <a className="contact-detail" href="mailto:u2i@u2iprocess.com">
                <span className="contact-detail__icon">
                  <Mail size={19} aria-hidden="true" />
                </span>
                <span>
                  <small>{t("contact.info.emailLabel")}</small>
                  <strong>u2i@u2iprocess.com</strong>
                  <em>
                    {t("contact.info.writeUs")} <ArrowUpRight size={13} aria-hidden="true" />
                  </em>
                </span>
              </a>
              <div className="contact-detail">
                <span className="contact-detail__icon">
                  <MapPin size={19} aria-hidden="true" />
                </span>
                <span>
                  <small>{t("contact.info.hq")}</small>
                  <strong>{t("contact.info.hqValue")}</strong>
                  <em>{t("contact.info.country")}</em>
                </span>
              </div>
              <div className="contact-hours">
                <Clock3 size={16} aria-hidden="true" />
                <span>{t("contact.hours.days")}</span>
                <strong>08:00 — 17:00</strong>
              </div>
            </motion.section>

            <motion.section
              className="contact-form-section"
              aria-labelledby="contact-form-title"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <div className="contact-form-section__heading">
                <div>
                  <span>{t("contact.form.eyebrow")}</span>
                  <h3 id="contact-form-title">{t("contact.form.heading")}</h3>
                </div>
              </div>
              <form className="contact-form" onSubmit={handleSubmit}>
                {/* Honeypot field — hidden from humans, catches naive bots. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="contact-form__honeypot"
                  aria-hidden="true"
                />
                <div className="contact-form__row">
                  <label>
                    {t("contact.form.firstName")}
                    <input
                      name="firstName"
                      autoComplete="given-name"
                      placeholder={t("contact.form.phFirst")}
                      required
                    />
                  </label>
                  <label>
                    {t("contact.form.lastName")}
                    <input
                      name="lastName"
                      autoComplete="family-name"
                      placeholder={t("contact.form.phLast")}
                      required
                    />
                  </label>
                </div>
                <div className="contact-form__row">
                  <label>
                    {t("contact.form.emailLabel")}
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("contact.form.phEmail")}
                      required
                    />
                  </label>
                  <label>
                    {t("contact.form.company")} <span>{t("contact.form.optional")}</span>
                    <input
                      name="company"
                      autoComplete="organization"
                      placeholder={t("contact.form.phCompany")}
                    />
                  </label>
                </div>
                <label>
                  {t("contact.form.subject")}
                  <input
                    name="subject"
                    placeholder={t("contact.form.phSubject")}
                    required
                  />
                </label>
                <label>
                  {t("contact.form.messageLabel")}
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={t("contact.form.phMessage")}
                    required
                  />
                </label>
                <div className="contact-form__submit-row">
                  <button type="submit" disabled={submitState.status === "submitting"}>
                    {submitState.status === "submitting" ? (
                      <>
                        <Loader2 size={16} className="contact-form__spinner" aria-hidden="true" />
                        {t("contact.form.sending")}
                      </>
                    ) : (
                      <>
                        {t("contact.form.submit")} <ArrowRight size={17} aria-hidden="true" />
                      </>
                    )}
                  </button>
                  {submitState.status === "success" && (
                    <p className="contact-form__status contact-form__status--success" role="status">
                      {submitState.message}
                    </p>
                  )}
                  {submitState.status === "error" && (
                    <p className="contact-form__status contact-form__status--error" role="alert">
                      {submitState.message}
                    </p>
                  )}
                </div>
              </form>
            </motion.section>
          </div>
        </div>
      </section>

      <section className="contact-location">
        <div className="contact-wrap">
          <div className="contact-location__heading">
            <div>
              <span className="contact-eyebrow contact-eyebrow--dark">
                {t("contact.location.eyebrow")}
              </span>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              title={t("contact.location.title")}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25864.77929716165!2d10.5775104!3d35.8711296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd8a3269a9e77b%3A0xe2adfdb4979a6bdc!2sUnivers%20Inox%20Industriel%20U2I!5e0!3m2!1sfr!2stn!4v1784619191195!5m2!1sfr!2stn"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen={false}
            />
            <div className="contact-map__label">
              <MapPin size={17} aria-hidden="true" />
              <span>{t("contact.location.caption")}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
