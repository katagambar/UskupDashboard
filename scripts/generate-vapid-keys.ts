/**
 * VAPID Key Generator Script
 * 
 * Run: npx ts-node scripts/generate-vapid-keys.ts
 * 
 * Output will be environment variables to add to .env
 */

async function generateVAPIDKeys() {
  console.log('🔑 Generating VAPID Keys for Push Notifications...\n')

  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify']
    )

    const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey)
    const privateKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.privateKey)

    // Convert to URL-safe base64
    const publicKey = Buffer.from(publicKeyBuffer)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // For private key, use the 'd' parameter from JWK
    const privateKey = privateKeyJWK.d || ''

    console.log('=' .repeat(60))
    console.log('VAPID KEYS GENERATED SUCCESSFULLY')
    console.log('=' .repeat(60))
    console.log('')
    console.log('Add these to your .env file:')
    console.log('')
    console.log(`VAPID_PUBLIC_KEY=${publicKey}`)
    console.log(`VAPID_PRIVATE_KEY=${privateKey}`)
    console.log(`VAPID_SUBJECT=mailto:admin@keuskupan-surabaya.org`)
    console.log('')
    console.log('=' .repeat(60))
    console.log('')
    console.log('📱 Push notifications are now ready to be configured!')
    console.log('')

  } catch (error) {
    console.error('❌ Failed to generate keys:', error)
    process.exit(1)
  }
}

generateVAPIDKeys()
