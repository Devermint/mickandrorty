export type LeaderboardEntry = {
  id: string;
  points: number;
  rank: number;
  isSelf: boolean;
  name: string;
};

export type LeaderboardPeriod = {
  range_start: string;
  range_end: string;
  entries: LeaderboardEntry[];
};

export type LeaderboardResponse = {
  weekly: LeaderboardPeriod;
  monthly: LeaderboardPeriod;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isLeaderboardEntry = (value: unknown): value is LeaderboardEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    isFiniteNumber(record.points) &&
    isFiniteNumber(record.rank) &&
    typeof record.isSelf === "boolean" &&
    typeof record.name === "string"
  );
};

const isLeaderboardPeriod = (value: unknown): value is LeaderboardPeriod => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const entries = record.entries;

  return (
    typeof record.range_start === "string" &&
    typeof record.range_end === "string" &&
    Array.isArray(entries) &&
    entries.every(isLeaderboardEntry)
  );
};

export const isLeaderboardResponse = (
  value: unknown
): value is LeaderboardResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const weekly = record.weekly;
  const monthly = record.monthly;

  return isLeaderboardPeriod(weekly) && isLeaderboardPeriod(monthly);
};