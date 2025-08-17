// // aptos-swap-sdk.ts
// // One-file, class-based SDK for your Aptos AMM.
// // - No app framework assumptions
// // - Uses @aptos-labs/ts-sdk for RPC + view calls
// // - Pure helpers for resource address derivation (sha3-256)
// // - Action-driven 15s reserve caching with stale flag
// // - Emits minimal loading/tx/reserve events
// //
// // Dependencies to install in your app:
// //   npm i @aptos-labs/ts-sdk @noble/hashes
// //
// // Usage sketch:
// //   const sdk = new AptosSwapSDK({ nodeUrl, moduleAddress: '0x...::swap', defaultSlippageBps: 100 });
// //   const pair = sdk.getPairAddress(xMeta, yMeta);
// //   const { reserves, stale } = await sdk.getReserves(xMeta, yMeta, { refreshIfStale: true });
// //   const quote = await sdk.quoteExactIn({ inMeta: xMeta, outMeta: yMeta, amountIn: 1_000_000n });
// //   const payload = await sdk.buildSwapTx({ sender: addr, inMeta: xMeta, outMeta: yMeta, amountIn: 1_000_000n, slippageBps: 100 });
// //   await wallet.signAndSubmitTransaction(payload);
// //
// // Notes:
// // - All amounts are raw u64 as BigInt (no decimals applied).
// // - Metadata params are FA metadata OBJECT addresses (like your CLI).
// // - Module address is the account that published `swap` (aka @swap).
//
// import { sha3_256 } from "@noble/hashes/sha3";
// import { hexToBytes as _hexToBytes } from "@noble/hashes/utils";
// import {
//     Aptos,
//     AptosConfig,
//     InputViewFunctionData,
//     InputGenerateTransactionPayloadData,
//     // Types:
//     MoveStructId,
// } from "@aptos-labs/ts-sdk";
//
// // -------------------------- small utils --------------------------
//
// type Hex = `0x${string}`;
// // const ZERO_ADDR: Hex = "0x0";
// const FEE_MULTIPLIER = 30n;   // 0.30%
// const FEE_SCALE = 10_000n;
//
// function nowMs() { return Date.now(); }
//
// function strip0x(h: string) { return h.startsWith("0x") ? h.slice(2) : h; }
// function normalizeAddr(a: string): Hex {
//     const s = strip0x(a).toLowerCase();
//     return ("0x" + s.padStart(64, "0")) as Hex;
// }
// function hexToBytes(h: string): Uint8Array {
//     return _hexToBytes(strip0x(h));
// }
// function u8(a: number) { return Uint8Array.of(a & 0xff); }
//
// function concatBytes(...arrays: Uint8Array[]) {
//     const len = arrays.reduce((n, a) => n + a.length, 0);
//     const out = new Uint8Array(len);
//     let off = 0;
//     for (const a of arrays) { out.set(a, off); off += a.length; }
//     return out;
// }
//
// function compareBytes(a: Uint8Array, b: Uint8Array): number {
//     const n = Math.min(a.length, b.length);
//     for (let i = 0; i < n; i++) {
//         if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
//     }
//     return a.length === b.length ? 0 : (a.length < b.length ? -1 : 1);
// }
//
// // BCS address = raw 32 bytes. We just pad hex → 32 bytes.
// function bcsAddressBytes(addr: Hex): Uint8Array {
//     const bytes = hexToBytes(addr);
//     if (bytes.length === 32) return bytes;
//     const out = new Uint8Array(32);
//     out.set(bytes, 32 - bytes.length);
//     return out;
// }
//
// // Aptos resource address derivation:
// // sha3_256( bcs(source_addr) || seed || 0xFF )
// function createResourceAddress(source: Hex, seed: Uint8Array): Hex {
//     const input = concatBytes(bcsAddressBytes(normalizeAddr(source)), seed, u8(0xff));
//     const hash = sha3_256(input);
//     // @noble/hashes returns Uint8Array; to hex:
//     const hex = "0x" + Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
//     return hex as Hex;
// }
//
// function toBigInt(v: bigint | number | string): bigint {
//     if (typeof v === "bigint") return v;
//     if (typeof v === "number") return BigInt(Math.floor(v));
//     if (typeof v === "string") return BigInt(v);
//     throw new Error("invalid bigint input");
// }
//
// function mulDiv(a: bigint, b: bigint, d: bigint): bigint {
//     if (d === 0n) throw new Error("division by zero");
//     return (a * b) / d;
// }
//
// function floorWithBps(x: bigint, bps: number): bigint {
//     const b = BigInt(bps);
//     return (x * (FEE_SCALE - b)) / FEE_SCALE;
// }
//
// function ceilWithBps(x: bigint, bps: number): bigint {
//     const b = BigInt(bps);
//     // ceil(x * (1 + bps))
//     return ((x * (FEE_SCALE + b)) + (FEE_SCALE - 1n)) / FEE_SCALE;
// }
//
// // -------------------------- events --------------------------
//
// type EventName =
//     | "loading:start"
//     | "loading:end"
//     | "reserves:update"
//     | "tx:submitted"
//     | "tx:success"
//     | "tx:error";
//
// type Listener = (data?: any) => void;
//
// class Emitter {
//     private m = new Map<EventName, Set<Listener>>();
//     on(name: EventName, fn: Listener) {
//         if (!this.m.has(name)) this.m.set(name, new Set());
//         this.m.get(name)!.add(fn);
//         return () => this.off(name, fn);
//     }
//     off(name: EventName, fn: Listener) { this.m.get(name)?.delete(fn); }
//     emit(name: EventName, data?: any) { this.m.get(name)?.forEach(fn => fn(data)); }
// }
//
// // -------------------------- SDK --------------------------
//
// export type SDKInit = {
//     nodeUrl: string;
//     moduleAddress: Hex; // account that published `swap`
//     defaultSlippageBps?: number; // default 100 (1.00%)
// };
//
// type Reserves = { reserveX: bigint; reserveY: bigint; pairAddress: Hex; tsMs: number; stale: boolean };
//
// type QuoteExactInArgs = { inMeta: Hex; outMeta: Hex; amountIn: bigint; refreshIfStale?: boolean; };
// type QuoteExactOutArgs = { inMeta: Hex; outMeta: Hex; amountOut: bigint; refreshIfStale?: boolean; };
//
// type SwapTxArgs = {
//     sender: Hex;
//     inMeta: Hex;
//     outMeta: Hex;
//     amountIn: bigint;
//     slippageBps?: number; // if omitted uses defaultSlippageBps
// };
//
// type AddLiqTxArgs = {
//     sender: Hex;
//     xMeta: Hex;
//     yMeta: Hex;
//     xDesired: bigint;
//     yDesired: bigint;
//     slippageBps?: number;
//     // lazily creates the pool on-chain anyway, but we keep it explicit in SDK behavior
// };
//
// type RemoveLiqTxArgs = {
//     sender: Hex;
//     xMeta: Hex;
//     yMeta: Hex;
//     lpAmount: bigint;
//     slippageBps?: number;
// };
//
// type CreatePoolTxArgs = { sender: Hex; xMeta: Hex; yMeta: Hex; };
//
// export class AptosSwapSDK {
//     readonly aptos: Aptos;
//     readonly moduleAddress: Hex;  // e.g. 0xf63d...bf2f
//     readonly moduleName = "swap";
//     readonly interfaceModule: string; // `${module}::interface`
//     readonly implementsModule: string; // `${module}::implements`
//     readonly defaultSlippageBps: number;
//     readonly emitter = new Emitter();
//
//     private poolAdminSeed = new TextEncoder().encode("swap_account_seed");
//     private pairSeedPrefix = new TextEncoder().encode("swap:");
//     private colon = Uint8Array.of(58);
//
//     private _poolAdminAddr?: Hex;
//
//     private reservesCache = new Map<string, Reserves>(); // key = `${xMeta}_${yMeta}` sorted key
//     private lpMetaCache = new Map<Hex, Hex>(); // pairAddr -> lp_meta address
//     private lpSupplyCache = new Map<Hex, { supply: bigint; tsMs: number }>(); // lp_meta -> supply
//
//     private readonly CACHE_TTL_MS = 15_000;
//
//     constructor(opts: SDKInit) {
//         const cfg = new AptosConfig({ fullnode: opts.nodeUrl });
//         this.aptos = new Aptos(cfg);
//         this.moduleAddress = normalizeAddr(opts.moduleAddress);
//         this.interfaceModule = `${this.moduleAddress}::interface`;
//         this.implementsModule = `${this.moduleAddress}::implements`;
//         this.defaultSlippageBps = opts.defaultSlippageBps ?? 100;
//     }
//
//     // ------------- address derivation helpers -------------
//
//     getPoolAdminAddress(): Hex {
//         if (!this._poolAdminAddr) {
//             this._poolAdminAddr = createResourceAddress(this.moduleAddress, this.poolAdminSeed);
//         }
//         return this._poolAdminAddr;
//     }
//
//     // Deterministically sort metadata addresses by BCS bytes and compute seed "swap:<A>:<B>"
//     private orderAndMakeSeed(xMeta: Hex, yMeta: Hex): { a: Hex; b: Hex; seed: Uint8Array } {
//         const xb = bcsAddressBytes(normalizeAddr(xMeta));
//         const yb = bcsAddressBytes(normalizeAddr(yMeta));
//         const isXFirst = compareBytes(xb, yb) < 0;
//         const a = isXFirst ? normalizeAddr(xMeta) : normalizeAddr(yMeta);
//         const b = isXFirst ? normalizeAddr(yMeta) : normalizeAddr(xMeta);
//         const seed = concatBytes(this.pairSeedPrefix, bcsAddressBytes(a), this.colon, bcsAddressBytes(b));
//         return { a, b, seed };
//     }
//
//     getPairAddress(xMeta: Hex, yMeta: Hex): Hex {
//         const { seed } = this.orderAndMakeSeed(xMeta, yMeta);
//         const poolAdmin = this.getPoolAdminAddress();
//         return createResourceAddress(poolAdmin, seed);
//     }
//
//     // For cache key we always use sorted meta addresses
//     private pairKey(xMeta: Hex, yMeta: Hex) {
//         const { a, b } = this.orderAndMakeSeed(xMeta, yMeta);
//         return `${a}_${b}`;
//     }
//
//     // ------------- on-chain views (framework) -------------
//
//     private async viewPrimaryBalance(owner: Hex, metadataAddr: Hex): Promise<bigint> {
//         const payload: InputViewFunctionData = {
//             function: "0x1::primary_fungible_store::balance",
//             typeArguments: ["0x1::fungible_asset::Metadata"],
//             functionArguments: [normalizeAddr(owner), normalizeAddr(metadataAddr)],
//         };
//         const [res] = await this.aptos.view({ payload });
//         // REST returns strings; ts-sdk normalizes, but we coerce to bigint:
//         return toBigInt(res as string);
//     }
//
//     private async viewFASupply(metadataAddr: Hex): Promise<bigint> {
//         // 0x1::fungible_asset::supply(Object<Metadata>) -> Option<u128>
//         const payload: InputViewFunctionData = {
//             function: "0x1::fungible_asset::supply",
//             typeArguments: ["0x1::fungible_asset::Metadata"],
//             functionArguments: [normalizeAddr(metadataAddr)],
//         };
//         const [opt] = await this.aptos.view({ payload });
//         if (!opt || typeof opt !== "object" || !("vec" in opt)) {
//             // Some nodes return Move option as { vec: [] | [value] }
//             // Fall back: try number directly
//             const v = (opt as any) ?? 0;
//             return toBigInt(v);
//         }
//         const arr = (opt as any).vec as any[];
//         return arr.length ? toBigInt(arr[0]) : 0n;
//     }
//
//     // ------------- reads (reserves, lp, balances) -------------
//
//     async getReserves(xMeta: Hex, yMeta: Hex, opts?: { refresh?: boolean; refreshIfStale?: boolean }): Promise<{ reserves: Reserves }> {
//         const key = this.pairKey(xMeta, yMeta);
//         const cached = this.reservesCache.get(key);
//         const now = nowMs();
//         const ttlExpired = !cached || (now - cached.tsMs) > this.CACHE_TTL_MS;
//
//         const shouldRefresh =
//             !!opts?.refresh ||
//             (!!opts?.refreshIfStale && ttlExpired) ||
//             !cached;
//
//         if (!shouldRefresh && cached) {
//             const stale = (now - cached.tsMs) > this.CACHE_TTL_MS;
//             return { reserves: { ...cached, stale } };
//         }
//
//         this.emitter.emit("loading:start", { op: "getReserves", key });
//         try {
//             const pairAddr = this.getPairAddress(xMeta, yMeta);
//             // Call in canonical order (a,b)
//             const { a, b } = this.orderAndMakeSeed(xMeta, yMeta);
//             const [rx, ry] = await Promise.all([
//                 this.viewPrimaryBalance(pairAddr, a),
//                 this.viewPrimaryBalance(pairAddr, b),
//             ]);
//             const entry: Reserves = { reserveX: rx, reserveY: ry, pairAddress: pairAddr, tsMs: nowMs(), stale: false };
//             this.reservesCache.set(key, entry);
//             this.emitter.emit("reserves:update", { key, entry });
//             return { reserves: entry };
//         } finally {
//             this.emitter.emit("loading:end", { op: "getReserves", key });
//         }
//     }
//
//     async getWalletBalance(owner: Hex, meta: Hex): Promise<bigint> {
//         return this.viewPrimaryBalance(owner, meta);
//     }
//
//     // LiquidityPool resource → lp_meta address (once)
//     private async getLpMeta(pairAddr: Hex): Promise<Hex> {
//         const cached = this.lpMetaCache.get(pairAddr);
//         if (cached) return cached;
//
//         const type: MoveStructId = `${this.implementsModule}::LiquidityPool`;
//         const res = await this.aptos.getAccountResource({ accountAddress: pairAddr, resourceType: type });
//         // Shape: { data: { lp_meta: { inner: '0x..' } or just address } } depends on node version
//         const data: any = (res as any).data ?? (res as any);
//         let lp: string | undefined;
//
//         // Try common shapes
//         if (typeof data?.lp_meta === "string") lp = data.lp_meta;
//         else if (typeof data?.lp_meta?.inner === "string") lp = data.lp_meta.inner;
//         else if (typeof data?.lp_meta?.object === "string") lp = data.lp_meta.object;
//
//         if (!lp) throw new Error(`Cannot decode LiquidityPool.lp_meta at ${pairAddr}`);
//         const lpMeta = normalizeAddr(lp);
//         this.lpMetaCache.set(pairAddr, lpMeta);
//         return lpMeta;
//     }
//
//     async getWalletLPBalance(owner: Hex, xMeta: Hex, yMeta: Hex): Promise<{ lpMeta: Hex; lpBalance: bigint; pairAddress: Hex }> {
//         const pairAddr = this.getPairAddress(xMeta, yMeta);
//         const lpMeta = await this.getLpMeta(pairAddr);
//         const lpBal = await this.viewPrimaryBalance(owner, lpMeta);
//         return { lpMeta, lpBalance: lpBal, pairAddress: pairAddr };
//         // Note: no 15s caching here; balances change per user action frequently.
//     }
//
//     // ------------- AMM math (parity with your Move) -------------
//
//     // get_amount_out(coin_in, reserve_in, reserve_out) w/ fee:
//     getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
//         if (amountIn <= 0n) return 0n;
//         if (reserveIn <= 0n || reserveOut <= 0n) return 0n;
//
//         const feeMultiplier = FEE_SCALE - FEE_MULTIPLIER;                   // 9970 if fee 0.30% and scale 10000
//         const amtInAfterFees = amountIn * feeMultiplier;                    // scaled by 10_000
//         const newReserveIn = reserveIn * FEE_SCALE + amtInAfterFees;        // scaled by 10_000
//         return mulDiv(amtInAfterFees, reserveOut, newReserveIn);            // truncation matches Move
//     }
//
//     // Spot price (in/out) = reserveIn / reserveOut (as rational)
//     getSpotPrice(reserveIn: bigint, reserveOut: bigint): number {
//         if (reserveOut === 0n) return Infinity;
//         return Number(reserveIn) / Number(reserveOut);
//     }
//
//     // Execution price = amountIn / amountOut
//     getExecutionPrice(amountIn: bigint, amountOut: bigint): number {
//         if (amountOut === 0n) return Infinity;
//         return Number(amountIn) / Number(amountOut);
//     }
//
//     // Price impact = exec/spot - 1
//     getPriceImpact(spot: number, exec: number): number {
//         if (!isFinite(spot) || spot === 0) return 0;
//         return exec / spot - 1;
//     }
//
//     // Optimal amounts for add liquidity (same logic as Move)
//     getOptimalAddAmounts(
//         xDesired: bigint, yDesired: bigint,
//         reserveX: bigint, reserveY: bigint,
//     ): { x: bigint; y: bigint } {
//         if (reserveX === 0n && reserveY === 0n) return { x: xDesired, y: yDesired };
//
//         // y_opt = x_desired * reserveY / reserveX
//         const yOpt = mulDiv(xDesired, reserveY, reserveX);
//         if (yOpt <= yDesired) return { x: xDesired, y: yOpt };
//
//         // else x_opt = y_desired * reserveX / reserveY
//         const xOpt = mulDiv(yDesired, reserveX, reserveY);
//         if (xOpt > xDesired) throw new Error("x_opt exceeds x_desired (overlimit)");
//         return { x: xOpt, y: yDesired };
//     }
//
//     // ------------- quoting (uses cached reserves) -------------
//
//     async quoteExactIn(args: QuoteExactInArgs) {
//         const { inMeta, outMeta, amountIn, refreshIfStale } = args;
//         const { reserves } = await this.getReserves(inMeta, outMeta, { refreshIfStale });
//         const { a, b } = this.orderAndMakeSeed(inMeta, outMeta);
//         const reserveIn = (normalizeAddr(inMeta) === a) ? reserves.reserveX : reserves.reserveY;
//         const reserveOut = (normalizeAddr(outMeta) === b) ? reserves.reserveY : reserves.reserveX;
//
//         const out = this.getAmountOut(amountIn, reserveIn, reserveOut);
//         const spot = this.getSpotPrice(reserveIn, reserveOut);
//         const exec = this.getExecutionPrice(amountIn, out);
//         const priceImpact = this.getPriceImpact(spot, exec);
//
//         return {
//             amountOut: out,
//             spotPrice: spot,
//             executionPrice: exec,
//             priceImpact, // >0 = worse than spot
//             reserves,
//         };
//     }
//
//     // ------------- tx builders (wallet-friendly) -------------
//
//     private ef(functionId: string, typeArguments: string[], functionArguments: any[]): InputGenerateTransactionPayloadData {
//         return {
//             function: functionId as MoveStructId,
//             typeArguments,
//             functionArguments,
//         };
//     }
//
//     async buildCreatePoolTx({ sender, xMeta, yMeta }: CreatePoolTxArgs) {
//         // interface::register_pool(account, x_meta, y_meta)
//         const fid = `${this.interfaceModule}::register_pool`;
//         return this.ef(fid, [], [sender, normalizeAddr(xMeta), normalizeAddr(yMeta),]);
//     }
//
//     async buildAddLiquidityTx(args: AddLiqTxArgs) {
//         const { sender, xMeta, yMeta, xDesired, yDesired } = args;
//         // Reserves + optimal + mins
//         const { reserves } = await this.getReserves(xMeta, yMeta, { refreshIfStale: true });
//
//         // Align to canonical order (asset_a == xMeta ? pass as-is : swap)
//         const { a, b } = this.orderAndMakeSeed(xMeta, yMeta);
//         const xDes = normalizeAddr(xMeta) === a ? xDesired : yDesired;
//         const yDes = normalizeAddr(xMeta) === a ? yDesired : xDesired;
//
//         const reserveX = reserves.reserveX;
//         const reserveY = reserves.reserveY;
//         const opt = this.getOptimalAddAmounts(xDes, yDes, reserveX, reserveY);
//
//         const slippage = args.slippageBps ?? this.defaultSlippageBps;
//         const xMin = floorWithBps(opt.x, slippage);
//         const yMin = floorWithBps(opt.y, slippage);
//
//         // interface::add_liquidity(account, x_meta, y_meta, x_val, x_min, y_val, y_min)
//         const fid = `${this.interfaceModule}::add_liquidity`;
//         // IMPORTANT: arguments are passed in user-provided order; the contract realigns internally.
//         const payload = this.ef(fid, [], [
//             normalizeAddr(xMeta),
//             normalizeAddr(yMeta),
//             opt.x.toString(), xMin.toString(),
//             opt.y.toString(), yMin.toString(),
//         ]);
//
//         return { payload, computed: { optimal: opt, xMin, yMin, pairAddress: reserves.pairAddress } };
//     }
//
//     async buildRemoveLiquidityTx(args: RemoveLiqTxArgs) {
//         const { sender, xMeta, yMeta, lpAmount } = args;
//         const { reserves } = await this.getReserves(xMeta, yMeta, { refreshIfStale: true });
//         const pairAddr = reserves.pairAddress;
//         const lpMeta = await this.getLpMeta(pairAddr);
//         // total LP supply (u128); your Move stores supply in FA state:
//         let total = this.lpSupplyCache.get(lpMeta)?.supply;
//         const now = nowMs();
//         if (total === undefined || (now - (this.lpSupplyCache.get(lpMeta)?.tsMs ?? 0)) > this.CACHE_TTL_MS) {
//             total = await this.viewFASupply(lpMeta);
//             this.lpSupplyCache.set(lpMeta, { supply: total, tsMs: nowMs() });
//         }
//         if (!total || total === 0n) throw new Error("LP total supply is zero");
//
//         // Pro-rata expected outs (matches Move burn math before truncation):
//         const xOut = mulDiv(reserves.reserveX, lpAmount, total);
//         const yOut = mulDiv(reserves.reserveY, lpAmount, total);
//
//         const slippage = args.slippageBps ?? this.defaultSlippageBps;
//         const minX = floorWithBps(xOut, slippage);
//         const minY = floorWithBps(yOut, slippage);
//
//         // interface::remove_liquidity(account, x_meta, y_meta, lp_val, min_x, min_y)
//         const fid = `${this.interfaceModule}::remove_liquidity`;
//         const payload = this.ef(fid, [], [
//             normalizeAddr(xMeta),
//             normalizeAddr(yMeta),
//             lpAmount.toString(),
//             minX.toString(),
//             minY.toString(),
//         ]);
//
//         return { payload, computed: { expected: { xOut, yOut }, minX, minY, pairAddress: pairAddr, lpMeta } };
//     }
//
//     async buildSwapTx(args: SwapTxArgs) {
//         const { inMeta, outMeta, amountIn } = args;
//         const { amountOut, reserves } = await this.quoteExactIn({ inMeta, outMeta, amountIn, refreshIfStale: true });
//         const slippage = args.slippageBps ?? this.defaultSlippageBps;
//         const minOut = floorWithBps(amountOut, slippage);
//
//         const fid = `${this.interfaceModule}::swap`;
//         // interface::swap(account, in_meta, out_meta, coin_in_value, coin_out_min)
//         const payload = this.ef(fid, [], [
//             normalizeAddr(inMeta),
//             normalizeAddr(outMeta),
//             amountIn.toString(),
//             minOut.toString(),
//         ]);
//
//         return { payload, computed: { expectedOut: amountOut, minOut, pairAddress: reserves.pairAddress } };
//     }
//
//     // ------------- high-level helpers (submit & post-refresh) -------------
//
//     // These are optional; many integrations will use wallet adapters to sign+submit.
//     async submit(sender: Hex, payload: InputGenerateTransactionPayloadData)) {
//         // Emits loading & tx:* events only. The actual submit depends on the wallet injected API.
//         this.emitter.emit("loading:start", { op: "submit" });
//         this.emitter.emit("tx:submitted", { payload });
//         try {
//             const res = await senderAccount.signAndSubmitTransaction(payload);
//             this.emitter.emit("tx:success", res);
//             return res;
//         } catch (e) {
//             this.emitter.emit("tx:error", e);
//             throw e;
//         } finally {
//             this.emitter.emit("loading:end", { op: "submit" });
//         }
//     }
//
//     // Convenience wrappers that refresh reserves cache after success.
//     async createPool(args: CreatePoolTxArgs & { submit?: boolean; signer?: any }) {
//         const { sender, xMeta, yMeta, submit: doSubmit, signer } = args as any;
//         const payload = await this.buildCreatePoolTx({ sender, xMeta, yMeta });
//         if (!doSubmit) return { payload };
//         const res = await this.submit(signer, payload);
//         await this.getReserves(xMeta, yMeta, { refresh: true });
//         return { payload, res };
//     }
//
//     async addLiquidity(args: AddLiqTxArgs & { submit?: boolean; }) {
//         const { sender, xMeta, yMeta, submit: doSubmit } = args as any;
//         const built = await this.buildAddLiquidityTx(args);
//         if (!doSubmit) return built;
//         const res = await this.submit(sender, built.payload);
//         await this.getReserves(xMeta, yMeta, { refresh: true });
//         return { ...built, res };
//     }
//
//     async swap(args: SwapTxArgs & { submit?: boolean; signer?: any }) {
//         const { sender, inMeta, outMeta, submit: doSubmit, signer } = args as any;
//         const built = await this.buildSwapTx(args);
//         if (!doSubmit) return built;
//         const res = await this.submit(signer, built.payload);
//         await this.getReserves(inMeta, outMeta, { refresh: true });
//         return { ...built, res };
//     }
//
//     async removeLiquidity(args: RemoveLiqTxArgs & { submit?: boolean; signer?: any }) {
//         const { sender, xMeta, yMeta, submit: doSubmit, signer } = args as any;
//         const built = await this.buildRemoveLiquidityTx(args);
//         if (!doSubmit) return built;
//         const res = await this.submit(signer, built.payload);
//         await this.getReserves(xMeta, yMeta, { refresh: true });
//         return { ...built, res };
//     }
// }

