import { sha3_256 } from "@noble/hashes/sha3";
import { hexToBytes as _hexToBytes } from "@noble/hashes/utils";
import { Aptos, InputViewFunctionData } from "@aptos-labs/ts-sdk";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";

const FEE_MULTIPLIER = 30n; // 0.30%
const FEE_SCALE = 10_000n;

const strip0x = (h: string) => (h.startsWith("0x") ? h.slice(2) : h);
const normalizeAddr = (a: string): string =>
  ("0x" + strip0x(a).toLowerCase().padStart(64, "0")) as string;

const hexToBytes = (h: string) => _hexToBytes(strip0x(h));
const u8 = (n: number) => Uint8Array.of(n & 0xff);

const concatBytes = (...arrs: Uint8Array[]) => {
  const len = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const a of arrs) {
    out.set(a, off);
    off += a.length;
  }
  return out;
};

const compareBytes = (a: Uint8Array, b: Uint8Array) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
};

const bcsAddressBytes = (addr: string) => {
  const bytes = hexToBytes(addr);
  if (bytes.length === 32) return bytes;
  const out = new Uint8Array(32);
  out.set(bytes, 32 - bytes.length);
  return out;
};

// sha3_256(bcs(source) || seed || 0xFF)
const createResourceAddress = (source: string, seed: Uint8Array): string => {
  const input = concatBytes(
    bcsAddressBytes(normalizeAddr(source)),
    seed,
    u8(0xff)
  );
  const hash = sha3_256(input);
  const hex =
    "0x" + Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
  return hex as string;
};

const toBig = (v: string | number | bigint) =>
  typeof v === "bigint"
    ? v
    : typeof v === "number"
    ? BigInt(Math.floor(v))
    : BigInt(v);

const mulDiv = (a: bigint, b: bigint, d: bigint) => {
  if (d === 0n) throw new Error("division by zero");
  return (a * b) / d;
};
const floorWithBps = (x: bigint, bps: number) =>
  (x * (FEE_SCALE - BigInt(bps))) / FEE_SCALE;

// ----------------- tiny emitter -----------------
type EventName =
  | "loading:start"
  | "loading:end"
  | "reserves:update"
  | "tx:submitted"
  | "tx:success"
  | "tx:error";
type Listener = (data?: any) => void;
class Emitter {
  private m = new Map<EventName, Set<Listener>>();
  on(n: EventName, fn: Listener) {
    if (!this.m.has(n)) this.m.set(n, new Set());
    this.m.get(n)!.add(fn);
    return () => this.m.get(n)!.delete(fn);
  }
  emit(n: EventName, d?: any) {
    this.m.get(n)?.forEach((f) => f(d));
  }
}

// ----------------- SDK -----------------
export type SDKInit = {
  nodeUrl: string;
  moduleAddress: string;
  aptosSDK: Aptos;
  defaultSlippageBps?: number; // default 100 (1%)
};

type Reserves = {
  reserveX: bigint;
  reserveY: bigint;
  pairAddress: string;
  tsMs: number;
  stale: boolean;
};

export class AptosSwapSDK {
  readonly aptos: Aptos;
  readonly moduleAddress: string;
  readonly interfaceModule: `${string}::${string}`;
  readonly implementsModule: `${string}::${string}`;
  readonly agentCreatorModule: `${string}::${string}`;
  readonly defaultSlippageBps: number;
  readonly emitter = new Emitter();

  private poolAdminSeed = new TextEncoder().encode("swap_account_seed");
  private pairSeedPrefix = new TextEncoder().encode("swap:");
  private colon = Uint8Array.of(58);

  private _poolAdminAddr?: string;
  private reservesCache = new Map<string, Reserves>();
  private lpMetaCache = new Map<string, string>();
  private readonly CACHE_TTL_MS = 15_000;

