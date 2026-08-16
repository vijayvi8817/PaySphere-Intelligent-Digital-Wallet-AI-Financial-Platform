export interface CurrencyWalletResponse {
  id: string;
  currency: string;
  balance: number;
  symbol: string;
  currencyName: string;
}

export interface ExchangeRateResponse {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  feePercentage: number;
}

export interface CurrencyExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}
