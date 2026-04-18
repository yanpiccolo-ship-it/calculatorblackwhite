import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, FileText, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const isPremium = type === 'master_premium';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isPremium ? 'bg-amber-50' : 'bg-gray-50'}`}>
            <CheckCircle className={`w-10 h-10 ${isPremium ? 'text-[#D4AF37]' : 'text-gray-600'}`} />
          </div>
        </div>

        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isPremium ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
            {isPremium ? 'Master Premium Report' : 'Complete Report'}
          </p>
          <h1 className="font-serif text-3xl font-light text-gray-900 mb-3">
            ¡Pago confirmado!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hemos recibido tu pago correctamente. Tu informe numerológico personalizado está siendo preparado.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            {isPremium ? (
              <Star className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            ) : (
              <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-800">¿Cuándo recibiré mi informe?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                En los próximos minutos recibirás tu informe personalizado en el email que registraste. Si no lo recibes en 30 minutos, revisa tu carpeta de spam.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">¿Qué incluye tu informe?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPremium
                  ? 'Análisis profundo de numerología y arquetipos, ciclos de vida, plan de evolución, meditación y ritual numerológico. 4500–6500 palabras.'
                  : 'Número de vida, arquetipo, alma, personalidad, kármicos, año personal, meditación y ejercicios. 2500–3500 palabras.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="w-full bg-black hover:bg-gray-900 text-white rounded-xl py-5">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la calculadora
            </Link>
          </Button>
          <p className="text-[10px] text-gray-300 italic">Design by Just Bee Brand Agency</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
