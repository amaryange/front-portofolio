/**
 * Traduit les erreurs de validation VineJS (AdonisJS) en messages lisibles.
 *
 * Format d'erreur VineJS :
 * { field: string, rule: string, message: string, meta?: Record<string, unknown> }
 */

export interface VineError {
  field: string;
  rule: string;
  message: string;
  meta?: Record<string, unknown>;
}

type Locale = "fr" | "en";

/* ── Noms de champs lisibles ────────────────────────────────────── */

const FIELD_LABELS: Record<string, Record<Locale, string>> = {
  name:        { fr: "Nom",      en: "Name"    },
  email:       { fr: "E-mail",   en: "Email"   },
  subject:     { fr: "Sujet",    en: "Subject" },
  message:     { fr: "Message",  en: "Message" },
  password:    { fr: "Mot de passe", en: "Password" },
  title:       { fr: "Titre",    en: "Title"   },
  description: { fr: "Description", en: "Description" },
  url:         { fr: "URL",      en: "URL"     },
  content:     { fr: "Contenu",  en: "Content" },
  company:     { fr: "Entreprise", en: "Company" },
  position:    { fr: "Poste",    en: "Position" },
  locale:      { fr: "Langue",   en: "Language" },
};

function fieldLabel(field: string, locale: Locale): string {
  const key = field.split(".").pop() ?? field; // handle nested fields like "address.city"
  return FIELD_LABELS[key]?.[locale] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/* ── Traductions par règle ──────────────────────────────────────── */

type RuleTranslator = (field: string, meta: Record<string, unknown>, locale: Locale) => string;

const RULES: Record<string, RuleTranslator> = {
  required: (f, _, l) =>
    l === "fr"
      ? `Le champ "${fieldLabel(f, l)}" est obligatoire.`
      : `The field "${fieldLabel(f, l)}" is required.`,

  email: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être une adresse e-mail valide.`
      : `"${fieldLabel(f, l)}" must be a valid email address.`,

  minLength: (f, meta, l) => {
    const min = meta?.min ?? meta?.minLength ?? "?";
    return l === "fr"
      ? `"${fieldLabel(f, l)}" doit contenir au moins ${min} caractère${Number(min) > 1 ? "s" : ""}.`
      : `"${fieldLabel(f, l)}" must be at least ${min} character${Number(min) > 1 ? "s" : ""} long.`;
  },

  maxLength: (f, meta, l) => {
    const max = meta?.max ?? meta?.maxLength ?? "?";
    return l === "fr"
      ? `"${fieldLabel(f, l)}" ne doit pas dépasser ${max} caractères.`
      : `"${fieldLabel(f, l)}" must not exceed ${max} characters.`;
  },

  string: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être du texte.`
      : `"${fieldLabel(f, l)}" must be a string.`,

  number: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être un nombre.`
      : `"${fieldLabel(f, l)}" must be a number.`,

  boolean: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être vrai ou faux.`
      : `"${fieldLabel(f, l)}" must be true or false.`,

  url: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être une URL valide.`
      : `"${fieldLabel(f, l)}" must be a valid URL.`,

  enum: (f, meta, l) => {
    const choices = Array.isArray(meta?.choices) ? (meta.choices as string[]).join(", ") : "";
    return l === "fr"
      ? `"${fieldLabel(f, l)}" doit être l'une des valeurs : ${choices}.`
      : `"${fieldLabel(f, l)}" must be one of: ${choices}.`;
  },

  unique: (f, _, l) =>
    l === "fr"
      ? `Cette valeur pour "${fieldLabel(f, l)}" est déjà utilisée.`
      : `This value for "${fieldLabel(f, l)}" is already taken.`,

  exists: (f, _, l) =>
    l === "fr"
      ? `La valeur de "${fieldLabel(f, l)}" n'existe pas.`
      : `The value of "${fieldLabel(f, l)}" does not exist.`,

  confirmed: (f, _, l) =>
    l === "fr"
      ? `La confirmation de "${fieldLabel(f, l)}" ne correspond pas.`
      : `"${fieldLabel(f, l)}" confirmation does not match.`,

  regex: (f, _, l) =>
    l === "fr"
      ? `Le format de "${fieldLabel(f, l)}" est invalide.`
      : `The format of "${fieldLabel(f, l)}" is invalid.`,

  date: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" doit être une date valide.`
      : `"${fieldLabel(f, l)}" must be a valid date.`,

  alpha: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" ne doit contenir que des lettres.`
      : `"${fieldLabel(f, l)}" must contain only letters.`,

  alphaNumeric: (f, _, l) =>
    l === "fr"
      ? `"${fieldLabel(f, l)}" ne doit contenir que des lettres et chiffres.`
      : `"${fieldLabel(f, l)}" must contain only letters and numbers.`,

  minValue: (f, meta, l) => {
    const min = meta?.min ?? "?";
    return l === "fr"
      ? `"${fieldLabel(f, l)}" doit être supérieur ou égal à ${min}.`
      : `"${fieldLabel(f, l)}" must be greater than or equal to ${min}.`;
  },

  maxValue: (f, meta, l) => {
    const max = meta?.max ?? "?";
    return l === "fr"
      ? `"${fieldLabel(f, l)}" doit être inférieur ou égal à ${max}.`
      : `"${fieldLabel(f, l)}" must be less than or equal to ${max}.`;
  },
};

/* ── Fonction principale ─────────────────────────────────────────── */

export function translateVineError(err: VineError, locale: Locale = "fr"): string {
  const translator = RULES[err.rule];
  if (translator) {
    return translator(err.field, err.meta ?? {}, locale);
  }
  // Règle inconnue : retourner le message brut
  return err.message;
}

export function translateVineErrors(errors: VineError[], locale: Locale = "fr"): string[] {
  return errors.map((e) => translateVineError(e, locale));
}
