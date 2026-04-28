import { createClient } from '@supabase/supabase-js';
import { createOrderFromStripeSession, processOrder } from '../api/_lib/orders';
import type { ProductKey } from '../api/_lib/prompts';

const ADMIN_EMAIL = process.argv[2] || 'yanpiccolo@gmail.com';

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

async function ensureAdminUser(email: string): Promise<{ id: string; tempPassword?: string }> {
  // Try to find existing user
  const list = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;
  let tempPassword: string | undefined;

  if (existing) {
    userId = existing.id;
    console.log(`✓ Usuario existente: ${email} (id=${userId})`);
  } else {
    tempPassword =
      'Numero-' +
      Math.random().toString(36).slice(2, 10) +
      '!' +
      Math.floor(Math.random() * 99);
    const created = await sb.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      throw new Error('createUser: ' + (created.error?.message || 'unknown'));
    }
    userId = created.data.user.id;
    console.log(`✓ Usuario creado: ${email} (id=${userId})`);
  }

  // Insert admin role (idempotent via unique constraint)
  const { error: roleErr } = await sb
    .from('user_roles')
    .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
  if (roleErr) throw new Error('user_roles upsert: ' + roleErr.message);
  console.log(`✓ Rol admin asignado`);

  return { id: userId, tempPassword };
}

interface SampleSpec {
  productKey: ProductKey;
  amountCents: number;
  currency: string;
  customerName: string;
  birthDate: string;
  language: string;
}

const SAMPLES: SampleSpec[] = [
  {
    productKey: 'premium_pdf',
    amountCents: 999,
    currency: 'eur',
    customerName: 'María García López',
    birthDate: '1990-03-15',
    language: 'es',
  },
  {
    productKey: 'complete_report',
    amountCents: 2999,
    currency: 'eur',
    customerName: 'Carlos Rodríguez Martín',
    birthDate: '1985-07-22',
    language: 'es',
  },
  {
    productKey: 'master_premium',
    amountCents: 5999,
    currency: 'eur',
    customerName: 'Ana Beltrán Ruiz',
    birthDate: '1978-11-11',
    language: 'es',
  },
];

async function seedSample(spec: SampleSpec): Promise<void> {
  const fakeSessionId = `cs_test_seed_${spec.productKey}_${Date.now()}`;
  console.log(`\n→ ${spec.productKey} | ${spec.customerName}`);

  const order = await createOrderFromStripeSession({
    sessionId: fakeSessionId,
    productKey: spec.productKey,
    amountCents: spec.amountCents,
    currency: spec.currency,
    customerEmail: ADMIN_EMAIL,
    customerName: spec.customerName,
    birthDate: spec.birthDate,
    language: spec.language,
    metadata: { source: 'seed_script', purpose: 'sample_for_dashboard' },
  });
  console.log(`  ✓ Orden creada id=${order.id}`);

  console.log(`  · Generando informe con IA, PDF y email…`);
  const result = await processOrder(order.id);
  if (result.ok) {
    console.log(`  ✓ status=${result.status} email_id=${result.emailMessageId}`);
    console.log(`  ✓ PDF: ${result.pdfUrl}`);
  } else {
    console.error(`  ✗ ERROR: ${result.error}`);
  }
}

async function main() {
  console.log(`\n=== Configurando admin + 3 informes de prueba ===\n`);

  const { tempPassword } = await ensureAdminUser(ADMIN_EMAIL);

  // Run all 3 in parallel — independent OpenAI / PDF / email calls
  const results = await Promise.allSettled(SAMPLES.map(seedSample));

  let okCount = 0;
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`\n✗ ${SAMPLES[i].productKey}: ${r.reason?.message || r.reason}`);
    } else {
      okCount++;
    }
  });

  console.log(`\n=== Resumen ===`);
  console.log(`Informes generados correctamente: ${okCount}/${SAMPLES.length}`);
  console.log(`Email destino: ${ADMIN_EMAIL}`);
  if (tempPassword) {
    console.log(`\n⚠ Contraseña temporal del admin: ${tempPassword}`);
    console.log(`  Inicia sesión en /admin/login con ese email + esa contraseña.`);
  } else {
    console.log(`\n(Usa la contraseña que ya tengas para entrar en /admin/login)`);
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