import { sha3_256 } from "@noble/hashes/sha3";
import { hexToBytes as _hexToBytes } from "@noble/hashes/utils";
import {
    Aptos,
    AptosConfig,
    InputViewFunctionData,
    MoveStructId,
} from "@aptos-labs/ts-sdk";

// ----------------- utils -----------------
type Hex = `0x${string}`;
const FEE_MULTIPLIER = 30n;   // 0.30%
const FEE_SCALE = 10_000n;

const strip0x = (h: string) => (h.startsWith("0x") ? h.slice(2) : h);
const normalizeAddr = (a: string): Hex =>
    ("0x" + strip0x(a).toLowerCase().padStart(64, "0")) as Hex;

const hexToBytes = (h: string) => _hexToBytes(strip0x(h));
const u8 = (n: number) => Uint8Array.of(n & 0xff);

const concatBytes = (...arrs: Uint8Array[]) => {
    const len = arrs.reduce((n, a) => n + a.length, 0);
    const out = new Uint8Array(len);
    let off = 0;
    for (const a of arrs) { out.set(a, off); off += a.length; }
    return out;
};

const compareBytes = (a: Uint8Array, b: Uint8Array) => {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
};

const bcsAddressBytes = (addr: Hex) => {
    const bytes = hexToBytes(addr);
    if (bytes.length === 32) return bytes;
    const out = new Uint8Array(32);
    out.set(bytes, 32 - bytes.length);
    return out;
};

