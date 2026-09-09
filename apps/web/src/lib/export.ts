/**
 * Universal Data Export Utility for BetFlow CRM.
 * Supports UTF-8 BOM encoding for seamless Microsoft Excel opening with Amharic/Unicode support.
 */

import { formatDualDate } from "@betflow/shared";

export type CsvExportOptions = {
  filename: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
};

/**
 * Escapes a single CSV cell value safely against CSV injection & delimiter breakage.
 */
function escapeCsvCell(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // Guard against CSV formula injection in spreadsheet software
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports tabular data as a downloadable CSV file with UTF-8 BOM encoding.
 */
export function exportToCsv({ filename, headers, rows }: CsvExportOptions): void {
  if (typeof window === "undefined") return;

  const headerRow = headers.map(escapeCsvCell).join(",");
  const bodyRows = rows.map((row) => row.map(escapeCsvCell).join(","));
  const csvString = [headerRow, ...bodyRows].join("\r\n");

  // \uFEFF is UTF-8 BOM, required for Excel to properly render Amharic / non-ASCII UTF-8 characters
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Formats a date value into dual Gregorian and Ethiopian calendar string suitable for export cells.
 */
export function formatExportDualDate(
  dateValue: string | Date | null | undefined,
  locale: "am" | "en" = "en",
): string {
  if (!dateValue) return "N/A";
  try {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "N/A";
    return formatDualDate(d, locale);
  } catch {
    return String(dateValue);
  }
}