  constructor(opts: SDKInit) {
    this.aptos = opts.aptosSDK;
    this.moduleAddress = normalizeAddr(opts.moduleAddress);
    this.interfaceModule = `${this.moduleAddress}::interface`;
    this.implementsModule = `${this.moduleAddress}::implements`;
    this.agentCreatorModule = `${this.moduleAddress}::agent_creator`;
    this.defaultSlippageBps = opts.defaultSlippageBps ?? 100;
  }
// --- add near other helpers ---
  private ceilDiv(n: bigint, d: bigint) {
    if (d === 0n) throw new Error("division by zero");
    return (n + d - 1n) / d;
  }
  getAmountIn(amountOut: bigint, reserveIn: bigint, reserveOut: bigint) {
    // Uniswap v2 style with fee
    if (amountOut <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
    if (amountOut >= reserveOut) throw new Error("insufficient liquidity");
    const feeMul = FEE_SCALE - FEE_MULTIPLIER; // 9970 for 0.30%
    // amountIn = ceil( reserveIn * amountOut * SCALE / ((reserveOut - amountOut) * feeMul) )
    const num = reserveIn * amountOut * FEE_SCALE;
    const den = (reserveOut - amountOut) * feeMul;
    return this.ceilDiv(num, den);
  }

// --- new public quoteExactOut ---
  async quoteExactOut(
      inMeta: string,
      outMeta: string,
      amountOut: bigint,
      refreshIfStale = true,
      slippageBps?: number
  ) {
    const { reserves } = await this.getReserves(inMeta, outMeta, {
      refreshIfStale,
    });
    const { a, b } = this.orderAndSeed(inMeta, outMeta);

    const reserveIn =
        normalizeAddr(inMeta) === a ? reserves.reserveX : reserves.reserveY;
    const reserveOut =
        normalizeAddr(outMeta) === b ? reserves.reserveY : reserves.reserveX;

    const inAmt = this.getAmountIn(amountOut, reserveIn, reserveOut);
    const spot = this.getSpotPrice(reserveIn, reserveOut);
    const exec = this.getExecutionPrice(inAmt, amountOut);
    const priceImpact = this.getPriceImpact(spot, exec);

    // slippage tolerance → max input
    const slip = slippageBps ?? this.defaultSlippageBps;
    const maxIn = this.ceilDiv(inAmt * FEE_SCALE, FEE_SCALE - BigInt(slip));

    return {
      amountIn: inAmt,
      maxIn,
      slippageBps: slip,
      spotPrice: spot,
      executionPrice: exec,
      priceImpact,
      pairAddress: reserves.pairAddress,
      reserves,
    };
  }

  getPoolAdminAddress(): string {
    if (!this._poolAdminAddr) {
      this._poolAdminAddr = createResourceAddress(
        this.moduleAddress,
        this.poolAdminSeed
      );
    }
    return this._poolAdminAddr;
  }
  private orderAndSeed(xMeta: string, yMeta: string) {
    const xb = bcsAddressBytes(normalizeAddr(xMeta));
    const yb = bcsAddressBytes(normalizeAddr(yMeta));
    const xFirst = compareBytes(xb, yb) < 0;
    const a = xFirst ? normalizeAddr(xMeta) : normalizeAddr(yMeta);
    const b = xFirst ? normalizeAddr(yMeta) : normalizeAddr(xMeta);
    const seed = concatBytes(
      this.pairSeedPrefix,
      bcsAddressBytes(a),
      this.colon,
      bcsAddressBytes(b)
    );
    return { a, b, seed };
  }
  getPairAddress(xMeta: string, yMeta: string): string {
    const { seed } = this.orderAndSeed(xMeta, yMeta);
    return createResourceAddress(this.getPoolAdminAddress(), seed);
  }
  private pairKey(xMeta: string, yMeta: string) {
    const { a, b } = this.orderAndSeed(xMeta, yMeta);
    return `${a}_${b}`;
  }

  // FA views
  private async viewPrimaryBalance(
    owner: string,
    metadataAddr: string
  ): Promise<bigint> {
    const payload: InputViewFunctionData = {
      function: "0x1::primary_fungible_store::balance",
      typeArguments: ["0x1::fungible_asset::Metadata"],
      functionArguments: [normalizeAddr(owner), normalizeAddr(metadataAddr)],
    };
    const [raw] = await this.aptos.view({ payload });
    return toBig(raw as string);
  }

  private async viewFASupply(meta: string): Promise<bigint> {
    const payload: InputViewFunctionData = {
      function: "0x1::fungible_asset::supply",
      typeArguments: ["0x1::fungible_asset::Metadata"],
      functionArguments: [normalizeAddr(meta)],
    };
    const [opt] = await this.aptos.view({ payload });
    const v = (opt as any)?.vec?.[0] ?? 0;
    return toBig(v);
  }

  async getReserves(
    xMeta: string,
    yMeta: string,
    opts?: { refresh?: boolean; refreshIfStale?: boolean }
  ) {
    const key = this.pairKey(xMeta, yMeta);
    const cached = this.reservesCache.get(key);
    const now = Date.now();
    const isExpired = !cached || now - cached.tsMs > this.CACHE_TTL_MS;
    const mustRefresh =
      !!opts?.refresh || (!!opts?.refreshIfStale && isExpired) || !cached;

    if (!mustRefresh && cached)
      return {
        reserves: { ...cached, stale: now - cached.tsMs > this.CACHE_TTL_MS },
      };

    this.emitter.emit("loading:start", { op: "getReserves", key });
    try {
      const pair = this.getPairAddress(xMeta, yMeta);
      const { a, b } = this.orderAndSeed(xMeta, yMeta);
      const [rx, ry] = await Promise.all([
        this.viewPrimaryBalance(pair, a),
        this.viewPrimaryBalance(pair, b),
      ]);
      const entry: Reserves = {
        reserveX: rx,
        reserveY: ry,
        pairAddress: pair,
        tsMs: Date.now(),
        stale: false,
      };
      this.reservesCache.set(key, entry);
      this.emitter.emit("reserves:update", { key, entry });
      return { reserves: entry };
    } finally {
      this.emitter.emit("loading:end", { op: "getReserves", key });
    }
  }

  async getWalletBalance(owner: string, meta: string) {
    return this.viewPrimaryBalance(owner, meta);
  }

  private async getLpMeta(pairAddr: string) {
    const hit = this.lpMetaCache.get(pairAddr);
    if (hit) return hit;
    const type: string = `${this.implementsModule}::LiquidityPool`;
    // @ts-ignore
    const res: any = await this.aptos.getAccountResource({
      accountAddress: pairAddr,
      resourceType: type as any,
    });
    const data = res?.data ?? res;
    const lp: string | undefined =
      typeof data?.lp_meta === "string"
        ? data.lp_meta
        : typeof data?.lp_meta?.inner === "string"
        ? data.lp_meta.inner
        : typeof data?.lp_meta?.object === "string"
        ? data.lp_meta.object
        : undefined;
    if (!lp)
      throw new Error(`Cannot read LiquidityPool.lp_meta at ${pairAddr}`);
    const norm = normalizeAddr(lp);
    this.lpMetaCache.set(pairAddr, norm);
    return norm;
  }

  async getWalletLPBalance(owner: string, xMeta: string, yMeta: string) {
    const pair = this.getPairAddress(xMeta, yMeta);
    const lpMeta = await this.getLpMeta(pair);
    const bal = await this.viewPrimaryBalance(owner, lpMeta);
    return { lpMeta, lpBalance: bal, pairAddress: pair };
  }

  // --- AMM math ---
  getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
    if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
    const feeMul = FEE_SCALE - FEE_MULTIPLIER; // 9970
    const inAfter = amountIn * feeMul; // scaled by 10_000
    const newIn = reserveIn * FEE_SCALE + inAfter; // scaled
    return mulDiv(inAfter, reserveOut, newIn); // truncation == Move
  }
  getSpotPrice(reserveIn: bigint, reserveOut: bigint) {
    if (reserveOut === 0n) return Infinity;
    return Number(reserveIn) / Number(reserveOut);
  }
  getExecutionPrice(amountIn: bigint, amountOut: bigint) {
    if (amountOut === 0n) return Infinity;
    return Number(amountIn) / Number(amountOut);
  }
  getPriceImpact(spot: number, exec: number) {
    if (!isFinite(spot) || spot === 0) return 0;
    return exec / spot - 1;
  }
  getOptimalAdd(xDesired: bigint, yDesired: bigint, rx: bigint, ry: bigint) {
    if (rx === 0n && ry === 0n) return { x: xDesired, y: yDesired };
    const yOpt = mulDiv(xDesired, ry, rx);
    if (yOpt <= yDesired) return { x: xDesired, y: yOpt };
    const xOpt = mulDiv(yDesired, rx, ry);
    if (xOpt > xDesired) throw new Error("x_opt > x_desired");
    return { x: xOpt, y: yDesired };
  }

