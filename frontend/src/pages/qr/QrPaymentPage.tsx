import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Copy,
  Check,
  DollarSign,
  Clock,
  Zap,
  ScanLine,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { qrPaymentApi } from '@/api/qrPayment';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

type Tab = 'generate' | 'scan' | 'history';

export function QrPaymentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  // Generate form state
  const [genAmount, setGenAmount] = useState('');
  const [genNote, setGenNote] = useState('');
  const [genSingleUse, setGenSingleUse] = useState(true);
  const [genExpiry, setGenExpiry] = useState('30');
  const [generatedToken, setGeneratedToken] = useState<{
    token: string;
    qrContent: string;
    amount?: number;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Scan/Pay form state
  const [scanToken, setScanToken] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [tokenInfo, setTokenInfo] = useState<{
    recipientName: string;
    recipientEmail: string;
    amount?: number;
    note?: string;
    expiresAt: string;
  } | null>(null);
  const [payStep, setPayStep] = useState<'scan' | 'confirm' | 'success'>('scan');

  // History
  const [historyPage, setHistoryPage] = useState(0);

  const historyQuery = useQuery({
    queryKey: ['qr-codes', historyPage],
    queryFn: () => qrPaymentApi.getMyCodes(historyPage, 10),
    enabled: activeTab === 'history',
  });

  const qrCodes = historyQuery.data?.data?.content ?? [];
  const totalPages = historyQuery.data?.data?.totalPages ?? 0;

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: qrPaymentApi.generate,
    onSuccess: (data) => {
      const t = data.data;
      setGeneratedToken({
        token: t.token,
        qrContent: t.qrContent,
        amount: t.amount,
        expiresAt: t.expiresAt,
      });
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success('QR code generated!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to generate QR'),
  });

  // Lookup token mutation
  const lookupMutation = useMutation({
    mutationFn: qrPaymentApi.getTokenInfo,
    onSuccess: (data) => {
      const t = data.data;
      setTokenInfo({
        recipientName: t.recipientName,
        recipientEmail: t.recipientEmail,
        amount: t.amount ?? undefined,
        note: t.note ?? undefined,
        expiresAt: t.expiresAt,
      });
      setPayStep('confirm');
      toast.success('QR code verified');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Invalid or expired QR code'),
  });

  // Pay mutation
  const payMutation = useMutation({
    mutationFn: ({ token, amount, note }: { token: string; amount?: number; note?: string }) =>
      qrPaymentApi.payViaQr(token, amount, note),
    onSuccess: () => {
      setPayStep('success');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Payment completed!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Payment failed'),
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      amount: genAmount ? parseFloat(genAmount) : undefined,
      note: genNote || undefined,
      singleUse: genSingleUse,
      expiryMinutes: parseInt(genExpiry) || 30,
    });
  };

  const handleLookup = () => {
    if (!scanToken.trim()) {
      toast.error('Enter a QR token');
      return;
    }
    // Extract token from paysphere:// URL if pasted
    const tokenMatch = scanToken.match(/token=(.+)/);
    const token = (tokenMatch && tokenMatch[1]) ? tokenMatch[1] : scanToken.trim();
    lookupMutation.mutate(token);
  };

  const handlePay = () => {
    const tokenMatch = scanToken.match(/token=(.+)/);
    const token = (tokenMatch && tokenMatch[1]) ? tokenMatch[1] : scanToken.trim();
    payMutation.mutate({
      token,
      amount: payAmount ? parseFloat(payAmount) : undefined,
      note: payNote || undefined,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetScanForm = () => {
    setScanToken('');
    setPayAmount('');
    setPayNote('');
    setTokenInfo(null);
    setPayStep('scan');
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const quickAmounts = [5, 10, 25, 50, 100, 250];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <QrCode className="h-7 w-7 text-primary" /> QR Payments
        </h1>
        <p className="text-muted-foreground mt-1">Generate QR codes to receive payments or pay via QR</p>
      </motion.div>

      {/* Tab Buttons */}
      <motion.div variants={itemVariants} className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit">
        {[
          { id: 'generate' as Tab, label: 'Generate QR', icon: Plus },
          { id: 'scan' as Tab, label: 'Pay via QR', icon: ScanLine },
          { id: 'history' as Tab, label: 'My QR Codes', icon: Clock },
        ].map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' : ''}
          >
            <tab.icon className="h-4 w-4 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ===== GENERATE TAB ===== */}
        {activeTab === 'generate' && (
          <motion.div key="generate" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Generate Form */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="text-lg">Create Payment QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Amount */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Amount (optional — leave blank for any amount)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={genAmount}
                      onChange={(e) => setGenAmount(e.target.value)}
                      className="text-lg font-bold h-12"
                    />
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((qa) => (
                        <Button
                          key={qa}
                          size="sm"
                          variant={genAmount === String(qa) ? 'default' : 'outline'}
                          onClick={() => setGenAmount(String(qa))}
                          className="text-xs"
                        >
                          ${qa}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Note (optional)
                    </Label>
                    <Input
                      placeholder="Payment for..."
                      value={genNote}
                      onChange={(e) => setGenNote(e.target.value)}
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Type
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={genSingleUse ? 'default' : 'outline'}
                          onClick={() => setGenSingleUse(true)}
                          className="flex-1 text-xs"
                        >
                          Single Use
                        </Button>
                        <Button
                          size="sm"
                          variant={!genSingleUse ? 'default' : 'outline'}
                          onClick={() => setGenSingleUse(false)}
                          className="flex-1 text-xs"
                        >
                          Multi Use
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Expiry (minutes)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="1440"
                        value={genExpiry}
                        onChange={(e) => setGenExpiry(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                    className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                  >
                    {generateMutation.isPending ? 'Generating...' : '✦ Generate QR Code'}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated QR Display */}
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Your QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedToken ? (
                    <div className="text-center space-y-4">
                      {/* QR Visualization */}
                      <div className="relative mx-auto w-56 h-56 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                        <div className="absolute inset-4 bg-background rounded-xl flex items-center justify-center">
                          <div className="grid grid-cols-5 gap-1">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-sm ${
                                  Math.random() > 0.4 ? 'bg-foreground' : 'bg-transparent'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="absolute -bottom-3 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                          PAY-SPHERE
                        </div>
                      </div>

                      {generatedToken.amount && (
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(generatedToken.amount)}
                        </p>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Share this token with the payer:</p>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 border">
                          <code className="text-xs font-mono flex-1 truncate">
                            {generatedToken.qrContent}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleCopy(generatedToken.qrContent)}
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(generatedToken.expiresAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <QrCode className="h-16 w-16 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">Generate a QR code to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ===== SCAN / PAY TAB ===== */}
        {activeTab === 'scan' && (
          <motion.div key="scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Card className="relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-teal-500" />
                  {payStep === 'scan' && 'Enter QR Token'}
                  {payStep === 'confirm' && 'Confirm Payment'}
                  {payStep === 'success' && 'Payment Complete'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {payStep === 'scan' && (
                    <motion.div key="scan-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                      <div className="space-y-2">
                        <Label>QR Token or paysphere:// URL</Label>
                        <Input
                          placeholder="Paste QR token or paysphere://pay?token=..."
                          value={scanToken}
                          onChange={(e) => setScanToken(e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={handleLookup}
                        disabled={!scanToken.trim() || lookupMutation.isPending}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                      >
                        {lookupMutation.isPending ? 'Verifying...' : '🔍 Verify QR Code'}
                      </Button>
                    </motion.div>
                  )}

                  {payStep === 'confirm' && tokenInfo && (
                    <motion.div key="confirm-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                      <div className="rounded-xl bg-muted/30 border p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Send className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Paying to</p>
                            <p className="font-semibold">{tokenInfo.recipientName}</p>
                            <p className="text-xs text-muted-foreground">{tokenInfo.recipientEmail}</p>
                          </div>
                        </div>

                        {tokenInfo.amount ? (
                          <div className="text-center py-2">
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(tokenInfo.amount)}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> Enter Amount
                            </Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="0.01"
                              step="0.01"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="text-xl font-bold h-14"
                            />
                          </div>
                        )}

                        {tokenInfo.note && (
                          <div>
                            <p className="text-xs text-muted-foreground">Note</p>
                            <p className="text-sm italic">"{tokenInfo.note}"</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Add a note (optional)</Label>
                          <Input
                            placeholder="Add your note..."
                            value={payNote}
                            onChange={(e) => setPayNote(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          This payment cannot be undone. Please verify the recipient and amount before confirming.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={resetScanForm} className="flex-1 h-12">
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePay}
                          disabled={payMutation.isPending || (!tokenInfo.amount && !payAmount)}
                          className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                        >
                          {payMutation.isPending ? 'Processing...' : '✓ Confirm & Pay'}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {payStep === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold">Payment Successful!</h3>
                        <p className="text-muted-foreground mt-1">Your QR payment has been processed</p>
                      </div>
                      <Button onClick={resetScanForm} className="w-full h-12">
                        Make Another Payment
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
            {historyQuery.isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-muted-foreground">Loading QR codes...</p>
                </CardContent>
              </Card>
            ) : qrCodes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <QrCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">No QR Codes</h3>
                  <p className="text-muted-foreground mt-1">You haven't generated any QR codes yet</p>
                </CardContent>
              </Card>
            ) : (
              qrCodes.map((qr) => {
                const isExpired = new Date(qr.expiresAt) < new Date();
                const statusLabel = qr.used ? 'Used' : isExpired ? 'Expired' : 'Active';
                const statusColor = qr.used
                  ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                  : isExpired
                  ? 'text-red-500 bg-red-500/10 border-red-500/20'
                  : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

                return (
                  <Card key={qr.id} className={`border-l-4 ${qr.used ? 'border-l-blue-500' : isExpired ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <QrCode className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {qr.amount ? formatCurrency(qr.amount) : 'Any Amount'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {qr.singleUse ? 'Single use' : 'Multi use'} · {formatDate(qr.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {statusLabel}
                        </div>
                      </div>
                      {qr.note && (
                        <p className="text-xs text-muted-foreground mt-2 pl-13">"{qr.note}"</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled={historyPage === 0} onClick={() => setHistoryPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground flex items-center px-3">
                  Page {historyPage + 1} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={historyPage >= totalPages - 1} onClick={() => setHistoryPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
