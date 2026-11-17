/** A complete, valid provider form for tests; override fields as needed. */
export function validSubmissionForm(over: Record<string, string | string[] | null> = {}): FormData {
  const base: Record<string, string | string[]> = {
    orgName: "Testverein Kalk",
    title: "Kinderturnen am Mittwoch",
    summary: "Toben, klettern und balancieren für Kleine.",
    description: "Eine Stunde Bewegung in der Halle mit Matten, Bällen und Kletterwand.",
    categories: ["sports"],
    ageMin: "3",
    ageMax: "6",
    priceKind: "paid",
    priceEuro: "7,50",
    priceUnit: "perChild",
    languages: ["de", "tr"],
    setting: "indoor",
    accessibility: ["stroller"],
    district: "Kalk",
    venueName: "Turnhalle",
    street: "Teststraße 5",
    postalCode: "51103",
    firstDate: "2026-12-02",
    startTime: "16:00",
    endTime: "17:00",
    repeatWeeks: "4",
    bookingUrl: "https://example.org/anmeldung",
    cancellation: "Absage bis 24 Stunden vorher kostenlos.",
    confirmRights: "yes",
    confirmReview: "yes",
  };
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...over })) {
    if (v === null) continue;
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  }
  return f;
}
