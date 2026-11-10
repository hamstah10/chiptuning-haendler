export function integrationHead(title: string, description: string) {
  return { meta: [
    { title: `${title} – TuningFiles` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} – TuningFiles` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] };
}