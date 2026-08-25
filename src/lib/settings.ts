import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

const SETTINGS_CACHE_KEY = "system:settings";
const SETTINGS_TTL = 30; // seconds

export interface PlatformSettings {
  enableDirectBooking: boolean;
  leadFee: number;
  supportEmail: string;
  mpesaPaybill: string;
  semester1EndDate: string; // e.g. "2026-12-20"
  semester2EndDate: string; // e.g. "2026-04-30"
  academicYearEndDate: string; // e.g. "2026-07-31"
}

const DEFAULT_SETTINGS: PlatformSettings = {
  enableDirectBooking: false, // Default is FALSE (hidden) as requested
  leadFee: 50,
  supportEmail: "campusdive.org@gmail.com",
  mpesaPaybill: "400200",
  semester1EndDate: "2026-12-20",
  semester2EndDate: "2026-04-30",
  academicYearEndDate: "2026-07-31",
};

/**
 * Fetch all platform settings with in-memory caching.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const cached = cacheGet<PlatformSettings>(SETTINGS_CACHE_KEY);
  if (cached) return cached;

  try {
    const records = await (prisma as any).systemSetting.findMany();
    const result: PlatformSettings = { ...DEFAULT_SETTINGS };

    for (const record of records) {
      if (record.key === "ENABLE_DIRECT_BOOKING") {
        result.enableDirectBooking = record.value === "true";
      } else if (record.key === "LEAD_FEE") {
        result.leadFee = Number(record.value) || 50;
      } else if (record.key === "SUPPORT_EMAIL") {
        result.supportEmail = record.value;
      } else if (record.key === "MPESA_PAYBILL") {
        result.mpesaPaybill = record.value;
      } else if (record.key === "SEMESTER_1_END_DATE") {
        result.semester1EndDate = record.value;
      } else if (record.key === "SEMESTER_2_END_DATE") {
        result.semester2EndDate = record.value;
      } else if (record.key === "ACADEMIC_YEAR_END_DATE") {
        result.academicYearEndDate = record.value;
      }
    }

    cacheSet(SETTINGS_CACHE_KEY, result, SETTINGS_TTL);
    return result;
  } catch (error) {
    console.warn("[getPlatformSettings] Fallback to default settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save or update platform settings.
 */
export async function updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const entries: { key: string; value: string }[] = [];

  if (settings.enableDirectBooking !== undefined) {
    entries.push({ key: "ENABLE_DIRECT_BOOKING", value: String(settings.enableDirectBooking) });
  }
  if (settings.leadFee !== undefined) {
    entries.push({ key: "LEAD_FEE", value: String(settings.leadFee) });
  }
  if (settings.supportEmail !== undefined) {
    entries.push({ key: "SUPPORT_EMAIL", value: settings.supportEmail });
  }
  if (settings.mpesaPaybill !== undefined) {
    entries.push({ key: "MPESA_PAYBILL", value: settings.mpesaPaybill });
  }
  if (settings.semester1EndDate !== undefined) {
    entries.push({ key: "SEMESTER_1_END_DATE", value: settings.semester1EndDate });
  }
  if (settings.semester2EndDate !== undefined) {
    entries.push({ key: "SEMESTER_2_END_DATE", value: settings.semester2EndDate });
  }
  if (settings.academicYearEndDate !== undefined) {
    entries.push({ key: "ACADEMIC_YEAR_END_DATE", value: settings.academicYearEndDate });
  }

  for (const { key, value } of entries) {
    await (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  cacheDelete(SETTINGS_CACHE_KEY);
  return getPlatformSettings();
}

