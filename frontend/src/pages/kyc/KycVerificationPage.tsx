import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitKyc, getLatestKyc } from '@/api/kyc';
import { DocumentType, KycDocumentResponse } from '@/types/kyc';

export const KycVerificationPage: React.FC = () => {
  const [latestKyc, setLatestKyc] = useState<KycDocumentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [documentType, setDocumentType] = useState<DocumentType>('PASSPORT');
  const [documentNumber, setDocumentNumber] = useState('');
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const fetchKycStatus = async () => {
    try {
      const data = await getLatestKyc();
      setLatestKyc(data);
    } catch (err: any) {
      console.error('Failed to load KYC status', err);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber.trim()) {
      setError('Please enter a valid document number');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitKyc({
        documentType,
        documentNumber,
        idFrontUrl: frontImagePreview || undefined,
        selfieUrl: selfiePreview || undefined,
      });
      setSuccessMsg('Your identity document has been submitted successfully for verification!');
      fetchKycStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC verification');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = () => {
    if (!latestKyc) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700">
          <Clock className="w-4 h-4 text-amber-400" /> Not Submitted
        </div>
      );
    }

    switch (latestKyc.status) {
      case 'APPROVED':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified Account
          </div>
        );
      case 'PENDING':
      case 'UNDER_REVIEW':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-semibold border border-amber-500/30">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" /> Under Verification Review
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-400 text-sm font-semibold border border-rose-500/30">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Verification Rejected
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" /> KYC Identity Verification
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Complete identity verification to unlock higher transaction limits and instant transfers.
          </p>
        </div>
        <div>{renderStatusBadge()}</div>
      </div>

      {/* Existing Verification Status Card if APPROVED or PENDING */}
      {latestKyc && (
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" /> Current Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase font-semibold">Document Type</span>
                <p className="text-white font-medium mt-1">{latestKyc.documentType}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase font-semibold">Document Number</span>
                <p className="text-white font-medium mt-1">•••• {latestKyc.documentNumber.slice(-4)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-xs text-slate-400 uppercase font-semibold">Submitted On</span>
                <p className="text-white font-medium mt-1">
                  {new Date(latestKyc.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
            </div>

            {latestKyc.status === 'REJECTED' && latestKyc.rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                <strong>Rejection Reason:</strong> {latestKyc.rejectionReason}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Form Wizard if NOT APPROVED */}
      {(!latestKyc || latestKyc.status === 'REJECTED') && (
        <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" /> Submit Verification Request
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select your identity document and provide details for instant manual verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center justify-between max-w-md mx-auto mb-6">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                <span className="text-sm font-medium">Document Info</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-700"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                <span className="text-sm font-medium">Upload & Confirm</span>
              </div>
            </div>

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

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-slate-300 font-semibold mb-2 block">Choose Identity Document Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'PASSPORT', label: 'Passport', icon: FileText, desc: 'Government issued passport' },
                      { id: 'DRIVERS_LICENSE', label: "Driver's License", icon: UserCheck, desc: 'Official driving permit' },
                      { id: 'NATIONAL_ID', label: 'National ID Card', icon: ShieldCheck, desc: 'State ID card' }
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = documentType === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setDocumentType(item.id as DocumentType)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/40' 
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <IconComp className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                          <h3 className="font-semibold text-white">{item.label}</h3>
                          <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="docNumber" className="text-slate-300 font-semibold mb-1 block">
                    Document Serial / Identification Number
                  </Label>
                  <Input
                    id="docNumber"
                    type="text"
                    placeholder="e.g. A984712093"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 h-12"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => {
                      if (!documentNumber) {
                        setError('Please enter document number first');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                  >
                    Continue to Upload <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Front ID Photo simulation */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center text-center">
                    <Upload className="w-10 h-10 text-blue-400 mb-2" />
                    <h4 className="font-semibold text-white">Front Document Image</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">PNG, JPG up to 10MB</p>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setFrontImagePreview('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop')}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      {frontImagePreview ? '✓ Front Image Uploaded' : 'Simulate Select File'}
                    </Button>
                  </div>

                  {/* Selfie Photo simulation */}
                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center text-center">
                    <UserCheck className="w-10 h-10 text-indigo-400 mb-2" />
                    <h4 className="font-semibold text-white">Selfie Verification</h4>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Clear photo holding document</p>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setSelfiePreview('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop')}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      {selfiePreview ? '✓ Selfie Uploaded' : 'Simulate Select File'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white"
                  >
                    Back to Step 1
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 px-6"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Submit Verification
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
