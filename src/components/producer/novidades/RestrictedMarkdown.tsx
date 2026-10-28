import { parseRestrictedMarkdown } from "@/lib/novidades";

/** Markdown restrito das Novidades montado em elementos do React; nunca HTML. */
export function RestrictedMarkdown({ source }: { source: string | null | undefined }) {
  return (
    <>
      {parseRestrictedMarkdown(source).map((lines, p) => (
        <p key={p}>
          {lines.map((spans, l) => (
            <span key={l}>
              {l > 0 && <br />}
              {spans.map((span, s) => {
                if (span.kind === "strong") return <strong key={s}>{span.text}</strong>;
                if (span.kind === "em") return <em key={s}>{span.text}</em>;
                if (span.kind === "link")
                  return (
                    <a key={s} href={span.href} target="_blank" rel="noopener noreferrer">
                      {span.text}
                    </a>
                  );
                return span.text;
              })}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}