  // --- quoting ---
  async quoteExactIn(
    inMeta: string,
    outMeta: string,
    amountIn: bigint,
    refreshIfStale = true,
    slippageBps?: number
  ) {
    const { reserves } = await this.getReserves(inMeta, outMeta, {
      refreshIfStale,
    });
    const { a, b } = this.orderAndSeed(inMeta, outMeta);

    const reserveIn =
      normalizeAddr(inMeta) === a ? reserves.reserveX : reserves.reserveY;
    const reserveOut =
      normalizeAddr(outMeta) === b ? reserves.reserveY : reserves.reserveX;

    const out = this.getAmountOut(amountIn, reserveIn, reserveOut);
    const spot = this.getSpotPrice(reserveIn, reserveOut);
    const exec = this.getExecutionPrice(amountIn, out);
    const priceImpact = this.getPriceImpact(spot, exec);

    // slippage tolerance
    const slip = slippageBps ?? this.defaultSlippageBps;
    const minOut = floorWithBps(out, slip);

    return {
      amountOut: out,
      minOut, // 💡 new: minimum out with slippage
      slippageBps: slip,
      spotPrice: spot,
      executionPrice: exec,
      priceImpact,
      pairAddress: reserves.pairAddress,
      reserves,
    };
  }
  // --- tx builders ---
  buildRegisterPoolTx(
    xMeta: string,
    yMeta: string,
    sender: string
  ): InputTransactionData {
    return {
      ...(sender ? { sender } : {}),
      data: {
        function: `${this.interfaceModule}::register_pool`,
        typeArguments: [],
        functionArguments: [normalizeAddr(xMeta), normalizeAddr(yMeta)],
      },
    };
  }
  async buildAddLiquidityTx(
    xMeta: string,
    yMeta: string,
    xDesired: bigint,
    yDesired: bigint,
    sender: string,
    slippageBps?: number
  ): Promise<{
    payload: InputTransactionData;
    computed: {
      optimal: { x: bigint; y: bigint };
      xMin: bigint;
      yMin: bigint;
      pairAddress: string;
    };
  }> {
    const { reserves } = await this.getReserves(xMeta, yMeta, {
      refreshIfStale: true,
    });

    // compute optimal in canonical (a,b)
    const { a } = this.orderAndSeed(xMeta, yMeta);
    const xDesA = normalizeAddr(xMeta) === a ? xDesired : yDesired;
    const yDesA = normalizeAddr(xMeta) === a ? yDesired : xDesired;

    const optA = this.getOptimalAdd(
      xDesA,
      yDesA,
      reserves.reserveX,
      reserves.reserveY
    );
    const slip = slippageBps ?? this.defaultSlippageBps;
    const minXA = floorWithBps(optA.x, slip);
    const minYA = floorWithBps(optA.y, slip);

    // map BOTH amounts and mins to caller order
    const xIsA = normalizeAddr(xMeta) === a;
    const valForX = xIsA ? optA.x : optA.y;
    const valForY = xIsA ? optA.y : optA.x;
    const minForX = xIsA ? minXA : minYA;
    const minForY = xIsA ? minYA : minXA;

    const payload: InputTransactionData = {
      ...(sender ? { sender } : {}),
      data: {
        function: `${this.interfaceModule}::add_liquidity`,
        typeArguments: [],
        functionArguments: [
          normalizeAddr(xMeta),
          normalizeAddr(yMeta),
          valForX.toString(),
          minForX.toString(),
          valForY.toString(),
          minForY.toString(),
        ],
      },
    };

    return {
      payload,
      computed: {
        optimal: { x: optA.x, y: optA.y },
        xMin: minForX,
        yMin: minForY,
        pairAddress: reserves.pairAddress,
      },
    };
  }

