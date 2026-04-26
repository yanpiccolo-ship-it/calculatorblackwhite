import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Loader2,
  RefreshCw,
  Send,
  PlayCircle,
  Download,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Order {
  id: string;
  stripe_session_id: string;
  product_key: string;
  amount_cents: number;
  currency: string;
  customer_email: string;
  customer_name: string | null;
  birth_date: string | null;
  language: string | null;
  status: string;
  report_text: string | null;
  report_pdf_url: string | null;
  email_message_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  sent_at: string | null;
}

const PRODUCT_LABELS: Record<string, string> = {
  premium_pdf: 'Initial Insight (€9.99)',
  complete_report: 'Complete Report (€29.99)',
  master_premium: 'Master Premium (€59.99)',
};

const STATUS_BADGES: Record<string, { label: string; cls: string; Icon: any }> = {
  pending: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  processing: { label: 'Procesando', cls: 'bg-blue-50 text-blue-700 border-blue-200', Icon: Loader2 },
  completed: { label: 'Generado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  sent: { label: 'Enviado', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: Mail },
  error: { label: 'Error', cls: 'bg-red-50 text-red-700 border-red-200', Icon: AlertCircle },
};

function formatMoney(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  const sym = currency.toLowerCase() === 'eur' ? '€' : currency.toLowerCase() === 'usd' ? '$' : '';
  return `${sym}${amount}`;
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
}

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: 'Error cargando órdenes', description: error.message, variant: 'destructive' });
      setOrders([]);
    } else {
      setOrders((data || []) as Order[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const callProcess = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('No hay sesión activa. Vuelve a iniciar sesión.');

      const res = await fetch('/api/process-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Status ${res.status}`);
      toast({
        title: json.ok ? 'Informe generado y enviado' : 'Error en el flujo',
        description: json.error || `Estado: ${json.status}`,
        variant: json.ok ? 'default' : 'destructive',
      });
      await load();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (productFilter !== 'all' && o.product_key !== productFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.customer_email?.toLowerCase().includes(s) &&
        !(o.customer_name || '').toLowerCase().includes(s) &&
        !o.id.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  if (!isSupabaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Órdenes e Informes</CardTitle>
          <CardDescription>
            Supabase no está configurado. Añade VITE_SUPABASE_URL y la clave pública para ver órdenes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Órdenes e Informes
              </CardTitle>
              <CardDescription>
                Gestiona los informes generados, regenera, descarga el PDF y reenvía el email.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Refrescar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Buscar por email, nombre o ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Generado (no enviado)</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                <SelectItem value="premium_pdf">Initial Insight (€9.99)</SelectItem>
                <SelectItem value="complete_report">Complete Report (€29.99)</SelectItem>
                <SelectItem value="master_premium">Master Premium (€59.99)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No hay órdenes para mostrar todavía. Cuando un cliente pague, aparecerá aquí.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="text-left py-2 pr-3">Cliente</th>
                    <th className="text-left py-2 pr-3">Producto</th>
                    <th className="text-left py-2 pr-3">Importe</th>
                    <th className="text-left py-2 pr-3">Estado</th>
                    <th className="text-left py-2 pr-3">Fecha</th>
                    <th className="text-right py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const badge = STATUS_BADGES[o.status] || STATUS_BADGES.pending;
                    const Icon = badge.Icon;
                    const isProcessing = processingId === o.id || o.status === 'processing';
                    return (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 pr-3">
                          <div className="font-medium">{o.customer_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                          {o.error_message && (
                            <div className="text-[10px] text-red-600 mt-1 max-w-xs truncate" title={o.error_message}>
                              ⚠ {o.error_message}
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-xs">{PRODUCT_LABELS[o.product_key] || o.product_key}</td>
                        <td className="py-3 pr-3 font-medium">{formatMoney(o.amount_cents, o.currency)}</td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            <Icon className={`w-3 h-3 ${o.status === 'processing' ? 'animate-spin' : ''}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                        <td className="py-3 text-right space-x-1">
                          {o.report_pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(o.report_pdf_url!, '_blank')}
                              title="Descargar PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={o.status === 'sent' || o.status === 'completed' ? 'outline' : 'default'}
                            onClick={() => callProcess(o.id)}
                            disabled={isProcessing}
                            title={
                              o.status === 'sent' || o.status === 'completed'
                                ? 'Regenerar y reenviar'
                                : 'Generar y enviar'
                            }
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : o.status === 'sent' || o.status === 'completed' ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : (
                              <PlayCircle className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
