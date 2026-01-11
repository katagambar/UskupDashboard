import { NextRequest, NextResponse } from 'next/server'
import { 
  saveSubscription, 
  removeSubscription, 
  getUserSubscriptions,
  sendPushNotification,
  getVAPIDPublicKey,
  hasVAPIDKeys,
  generateVAPIDKeys,
  NOTIFICATION_TEMPLATES,
} from '@/lib/push-notifications'
import { withAuth, successResponse, errorResponse, serverErrorResponse } from '@/lib/api-helpers'

/**
 * GET /api/push/subscribe
 * 
 * Get VAPID public key for subscription
 */
export async function GET() {
  try {
    const publicKey = getVAPIDPublicKey()
    
    if (!publicKey) {
      // Generate keys if not exists (development only)
      if (process.env.NODE_ENV === 'development') {
        const keys = await generateVAPIDKeys()
        console.log('=== VAPID Keys Generated ===')
        console.log('Add these to your .env file:')
        console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
        console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
        console.log('============================')
        
        return NextResponse.json({
          success: true,
          publicKey: keys.publicKey,
          _dev: {
            message: 'Keys generated. See server console for values.',
          },
        })
      }
      
      return NextResponse.json(
        { success: false, error: 'VAPID keys not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      publicKey,
      configured: hasVAPIDKeys(),
    })

  } catch (error) {
    console.error('VAPID key error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get VAPID key' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/push/subscribe
 * 
 * Subscribe user to push notifications
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { subscription, action } = body

    // Unsubscribe
    if (action === 'unsubscribe') {
      if (!subscription?.endpoint) {
        return errorResponse('Subscription endpoint required')
      }
      
      const removed = removeSubscription(user.id, subscription.endpoint)
      return successResponse({
        message: removed ? 'Unsubscribed successfully' : 'Subscription not found',
        removed,
      })
    }

    // Subscribe
    if (!subscription?.endpoint || !subscription?.keys) {
      return errorResponse('Invalid subscription object')
    }

    saveSubscription(
      user.id,
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      request.headers.get('user-agent') || undefined
    )

    return successResponse({
      message: 'Subscription saved successfully',
      subscriptionCount: getUserSubscriptions(user.id).length,
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return serverErrorResponse('Failed to process subscription')
  }
})
