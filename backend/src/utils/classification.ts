/**
 * Classification utilities for 年別/月別/週別 grouping
 */

export type ClassificationType = 'year' | 'month' | 'week';

export interface ClassificationValue {
  type: ClassificationType;
  value: string;
}

/**
 * Get year classification from date (e.g., "2024")
 */
export const getYearClassification = (date: Date): string => {
  return date.getFullYear().toString();
};

/**
 * Get month classification from date (e.g., "2024/04")
 */
export const getMonthClassification = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
};

/**
 * Get week classification from date (e.g., "2024-W20")
 * ISO week format
 */
export const getWeekClassification = (date: Date): string => {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

/**
 * Get ISO week number
 */
const getISOWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Generate all classifications for a date
 */
export const generateClassifications = (date: Date): ClassificationValue[] => {
  return [
    { type: 'year', value: getYearClassification(date) },
    { type: 'month', value: getMonthClassification(date) },
    { type: 'week', value: getWeekClassification(date) },
  ];
};

/**
 * Classify patent by application date or publication date
 */
export const classifyPatent = (
  applicationDate: Date | null,
  publicationDate: Date | null
): ClassificationValue[] => {
  const date = applicationDate || publicationDate;
  if (!date) return [];
  return generateClassifications(date);
};