// sha3_256(bcs(source) || seed || 0xFF)
const createResourceAddress = (source: Hex, seed: Uint8Array): Hex => {
    const input = concatBytes(bcsAddressBytes(normalizeAddr(source)), seed, u8(0xff));
    const hash = sha3_256(input);
    const hex = "0x" + Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
    return hex as Hex;
};

const toBig = (v: string | number | bigint) =>
    typeof v === "bigint" ? v : typeof v === "number" ? BigInt(Math.floor(v)) : BigInt(v);

const mulDiv = (a: bigint, b: bigint, d: bigint) => {
    if (d === 0n) throw new Error("division by zero");
    return (a * b) / d;
};
const floorWithBps = (x: bigint, bps: number) =>
    (x * (FEE_SCALE - BigInt(bps))) / FEE_SCALE;

// ----------------- tiny emitter -----------------
type EventName = "loading:start" | "loading:end" | "reserves:update" | "tx:submitted" | "tx:success" | "tx:error";
type Listener = (data?: any) => void;
class Emitter {
    private m = new Map<EventName, Set<Listener>>();
    on(n: EventName, fn: Listener) { if (!this.m.has(n)) this.m.set(n, new Set()); this.m.get(n)!.add(fn); return () => this.m.get(n)!.delete(fn); }
    emit(n: EventName, d?: any) { this.m.get(n)?.forEach(f => f(d)); }
}

