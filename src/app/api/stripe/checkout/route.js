import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// En producción, esto debería venir de una variable de entorno o buscarse dinámicamente en Stripe
// Como estamos en un entorno de aprendizaje, usaremos un precio dinámico para no obligarte a crearlo en el dashboard de Stripe.
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    await dbConnect();
    
    // Buscar o crear el usuario en nuestra DB local
    let user = await UserModel.findOne({ clerkUserId: userId });
    if (!user) {
      user = await UserModel.create({ clerkUserId: userId });
    }

    // Si el usuario ya es Pro, no dejarlo comprar de nuevo (opcional, pero buena práctica)
    if (user.isPro) {
      return NextResponse.redirect(new URL('/dashboard?error=already_pro', request.url));
    }

    // Crear la sesión de Checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          // Creación de precio dinámico para ahorrarte pasos en el Dashboard de Stripe
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'IPTPush Pro Plan',
              description: 'Notificaciones Ilimitadas y Encriptación AES-256',
            },
            unit_amount: 1500, // $15.00 USD
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      // Metadatos cruciales: aquí guardamos el ID del usuario para saber quién pagó
      // cuando Stripe nos envíe el Webhook de respuesta.
      metadata: {
        clerkUserId: userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
    });

    // Redirigir al usuario a la página de pago segura alojada por Stripe
    return NextResponse.redirect(session.url, 303);

  } catch (error) {
    console.error('Error in Stripe Checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
