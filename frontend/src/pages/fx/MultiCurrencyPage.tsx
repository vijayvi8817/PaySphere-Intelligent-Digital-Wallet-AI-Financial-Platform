import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Coins, 
  ArrowRightLeft, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrencyWallets, getExchangeRates, convertCurrency } from '@/api/currencyExchange';
import { CurrencyWalletResponse, ExchangeRateResponse } from '@/types/currencyExchange';

export const MultiCurrencyPage: React.FC = () => {
  const [wallets, setWallets] = useState<CurrencyWalletResponse[]>([]);
  const [rates, setRates] = useState<ExchangeRateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Conversion Form State
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('100');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletData, rateData] = await Promise.all([
        getCurrencyWallets(),
        getExchangeRates()
      ]);
      setWallets(walletData);
      setRates(rateData);
    } catch (err) {
      console.error('Failed to load multi-currency FX data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid conversion amount');
      return;
    }

    try {
      setConverting(true);
      setError(null);
      await convertCurrency({
        fromCurrency,
        toCurrency,
        amount: numAmount
      });
      setSuccessMsg(`Successfully converted ${numAmount} ${fromCurrency} to ${toCurrency}!`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete currency conversion');
    } finally {
      setConverting(false);
    }
  };

  // Find rate for selected pair
  const currentRate = rates.find(r => r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency);
  const calculatedEstimated = currentRate && !isNaN(parseFloat(amount))
    ? (parseFloat(amount) * currentRate.rate * (1 - currentRate.feePercentage / 100)).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900/40 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-400" /> Multi-Currency FX & Foreign Exchange
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Hold foreign currencies, convert instant liquidity with low fee rates, and manage global wallets.
          </p>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          disabled={loading}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh FX Rates
        </Button>
      </div>

      {/* Currency Wallets Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" /> Your Currency Wallets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.currency} className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {wallet.currency}
                  </span>
                  <span className="text-lg font-bold text-slate-300">{wallet.symbol}</span>
                </div>
                <CardTitle className="text-sm font-semibold text-slate-400 mt-1">
                  {wallet.currencyName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">
                  {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Instant FX Conversion Calculator */}
      <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-emerald-400" /> Instant Currency Exchange
          </CardTitle>
          <CardDescription className="text-slate-400">
            Convert funds between your USD primary wallet and foreign currency wallets instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleConvert} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <Label className="text-slate-300 font-semibold mb-2 block">From Currency</Label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="CAD">CAD - Canadian Dollar (CA$)</option>
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-300 font-semibold mb-2 block">To Currency</Label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl h-12 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="CAD">CAD - Canadian Dollar (CA$)</option>
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                </select>
              </div>

              <div>
                <Label className="text-slate-300 font-semibold mb-2 block">Amount to Convert</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800/80 border-slate-700 text-white h-12"
                />
              </div>
            </div>

            {/* Estimated Conversion Summary Banner */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase">Exchange Rate</span>
                <p className="text-white font-medium text-sm mt-0.5">
                  1 {fromCurrency} = {currentRate ? currentRate.rate : '...'} {toCurrency} (Fee: {currentRate ? currentRate.feePercentage : '0.5'}%)
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-slate-400 font-mono uppercase">Estimated Payout</span>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">
                  {calculatedEstimated} {toCurrency}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={converting || fromCurrency === toCurrency}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 font-bold text-base gap-2"
            >
              {converting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
              Execute Instant Currency Exchange
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
