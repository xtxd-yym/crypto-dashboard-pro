/// <reference lib="webworker" />

interface BinanceTicker {
    s: string; // Symbol, e.g., "BTCUSDT"
    c: string; // Current price as string
}

let ws: WebSocket | null = null;
let activePairs: Set<string> = new Set();
let isConnecting = false;

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'ENABLE_POLLING') {
        const symbols: string[] = payload || [];
        // Expecting symbols like 'btc', 'eth'. Convert to 'BTCUSDT'.
        activePairs = new Set(symbols.map((s) => `${s.toUpperCase()}USDT`));

        if (!ws || ws.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
    } else if (type === 'DISABLE_POLLING') {
        if (ws) {
            ws.close();
            ws = null;
        }
        activePairs.clear();
    }
};

function connectWebSocket() {
    if (isConnecting) return;
    isConnecting = true;

    ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

    ws.onopen = () => {
        isConnecting = false;
        // console.log('[Worker] Connected to Binance WS');
    };

    ws.onmessage = (event) => {
        try {
            const tickers: BinanceTicker[] = JSON.parse(event.data);

            const relevantUpdates: Record<string, number> = {};
            let hasUpdates = false;

            // Filter: only process tickers we care about
            for (const t of tickers) {
                if (activePairs.has(t.s)) {
                    // Payload: { "BTCUSDT": 65000.00, ... }
                    relevantUpdates[t.s] = parseFloat(t.c);
                    hasUpdates = true;
                }
            }

            if (hasUpdates) {
                self.postMessage({ type: 'PRICE_UPDATE', payload: relevantUpdates });
            }
        } catch (err) {
            console.warn('[Worker] Parse error', err);
        }
    };

    ws.onerror = (err) => {
        console.warn('[Worker] WS Error', err);
        isConnecting = false;
    };

    ws.onclose = () => {
        // console.log('[Worker] Disconnected');
        isConnecting = false;
    };
}
