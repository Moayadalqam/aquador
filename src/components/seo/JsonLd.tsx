interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Unified JSON-LD structured data component.
 * Escapes `<` to prevent XSS via </script> injection in JSON-LD payloads.
 * Server Component — zero client JS.
 */
export default function JsonLd({ schema }: JsonLdProps) {
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
