import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { useAppSettings, getSettingNumber } from '@/hooks/useAppSettings';

const Pricing = () => {
  const navigate = useNavigate();
  const { data: settings } = useAppSettings();

  const tiers = [
    {
      id: 'solo_aura',
      name: 'Solo Aura',
      price: getSettingNumber(settings, 'tier_solo_aura_price', 350),
      description: 'Licencia Única - Emprendedor',
      features: ['1 Dominio autorizado', 'Calculadora completa', 'Soporte estándar', 'Actualizaciones básicas'],
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-200'
    },
    {
      id: 'binary_essence',
      name: 'Binary Essence',
      price: getSettingNumber(settings, 'tier_binary_essence_price', 600),
      description: 'Pack Duo - Colaboración',
      features: ['2 Dominios autorizados', 'Branding personalizado', 'Soporte prioritario', 'Panel de socio'],
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-200'
    },
    {
      id: 'ai_sales_master',
      name: 'AI Sales Master',
      price: getSettingNumber(settings, 'tier_ai_sales_master_price', 1500),
      description: 'El Agente de Ventas Inteligente',
      features: ['Módulo AI Sales Master', 'Entrenamiento IA personalizado', 'Integración WhatsApp/Email', 'Automatización de leads'],
      icon: <Sparkles className="w-6 h-6 text-[#800020]" />,
      color: 'border-[#800020]',
      highlight: true
    },
    {
      id: 'monolith_empire',
      name: 'Monolith Empire',
      price: getSettingNumber(settings, 'tier_monolith_empire_price', 5000),
      description: 'Franquicias - Escala Total',
      features: ['Dominios ilimitados', 'Marca Blanca (White Label)', 'Control total de API', 'Soporte 24/7 dedicado'],
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: 'border-amber-200'
    }
  ];

  const handlePurchase = (tierId: string) => {
    // In a real implementation, this would call a Supabase function to create a Stripe session
    console.log(`Starting purchase for ${tierId}`);
    
    // We map tiers to Stripe Payment Links (placeholders for now)
    const paymentLinks: Record<string, string> = {
      'solo_aura': 'https://buy.stripe.com/test_solo_aura',
      'binary_essence': 'https://buy.stripe.com/test_binary_essence',
      'ai_sales_master': 'https://buy.stripe.com/test_ai_sales_master',
      'monolith_empire': 'https://buy.stripe.com/test_monolith_empire'
    };

    const checkoutUrl = paymentLinks[tierId];
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    } else {
      alert('Configuración de pago en proceso. Contacte al administrador.');
    }
  };

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Just Bee Selection</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto font-sans">
          Elige el nivel de potencia que tu negocio necesita para escalar con numerología y tecnología de punta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {tiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`flex flex-col transition-all duration-300 hover:shadow-xl ${tier.color} ${tier.highlight ? 'ring-2 ring-[#800020] scale-105' : ''}`}
          >
            <CardHeader>
              <div className="mb-4">{tier.icon}</div>
              <CardTitle className="font-serif text-2xl">{tier.name}</CardTitle>
              <CardDescription className="font-sans">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">
                €{tier.price}
                <span className="text-sm font-normal text-gray-500"> / pago único</span>
              </div>
              <ul className="space-y-3">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handlePurchase(tier.id)}
                className={`w-full py-6 text-lg ${tier.highlight ? 'bg-[#800020] hover:bg-[#600018]' : 'bg-black hover:bg-gray-800'}`}
              >
                Adquirir Ahora
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <footer className="mt-20 text-center text-gray-400 font-serif italic text-sm">
        Design by Just Bee Brand Agency
      </footer>
    </div>
  );
};

export default Pricing;
