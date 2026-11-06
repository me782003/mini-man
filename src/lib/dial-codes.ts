// Every country's international dial code. The picker loads the list from the API
// (GET /user/auth/phone-codes, see usePhoneCodes); this bundled copy is the offline fallback
// and is used to split stored numbers into code + number without waiting for the request.
// Independent of the dashboard's active countries: those only control where we ship.

import type { Country } from '@/lib/countries';

/** [ISO 3166-1 alpha-2, dial code] */
const DIAL_CODES: readonly [string, string][] = [
  ['EG', '+20'], ['SA', '+966'], ['AE', '+971'], ['KW', '+965'], ['QA', '+974'], ['BH', '+973'],
  ['OM', '+968'], ['JO', '+962'], ['LB', '+961'], ['SY', '+963'], ['IQ', '+964'], ['PS', '+970'],
  ['YE', '+967'], ['LY', '+218'], ['SD', '+249'], ['TN', '+216'], ['DZ', '+213'], ['MA', '+212'],
  ['MR', '+222'], ['SO', '+252'], ['DJ', '+253'], ['KM', '+269'],
  ['AF', '+93'], ['AL', '+355'], ['AD', '+376'], ['AO', '+244'], ['AG', '+1268'], ['AR', '+54'],
  ['AM', '+374'], ['AU', '+61'], ['AT', '+43'], ['AZ', '+994'], ['BS', '+1242'], ['BD', '+880'],
  ['BB', '+1246'], ['BY', '+375'], ['BE', '+32'], ['BZ', '+501'], ['BJ', '+229'], ['BT', '+975'],
  ['BO', '+591'], ['BA', '+387'], ['BW', '+267'], ['BR', '+55'], ['BN', '+673'], ['BG', '+359'],
  ['BF', '+226'], ['BI', '+257'], ['KH', '+855'], ['CM', '+237'], ['CA', '+1'], ['CV', '+238'],
  ['CF', '+236'], ['TD', '+235'], ['CL', '+56'], ['CN', '+86'], ['CO', '+57'], ['CG', '+242'],
  ['CD', '+243'], ['CR', '+506'], ['CI', '+225'], ['HR', '+385'], ['CU', '+53'], ['CY', '+357'],
  ['CZ', '+420'], ['DK', '+45'], ['DM', '+1767'], ['DO', '+1809'], ['EC', '+593'], ['SV', '+503'],
  ['GQ', '+240'], ['ER', '+291'], ['EE', '+372'], ['SZ', '+268'], ['ET', '+251'], ['FJ', '+679'],
  ['FI', '+358'], ['FR', '+33'], ['GA', '+241'], ['GM', '+220'], ['GE', '+995'], ['DE', '+49'],
  ['GH', '+233'], ['GR', '+30'], ['GD', '+1473'], ['GT', '+502'], ['GN', '+224'], ['GW', '+245'],
  ['GY', '+592'], ['HT', '+509'], ['HN', '+504'], ['HK', '+852'], ['HU', '+36'], ['IS', '+354'],
  ['IN', '+91'], ['ID', '+62'], ['IR', '+98'], ['IE', '+353'], ['IT', '+39'], ['JM', '+1876'],
  ['JP', '+81'], ['KZ', '+7'], ['KE', '+254'], ['KI', '+686'], ['KP', '+850'], ['KR', '+82'],
  ['XK', '+383'], ['KG', '+996'], ['LA', '+856'], ['LV', '+371'], ['LS', '+266'], ['LR', '+231'],
  ['LI', '+423'], ['LT', '+370'], ['LU', '+352'], ['MO', '+853'], ['MG', '+261'], ['MW', '+265'],
  ['MY', '+60'], ['MV', '+960'], ['ML', '+223'], ['MT', '+356'], ['MH', '+692'], ['MU', '+230'],
  ['MX', '+52'], ['FM', '+691'], ['MD', '+373'], ['MC', '+377'], ['MN', '+976'], ['ME', '+382'],
  ['MZ', '+258'], ['MM', '+95'], ['NA', '+264'], ['NR', '+674'], ['NP', '+977'], ['NL', '+31'],
  ['NZ', '+64'], ['NI', '+505'], ['NE', '+227'], ['NG', '+234'], ['MK', '+389'], ['NO', '+47'],
  ['PK', '+92'], ['PW', '+680'], ['PA', '+507'], ['PG', '+675'], ['PY', '+595'], ['PE', '+51'],
  ['PH', '+63'], ['PL', '+48'], ['PT', '+351'], ['PR', '+1787'], ['RO', '+40'], ['RU', '+7'],
  ['RW', '+250'], ['KN', '+1869'], ['LC', '+1758'], ['VC', '+1784'], ['WS', '+685'], ['SM', '+378'],
  ['ST', '+239'], ['SN', '+221'], ['RS', '+381'], ['SC', '+248'], ['SL', '+232'], ['SG', '+65'],
  ['SK', '+421'], ['SI', '+386'], ['SB', '+677'], ['ZA', '+27'], ['SS', '+211'], ['ES', '+34'],
  ['LK', '+94'], ['SR', '+597'], ['SE', '+46'], ['CH', '+41'], ['TW', '+886'], ['TJ', '+992'],
  ['TZ', '+255'], ['TH', '+66'], ['TL', '+670'], ['TG', '+228'], ['TO', '+676'], ['TT', '+1868'],
  ['TR', '+90'], ['TM', '+993'], ['TV', '+688'], ['UG', '+256'], ['UA', '+380'], ['GB', '+44'],
  ['US', '+1'], ['UY', '+598'], ['UZ', '+998'], ['VU', '+678'], ['VA', '+379'], ['VE', '+58'],
  ['VN', '+84'], ['ZM', '+260'], ['ZW', '+263'],
];

// Ids only need to be unique inside this list (they never reach the backend).
const ID_OFFSET = 100000;

const cache = new Map<string, Country[]>();

/** All countries with dial codes, Egypt first then alphabetical in the page language. */
export function allDialCountries(locale: string): Country[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([locale === 'ar' ? 'ar' : 'en'], { type: 'region' });
  } catch {
    // Very old browser: fall back to ISO codes.
  }
  const list: Country[] = DIAL_CODES.map(([code, phone_code], i) => ({
    id: ID_OFFSET + i,
    code,
    phone_code,
    flag_url: `https://flagpedia.net/data/flags/h80/${code.toLowerCase()}.png`,
    name: names?.of(code) ?? code,
  }));
  const [egypt, ...rest] = list;
  rest.sort((a, b) => (a.name ?? a.code).localeCompare(b.name ?? b.code, locale));
  const result = [egypt, ...rest];
  cache.set(locale, result);
  return result;
}

/** Longest-prefix match: "+97150..." → "+971" (not "+97"). */
export function matchDialCode(international: string): string | null {
  const v = international.replace(/[\s\-()]/g, '');
  let best: string | null = null;
  for (const [, code] of DIAL_CODES) {
    if (v.startsWith(code) && (!best || code.length > best.length)) best = code;
  }
  return best;
}
