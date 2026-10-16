export type Locale = "de" | "en";

const intlLocale = (locale: Locale): string => (locale === "de" ? "de-DE" : "en-GB");

export function formatNumber(value: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatEuro(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Monthly gross profit: (customer price - file price) per job, minus the package's monthly fee. */
export function calcMonthlyEarnings(
  jobsPerMonth: number,
  customerPrice: number,
  filePrice: number,
  monthlyFee: number,
): number {
  const perJob = Math.max(0, customerPrice - filePrice);
  return Math.max(0, jobsPerMonth * perJob - monthlyFee);
}
