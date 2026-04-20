import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Send, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TAROT_MARSEILLE: Record<number, { card: string; jungArchetype: string; shadow: string; light: string; roman: string }> = {
  1:  { roman: 'I',     card: 'El Mago (Le Bagatto)',       jungArchetype: 'El Héroe',           shadow: 'Manipulación, arrogancia',          light: 'Manifestación creativa, voluntad alineada' },
  2:  { roman: 'II',    card: 'La Sacerdotisa (La Papesse)', jungArchetype: 'La Sabia Interior',  shadow: 'Secretismo, bloqueo intuitivo',     light: 'Sabiduría intuitiva, receptividad sagrada' },
  3:  { roman: 'III',   card: "La Emperatriz (L'Impératrice)", jungArchetype: 'La Gran Madre',   shadow: 'Dependencia afectiva, sobreprotección', light: 'Creatividad, amor incondicional' },
  4:  { roman: 'IV',    card: "El Emperador (L'Empereur)",   jungArchetype: 'El Rey Interior',   shadow: 'Rigidez, control, autoritarismo',   light: 'Estructura sagrada, liderazgo íntegro' },
  5:  { roman: 'V',     card: 'El Hierofante (Le Pape)',     jungArchetype: 'El Guía Espiritual', shadow: 'Dogmatismo, conformismo',           light: 'Transmisión de conocimiento sagrado' },
  6:  { roman: 'VI',    card: "El Enamorado (L'Amoureux)",   jungArchetype: 'Ánima/Ánimus',      shadow: 'Indecisión, dependencia emocional', light: 'Elección consciente, amor como misión' },
  7:  { roman: 'VII',   card: 'El Carro (Le Chariot)',       jungArchetype: 'El Guerrero',        shadow: 'Control rígido, victoria vacía',    light: 'Dominio interior, conquista del destino' },
  8:  { roman: 'VIII',  card: 'La Justicia (La Justice)',    jungArchetype: 'El Árbitro Moral',   shadow: 'Juicio implacable, inflexibilidad', light: 'Equilibrio kármico, discernimiento' },
  9:  { roman: 'IX',    card: "El Ermitaño (L'Hermite)",     jungArchetype: 'El Viejo Sabio',     shadow: 'Aislamiento, perfeccionismo estéril', light: 'Búsqueda interior, guía auténtica' },
  11: { roman: 'XI',    card: 'La Fuerza (La Force)',        jungArchetype: 'El Domador',         shadow: 'Represión de la sombra, lucha interna', light: 'Fuerza desde la compasión, coraje' },
  22: { roman: '0',     card: 'El Loco (Le Mat)',            jungArchetype: 'El Espíritu Libre',  shadow: 'Irresponsabilidad, huida de la realidad', light: 'Libertad absoluta, potencial ilimitado' },
  33: { roman: 'VI★',   card: 'El Enamorado — vibración superior', jungArchetype: 'Maestro del Amor', shadow: 'Sacrificio excesivo, martirio', light: 'Amor incondicional como misión colectiva' },
  44: { roman: 'IV★',   card: 'El Emperador — vibración superior', jungArchetype: 'El Gran Constructor', shadow: 'Perfeccionismo paralizante', light: 'Legados que trascienden lo personal' },
};

const NUMBER_COLORS: Record<number, { bg: string; ring: string; text: string }> = {
  1: { bg: '#FF6B35', ring: '#FF4500', text: '#fff' },
  2: { bg: '#7B68EE', ring: '#5A4CD6', text: '#fff' },
  3: { bg: '#FFD700', ring: '#FFA500', text: '#111' },
  4: { bg: '#2ECC71', ring: '#1A9A50', text: '#fff' },
  5: { bg: '#E74C3C', ring: '#C0392B', text: '#fff' },
  6: { bg: '#E91E8C', ring: '#B5157A', text: '#fff' },
  7: { bg: '#3498DB', ring: '#1A6FAD', text: '#fff' },
  8: { bg: '#8E44AD', ring: '#6C2E8A', text: '#fff' },
  9: { bg: '#1ABC9C', ring: '#0E8C72', text: '#fff' },
  11: { bg: '#D4AF37', ring: '#A08020', text: '#111' },
  22: { bg: '#D4AF37', ring: '#A08020', text: '#111' },
  33: { bg: '#D4AF37', ring: '#A08020', text: '#111' },
  44: { bg: '#D4AF37', ring: '#A08020', text: '#111' },
};

