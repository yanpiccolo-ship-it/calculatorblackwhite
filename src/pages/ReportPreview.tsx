import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';

type Order = {
  id: string;
  user_name: string;
  user_email: string;
  birth_date: string;
  report_type: 'complete' | 'master_premium';
  destiny_number: number | null;
  soul_number: number | null;
  personality_number: number | null;
  personal_year_number: number | null;
  generated_report: string | null;
  created_at: string;
};

const ReportPreview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const isPremium = order?.report_type === 'master_premium';
  const accentColor = isPremium ? '#D4AF37' : '#111111';

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setError('Informe no encontrado'); }
        else setOrder(data as Order);
        setLoading(false);
      });
  }, [orderId]);

  const handlePrint = () => window.print();

  const formatReport = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      // Section headers: starts with number+dot or is all-caps
      if (/^\d+\.\s+[A-ZÁÉÍÓÚÑÜ]/.test(trimmed)) {
        const [num, ...rest] = trimmed.split(/\.\s+/);
        return (
          <h2 key={i} className="section-heading" style={{ color: accentColor }}>
            <span className="section-number">{num}.</span> {rest.join('. ')}
          </h2>
        );
      }
      if (/^[A-ZÁÉÍÓÚÑÜ\s\-—]{15,}$/.test(trimmed)) {
        return <h3 key={i} className="subsection-heading">{trimmed}</h3>;
      }
      return <p key={i} className="report-paragraph">{trimmed}</p>;
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">{error || 'Informe no encontrado'}</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');

        body { margin: 0; background: #f4f4f2; }

        .no-print {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          background: white; border-bottom: 1px solid #eee;
          padding: 12px 24px; display: flex; align-items: center; gap: 12px;
        }

        .report-wrapper {
          max-width: 860px; margin: 72px auto 60px; background: white;
          box-shadow: 0 4px 40px rgba(0,0,0,0.10);
        }

        .report-cover {
          background: ${isPremium ? 'linear-gradient(160deg, #0f0f0f, #1e1e1e)' : '#111111'};
          padding: 72px 80px 60px; text-align: center;
        }

        .cover-label {
          font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 4px;
          text-transform: uppercase; color: ${accentColor}; margin-bottom: 24px;
        }

        .cover-name {
          font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300;
          color: white; margin: 0 0 8px; line-height: 1.2;
        }

        .cover-sub {
          font-family: 'Inter', sans-serif; font-size: 13px; color: rgba(255,255,255,0.4);
          margin: 0;
        }

        .numbers-bar {
          background: ${accentColor};
          padding: 20px 80px;
          display: flex; gap: 0;
        }

        .number-item {
          flex: 1; text-align: center;
          font-family: 'Inter', sans-serif;
          color: ${isPremium ? '#111' : '#fff'};
        }

        .number-value {
          font-size: 24px; font-weight: 600; display: block;
        }

        .number-label {
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;
        }

        .report-body {
          padding: 64px 80px;
        }

        .section-heading {
          font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600;
          margin: 48px 0 16px; padding-bottom: 10px;
          border-bottom: 1px solid #e8e8e4; line-height: 1.3;
        }

        .section-number { opacity: 0.4; margin-right: 6px; }

        .subsection-heading {
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase; color: #666;
          margin: 32px 0 12px;
        }

        .report-paragraph {
          font-family: 'Cormorant Garamond', serif; font-size: 16px; line-height: 1.9;
          color: #2a2a2a; margin: 0 0 16px;
        }

        .report-footer {
          background: #f9f9f7; border-top: 1px solid #eee;
          padding: 36px 80px; text-align: center;
          font-family: 'Inter', sans-serif; font-size: 11px; color: #bbb;
        }

        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .report-wrapper { margin: 0; box-shadow: none; max-width: 100%; }
          .report-cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .numbers-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .section-heading { page-break-after: avoid; }
          .report-paragraph { orphans: 3; widows: 3; }
        }
      `}</style>

      {/* Toolbar — hidden when printing */}
      <div className="no-print">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Admin
        </Button>
        <div className="flex-1 text-sm text-gray-500">
          <span className="font-medium">{order.user_name}</span>
          &nbsp;·&nbsp; {isPremium ? 'Master Premium Report' : 'Complete Report'}
          &nbsp;·&nbsp; {order.user_email}
        </div>
        <Button onClick={handlePrint} className="bg-black hover:bg-gray-900 text-white">
          <Printer className="w-4 h-4 mr-2" /> Imprimir / Guardar PDF
        </Button>
      </div>

      {/* Report */}
      <div className="report-wrapper" ref={printRef}>
        {/* Cover */}
        <div className="report-cover">
          <p className="cover-label">
            {isPremium ? 'Master Premium Report · Absolute Revelation' : 'Complete Report · Fundamental Guidance'}
          </p>
          <h1 className="cover-name">Informe Numerológico<br />de {order.user_name}</h1>
          <p className="cover-sub">
            Fecha de nacimiento: {order.birth_date}
          </p>
        </div>

        {/* Numbers bar */}
        <div className="numbers-bar">
          {[
            { label: 'Número de Vida', value: order.destiny_number },
            { label: 'Alma', value: order.soul_number },
            { label: 'Personalidad', value: order.personality_number },
            { label: 'Año Personal', value: order.personal_year_number },
          ].map((n) => (
            <div key={n.label} className="number-item">
              <span className="number-value">{n.value ?? '—'}</span>
              <span className="number-label">{n.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="report-body">
          {order.generated_report
            ? formatReport(order.generated_report)
            : <p className="report-paragraph" style={{ color: '#aaa', fontStyle: 'italic' }}>
                El informe aún no ha sido generado.
              </p>
          }
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p style={{ margin: '0 0 4px' }}>
            Este informe ha sido generado personalmente para {order.user_name} · {order.user_email}
          </p>
          <p style={{ margin: 0, fontSize: '10px', color: '#d4d4d4' }}>
            Design by Just Bee Brand Agency · Dresstyle
          </p>
        </div>
      </div>
    </>
  );
};

export default ReportPreview;