// ----------------- SDK -----------------
export type SDKInit = {
    nodeUrl: string;
    moduleAddress: Hex;          // account that published `swap` (aka @swap)
    defaultSlippageBps?: number; // default 100 (1%)
};

type Reserves = { reserveX: bigint; reserveY: bigint; pairAddress: Hex; tsMs: number; stale: boolean };

export class AptosSwapSDK {
    readonly aptos: Aptos;
    readonly moduleAddress: Hex;
    readonly interfaceModule: string;
    readonly implementsModule: string;
    readonly defaultSlippageBps: number;
    readonly emitter = new Emitter();

    private poolAdminSeed = new TextEncoder().encode("swap_account_seed");
    private pairSeedPrefix = new TextEncoder().encode("swap:");
    private colon = Uint8Array.of(58);

    private _poolAdminAddr?: Hex;
    private reservesCache = new Map<string, Reserves>();
    private lpMetaCache = new Map<Hex, Hex>();
    private lpSupplyCache = new Map<Hex, { supply: bigint; tsMs: number }>();
    private readonly CACHE_TTL_MS = 15_000;

    constructor(opts: SDKInit) {
        this.aptos = new Aptos(new AptosConfig({ fullnode: opts.nodeUrl }));
        this.moduleAddress = normalizeAddr(opts.moduleAddress);
        this.interfaceModule = `${this.moduleAddress}::interface`;
        this.implementsModule = `${this.moduleAddress}::implements`;
        this.defaultSlippageBps = opts.defaultSlippageBps ?? 100;
    }

