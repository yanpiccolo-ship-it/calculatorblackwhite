import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Star, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PurchaseReportModalProps {
  open: boolean;
  onClose: () => void;
  reportType: 'complete' | 'master_premium';
  prefillEmail?: string;
  prefillName?: string;
  prefillBirthDate?: string;
  destinyNumber?: number;
  soulNumber?: number;
  personalityNumber?: number;
  personalYearNumber?: number;
}

const REPORT_INFO = {
  complete: {
    name: 'Complete Report',
    subtitle: 'Fundamental Guidance',
    price: '€29.99',
    description: 'Informe completo de numerología y arquetipos (2500-3500 palabras)',
    features: [
      'Número de Vida y Arquetipo completo',
      'Números maestros 11, 22, 33, 44',
      'Alma, Personalidad y Expresión',
      'Números Kármicos',
      'Áreas de Vida y Año Personal',
      'Meditación + Ejercicios prácticos',
    ],
    color: 'text-gray-800',
    badge: 'bg-gray-100',
  },
  master_premium: {
    name: 'Master Premium Report',
    subtitle: 'Absolute Revelation',
    price: '€59.99',
    description: 'Informe premium transformador de numerología y arquetipos (4500-6500 palabras)',
    features: [
      'Todo lo del Complete Report',
      'Ciclos de Vida completos',
      'Relaciones y vínculos profundos',
      'Vocación y camino profesional',
      'Plan de Evolución Personal 90 días',
      'Meditación profunda (10 min)',
      'Ritual Numerológico de activación',
      'Mensaje del Alma',
    ],
    color: 'text-[#D4AF37]',
    badge: 'bg-amber-50',
  },
};

export const PurchaseReportModal = ({
  open,
  onClose,
  reportType,
  prefillEmail = '',
  prefillName = '',
  prefillBirthDate = '',
  destinyNumber,
  soulNumber,
  personalityNumber,
  personalYearNumber,
}: PurchaseReportModalProps) => {
  const info = REPORT_INFO[reportType];
  const [step, setStep] = useState<'form' | 'loading' | 'error'>('form');

  const [formData, setFormData] = useState({
    name: prefillName,
    email: prefillEmail,
    birthDay: prefillBirthDate ? prefillBirthDate.split('-')[2] || '' : '',
    birthMonth: prefillBirthDate ? prefillBirthDate.split('-')[1] || '' : '',
    birthYear: prefillBirthDate ? prefillBirthDate.split('-')[0] || '' : '',
  });

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYearNum - i);

  const handleCheckout = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      toast({ title: 'Por favor, completa todos los campos', variant: 'destructive' });
      return;
    }

    setStep('loading');

    try {
      const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
      const origin = window.location.origin;

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          reportType,
          userEmail: formData.email,
          userName: formData.name,
          birthDate,
          destinyNumber: destinyNumber || null,
          soulNumber: soulNumber || null,
          personalityNumber: personalityNumber || null,
          personalYearNumber: personalYearNumber || null,
          successUrl: `${origin}/success?type=${reportType}`,
          cancelUrl: `${origin}/pricing`,
        },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || 'No checkout URL received');
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setStep('error');
      toast({
        title: 'Error al iniciar el pago',
        description: err instanceof Error ? err.message : 'Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      setTimeout(() => setStep('form'), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2 self-start ${info.badge}`}>
            {reportType === 'master_premium' ? <Star className="w-3 h-3 text-[#D4AF37]" /> : <FileText className="w-3 h-3" />}
            {info.subtitle}
          </div>
          <DialogTitle className={`font-serif text-2xl ${info.color}`}>{info.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{info.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="space-y-1.5">
            {info.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm font-semibold">Tus datos para el informe</h3>

            <div className="space-y-1">
              <Label className="text-xs">Nombre completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Como aparece en tu documento"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="Para recibir tu informe"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Fecha de nacimiento</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={formData.birthDay} onValueChange={(v) => setFormData(p => ({ ...p, birthDay: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Día" /></SelectTrigger>
                  <SelectContent>{days.map(d => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formData.birthMonth} onValueChange={(v) => setFormData(p => ({ ...p, birthMonth: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Mes" /></SelectTrigger>
                  <SelectContent>{months.map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formData.birthYear} onValueChange={(v) => setFormData(p => ({ ...p, birthYear: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Año" /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total a pagar</p>
              <p className="text-2xl font-bold">{info.price}</p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={step === 'loading'}
              className={`px-8 py-5 rounded-lg font-semibold text-sm ${
                reportType === 'master_premium'
                  ? 'bg-[#D4AF37] hover:bg-[#C5A028] text-black'
                  : 'bg-black hover:bg-gray-900 text-white'
              }`}
            >
              {step === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirigiendo...</>
              ) : (
                'Buy'
              )}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            ⚡ Tu informe se genera y envía automáticamente al email indicado una vez confirmado el pago.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