  async buildRemoveLiquidityTx(
    xMeta: string,
    yMeta: string,
    lpAmount: bigint,
    sender: string,
    slippageBps?: number
  ): Promise<{
    payload: InputTransactionData;
    computed: {
      expected: { xOut: bigint; yOut: bigint };
      minX: bigint;
      minY: bigint;
      pairAddress: string;
      lpMeta: string;
    };
  }> {
    const { reserves } = await this.getReserves(xMeta, yMeta, {
      refresh: true,
    });
    const pairAddr = reserves.pairAddress;
    const lpMeta = await this.getLpMeta(pairAddr);

    // always fresh total supply for tx math
    const supply = await this.viewFASupply(lpMeta);
    if (supply === 0n) throw new Error("LP total supply is zero");

    // outputs in canonical (a,b)
    const aOut = mulDiv(reserves.reserveX, lpAmount, supply);
    const bOut = mulDiv(reserves.reserveY, lpAmount, supply);

    const slip = slippageBps ?? this.defaultSlippageBps;
    const minA = floorWithBps(aOut, slip);
    const minB = floorWithBps(bOut, slip);

    // map mins to caller order
    const { a } = this.orderAndSeed(xMeta, yMeta);
    const xIsA = normalizeAddr(xMeta) === a;
    const minForX = xIsA ? minA : minB;
    const minForY = xIsA ? minB : minA;

    const payload: InputTransactionData = {
      ...(sender ? { sender } : {}),
      data: {
        function: `${this.interfaceModule}::remove_liquidity`,
        typeArguments: [],
        functionArguments: [
          normalizeAddr(xMeta),
          normalizeAddr(yMeta),
          lpAmount.toString(),
          minForX.toString(),
          minForY.toString(),
        ],
      },
    };

    return {
      payload,
      computed: {
        expected: { xOut: aOut, yOut: bOut },
        minX: minForX,
        minY: minForY,
        pairAddress: pairAddr,
        lpMeta,
      },
    };
  }

