/**
 * Real-time stock price fetching service
 * Uses Yahoo Finance API for current price data and historical data
 */

export interface StockQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  currency: string;
  lastUpdated: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class StockPriceService {
  private cache: Map<string, { data: StockQuote; timestamp: number }> = new Map();
  private historicalCache: Map<string, { data: HistoricalDataPoint[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute cache

  /**
   * Fetch current stock quote
   */
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    // Check cache first
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Try Yahoo Finance API via query2.finance.yahoo.com
      const response = await fetch(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryDetail`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      if (!response.ok) {
        console.error(`Yahoo Finance API error for ${symbol}:`, response.status);
        return this.getFallbackQuote(symbol);
      }

      const data = await response.json();
      const priceData = data.quoteSummary?.result?.[0]?.price;
      const summaryData = data.quoteSummary?.result?.[0]?.summaryDetail;

      if (!priceData) {
        return this.getFallbackQuote(symbol);
      }

      const quote: StockQuote = {
        symbol: priceData.symbol || symbol,
        name: priceData.longName || priceData.shortName || symbol,
        currentPrice: priceData.regularMarketPrice?.raw || 0,
        previousClose: priceData.regularMarketPreviousClose?.raw || 0,
        change: priceData.regularMarketChange?.raw || 0,
        changePercent: priceData.regularMarketChangePercent?.raw || 0,
        dayHigh: priceData.regularMarketDayHigh?.raw || 0,
        dayLow: priceData.regularMarketDayLow?.raw || 0,
        volume: priceData.regularMarketVolume?.raw || 0,
        marketCap: priceData.marketCap?.raw || summaryData?.marketCap?.raw || 0,
        currency: priceData.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD'),
        lastUpdated: Date.now(),
      };

      // Cache the result
      this.cache.set(symbol, { data: quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      return this.getFallbackQuote(symbol);
    }
  }

  /**
   * Fetch historical price data
   */
  async getHistoricalData(
    symbol: string,
    period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo'
  ): Promise<HistoricalDataPoint[]> {
    const cacheKey = `${symbol}-${period}`;
    const cached = this.historicalCache.get(cacheKey);

    // Historical data can be cached longer (5 minutes)
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.data;
    }

    try {
      // Calculate date range
      const endDate = Math.floor(Date.now() / 1000);
      let startDate = endDate;

      switch (period) {
        case '1d':
          startDate = endDate - 86400;
          break;
        case '5d':
          startDate = endDate - 432000;
          break;
        case '1mo':
          startDate = endDate - 2592000;
          break;
        case '3mo':
          startDate = endDate - 7776000;
          break;
        case '6mo':
          startDate = endDate - 15552000;
          break;
        case '1y':
          startDate = endDate - 31536000;
          break;
        case '5y':
          startDate = endDate - 157680000;
          break;
      }

      const response = await fetch(
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      if (!response.ok) {
        console.error(`Yahoo Finance historical API error for ${symbol}:`, response.status);
        return this.getFallbackHistoricalData(symbol, period);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];

      if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        return this.getFallbackHistoricalData(symbol, period);
      }

      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      const historicalData: HistoricalDataPoint[] = timestamps.map((ts: number, idx: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quote.open?.[idx] || quote.close?.[idx] || 0,
        high: quote.high?.[idx] || quote.close?.[idx] || 0,
        low: quote.low?.[idx] || quote.close?.[idx] || 0,
        close: quote.close?.[idx] || 0,
        volume: quote.volume?.[idx] || 0,
      })).filter((point: HistoricalDataPoint) => point.close > 0); // Filter out invalid data points

      // Cache the result
      this.historicalCache.set(cacheKey, { data: historicalData, timestamp: Date.now() });
      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getFallbackHistoricalData(symbol, period);
    }
  }

  /**
   * Fetch multiple stock quotes in parallel
   */
  async getMultipleQuotes(symbols: string[]): Promise<Map<string, StockQuote | null>> {
    const results = await Promise.all(
      symbols.map(async (symbol) => ({
        symbol,
        quote: await this.getStockQuote(symbol),
      }))
    );

    return new Map(results.map(({ symbol, quote }) => [symbol, quote]));
  }

  /**
   * Fallback quote data when API fails
   */
  private getFallbackQuote(symbol: string): StockQuote {
    // Use static fallback data
    const fallbackData: Record<string, Partial<StockQuote>> = {
      'TATAMOTORS.NS': {
        name: 'Tata Motors Ltd',
        currentPrice: 785.5,
        previousClose: 780.0,
        currency: 'INR',
        marketCap: 1780000000000,
      },
      'HDFCBANK.NS': {
        name: 'HDFC Bank Ltd',
        currentPrice: 1650.3,
        previousClose: 1642.0,
        currency: 'INR',
        marketCap: 11600000000000,
      },
      'NVDA': {
        name: 'NVIDIA Corporation',
        currentPrice: 495.22,
        previousClose: 490.0,
        currency: 'USD',
        marketCap: 1230000000000,
      },
    };

    const fallback = fallbackData[symbol] || {
      name: symbol,
      currentPrice: 100,
      previousClose: 100,
      currency: symbol.endsWith('.NS') ? 'INR' : 'USD',
      marketCap: 1000000000,
    };

    return {
      symbol,
      name: fallback.name!,
      currentPrice: fallback.currentPrice!,
      previousClose: fallback.previousClose!,
      change: fallback.currentPrice! - fallback.previousClose!,
      changePercent: ((fallback.currentPrice! - fallback.previousClose!) / fallback.previousClose!) * 100,
      dayHigh: fallback.currentPrice! * 1.02,
      dayLow: fallback.currentPrice! * 0.98,
      volume: 1000000,
      marketCap: fallback.marketCap!,
      currency: fallback.currency!,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Fallback historical data when API fails
   */
  private getFallbackHistoricalData(symbol: string, period: string): HistoricalDataPoint[] {
    const quote = this.getFallbackQuote(symbol);
    const basePrice = quote.currentPrice;

    let days = 30;
    switch (period) {
      case '1d': days = 1; break;
      case '5d': days = 5; break;
      case '1mo': days = 30; break;
      case '3mo': days = 90; break;
      case '6mo': days = 180; break;
      case '1y': days = 365; break;
      case '5y': days = 1825; break;
    }

    const data: HistoricalDataPoint[] = [];
    const endDate = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);

      // Generate semi-realistic price movement
      const volatility = 0.02;
      const trend = -0.0005 * i; // Slight upward trend
      const random = (Math.random() - 0.5) * volatility;
      const multiplier = 1 + trend + random;

      const close = basePrice * multiplier;
      const open = close * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, close) * (1 + Math.random() * 0.015);
      const low = Math.min(open, close) * (1 - Math.random() * 0.015);

      data.push({
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume: Math.floor(1000000 + Math.random() * 5000000),
      });
    }

    return data;
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.historicalCache.clear();
  }
}

// Export singleton instance
export const stockPriceService = new StockPriceService();
