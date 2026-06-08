import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = 'mon_token_secret_123' // tu choisis ce que tu veux

// Vérification du webhook (GET) — appelé par Meta une seule fois
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  
  return new NextResponse('Forbidden', { status: 403 })
}

// Réception des messages (POST) — appelé à chaque message entrant
export async function POST(req: NextRequest) {
  const body = await req.json()
  
  console.log('Webhook reçu:', JSON.stringify(body, null, 2))
  
  // Extraire le message entrant
  const entry = body.entry?.[0]
  const change = entry?.changes?.[0]
  const message = change?.value?.messages?.[0]
  
  if (message) {
    const from = message.from        // numéro expéditeur
    const text = message.text?.body  // contenu du message
    console.log(`Message de ${from}: ${text}`)
    
    // TODO: traiter le message ici
  }
  
  return NextResponse.json({ status: 'ok' })
}