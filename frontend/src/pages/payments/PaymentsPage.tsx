import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Users,
  Star,
  StarOff,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Mail,
  User,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transferApi, beneficiaryApi } from '@/api/transfer';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Step = 'form' | 'confirm' | 'success';

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('form');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [lastTransfer, setLastTransfer] = useState<{ receiverName: string; amount: number; fee: number; referenceId: string } | null>(null);

  // Beneficiary state
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [benNickname, setBenNickname] = useState('');
  const [benEmail, setBenEmail] = useState('');

  const beneficiariesQuery = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => beneficiaryApi.getAll(),
  });

  const beneficiaries = beneficiariesQuery.data?.data ?? [];

  const sendMoneyMutation = useMutation({
    mutationFn: transferApi.sendMoney,
    onSuccess: (data) => {
      const t = data.data;
      setLastTransfer({ receiverName: t.receiverName, amount: t.amount, fee: t.fee, referenceId: t.referenceId });
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Transfer completed!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Transfer failed');
    },
  });

  const addBeneficiaryMutation = useMutation({
    mutationFn: beneficiaryApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      toast.success('Beneficiary added!');
      setShowAddBeneficiary(false);
      setBenNickname('');
      setBenEmail('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to add beneficiary');
    },
  });

  const toggleFavMutation = useMutation({
    mutationFn: beneficiaryApi.toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] }),
  });

  const deleteBenMutation = useMutation({
    mutationFn: beneficiaryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      toast.success('Beneficiary removed');
    },
  });

  const handleConfirm = () => {
    if (!recipientEmail || !amount || parseFloat(amount) <= 0) {
      toast.error('Please fill in recipient email and a valid amount');
      return;
    }
    setStep('confirm');
  };

  const handleSend = () => {
    sendMoneyMutation.mutate({
      recipientEmail,
      amount: parseFloat(amount),
      note: note || undefined,
      category: category || undefined,
    });
  };

  const handleReset = () => {
    setStep('form');
    setRecipientEmail('');
    setAmount('');
    setNote('');
    setCategory('');
    setLastTransfer(null);
  };

  const selectBeneficiary = (email: string) => {
    setRecipientEmail(email);
  };

  const fee = parseFloat(amount || '0') * 0.005;
  const total = parseFloat(amount || '0') + fee;

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <Send className="h-7 w-7 text-primary" /> Send Money
        </h1>
        <p className="text-muted-foreground mt-1">Transfer funds instantly to anyone on Pay-Sphere</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Send Money Form — takes 3 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="text-lg">
                {step === 'form' && 'Transfer Details'}
                {step === 'confirm' && 'Confirm Transfer'}
                {step === 'success' && 'Transfer Complete'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {step === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                    {/* Recipient Email */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Recipient Email</Label>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-xl font-bold h-14"
                      />
                      {/* Quick amounts */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quickAmounts.map((qa) => (
                          <Button
                            key={qa}
                            size="sm"
                            variant={amount === String(qa) ? 'default' : 'outline'}
                            onClick={() => setAmount(String(qa))}
                            className="text-xs"
                          >
                            ${qa}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Note (optional)</Label>
                      <Input placeholder="What's this for?" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2"><Tag className="h-4 w-4" /> Category (optional)</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Food', 'Rent', 'Utilities', 'Gift', 'Business', 'Other'].map((c) => (
                          <Button
                            key={c}
                            size="sm"
                            variant={category === c ? 'default' : 'outline'}
                            onClick={() => setCategory(category === c ? '' : c)}
                            className="text-xs"
                          >
                            {c}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Fee Preview */}
                    {parseFloat(amount || '0') > 0 && (
                      <div className="rounded-lg bg-muted/50 p-4 space-y-2 border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fee (0.5%)</span>
                          <span className="font-medium">{formatCurrency(fee)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-sm font-bold">
                          <span>Total Deduction</span>
                          <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    )}

                    <Button onClick={handleConfirm} className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg" disabled={!recipientEmail || !amount || parseFloat(amount) <= 0}>
                      <Send className="h-4 w-4 mr-2" /> Continue to Confirm
                    </Button>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                    <div className="rounded-xl bg-muted/30 border p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sending to</p>
                          <p className="font-semibold">{recipientEmail}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-lg font-bold">{formatCurrency(parseFloat(amount))}</p></div>
                        <div><p className="text-xs text-muted-foreground">Fee</p><p className="text-lg font-bold text-muted-foreground">{formatCurrency(fee)}</p></div>
                      </div>
                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground">Total Deduction</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                      </div>
                      {note && <div><p className="text-xs text-muted-foreground">Note</p><p className="text-sm italic">"{note}"</p></div>}
                      {category && <div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm">{category}</p></div>}
                    </div>

                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        This action cannot be undone. Please verify the recipient and amount before confirming.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep('form')} className="flex-1 h-12">Back</Button>
                      <Button
                        onClick={handleSend}
                        disabled={sendMoneyMutation.isPending}
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                      >
                        {sendMoneyMutation.isPending ? 'Processing...' : '✓ Confirm & Send'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && lastTransfer && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold">Transfer Successful!</h3>
                      <p className="text-muted-foreground mt-1">
                        {formatCurrency(lastTransfer.amount)} sent to {lastTransfer.receiverName}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-left space-y-2 border">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{lastTransfer.referenceId}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fee</span><span>{formatCurrency(lastTransfer.fee)}</span></div>
                    </div>
                    <Button onClick={handleReset} className="w-full h-12">Send Another</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Beneficiaries Panel — takes 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Saved Recipients
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Beneficiary Form */}
              <AnimatePresence>
                {showAddBeneficiary && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2 mb-3">
                      <Input placeholder="Nickname" value={benNickname} onChange={(e) => setBenNickname(e.target.value)} className="h-9 text-sm" />
                      <Input placeholder="Email" value={benEmail} onChange={(e) => setBenEmail(e.target.value)} className="h-9 text-sm" />
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!benNickname || !benEmail || addBeneficiaryMutation.isPending}
                        onClick={() => addBeneficiaryMutation.mutate({ nickname: benNickname, email: benEmail })}
                      >
                        {addBeneficiaryMutation.isPending ? 'Adding...' : 'Save Recipient'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Beneficiary List */}
              {beneficiaries.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No saved recipients yet</p>
                </div>
              ) : (
                beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                    onClick={() => selectBeneficiary(b.email)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {b.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{b.nickname}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); toggleFavMutation.mutate(b.id); }}
                      >
                        {b.isFavorite ? <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> : <StarOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={(e) => { e.stopPropagation(); deleteBenMutation.mutate(b.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
