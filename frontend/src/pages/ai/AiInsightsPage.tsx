import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  PiggyBank, 
  Zap, 
  Send, 
  Bot, 
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAiAdvisorSummary, askAiAdvisor } from '@/api/aiInsight';
import { AiAdvisorResponse, AiInsightResponse } from '@/types/aiInsight';

export const AiInsightsPage: React.FC = () => {
  const [advisorData, setAdvisorData] = useState<AiAdvisorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');

  const fetchAdvisor = async () => {
    try {
      setLoading(true);
      const data = await getAiAdvisorSummary();
      setAdvisorData(data);
    } catch (err) {
      console.error('Failed to load AI advisor summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisor();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    try {
      setAsking(true);
      const updated = await askAiAdvisor(userPrompt);
      setAdvisorData(updated);
      setUserPrompt('');
    } catch (err) {
      console.error('Failed to ask AI advisor', err);
    } finally {
      setAsking(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toUpperCase()) {
      case 'SPENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Spending Alert</span>;
      case 'SAVINGS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Savings Tip</span>;
      case 'SUBSCRIPTIONS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Subscription</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">General AI</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" /> AI Financial Intelligence
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Smart predictive financial advisor analyzing spending patterns, cash flow risks, and optimization opportunities.
          </p>
        </div>
        <Button 
          onClick={fetchAdvisor} 
          variant="outline" 
          disabled={loading}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Analysis
        </Button>
      </div>

      {/* Financial Health Score & Potential Savings Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Meter */}
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
              Financial Health Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-5xl font-black text-white">{advisorData?.healthScore ?? 88}</span>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {advisorData?.healthStatus ?? 'EXCELLENT'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${advisorData?.healthScore ?? 88}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400">
              Top 12% healthiest financial habits among Pay-Sphere users this month.
            </p>
          </CardContent>
        </Card>

        {/* Monthly Savings Potential */}
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" /> Monthly Optimization Potential
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-4xl font-extrabold text-emerald-400">
              +${(advisorData?.monthlySavingsPotential ?? 145.50).toFixed(2)}
            </div>
            <p className="text-xs text-slate-400">
              Estimated savings unlocked if you apply recommended subscription and transfer optimizations.
            </p>
          </CardContent>
        </Card>

        {/* AI Prompt Advice Summary */}
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Executive Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{advisorData?.aiSummaryPromptAdvice || 'Analyzing cash velocity across linked wallets...'}"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Chat Query Box */}
      <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" /> Ask AI Financial Advisor
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ask any question regarding your cash flow, budget targets, or spending trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAsk} className="flex gap-3">
            <Input
              type="text"
              placeholder="e.g., How much did I spend on dining out this month?"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 h-12"
            />
            <Button 
              type="submit" 
              disabled={asking || !userPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 px-6 gap-2"
            >
              {asking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Insights List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Smart Insights & Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advisorData?.insights.map((insight: AiInsightResponse) => (
            <Card key={insight.id} className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  {getCategoryBadge(insight.category)}
                  <span className="text-xs text-slate-500 font-mono">Impact Score: {insight.impactScore}/100</span>
                </div>
                <CardTitle className="text-lg font-bold text-white mt-2">
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {insight.summary}
                </p>

                {insight.recommendation && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Recommendation:</strong> {insight.recommendation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
