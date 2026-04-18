import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Star, FileText, Zap, Shield, Sparkles } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Language, translations } from '@/lib/translations';
import { PurchaseReportModal } from '@/components/PurchaseReportModal';

const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = React.useState<Language>((location.state?.language as Language) || 'es');
  const t = translations[language];

  const [purchaseModal, setPurchaseModal] = useState<{
    open: boolean;
    type: 'complete' | 'master_premium';
  }>({ open: false, type: 'complete' });

  const openPurchase = (type: 'complete' | 'master_premium') => {
    setPurchaseModal({ open: true, type });
  };

  const handleSubscription = (planId: string) => {
    const links: Record<string, string> = {
      personal: 'https://buy.stripe.com/test_personal_monthly',
      accion: 'https://buy.stripe.com/test_accion_monthly',
      profesional: 'https://buy.stripe.com/test_profesional_monthly',
    };
    const url = links[planId];
    if (url && !url.includes('test_')) {
      window.open(url, '_blank');
    } else {
      alert('El enlace de suscripción estará disponible pronto. Contáctanos para activar tu plan.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-end mb-6">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-gray-900 mb-3">
            Informes de Numerología
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Descubre tu propósito, arquetipos y ciclos de vida con informes personalizados generados con inteligencia artificial.
          </p>
        </div>

        {/* === REPORT PRODUCTS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Complete Report */}
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fundamental Guidance</p>
                <h2 className="font-serif text-xl font-semibold text-gray-900">Complete Report</h2>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€29</span>
              <span className="text-lg text-gray-400">.99</span>
              <p className="text-xs text-gray-500 mt-1">Pago único · PDF por email</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {[
                'Número de Vida y Arquetipo completo',
                'Números maestros 11, 22, 33, 44',
                'Alma, Personalidad y Expresión',
                'Números Kármicos',
                'Áreas de Vida: trabajo, amor, crecimiento',
                'Año Personal actual',
                'Ejercicio de autoconocimiento',
                'Meditación numerológica (5 min)',
                'Mensaje final inspirador',
                '2500–3500 palabras',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => openPurchase('complete')}
              className="w-full py-5 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-semibold"
            >
              Comprar Complete Report — €29.99
            </Button>
          </div>

          {/* Master Premium Report */}
          <div className="border-2 border-[#D4AF37] rounded-2xl p-6 flex flex-col bg-amber-50/30 hover:shadow-md transition-shadow relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#D4AF37] text-black text-xs font-bold px-4 py-1 rounded-full">MÁS COMPLETO</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-wide">Absolute Revelation</p>
                <h2 className="font-serif text-xl font-semibold text-gray-900">Master Premium Report</h2>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€59</span>
              <span className="text-lg text-gray-400">.99</span>
              <p className="text-xs text-gray-500 mt-1">Pago único · PDF por email</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {[
                'Todo lo del Complete Report',
                'Propósito del Alma — misión espiritual profunda',
                'Arquetipo Maestro con análisis de luz y sombra',
                'Ciclos de Vida completos (3 ciclos)',
                'Relaciones, amor y vínculos kármicos',
                'Vocación y estilo de liderazgo',
                'Plan de Evolución Personal — 90 días',
                'Meditación profunda guiada (10 min)',
                'Ritual Numerológico de activación',
                'Mensaje del Alma',
                '4500–6500 palabras',
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => openPurchase('master_premium')}
              className="w-full py-5 bg-[#D4AF37] hover:bg-[#C5A028] text-black rounded-xl text-sm font-bold"
            >
              Comprar Master Premium — €59.99
            </Button>
          </div>
        </div>

        {/* Delivery note */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-12 text-center">
          <p className="text-xs text-gray-500">
            💡 <strong>Forma de entrega:</strong> Una vez confirmado tu pago vía Stripe, recibirás tu informe personalizado en el email que registres. La entrega se realiza de forma manual, generalmente en minutos.
          </p>
        </div>

        {/* === SUBSCRIPTION PLANS === */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-center text-gray-900 mb-2">Planes de Membresía</h2>
          <p className="text-center text-sm text-gray-500 mb-8">Acceso mensual a contenido, guías y herramientas numerológicas</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: 'personal',
                name: t.personalPlan || 'Plan Personal Inteligente',
                price: 29,
                description: t.personalDescription || 'Claridad y dirección mensual',
                icon: <Zap className="w-5 h-5 text-gray-400" />,
                features: ['Plan estratégico PDF', 'Calendario semanal', 'Ejercicios prácticos', 'Activador mental', 'Informe evolutivo'],
              },
              {
                id: 'accion',
                name: t.actionPlan || 'Sistema de Acción Continua',
                price: 49,
                description: t.actionDescription || 'Estructura y disciplina semanal',
                icon: <Shield className="w-5 h-5 text-gray-500" />,
                features: ['Todo lo del Plan Personal', 'Foco semanal', 'Plan de acción 5 pasos', 'Desbloqueo mental', 'Mini-reporte', 'Hoja de implementación'],
              },
              {
                id: 'profesional',
                name: t.proPlan || 'Plan Profesional',
                price: 149,
                description: t.proDescription || 'Para Coaches y Consultores',
                icon: <Sparkles className="w-5 h-5 text-gray-600" />,
                features: ['Plan mensual estratégico', 'Seguimiento semanal', 'Lecturas personalizadas', 'Cursos y material extra', 'Sistema de Booking', 'Panel profesional'],
              },
            ].map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-sm transition-shadow">
                <div className="mb-1 opacity-70">{plan.icon}</div>
                <h3 className="font-serif text-lg font-medium text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{plan.description}</p>
                <div className="text-2xl font-bold text-gray-900 mb-4">
                  €{plan.price}<span className="text-sm font-normal text-gray-400"> / mes</span>
                </div>
                <ul className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscription(plan.id)}
                  className="w-full py-4 bg-black hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
                >
                  Suscribirse
                </Button>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-[10px] italic text-gray-300 mt-12">
          Design by Just Bee Brand Agency
        </footer>
      </div>

      <PurchaseReportModal
        open={purchaseModal.open}
        onClose={() => setPurchaseModal(p => ({ ...p, open: false }))}
        reportType={purchaseModal.type}
      />
    </div>
  );
};

export default Pricing;