    // --- address derivation ---
    getPoolAdminAddress(): Hex {
        if (!this._poolAdminAddr) {
            this._poolAdminAddr = createResourceAddress(this.moduleAddress, this.poolAdminSeed);
        }
        return this._poolAdminAddr;
    }
    private orderAndSeed(xMeta: Hex, yMeta: Hex) {
        const xb = bcsAddressBytes(normalizeAddr(xMeta));
        const yb = bcsAddressBytes(normalizeAddr(yMeta));
        const xFirst = compareBytes(xb, yb) < 0;
        const a = xFirst ? normalizeAddr(xMeta) : normalizeAddr(yMeta);
        const b = xFirst ? normalizeAddr(yMeta) : normalizeAddr(xMeta);
        const seed = concatBytes(this.pairSeedPrefix, bcsAddressBytes(a), this.colon, bcsAddressBytes(b));
        return { a, b, seed };
    }
    getPairAddress(xMeta: Hex, yMeta: Hex): Hex {
        const { seed } = this.orderAndSeed(xMeta, yMeta);
        return createResourceAddress(this.getPoolAdminAddress(), seed);
    }
    private pairKey(xMeta: Hex, yMeta: Hex) {
        const { a, b } = this.orderAndSeed(xMeta, yMeta);
        return `${a}_${b}`;
    }

