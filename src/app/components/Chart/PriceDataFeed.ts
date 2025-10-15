import { Agent } from '@/app/types/agent';
import {
    Bar,
    HistoryCallback,
    LibrarySymbolInfo,
    OnReadyCallback,
    QuotesCallback,
    ResolutionString,
    ResolveCallback,
    SearchSymbolsCallback,
    PeriodParams,
    SubscribeBarsCallback,
} from '../../../../public/tradingview/charting_library/datafeed-api';
import { Chain } from 'viem';

const RESOLUTION_TO_SECONDS = (r: string): number => {
    if (r === 'D') return 86400;
    if (r === 'W') return 7 * 86400;
    if (r === 'M') return 30 * 86400;
    const n = parseInt(r, 10);
    if (!isNaN(n)) return n * 60;
    return 60;
};

type CacheEntry = {
    bars: Bar[];
    expiry: number;
    promise?: Promise<Bar[]>;
};

type Subscriber = {
    symbolInfo: LibrarySymbolInfo;
    resolution: ResolutionString;
    lastBarTime: number | null;
    onRealtimeCallback: SubscribeBarsCallback;
    timerId: number;
};

const CACHE_TTL_MS = 5000; // keep history cached for 5 seconds

export default class PriceDataFeed {
    private symbol: string;
    private agentPackage: string;
    private cache: Map<string, CacheEntry> = new Map();
    private subscribers: Map<string, Subscriber> = new Map();
    private lastBarPerSub: Map<string, Bar> = new Map();

    constructor(symbol: string, agentPackage: string, private queryClient: any) {
        this.symbol = symbol;
        this.agentPackage = agentPackage;
    }

    private makeCacheKey(symbol: string | undefined, resolution: string, from: number, to: number) {
        return `${symbol}|${resolution}|${from}|${to}`;
    }

    onReady(callback: OnReadyCallback) {
        setTimeout(() => {
            callback({
                supported_resolutions: ['1', '5', '15', '60', 'D'] as ResolutionString[],
                supports_marks: false,
                supports_timescale_marks: false,
            });
        }, 0);
    }

    resolveSymbol(symbolName: string, onResolve: ResolveCallback) {
        setTimeout(() => {
            onResolve({
                name: symbolName,
                ticker: symbolName,
                description: symbolName,
                format: 'price',
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
                exchange: 'AGENTS',
                listed_exchange: 'AGENTS',
                minmov: 1,
                pricescale: 1,
                has_intraday: true,
                supported_resolutions: ['1', '5', '15', '60', 'D'] as ResolutionString[],
                volume_precision: 0,
                data_status: 'streaming',
            });
        }, 0);
    }

