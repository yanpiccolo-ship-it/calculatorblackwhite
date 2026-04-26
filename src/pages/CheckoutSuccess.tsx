import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(params.get('session_id'));
  }, [params]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
          Payment confirmed
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Thank you for your purchase. Your personalized numerology report is
          being generated and will arrive in your inbox within a few minutes.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg py-3 px-4 mb-6">
          <Mail className="w-4 h-4" />
          <span>Check your email — including spam — for delivery.</span>
        </div>

        {sessionId && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-6 break-all">
            Reference: {sessionId}
          </p>
        )}

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-foreground text-background font-medium px-5 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to calculator
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
