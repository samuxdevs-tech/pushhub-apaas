import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Este es el secreto del Webhook. Stripe te lo dará en su panel de control.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const payload = await req.text(); // Stripe requiere el texto puro para verificar la firma
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    // 1. VERIFICACIÓN CRIPTOGRÁFICA
    // Esto asegura que el mensaje viene 100% de los servidores reales de Stripe y no de un hacker.
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. MANEJO DE EVENTOS
  // Stripe manda muchos eventos. Los que nos importan son cuando alguien paga o cancela.
  
  await dbConnect();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Recuperamos el ID del usuario que guardamos en la metadata al crear el Checkout
    const clerkUserId = session.metadata.clerkUserId;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (clerkUserId) {
      // 3. ACTUALIZAR BASE DE DATOS
      // ¡El usuario ha pagado! Lo marcamos como "Pro"
      await UserModel.findOneAndUpdate(
        { clerkUserId },
        { 
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          isPro: true 
        },
        { upsert: true }
      );
      console.log(`✅ Usuario ${clerkUserId} actualizado a PRO.`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    
    // Si cancela la suscripción o su tarjeta es rechazada repetidas veces, Stripe nos avisa.
    await UserModel.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { isPro: false } // Le quitamos los beneficios Pro
    );
    console.log(`❌ Suscripción ${subscription.id} cancelada. Bajado a plan Gratis.`);
  }

  // Siempre debemos responder con 200 a Stripe para decirle que recibimos el mensaje.
  return NextResponse.json({ received: true });
}