    // --- FA views ---
    private async viewPrimaryBalance(owner: Hex, meta: Hex): Promise<bigint> {
        const payload: InputViewFunctionData = {
            function: "0x1::primary_fungible_store::balance",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [normalizeAddr(owner), normalizeAddr(meta)],
        };
        const [r] = await this.aptos.view({ payload });
        return toBig(r as string);
    }
    private async viewFASupply(meta: Hex): Promise<bigint> {
        const payload: InputViewFunctionData = {
            function: "0x1::fungible_asset::supply",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [normalizeAddr(meta)],
        };
        const [opt] = await this.aptos.view({ payload });
        const v = (opt as any)?.vec?.[0] ?? 0;
        return toBig(v);
    }

    // --- reads ---
    async getReserves(xMeta: Hex, yMeta: Hex, opts?: { refresh?: boolean; refreshIfStale?: boolean }) {
        const key = this.pairKey(xMeta, yMeta);
        const cached = this.reservesCache.get(key);
        const now = Date.now();
        const isExpired = !cached || now - cached.tsMs > this.CACHE_TTL_MS;
        const mustRefresh = !!opts?.refresh || (!!opts?.refreshIfStale && isExpired) || !cached;

        if (!mustRefresh && cached) return { reserves: { ...cached, stale: now - cached.tsMs > this.CACHE_TTL_MS } };

        this.emitter.emit("loading:start", { op: "getReserves", key });
        try {
            const pair = this.getPairAddress(xMeta, yMeta);
            const { a, b } = this.orderAndSeed(xMeta, yMeta);
            const [rx, ry] = await Promise.all([
                this.viewPrimaryBalance(pair, a),
                this.viewPrimaryBalance(pair, b),
            ]);
            const entry: Reserves = { reserveX: rx, reserveY: ry, pairAddress: pair, tsMs: Date.now(), stale: false };
            this.reservesCache.set(key, entry);
            this.emitter.emit("reserves:update", { key, entry });
            return { reserves: entry };
        } finally {
            this.emitter.emit("loading:end", { op: "getReserves", key });
        }
    }
    async getWalletBalance(owner: Hex, meta: Hex) {
        return this.viewPrimaryBalance(owner, meta);
    }
    private async getLpMeta(pairAddr: Hex) {
        const hit = this.lpMetaCache.get(pairAddr);
        if (hit) return hit;
        const type: string = `${this.implementsModule}::LiquidityPool`;
        // @ts-ignore
        const res: any = await this.aptos.getAccountResource({ accountAddress: pairAddr, resourceType: type });
        const data = res?.data ?? res;
        const lp: string | undefined =
            typeof data?.lp_meta === "string" ? data.lp_meta :
                typeof data?.lp_meta?.inner === "string" ? data.lp_meta.inner :
                    typeof data?.lp_meta?.object === "string" ? data.lp_meta.object : undefined;
        if (!lp) throw new Error(`Cannot read LiquidityPool.lp_meta at ${pairAddr}`);
        const norm = normalizeAddr(lp);
        this.lpMetaCache.set(pairAddr, norm);
        return norm;
    }
    async getWalletLPBalance(owner: Hex, xMeta: Hex, yMeta: Hex) {
        const pair = this.getPairAddress(xMeta, yMeta);
        const lpMeta = await this.getLpMeta(pair);
        const bal = await this.viewPrimaryBalance(owner, lpMeta);
        return { lpMeta, lpBalance: bal, pairAddress: pair };
    }

