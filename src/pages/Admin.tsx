import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllAppContent, useUpdateContent, useCreateContent, useDeleteContent, AppContent } from '@/hooks/useAppContent';
import { useAppSettings, useUpdateSetting, AppSetting, getSettingValue } from '@/hooks/useAppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2, LogOut, Save, Plus, Trash2, Search, Settings, Languages, Hash, MessageSquare, Sparkles, DollarSign, Mail, Link, Key } from 'lucide-react';
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
        <Tabs defaultValue="settings">
          <TabsList className="mb-6">
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
