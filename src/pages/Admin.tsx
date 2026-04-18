import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllAppContent, useUpdateContent, useCreateContent, useDeleteContent, AppContent } from '@/hooks/useAppContent';
import { useAppSettings, useUpdateSetting, AppSetting, getSettingValue } from '@/hooks/useAppSettings';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, Save, Plus, Trash2, Search, Settings, Languages, Hash, MessageSquare, Sparkles, DollarSign, Mail, Link, Key, FileText, RefreshCw, Eye, Download, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicensesPanel } from '@/components/LicensesPanel';

const CONTENT_TYPES = [
  { value: 'ui_label', label: 'UI Labels', icon: Settings },
  { value: 'number_meaning', label: 'Number Meanings', icon: Hash },
  { value: 'cta_text', label: 'CTA Text', icon: MessageSquare },
  { value: 'step_text', label: 'Step Text', icon: Sparkles },
  { value: 'tarot_meaning', label: 'Tarot Meanings', icon: Sparkles },
] as const;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'de', label: 'Deutsch' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'fr', label: 'Français' },
];

// Settings Configuration Panel Component
const SettingsPanel = ({ settings, updateSetting }: { settings: AppSetting[] | undefined; updateSetting: any }) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = async (key: string) => {
    try {
      await updateSetting.mutateAsync({ key, value: editValue });
      toast({ title: 'Configuración actualizada' });
      setEditingKey(null);
    } catch (error) {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    }
  };

  const premiumSettings = [
    { key: 'premium_enabled', label: 'Premium Enabled', type: 'boolean' },
    { key: 'premium_price', label: 'Price', type: 'number' },
    { key: 'premium_currency', label: 'Currency Code', type: 'text' },
    { key: 'premium_currency_symbol', label: 'Currency Symbol', type: 'text' },
    { key: 'premium_checkout_url', label: 'Checkout URL', type: 'url' },
    { key: 'stripe_publishable_key', label: 'Stripe Publishable Key', type: 'text' },
    { key: 'stripe_secret_key', label: 'Stripe Secret Key', type: 'secret' },
  ];

  const productTiers = [
    { key: 'tier_solo_aura_price', label: 'Solo Aura (€350)', type: 'number' },
    { key: 'tier_binary_essence_price', label: 'Binary Essence (€600)', type: 'number' },
    { key: 'tier_monolith_empire_price', label: 'Monolith Empire (€5000)', type: 'number' },
    { key: 'tier_ai_sales_master_price', label: 'AI Sales Master (€1500)', type: 'number' },
  ];

  const mailchimpSettings = [
    { key: 'mailchimp_api_key', label: 'API Key', type: 'secret' },
    { key: 'mailchimp_list_id', label: 'Audience/List ID', type: 'text' },
    { key: 'mailchimp_server', label: 'Server Prefix (e.g., us1)', type: 'text' },
  ];

  const mergeTagSettings = [
    { key: 'mailchimp_merge_fname', label: 'Nombre (FNAME)', type: 'text' },
    { key: 'mailchimp_merge_lpath', label: 'Resultado Numerológico (LPATH)', type: 'text' },
    { key: 'mailchimp_merge_tarch', label: 'Arquetipo Tarot (T_ARCH)', type: 'text' },
  ];

  const brandingSettings = [
    { key: 'branding_app_name', label: 'App Name', type: 'text' },
    { key: 'branding_copyright', label: 'Copyright Holder', type: 'text' },
  ];

  const renderSettingRow = (setting: { key: string; label: string; type: string }) => {
    const currentValue = getSettingValue(settings, setting.key, '');
    const isEditing = editingKey === setting.key;

    return (
      <div key={setting.key} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
        <div className="flex-1">
          <p className="text-sm font-medium">{setting.label}</p>
          <code className="text-xs text-muted-foreground">{setting.key}</code>
        </div>
        <div className="flex items-center gap-2 flex-1">
          {isEditing ? (
            <>
              <Input
                type={setting.type === 'secret' ? 'password' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={() => handleSave(setting.key)} disabled={updateSetting.isPending}>
                {updateSetting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-foreground flex-1 truncate">
                {setting.type === 'secret' && currentValue ? '••••••••' : currentValue || '-'}
              </span>
              <Button size="sm" variant="outline" onClick={() => handleEdit(setting.key, currentValue)}>
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#800020]">
            <Sparkles className="w-5 h-5" />
            Niveles de Licencia (Precios)
          </CardTitle>
          <CardDescription>Configura los precios para los 4 niveles de producto.</CardDescription>
        </CardHeader>
        <CardContent>
          {productTiers.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Premium Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Configuración Stripe & Pagos
          </CardTitle>
          <CardDescription>Configura las llaves de Stripe y la pasarela de pago.</CardDescription>
        </CardHeader>
        <CardContent>
          {premiumSettings.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Mailchimp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Mailchimp Configuration
          </CardTitle>
          <CardDescription>API credentials for email marketing automation</CardDescription>
        </CardHeader>
        <CardContent>
          {mailchimpSettings.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Merge Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Mailchimp Merge Tags
          </CardTitle>
          <CardDescription>Configure field mapping for lead data (FNAME, LPATH for numerology result, T_ARCH for tarot binomial)</CardDescription>
        </CardHeader>
        <CardContent>
          {mergeTagSettings.map(renderSettingRow)}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Branding
          </CardTitle>
          <CardDescription>Application name and copyright information</CardDescription>
        </CardHeader>
        <CardContent>
          {brandingSettings.map(renderSettingRow)}
        </CardContent>
      </Card>
    </div>
  );
};

type OrderRow = {
  id: string;
  user_email: string;
  user_name: string;
  birth_date: string;
  report_type: 'complete' | 'master_premium';
  status: 'pending' | 'processing' | 'completed' | 'sent';
  destiny_number: number | null;
  soul_number: number | null;
  personality_number: number | null;
  personal_year_number: number | null;
  generated_report: string | null;
  amount_paid: number | null;
  currency: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  sent: 'bg-gray-100 text-gray-600',
};

const OrdersPanel = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<OrderRow | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleGenerate = async (order: OrderRow) => {
    setGeneratingId(order.id);
    try {
      const { error } = await supabase.functions.invoke('generate-report', {
        body: { orderId: order.id },
      });
      if (error) throw new Error(error.message);
      toast({ title: '¡Informe generado correctamente!' });
      fetchOrders();
    } catch (err: unknown) {
      toast({ title: 'Error al generar el informe', description: err instanceof Error ? err.message : 'Intenta de nuevo', variant: 'destructive' });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleMarkSent = async (orderId: string) => {
    await supabase.from('orders').update({ status: 'sent' }).eq('id', orderId);
    toast({ title: 'Estado actualizado a "Enviado"' });
    fetchOrders();
  };

  const handleDownloadReport = (order: OrderRow) => {
    if (!order.generated_report) return;
    const blob = new Blob([order.generated_report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_${order.user_name.replace(/\s+/g, '_')}_${order.report_type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Tipo', 'Estado', 'Destino#', 'Alma#', 'Personalidad#', 'AñoPersonal#', 'Importe', 'Fecha'];
    const rows = filteredOrders.map(o => [
      o.user_name, o.user_email, o.report_type, o.status,
      o.destiny_number ?? '', o.soul_number ?? '', o.personality_number ?? '', o.personal_year_number ?? '',
      o.amount_paid ? `${o.amount_paid} ${o.currency}` : '',
      new Date(o.created_at).toLocaleDateString('es-ES'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos_informes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchType = filterType === 'all' || o.report_type === filterType;
    return matchStatus && matchType;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="complete">Complete Report</SelectItem>
              <SelectItem value="master_premium">Master Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchOrders} className="h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Actualizar
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs">
            <Download className="w-3 h-3 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">Total: <strong>{filteredOrders.length}</strong></span>
        <span className="text-yellow-700">Pendientes: <strong>{orders.filter(o => o.status === 'pending').length}</strong></span>
        <span className="text-green-700">Completados: <strong>{orders.filter(o => o.status === 'completed').length}</strong></span>
        <span className="text-gray-500">Enviados: <strong>{orders.filter(o => o.status === 'sent').length}</strong></span>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No hay pedidos registrados aún.</p>
          <p className="text-xs mt-1">Los pedidos aparecerán aquí una vez que los clientes realicen pagos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Números</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Estado</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Importe</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-800">{order.user_name}</p>
                    <p className="text-gray-400">{order.user_email}</p>
                    <p className="text-gray-300">{order.birth_date}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${order.report_type === 'master_premium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                      {order.report_type === 'master_premium' ? 'Master Premium' : 'Complete'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-500">
                    <div className="space-y-0.5">
                      {order.destiny_number && <div>Destino: <strong>{order.destiny_number}</strong></div>}
                      {order.soul_number && <div>Alma: <strong>{order.soul_number}</strong></div>}
                      {order.personality_number && <div>Pers.: <strong>{order.personality_number}</strong></div>}
                      {order.personal_year_number && <div>Año: <strong>{order.personal_year_number}</strong></div>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status === 'pending' ? '⏳ Pendiente' : order.status === 'processing' ? '⚙️ Procesando' : order.status === 'completed' ? '✅ Completado' : '📤 Enviado'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 font-medium">
                    {order.amount_paid ? `€${order.amount_paid}` : '-'}
                  </td>
                  <td className="px-3 py-3 text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button
                          size="sm"
                          className="h-7 text-[10px] bg-black hover:bg-gray-900 text-white px-2"
                          disabled={generatingId === order.id}
                          onClick={() => handleGenerate(order)}
                        >
                          {generatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨ Generar'}
                        </Button>
                      )}
                      {order.generated_report && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2"
                            onClick={() => setViewReport(order)}
                          >
                            <Eye className="w-3 h-3 mr-1" /> Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2"
                            onClick={() => handleDownloadReport(order)}
                          >
                            <Download className="w-3 h-3 mr-1" /> TXT
                          </Button>
                        </>
                      )}
                      {order.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2 text-green-700 border-green-200"
                          onClick={() => handleMarkSent(order.id)}
                        >
                          <Send className="w-3 h-3 mr-1" /> Enviado
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Report Modal */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Informe de {viewReport?.user_name} — {viewReport?.report_type === 'master_premium' ? 'Master Premium' : 'Complete Report'}
            </DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 p-4 rounded-lg">
            {viewReport?.generated_report}
          </pre>
          <DialogFooter>
            <Button variant="outline" onClick={() => viewReport && handleDownloadReport(viewReport)}>
              <Download className="w-4 h-4 mr-2" /> Descargar TXT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Admin = () => {
  const { signOut, user } = useAuth();
  const { data: content, isLoading: contentLoading } = useAllAppContent();
  const { data: settings, isLoading: settingsLoading } = useAppSettings();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();
  const updateSetting = useUpdateSetting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    content_key: '',
    content_type: 'ui_label' as AppContent['content_type'],
    language: 'en',
    content_value: '',
    description: '',
  });

  const handleLogout = async () => {
    await signOut();
  };

  const handleEdit = (item: AppContent) => {
    setEditingId(item.id);
    setEditValue(item.content_value);
  };

  const handleSave = async (id: string) => {
    try {
      console.log('Updating content:', id, editValue);
      await updateContent.mutateAsync({ id, content_value: editValue });
      toast({ title: 'Content updated successfully' });
      setEditingId(null);
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: 'Failed to update content', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    try {
      await createContent.mutateAsync(newContent);
      toast({ title: 'Content created successfully' });
      setIsAddDialogOpen(false);
      setNewContent({
        content_key: '',
        content_type: 'ui_label',
        language: 'en',
        content_value: '',
        description: '',
      });
    } catch (error) {
      toast({ title: 'Failed to create content', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await deleteContent.mutateAsync(id);
      toast({ title: 'Content deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete content', variant: 'destructive' });
    }
  };

  const filterContent = (items: AppContent[] | undefined, type: string) => {
    if (!items) return [];
    return items.filter(item => {
      const matchesType = item.content_type === type;
      const matchesSearch = searchTerm === '' || 
        item.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_value.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = filterLanguage === 'all' || item.language === filterLanguage;
      return matchesType && matchesSearch && matchesLanguage;
    });
  };

  const isLoading = contentLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold">Content Manager</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content Key</Label>
                      <Input
                        placeholder="e.g., hero_title"
                        value={newContent.content_key}
                        onChange={(e) => setNewContent({ ...newContent, content_key: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newContent.content_type}
                        onValueChange={(v) => setNewContent({ ...newContent, content_type: v as AppContent['content_type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={newContent.language}
                      onValueChange={(v) => setNewContent({ ...newContent, language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Content Value</Label>
                    <Textarea
                      placeholder="Enter the content..."
                      value={newContent.content_value}
                      onChange={(e) => setNewContent({ ...newContent, content_value: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Input
                      placeholder="Internal note about this content"
                      value={newContent.description}
                      onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={createContent.isPending}>
                    {createContent.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Tabs: Settings vs Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Informes & Pedidos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Licenses
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Gestión de Informes y Pedidos
                </CardTitle>
                <CardDescription>
                  Visualiza, genera y gestiona los informes numerológicos de tus clientes. Requiere OPENAI_API_KEY configurada en Secrets para generación automática.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsPanel settings={settings} updateSetting={updateSetting} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            {/* Filters */}
            <div className="mb-6 flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Type Tabs */}
            <Tabs defaultValue="ui_label">
              <TabsList className="mb-6">
                {CONTENT_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {CONTENT_TYPES.map(type => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="space-y-3">
                    {filterContent(content, type.value).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No content found. Add some using the button above!</p>
                      </div>
                    ) : (
                      filterContent(content, type.value).map(item => (
                        <div key={item.id} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                                  {item.content_key}
                                </code>
                                <span className="text-xs text-muted-foreground uppercase">
                                  {item.language}
                                </span>
                              </div>
                              {editingId === item.id ? (
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  rows={3}
                                  className="w-full"
                                />
                              ) : (
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {item.content_value}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {editingId === item.id ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(item.id)}
                                  disabled={updateContent.isPending}
                                >
                                  {updateContent.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(item)}
                                >
                                  Edit
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <LicensesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
