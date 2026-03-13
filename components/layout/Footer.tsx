import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between md:px-8">
        <p className="font-mono text-sm text-text-muted">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
        <div className="flex gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-text-muted transition-colors duration-150 hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/amary"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-text-muted transition-colors duration-150 hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href="mailto:contact@amary.dev"
            className="font-mono text-sm text-text-muted transition-colors duration-150 hover:text-accent"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
