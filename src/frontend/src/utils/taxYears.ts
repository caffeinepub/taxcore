/**
 * Returns the last 5 tax years dynamically, in YYYY-YYYY format.
 * e.g. ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"]
 */
export function getTaxYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = 0; i < 5; i++) {
    const end = currentYear - i;
    const start = end - 1;
    years.push(`${start}-${end}`);
  }
  return years;
}

/** Default tax year (current) */
export function getCurrentTaxYear(): string {
  return getTaxYears()[0];
}
