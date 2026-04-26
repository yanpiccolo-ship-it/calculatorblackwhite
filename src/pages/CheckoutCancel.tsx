import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6">
          <XCircle className="w-9 h-9 text-amber-600" />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
          Checkout canceled
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          No charge was made. You can return to the calculator and try again
          whenever you're ready.
        </p>

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

export default CheckoutCancel;
