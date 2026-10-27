export type Locale = "de" | "en";

const intlLocale = (locale: Locale): string => (locale === "de" ? "de-DE" : "en-GB");

export function formatNumber(value: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Date as DD.MM.YYYY (de) or DD/MM/YYYY (en-GB). */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatEuro(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Labour cost of one job: working time in minutes times the hourly rate. */
export function calcLaborCostPerJob(minutesPerJob: number, hourlyRate: number): number {
  return (Math.max(0, minutesPerJob) / 60) * Math.max(0, hourlyRate);
}

/** Monthly gross profit: (customer price - file price - labour cost) per job, minus the package's monthly fee. */
export function calcMonthlyEarnings(
  jobsPerMonth: number,
  customerPrice: number,
  filePrice: number,
  monthlyFee: number,
  laborCostPerJob = 0,
): number {
  const perJob = Math.max(0, customerPrice - filePrice - laborCostPerJob);
  return Math.max(0, jobsPerMonth * perJob - monthlyFee);
}
