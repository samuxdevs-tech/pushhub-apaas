import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import { auth } from '@clerk/nextjs/server';
import { encrypt } from '@/lib/crypto';

export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { serviceAccountJson } = await request.json();

    if (!serviceAccountJson) {
      return NextResponse.json({ success: false, error: 'Falta el archivo JSON de credenciales.' }, { status: 400 });
    }

    let credentialsObj;
    try {
      credentialsObj = JSON.parse(serviceAccountJson);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'El texto proporcionado no es un JSON válido.' }, { status: 400 });
    }

    if (credentialsObj.type !== 'service_account' || !credentialsObj.project_id || !credentialsObj.client_email || !credentialsObj.private_key) {
      return NextResponse.json({ success: false, error: 'El archivo JSON no parece ser un Service Account válido de Firebase.' }, { status: 400 });
    }

    await dbConnect();
    const app = await AppModel.findOne({ _id: id, userId });
    
    if (!app) {
      return NextResponse.json({ success: false, error: 'Aplicación no encontrada' }, { status: 404 });
    }

    // Encrypt the private key before saving
    const encryptedPrivateKey = encrypt(credentialsObj.private_key);

    app.firebaseCredentials = {
      projectId: credentialsObj.project_id,
      clientEmail: credentialsObj.client_email,
      privateKey: encryptedPrivateKey,
    };

    await app.save();

    return NextResponse.json({ success: true, message: 'Credenciales encriptadas y guardadas exitosamente.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