    // --- AMM math ---
    getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint) {
        if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
        const feeMul = FEE_SCALE - FEE_MULTIPLIER;               // 9970
        const inAfter = amountIn * feeMul;                       // scaled by 10_000
        const newIn = reserveIn * FEE_SCALE + inAfter;           // scaled
        return mulDiv(inAfter, reserveOut, newIn);               // truncation == Move
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

    // --- quoting (cached reserves) ---
    async quoteExactIn(inMeta: Hex, outMeta: Hex, amountIn: bigint, refreshIfStale = true) {
        const { reserves } = await this.getReserves(inMeta, outMeta, { refreshIfStale });
        const { a, b } = this.orderAndSeed(inMeta, outMeta);
        const reserveIn = (normalizeAddr(inMeta) === a) ? reserves.reserveX : reserves.reserveY;
        const reserveOut = (normalizeAddr(outMeta) === b) ? reserves.reserveY : reserves.reserveX;
        const out = this.getAmountOut(amountIn, reserveIn, reserveOut);
        const spot = this.getSpotPrice(reserveIn, reserveOut);
        const exec = this.getExecutionPrice(amountIn, out);
        const priceImpact = this.getPriceImpact(spot, exec);
        return { amountOut: out, spotPrice: spot, executionPrice: exec, priceImpact, pairAddress: reserves.pairAddress, reserves };
    }

    // --- tx builders (no signer args; Petra adds signer implicitly) ---
    buildRegisterPoolTx(xMeta: Hex, yMeta: Hex) {
        // interface::register_pool(account, x_meta, y_meta)
        return {
            function: `${this.interfaceModule}::register_pool`,
            typeArguments: [],
            functionArguments: [normalizeAddr(xMeta), normalizeAddr(yMeta)],
        };
    }
    async buildAddLiquidityTx(xMeta: Hex, yMeta: Hex, xDesired: bigint, yDesired: bigint, slippageBps?: number) {
        const { reserves } = await this.getReserves(xMeta, yMeta, { refreshIfStale: true });
        const { a } = this.orderAndSeed(xMeta, yMeta);
        const xDes = normalizeAddr(xMeta) === a ? xDesired : yDesired;
        const yDes = normalizeAddr(xMeta) === a ? yDesired : xDesired;
        const opt = this.getOptimalAdd(xDes, yDes, reserves.reserveX, reserves.reserveY);
        const slip = slippageBps ?? this.defaultSlippageBps;
        const xMin = floorWithBps(opt.x, slip);
        const yMin = floorWithBps(opt.y, slip);
        return {
            payload: {
                function: `${this.interfaceModule}::add_liquidity`,
                typeArguments: [],
                functionArguments: [
                    normalizeAddr(xMeta), normalizeAddr(yMeta),
                    opt.x.toString(), xMin.toString(),
                    opt.y.toString(), yMin.toString(),
                ],
            },
            computed: { optimal: opt, xMin, yMin, pairAddress: reserves.pairAddress },
        };
    }
    async buildRemoveLiquidityTx(xMeta: Hex, yMeta: Hex, lpAmount: bigint, slippageBps?: number) {
        const { reserves } = await this.getReserves(xMeta, yMeta, { refreshIfStale: true });
        const pairAddr = reserves.pairAddress;
        const lpMeta = await this.getLpMeta(pairAddr);
        const now = Date.now();
        let supply = this.lpSupplyCache.get(lpMeta)?.supply;
        if (!supply || now - (this.lpSupplyCache.get(lpMeta)?.tsMs ?? 0) > this.CACHE_TTL_MS) {
            supply = await this.viewFASupply(lpMeta);
            this.lpSupplyCache.set(lpMeta, { supply, tsMs: Date.now() });
        }
        if (supply === 0n) throw new Error("LP total supply is zero");
        const xOut = mulDiv(reserves.reserveX, lpAmount, supply);
        const yOut = mulDiv(reserves.reserveY, lpAmount, supply);
        const slip = slippageBps ?? this.defaultSlippageBps;
        const minX = floorWithBps(xOut, slip);
        const minY = floorWithBps(yOut, slip);
        return {
            payload: {
                function: `${this.interfaceModule}::remove_liquidity`,
                typeArguments: [],
                functionArguments: [
                    normalizeAddr(xMeta), normalizeAddr(yMeta),
                    lpAmount.toString(), minX.toString(), minY.toString(),
                ],
            },
            computed: { expected: { xOut, yOut }, minX, minY, pairAddress: pairAddr, lpMeta },
        };
    }
    async buildSwapTx(inMeta: Hex, outMeta: Hex, amountIn: bigint, slippageBps?: number) {
        const { amountOut } = await this.quoteExactIn(inMeta, outMeta, amountIn, true);
        const slip = slippageBps ?? this.defaultSlippageBps;
        const minOut = floorWithBps(amountOut, slip);
        return {
            payload: {
                function: `${this.interfaceModule}::swap`,
                typeArguments: [],
                functionArguments: [
                    normalizeAddr(inMeta), normalizeAddr(outMeta),
                    amountIn.toString(), minOut.toString(),
                ],
            },
            computed: { expectedOut: amountOut, minOut },
        };
    }

    // --- submit with Petra wallet instance ---
    async submitWithWallet(wallet: { signAndSubmitTransaction: (p: any) => Promise<{ hash: string }> }, payload: any) {
        // Petra docs: signAndSubmitTransaction(transaction: InputTransactionData) → { hash }
        // https://petra.app/docs/sending-a-transaction
        this.emitter.emit("loading:start", { op: "submit" });
        this.emitter.emit("tx:submitted", { payload });
        try {
            const res = await wallet.signAndSubmitTransaction(payload);
            this.emitter.emit("tx:success", res);
            return res;
        } catch (e) {
            this.emitter.emit("tx:error", e);
            throw e;
        } finally {
            this.emitter.emit("loading:end", { op: "submit" });
        }
    }
}