function getTarot(n: number) {
  if (TAROT_MARSEILLE[n]) return TAROT_MARSEILLE[n];
  const reduced = n % 9 || 9;
  return TAROT_MARSEILLE[reduced] || TAROT_MARSEILLE[1];
}

function getColor(n: number) {
  return NUMBER_COLORS[n] || NUMBER_COLORS[(n % 9) || 9] || NUMBER_COLORS[1];
}

type OrderRow = {
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
  status: string;
  amount_paid: number | null;
  created_at: string;
};

type NumberBadgeProps = { label: string; number: number | null };

const NumberBadge = ({ label, number }: NumberBadgeProps) => {
  if (!number) return null;
  const tarot = getTarot(number);
  const color = getColor(number);
  const isMaster = [11, 22, 33, 44].includes(number);

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg relative"
        style={{ background: color.bg, color: color.text, boxShadow: `0 0 0 3px ${color.ring}` }}
      >
        {number}
        {isMaster && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center">
            <Star className="w-3 h-3 text-yellow-900" />
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-[10px] text-gray-400 leading-tight max-w-[80px] text-center">{tarot.roman} · {tarot.jungArchetype}</p>
      </div>
    </div>
  );
};

type ReportCardProps = { order: OrderRow; onResendEmail: (id: string) => void; resendingId: string | null };