    async getBars(
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        periodParams: PeriodParams,
        onHistoryCallback: HistoryCallback,
        onErrorCallback: (reason: string) => void
    ) {
        try {
            const { from, to } = periodParams; // seconds
            const fromMs = Math.floor(from * 1000);
            const toMs = Math.floor(to * 1000);
            if (!symbolInfo.name) {
                onHistoryCallback([], { noData: true });
                return;
            }

            const intervalSeconds = RESOLUTION_TO_SECONDS(resolution);
            // pad one interval to avoid edge trimming issues
            const periodMinutes = Math.ceil((to - from) / 60) + 1;

            const agent = encodeURIComponent(this.agentPackage);
            const url = `${process.env.NEXT_PUBLIC_API_URL}/ohlc?fa_id=${agent}&interval=${intervalSeconds}&period=${periodMinutes}`;

            const cacheKey = this.makeCacheKey(symbolInfo.name, resolution, from, to);
            const now = Date.now();

            // serve from cache if fresh
            const cached = this.cache.get(cacheKey);
            if (cached && cached.expiry > now) {
                const bars = cached.bars
                    .filter((b) => b.time >= fromMs && b.time <= toMs)
                    .sort((a, b) => a.time - b.time);
                onHistoryCallback(bars, { noData: bars.length === 0 });
                return;
            }

            // If in-flight, await it
            if (cached?.promise) {
                const bars = await cached.promise;
                const filtered = bars.filter((b) => b.time >= fromMs && b.time <= toMs).sort((a, b) => a.time - b.time);
                onHistoryCallback(filtered, { noData: filtered.length === 0 });
                return;
            }

            // kick off fetch and store promise to coalesce
            const fetchPromise: Promise<Bar[]> = (async () => {
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`OHLC fetch failed: ${resp.status}`);
                const data: any[] = await resp.json();
                const bars: Bar[] = data
                    .map((d) => ({
                        time: new Date(d.time).getTime(),
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                        volume: d.volume ?? 0,
                    }))
                    .filter((b) => b.time <= toMs) // limit to <= to
                    .sort((a, b) => a.time - b.time);
                this.cache.set(cacheKey, {
                    bars,
                    expiry: Date.now() + CACHE_TTL_MS,
                });
                return bars;
            })();

            this.cache.set(cacheKey, {
                bars: [],
                expiry: now + CACHE_TTL_MS,
                promise: fetchPromise,
            });

            const bars = await fetchPromise;
            const filtered = bars.filter((b) => b.time >= fromMs && b.time <= toMs).sort((a, b) => a.time - b.time);
            if (filtered.length === 0) {
                onHistoryCallback([], { noData: true });
            } else {
                this.lastBarPerSub.set(symbolInfo.name + resolution, filtered[filtered.length - 1]);
                onHistoryCallback(filtered, { noData: false });
            }
        } catch (err: any) {
            console.error('getBars error', err);
            onErrorCallback(err.message || 'Error fetching bars');
        }
    }

    subscribeBars(
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        onRealtimeCallback: SubscribeBarsCallback,
        listenerGuid: string,
        onResetCacheNeededCallback: () => void
    ) {
        if (this.subscribers.has(listenerGuid)) return;

        let lastBarTime: number | null = null;

        const poll = async () => {
            try {
                const intervalSeconds = RESOLUTION_TO_SECONDS(resolution);
                const periodMinutes = Math.ceil((intervalSeconds * 3) / 60); // small sliding window
                const agent = encodeURIComponent(this.agentPackage);
                const url = `${process.env.NEXT_PUBLIC_API_URL}/ohlc?fa_id=${agent}&interval=${intervalSeconds}&period=${periodMinutes}`;
                const resp = await fetch(url);
                if (!resp.ok) return;
                const data: any[] = await resp.json();
                if (!data.length) return;

                const latestRaw = data[data.length - 1];
                const bar: Bar = {
                    time: new Date(latestRaw.time).getTime(),
                    open: latestRaw.open,
                    high: latestRaw.high,
                    low: latestRaw.low,
                    close: latestRaw.close,
                    volume: latestRaw.volume ?? 0,
                };

                const prev = this.lastBarPerSub.get(listenerGuid);
                if (!prev) {
                    this.lastBarPerSub.set(listenerGuid, bar);
                    lastBarTime = bar.time;
                    onRealtimeCallback(bar);
                    return;
                }

                if (bar.time === prev.time) {
                    this.lastBarPerSub.set(listenerGuid, bar);
                    onRealtimeCallback(bar); // update existing
                } else if (bar.time > prev.time) {
                    this.lastBarPerSub.set(listenerGuid, bar);
                    lastBarTime = bar.time;
                    onRealtimeCallback(bar); // new bar
                }
            } catch (e) {
                console.warn('subscribeBars poll error', e);
            }
        };

        // start polling with small jitter to avoid sync storms
        const start = () => {
            poll();
            const timerId = window.setInterval(poll, 5000);
            this.subscribers.set(listenerGuid, {
                symbolInfo,
                resolution,
                lastBarTime,
                onRealtimeCallback,
                timerId,
            });
        };
        start();
    }

    unsubscribeBars(listenerGuid: string) {
        const sub = this.subscribers.get(listenerGuid);
        if (sub) {
            clearInterval(sub.timerId);
            this.subscribers.delete(listenerGuid);
            this.lastBarPerSub.delete(listenerGuid);
        }
    }

    searchSymbols(
        userInput: string,
        exchange: string | undefined,
        symbolType: string | undefined,
        onResult: SearchSymbolsCallback
    ) {
        onResult([]); // no search
    }

    getQuotes(
        symbols: string[],
        onDataCallback: QuotesCallback,
        onErrorCallback: (msg: string) => void
    ) {
        // unused
    }

    subscribeQuotes(): void {
        // noop
    }

    unsubscribeQuotes(): void {
        // noop
    }
}
