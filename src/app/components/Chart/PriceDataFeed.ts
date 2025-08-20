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
    SubscribeBarsCallback,
} from '../../../../public/tradingview/charting_library/datafeed-api';
import { Chain } from 'viem';

export default class PriceDataFeed {
    private lastBar: Bar | undefined;
    private subscribers: Map<string, () => void> = new Map();

    constructor(
        private token: Agent,
        private queryClient: any, // optional if you're not caching
        private onPriceUpdate?: (price: number) => void
    ) { }

    onReady(callback: OnReadyCallback): void {
        callback({
            supported_resolutions: ['1' as ResolutionString],
            supports_marks: false,
            supports_time: true,
        });
    }

    resolveSymbol(_: string, onResolve: ResolveCallback): void {
        setTimeout(() => {
            onResolve({
                name: this.token.agent_symbol + '/' + "Aptos",
                description: `${this.token.agent_symbol} on Aptos`,
                format: 'price',
                exchange: 'Custom',
                listed_exchange: 'Custom',
                minmov: 0.1,
                session: '24x7',
                supported_resolutions: ['1' as ResolutionString],
                timezone: 'Etc/UTC',
                type: 'crypto',
                pricescale: 100000,
                has_intraday: true,
            });
        }, 0);
    }

    async getBars(
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        periodParams: { from: number; to: number; firstDataRequest: boolean },
        onHistoryCallback: HistoryCallback,
        onErrorCallback: (error: string) => void
    ): Promise<void> {
        try {
            const interval = parseInt(resolution) * 60 || 60; // in seconds
            const from = new Date(periodParams.from * 1000).toISOString();
            const to = new Date(periodParams.to * 1000).toISOString();
            const agent = this.token.fa_id;

            const url = `${process.env.NEXT_PUBLIC_API_URL}/ohlc?fa_id=${agent}&interval=${interval}&from=${from}&to=${to}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            const bars: Bar[] = data.map((item: any) => ({
                time: item.time * 1000,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
            }));

            if (!bars.length) {
                onHistoryCallback([], { noData: true });
            } else {
                this.lastBar = bars.at(-1);
                onHistoryCallback(bars, { noData: false });
            }
        } catch (err) {
            console.error('getBars error:', err);
            onErrorCallback('Failed to fetch bars');
        }
    }



    subscribeBars(
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        onTick: SubscribeBarsCallback,
        listenerGuid: string
    ): void {
        const intervalSeconds = parseInt(resolution) * 60 || 60;
        const agent = this.token.fa_id;

        let lastBarTime = this.lastBar?.time;

        const poll = async () => {
            const now = new Date();
            const from = new Date(now.getTime() - intervalSeconds * 1000);
            const fromISO = from.toISOString();
            const toISO = now.toISOString();

            const url = `${process.env.NEXT_PUBLIC_API_URL}/ohlc?fa_id=${agent}&interval=${intervalSeconds}&from=${fromISO}&to=${toISO}`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                if (!data || data.length === 0) return;

                const latest = data.at(-1); // last bar
                if (!latest) return;

                const newBar: Bar = {
                    time: latest.time * 1000,
                    open: latest.open,
                    high: latest.high,
                    low: latest.low,
                    close: latest.close,
                    volume: latest.volume,
                };

                if (!lastBarTime || newBar.time > lastBarTime) {
                    // New candle
                    this.lastBar = newBar;
                    lastBarTime = newBar.time;
                    this.onPriceUpdate?.(newBar.close);
                    onTick(newBar);
                } else if (newBar.time === lastBarTime) {
                    // Same candle, update values
                    this.lastBar = {
                        ...this.lastBar!,
                        high: Math.max(this.lastBar!.high, newBar.high),
                        low: Math.min(this.lastBar!.low, newBar.low),
                        close: newBar.close,
                        volume: newBar.volume,
                    };
                    this.onPriceUpdate?.(this.lastBar.close);
                    onTick(this.lastBar);
                }
            } catch (err) {
                console.error('subscribeBars polling error:', err);
            }
        };

        const intervalId = setInterval(poll, 5000); // 5s polling
        this.subscribers.set(listenerGuid, () => clearInterval(intervalId));
        poll(); // immediate fire
    }


    unsubscribeBars(listenerGuid: string): void {
        const stop = this.subscribers.get(listenerGuid);
        if (stop) {
            stop();
            this.subscribers.delete(listenerGuid);
        }
    }

    searchSymbols(
        userInput: string,
        exchange: string,
        symbolType: string,
        onResult: SearchSymbolsCallback
    ): void {
        // optional if not using symbol search
        onResult([]);
    }

    getQuotes(symbols: string[], onDataCallback: QuotesCallback, onErrorCallback: (msg: string) => void): void {
        throw new Error('getQuotes not implemented');
    }

    subscribeQuotes(
        symbols: string[],
        fastSymbols: string[],
        onRealtimeCallback: QuotesCallback,
        listenerGUID: string
    ): void {
        throw new Error('subscribeQuotes not implemented');
    }

    unsubscribeQuotes(listenerGUID: string): void {
        throw new Error('unsubscribeQuotes not implemented');
    }
}
