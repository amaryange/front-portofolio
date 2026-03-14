"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { siGithub } from "simple-icons";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { sendContact } from "@/lib/api/contact";
import { isResponseError } from "up-fetch";
import { translateVineErrors, type VineError } from "@/lib/vine-errors";

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const inputClass =
  "w-full border border-border bg-surface px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent focus:outline-none";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  newsletter: false,
};

export default function Contact() {
  const t = useTranslations("contact");
  const locale = useLocale() as "fr" | "en";
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/amaryange",
      Icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d={siGithub.path} />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/amary-meless",
      Icon: LinkedInIcon,
    },
    {
      name: "meless@amarycode.dev",
      href: "mailto:meless@amarycode.dev",
      Icon: () => (
        <span className="font-mono text-sm leading-none text-accent">@</span>
      ),
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, newsletter: e.target.checked }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await sendContact(form);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");

      if (isResponseError(err)) {
        const data = err.data as { message?: string; errors?: VineError[] };

        // Erreurs de validation VineJS → traduites
        if (data?.errors?.length) {
          translateVineErrors(data.errors, locale).forEach((msg) => toast.error(msg));
          return;
        }

        // Message d'erreur backend direct (400, 429, 500…)
        if (data?.message) {
          toast.error(data.message);
          return;
        }
      }

      toast.error(t("errorGeneric"));
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Colonne gauche */}
          <AnimatedSection className="flex flex-col gap-8">
            <motion.p
              variants={fadeInUp}
              className="font-mono text-xs tracking-[0.2em] text-accent"
            >
              {t("label")}
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              className="font-display text-3xl font-bold leading-tight text-text-primary sm:text-4xl"
            >
              {t("heading1")}
              <br />
              {t("heading2")}
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="max-w-sm font-mono text-base leading-relaxed text-text-secondary"
            >
              {t("pitch")}
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="flex flex-col gap-4"
            >
              {socialLinks.map(({ name, href, Icon }) => (
                <motion.a
                  key={name}
                  variants={fadeInUp}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={
                    href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group inline-flex items-center gap-3 font-mono text-sm text-text-secondary transition-colors duration-150 hover:text-accent"
                >
                  <span className="opacity-60 transition-opacity duration-150 group-hover:opacity-100">
                    <Icon />
                  </span>
                  <span>{name}</span>
                  <span className="text-text-muted transition-colors duration-150 group-hover:text-accent">
                    ↗
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </AnimatedSection>

          {/* Formulaire */}
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              {status === "sent" ? (
                <div className="flex flex-col gap-4 border border-accent bg-surface p-8">
                  <span className="font-mono text-3xl text-accent">✓</span>
                  <p className="font-display text-xl font-bold text-text-primary">
                    {t("successTitle")}
                  </p>
                  <p className="font-mono text-sm text-text-secondary">
                    {t("successBody")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Nom + Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="name"
                        className="font-mono text-xs tracking-[0.15em] text-text-muted"
                      >
                        {t("nameLabel")}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t("namePlaceholder")}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="font-mono text-xs tracking-[0.15em] text-text-muted"
                      >
                        {t("emailLabel")}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder={t("emailPlaceholder")}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Sujet */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="subject"
                      className="font-mono text-xs tracking-[0.15em] text-text-muted"
                    >
                      {t("subjectLabel")}
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      placeholder={t("subjectPlaceholder")}
                      className={inputClass}
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="message"
                      className="font-mono text-xs tracking-[0.15em] text-text-muted"
                    >
                      {t("messageLabel")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t("messagePlaceholder")}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Newsletter */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={handleCheckbox}
                      className="h-4 w-4 accent-accent"
                    />
                    <span className="font-mono text-xs text-text-muted">
                      {t("newsletterLabel")}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex h-12 items-center justify-center bg-accent px-6 font-mono text-sm font-medium text-bg transition-all duration-150 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? t("sending") : t("send")}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
