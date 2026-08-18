/**
 * Dual Ethiopian Calendar (EC) & Gregorian Calendar (GC) conversion utilities.
 */

export type EthiopianDateInfo = {
  ecYear: number;
  ecMonthName: string;
  ecMonthNameAmharic: string;
  ecDay: number;
  formattedAmharic: string;
  formattedEnglish: string;
};

const EC_MONTHS_AMHARIC = [
  'መስከረም',
  'ጥቅምት',
  'ህዳር',
  'ታህሳስ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
];

const EC_MONTHS_ENGLISH = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yakatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
];

/**
 * Converts a Gregorian Date to Ethiopian Calendar (EC) date info.
 */
export function toEthiopianDate(
  gregorianDate?: Date | string | null,
): EthiopianDateInfo | null {
  if (!gregorianDate) return null;
  const date =
    typeof gregorianDate === 'string'
      ? new Date(gregorianDate)
      : gregorianDate;
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const isLeapYear = year % 4 === 3;
  const newYearDay = isLeapYear ? 12 : 11;

  let ecYear = year - 8;
  let ecMonth = 1;
  let ecDay = 1;

  const startSept11 = new Date(year, 8, newYearDay); // Sept is month index 8

  if (date >= startSept11) {
    ecYear = year - 7;
    const diffDays = Math.floor(
      (date.getTime() - startSept11.getTime()) / (1000 * 60 * 60 * 24),
    );
    ecMonth = Math.floor(diffDays / 30) + 1;
    ecDay = (diffDays % 30) + 1;
  } else {
    ecYear = year - 8;
    const prevLeap = (year - 1) % 4 === 3;
    const prevSept11 = new Date(year - 1, 8, prevLeap ? 12 : 11);
    const diffDays = Math.floor(
      (date.getTime() - prevSept11.getTime()) / (1000 * 60 * 60 * 24),
    );
    ecMonth = Math.floor(diffDays / 30) + 1;
    ecDay = (diffDays % 30) + 1;
  }

  if (ecMonth > 13) ecMonth = 13;
  if (ecMonth === 13 && ecDay > 6) ecDay = 6;

  const monthEng = EC_MONTHS_ENGLISH[ecMonth - 1] || 'Meskerem';
  const monthAmh = EC_MONTHS_AMHARIC[ecMonth - 1] || 'መስከረም';

  return {
    ecYear,
    ecMonthName: monthEng,
    ecMonthNameAmharic: monthAmh,
    ecDay,
    formattedAmharic: `${monthAmh} ${ecDay}, ${ecYear} ዓ.ም`,
    formattedEnglish: `${monthEng} ${ecDay}, ${ecYear} EC`,
  };
}
