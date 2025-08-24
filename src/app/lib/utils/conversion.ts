export const toAtomic = (amountStr: string, decimals: number): bigint => {
  const [i, f = ""] = amountStr.split(".");
  const frac = f.padEnd(decimals, "0").slice(0, decimals);
  const whole = BigInt(i || "0");
  const fracBI = BigInt(frac || "0");
  return whole * BigInt(10) ** BigInt(decimals) + fracBI;
};
export const fromAtomic = (amount: bigint, decimals: number): string => {
  const base = BigInt(10) ** BigInt(decimals);
  const i = amount / base;
  const f = amount % base;
  if (f === 0n) return i.toString();
  const fStr = f.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${i.toString()}.${fStr}`;
};