const ReportCard = ({ order, onResendEmail, resendingId }: ReportCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isPremium = order.report_type === 'master_premium';
  const destiny = order.destiny_number;
  const destinyTarot = destiny ? getTarot(destiny) : null;

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border ${isPremium ? 'border-yellow-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div
        className="p-5 text-white"
        style={{
          background: isPremium
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPremium ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'
                }`}
              >
                {isPremium ? '⭐ Master Premium' : 'Complete Report'}
              </span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                order.status === 'sent' ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-300'
              }`}>
                {order.status === 'sent' ? '✓ Enviado' : '✓ Generado'}
              </span>
            </div>
            <h3 className="text-xl font-semibold tracking-wide">{order.user_name}</h3>
            <p className="text-white/50 text-xs mt-0.5">{order.user_email} · {order.birth_date}</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-[10px]">{new Date(order.created_at).toLocaleDateString('es-ES')}</p>
            {order.amount_paid && (
              <p className="text-yellow-300 font-bold text-lg">€{order.amount_paid}</p>
            )}
          </div>
        </div>

        {/* Tarot card highlight */}
        {destinyTarot && (
          <div className={`mt-4 rounded-xl p-3 ${isPremium ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-white/5 border border-white/10'}`}>
            <p className={`text-[10px] uppercase tracking-widest mb-1 ${isPremium ? 'text-yellow-300' : 'text-white/40'}`}>
              Carta del Tarot de Marsella · Arcano {destinyTarot.roman}
            </p>
            <p className={`font-serif text-base font-medium ${isPremium ? 'text-yellow-100' : 'text-white'}`}>
              {destinyTarot.card}
            </p>
            <p className={`text-xs mt-1 ${isPremium ? 'text-yellow-200/70' : 'text-white/50'}`}>
              {destinyTarot.jungArchetype}
            </p>
          </div>
        )}
      </div>

      {/* Numbers row */}
      <div className="bg-gray-50 border-b px-5 py-4">
        <div className="flex gap-4 justify-around flex-wrap">
          <NumberBadge label="Destino" number={order.destiny_number} />
          <NumberBadge label="Alma" number={order.soul_number} />
          <NumberBadge label="Personalidad" number={order.personality_number} />
          <NumberBadge label="Año Personal" number={order.personal_year_number} />
        </div>
      </div>

      {/* Shadow & Light */}
      {destinyTarot && (
        <div className="grid grid-cols-2 divide-x bg-white border-b">
          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">🌑 Sombra Junguiana</p>
            <p className="text-xs text-gray-600 leading-relaxed">{destinyTarot.shadow}</p>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">☀️ Luz & Integración</p>
            <p className="text-xs text-gray-600 leading-relaxed">{destinyTarot.light}</p>
          </div>
        </div>
      )}

      {/* Actions + expandable report */}
      <div className="bg-white p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <><EyeOff className="w-3 h-3 mr-1" /> Ocultar informe</> : <><Eye className="w-3 h-3 mr-1" /> Ver informe completo</>}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => window.open(`/admin/report-preview/${order.id}`, '_blank')}
          >
            🖨️ PDF
          </Button>
          {order.generated_report && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-indigo-700 border-indigo-200"
              disabled={resendingId === order.id}
              onClick={() => onResendEmail(order.id)}
            >
              {resendingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 mr-1" /> Reenviar Email</>}
            </Button>
          )}
        </div>

        {expanded && order.generated_report && (
          <div className="mt-4 border rounded-xl overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
              <p className="text-white/60 text-xs uppercase tracking-widest">Informe Completo</p>
              <p className="text-white/30 text-[10px]">{order.generated_report.length.toLocaleString()} caracteres</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-6 bg-stone-50">
              {order.generated_report.split('\n').map((line, i) => {
                const t = line.trim();
                if (!t) return <div key={i} className="h-3" />;
                if (/^\d+\.\s+[A-ZÁÉÍÓÚÑÜ]/.test(t)) {
                  return (
                    <h3 key={i} className="font-serif text-base font-semibold mt-6 mb-2 pb-1 border-b border-gray-200 text-gray-800">
                      {t}
                    </h3>
                  );
                }
                if (/^[A-ZÁÉÍÓÚÑÜ\s\-—]{10,}$/.test(t)) {
                  return <p key={i} className="font-bold text-xs text-gray-400 uppercase tracking-widest mt-4 mb-1">{t}</p>;
                }
                return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2 font-serif">{t}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MasterReportsPanel = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'complete' | 'master_premium'>('all');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .not('generated_report', 'is', null)
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data as OrderRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId);
    try {
      const { error } = await supabase.functions.invoke('send-report-email', { body: { orderId } });
      if (error) throw new Error(error.message);
      toast({ title: '✉️ Email reenviado correctamente' });
    } catch (err: unknown) {
      toast({ title: 'Error al reenviar', description: err instanceof Error ? err.message : 'Intenta de nuevo', variant: 'destructive' });
    } finally {
      setResendingId(null);
    }
  };

  const filtered = filterType === 'all' ? orders : orders.filter(o => o.report_type === filterType);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reportes Maestros</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} informe{filtered.length !== 1 ? 's' : ''} generado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterType('complete')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === 'complete' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Complete ({orders.filter(o => o.report_type === 'complete').length})
          </button>
          <button
            onClick={() => setFilterType('master_premium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === 'master_premium' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ⭐ Master ({orders.filter(o => o.report_type === 'master_premium').length})
          </button>
          <Button size="sm" variant="outline" onClick={fetchOrders} className="h-8">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
          <p className="text-4xl mb-3">🔮</p>
          <p className="font-medium">No hay informes generados aún</p>
          <p className="text-xs mt-1">Los informes aparecerán aquí una vez generados desde la pestaña Pedidos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(order => (
            <ReportCard
              key={order.id}
              order={order}
              onResendEmail={handleResendEmail}
              resendingId={resendingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MasterReportsPanel;
