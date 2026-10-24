// Plain `ar` formats with Western digits (699) in current browsers; Egyptian Arabic
// uses Arabic-Indic digits (٦٩٩). Pass this to toLocaleString / toLocaleDateString.
export function intlLocale(locale: string): string {
  return locale === 'ar' ? 'ar-EG' : 'en-US';
}
