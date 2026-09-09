/**
 * Bidirectional Ethiopian Calendar (EC) & Gregorian Calendar (GC) conversion and formatting utilities.
 */

export type EthiopianDateInfo = {
  ecYear: number;
  ecMonth: number;
  ecMonthName: string;
  ecMonthNameAmharic: string;
  ecDay: number;
  formattedAmharic: string;
  formattedEnglish: string;
  formattedShort: string;
  isLeapYear: boolean;
};

export const EC_MONTHS_AMHARIC = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜን',
] as const;

export const EC_MONTHS_ENGLISH = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
] as const;

export const EC_WEEKDAYS_AMHARIC = [
  'እሑድ',
  'ሰኞ',
  'ማክሰኞ',
  'ረቡዕ',
  'ሐሙስ',
  'ዓርብ',
  'ቅዳሜ',
] as const;

export const EC_WEEKDAYS_ENGLISH = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function getEthiopianDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 13) return 30;
  if (month === 13) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return 30;
}

function dayOfYear(year: number, month: number, day: number): number {
  const monthLengths = [
    31,
    isGregorianLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let doy = 0;
  for (let i = 0; i < month - 1; i++) {
    doy += monthLengths[i];
  }
  doy += day;
  return doy;
}

function monthDayFromDayOfYear(
  year: number,
  doy: number,
): { month: number; day: number } {
  const monthLengths = [
    31,
    isGregorianLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let month = 1;
  let remainingDoy = doy;
  while (remainingDoy > monthLengths[month - 1]) {
    remainingDoy -= monthLengths[month - 1];
    month++;
  }
  return { month, day: remainingDoy };
}

function getGregorianDateOfEthiopianNewYear(ethiopianYear: number): {
  gregorianYear: number;
  month: number;
  day: number;
} {
  const gregorianYear = ethiopianYear + 7;
  const newYearDay = isGregorianLeapYear(gregorianYear + 1) ? 12 : 11;
  return { gregorianYear, month: 9, day: newYearDay };
}

/**
 * Converts Ethiopian Calendar date to Gregorian Date object.
 */
export function toGregorianDate(
  ethYear: number,
  ethMonth: number,
  ethDay: number,
): Date {
  const newYear = getGregorianDateOfEthiopianNewYear(ethYear);
  const daysSinceNewYear = (ethMonth - 1) * 30 + ethDay - 1;
  const newYearDOY = dayOfYear(
    newYear.gregorianYear,
    newYear.month,
    newYear.day,
  );
  let gregorianDOY = newYearDOY + daysSinceNewYear;
  let gregorianYear = newYear.gregorianYear;
  const yearLength = isGregorianLeapYear(gregorianYear) ? 366 : 365;

  if (gregorianDOY > yearLength) {
    gregorianDOY -= yearLength;
    gregorianYear += 1;
  }

  const { month, day } = monthDayFromDayOfYear(gregorianYear, gregorianDOY);
  return new Date(gregorianYear, month - 1, day);
}

function parseDateParts(input?: Date | string | null): {
  year: number;
  month: number;
  day: number;
  dateObj: Date;
} | null {
  if (!input) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      return {
        year,
        month,
        day,
        dateObj: new Date(year, month - 1, day),
      };
    }
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      dateObj: d,
    };
  }
  if (Number.isNaN(input.getTime())) return null;
  const isUtcMidnight =
    input.getUTCHours() === 0 &&
    input.getUTCMinutes() === 0 &&
    input.getUTCSeconds() === 0;

  return {
    year: isUtcMidnight ? input.getUTCFullYear() : input.getFullYear(),
    month: isUtcMidnight ? input.getUTCMonth() + 1 : input.getMonth() + 1,
    day: isUtcMidnight ? input.getUTCDate() : input.getDate(),
    dateObj: input,
  };
}

/**
 * Converts a Gregorian Date to rich Ethiopian Calendar (EC) info.
 */
export function toEthiopianDate(
  gregorianDate?: Date | string | null,
): EthiopianDateInfo | null {
  const parts = parseDateParts(gregorianDate);
  if (!parts) return null;

  const { year: gYear, month: gMonth, day: gDay } = parts;

  const inputDate = new Date(Date.UTC(gYear, gMonth - 1, gDay));
  const oneDay = 86400000;
  const oneYear = 365 * oneDay;
  const fourYears = 1461 * oneDay;
  const baseDate = new Date(Date.UTC(1971, 8, 12));
  const diff = inputDate.getTime() - baseDate.getTime();
  const fourYearCycles = Math.floor(diff / fourYears);
  let remainingYears = Math.floor((diff - fourYearCycles * fourYears) / oneYear);
  if (remainingYears === 4) remainingYears = 3;

  const remainingMonths = Math.floor(
    (diff - fourYearCycles * fourYears - remainingYears * oneYear) /
      (30 * oneDay),
  );
  const remainingDays = Math.floor(
    (diff -
      fourYearCycles * fourYears -
      remainingYears * oneYear -
      remainingMonths * 30 * oneDay) /
      oneDay,
  );

  const ecYear = 1964 + fourYearCycles * 4 + remainingYears;
  const ecMonth = remainingMonths + 1;
  const ecDay = remainingDays + 1;

  const isLeap = isEthiopianLeapYear(ecYear);
  const monthEng = EC_MONTHS_ENGLISH[ecMonth - 1] || 'Meskerem';
  const monthAmh = EC_MONTHS_AMHARIC[ecMonth - 1] || 'መስከረም';

  return {
    ecYear,
    ecMonth,
    ecMonthName: monthEng,
    ecMonthNameAmharic: monthAmh,
    ecDay,
    formattedAmharic: `${monthAmh} ${ecDay}, ${ecYear} ዓ.ም`,
    formattedEnglish: `${monthEng} ${ecDay}, ${ecYear} EC`,
    formattedShort: `${ecDay}/${ecMonth}/${ecYear} ዓ.ም`,
    isLeapYear: isLeap,
  };
}

const GC_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats a date showing both Gregorian and Ethiopian Calendar representations.
 * Example in English: "Sep 18, 2026 (መስከረም 8, 2019 ዓ.ም)"
 * Example in Amharic: "መስከረም 8, 2019 ዓ.ም (Sep 18, 2026)"
 */
export function formatDualDate(
  dateInput?: Date | string | null,
  lang: 'en' | 'am' = 'en',
  options: { includeTime?: boolean; compact?: boolean } = {},
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return '—';

  const ec = toEthiopianDate(parts.dateObj);
  if (!ec) return '—';

  const monthName = GC_MONTHS_SHORT[parts.month - 1];
  const gcFormatted = options.compact
    ? `${parts.month}/${parts.day}/${parts.year}`
    : `${monthName} ${parts.day}, ${parts.year}`;

  const timeStr = options.includeTime
    ? ` ${parts.dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  if (lang === 'am') {
    return `${ec.formattedAmharic}${timeStr} (${gcFormatted})`;
  }

  return `${gcFormatted}${timeStr} (${ec.formattedAmharic})`;
}

/**
 * Returns the current date in Ethiopian Calendar info.
 */
export function getCurrentEthiopianDate(): EthiopianDateInfo {
  return toEthiopianDate(new Date())!;
}