  async buildSwapTx(
    inMeta: string,
    outMeta: string,
    amountIn: bigint,
    sender: string,
    slippageBps?: number
  ): Promise<{
    payload: InputTransactionData;
    computed: { expectedOut: bigint; minOut: bigint };
  }> {
    const { amountOut } = await this.quoteExactIn(
      inMeta,
      outMeta,
      amountIn,
      true
    );
    const slip = slippageBps ?? this.defaultSlippageBps;
    const minOut = floorWithBps(amountOut, slip);

    const payload: InputTransactionData = {
      ...(sender ? { sender } : {}),
      data: {
        function: `${this.interfaceModule}::swap`,
        typeArguments: [],
        functionArguments: [
          normalizeAddr(inMeta),
          normalizeAddr(outMeta),
          amountIn.toString(),
          minOut.toString(),
        ],
      },
    };

    return { payload, computed: { expectedOut: amountOut, minOut } };
  }
  async fetchCreatedAgentMeta(txHash: string): Promise<string | null> {
    const tx = await this.aptos.waitForTransaction({ transactionHash: txHash });
    if (!("events" in tx)) return null;

    const createdEventType = `${this.agentCreatorModule}::CreatedEvent`;

    const evt = tx.events.find((e: any) => e.type === createdEventType);
    if (!evt) return null;
    // `meta` is the FA metadata object address in event.data
    return evt.data.meta as string;
  }

  async buildCreateAgentTx(
    name: string,
    symbol: string,
    iconUri: string,
    sender: string
  ): Promise<{ payload: InputTransactionData }> {
    const payload: InputTransactionData = {
      ...(sender ? { sender } : {}),
      data: {
        function: `${this.agentCreatorModule}::create_agent`,
        typeArguments: [],
        functionArguments: [
          // Name, symbol, icon uri
          name.toString(),
          symbol.toString(),
          iconUri.toString(),
        ],
      },
    };

    return { payload };
  }

  async submitWithWallet(wallet: PetraWallet, payload: InputTransactionData) {
    this.emitter.emit("loading:start", { op: "submit" });
    this.emitter.emit("tx:submitted", { payload });
    const res = await wallet.signAndSubmitTransaction(payload as any);
    this.emitter.emit("tx:success", res);
    return res;
  }
}
