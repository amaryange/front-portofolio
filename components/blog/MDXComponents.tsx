import type { MDXComponents } from "mdx/types";
import { YouTube } from "./YouTube";
import { CodeBlock } from "./CodeBlock";
import { VideoDemo } from "./VideoDemo";

type CalloutType = "info" | "warning" | "danger" | "tip";

const calloutStyles: Record<CalloutType, string> = {
  info:    "border-blue-500/40 bg-blue-500/5 text-blue-300",
  warning: "border-accent-warm/40 bg-accent-warm/5 text-accent-warm",
  danger:  "border-red-500/40 bg-red-500/5 text-red-400",
  tip:     "border-accent/40 bg-accent/5 text-accent",
};

function Callout({ type = "info", children }: { type?: CalloutType; children?: React.ReactNode }) {
  return (
    <div className={`my-6 rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed ${calloutStyles[type] ?? calloutStyles.info}`}>
      {children}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  YouTube,
  VideoDemo,
  Callout,

  // Headings
  h2: (props) => (
    <h2
      className="mb-4 mt-10 font-display text-2xl font-bold text-text-primary first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mb-3 mt-8 font-display text-xl font-bold text-text-primary"
      {...props}
    />
  ),

  // Prose
  p: (props) => (
    <p className="mb-5 leading-relaxed text-text-secondary" {...props} />
  ),
  ul: (props) => (
    <ul className="mb-5 flex flex-col gap-2 pl-5 text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol className="mb-5 flex flex-col gap-2 pl-5 text-text-secondary" {...props} />
  ),
  li: (props) => (
    <li className="relative list-disc marker:text-accent" {...props} />
  ),
  strong: (props) => (
    <strong className="font-semibold text-text-primary" {...props} />
  ),

  // Blocs de code (pre) — avec bouton copier
  pre: (props) => <CodeBlock {...props} />,

  // Inline code
  code: (props) => (
    <code
      className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
      {...props}
    />
  ),

  // Horizontal rule
  hr: () => <hr className="my-10 border-border" />,

  // Blockquote
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-2 border-accent pl-4 text-text-secondary italic"
      {...props}
    />
  ),

  // Links
  a: (props) => (
    <a
      className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
};
