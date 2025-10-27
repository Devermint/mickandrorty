export const isFiniteNum = (n: number | null | undefined) =>
  n && n != null && Number.isFinite(n);

export const normalizeHex = (addr: string) => {
  const a = addr.toLowerCase();
  return a.startsWith("0x") ? a : `0x${a}`;
};

export const addrLT = (a: string, b: string) => {
  try {
    return BigInt(normalizeHex(a)) < BigInt(normalizeHex(b));
  } catch {
    return normalizeHex(a) < normalizeHex(b);
  }
};

export const sanitizeDecimalInput = (
  raw: string,
  maxDecimals: number
): string => {
  let s = raw.replace(/[^0-9.]/g, "");
  const parts = s.split(".");
  if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
  const [ip, fp = ""] = s.split(".");
  const trimmedFp = fp.slice(0, Math.max(0, maxDecimals));
  if (ip && ip !== "0" && ip.startsWith("0")) {
    const n = String(parseInt(ip, 10));
    s = n + (trimmedFp ? "." + trimmedFp : "");
  } else {
    s =
      (ip || "0") + (trimmedFp ? "." + trimmedFp : s.endsWith(".") ? "." : "");
  }
  if (s === "." || s === "") s = "0";
  return s;
};

export const formatTinyPrice = (numStr?: string) => {
  if (!numStr) return <>{numStr}</>;
  if (!numStr.includes(".")) return <>{formatThousands(numStr)}</>;
  const [intPart, fracPart] = numStr.split(".");
  let trueZeroCount = 0;
  while (fracPart[trueZeroCount] === "0") trueZeroCount++;
  const significant = fracPart.slice(trueZeroCount).slice(0, 4).padEnd(4, "0");
  const intFmt = formatThousands(intPart);
  if (trueZeroCount > 0) {
    return (
      <>
        {intFmt}.0{trueZeroCount - 1 > 0 && <sup>{trueZeroCount - 1}</sup>}
        {significant}
      </>
    );
  }
  return (
    <>
      {intFmt}.{significant}
    </>
  );
};

export const formatThousands = (num: string | number, sep = ","): string => {
  const s = String(num);
  const isNeg = s.startsWith("-");
  const body = isNeg ? s.slice(1) : s;
  const [intPart, fracPart] = body.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (
    (isNeg ? "-" : "") +
    grouped +
    (fracPart !== undefined ? "." + fracPart : "")
  );
};

export const getEllipsisAddress = (
  address: string,
  prefixLength = 4,
  suffixLength = 4
) => {
  if (!address) return "";

  const normalized = normalizeHex(address);
  const cleanAddress = normalized.slice(2);

  if (cleanAddress.length <= prefixLength + suffixLength) {
    return normalized;
  }

  const prefix = cleanAddress.slice(0, prefixLength);
  const suffix = cleanAddress.slice(-suffixLength);

  return `0x${prefix}...${suffix}`;
};

// utils/formatFinanceNumber.ts
export function formatFinanceNumber(
  value: number | string | null | undefined,
  decimals: number = 2,
  trim: boolean = true
): string {
  if (value == null) return "—";

  const num =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(num)) return "—";

  const negative = num < 0;
  const abs = Math.abs(num);

  // finance-style suffixes
  const suffixes = [
    { v: 1e15, s: "Q" }, // Quadrillion
    { v: 1e12, s: "T" }, // Trillion
    { v: 1e9, s: "B" }, // Billion
    { v: 1e6, s: "M" }, // Million
    { v: 1e3, s: "K" }, // Thousand
  ];

  let scaled = abs;
  let suffix = "";

  for (const { v, s } of suffixes) {
    if (abs >= v) {
      scaled = abs / v;
      suffix = s;
      break;
    }
  }

  let formatted = scaled.toFixed(decimals);
  if (trim) formatted = formatted.replace(/\.?0+$/, ""); // strip trailing zeros

  return `${negative ? "-" : ""}${formatted}${suffix}`;
}
