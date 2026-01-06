import { toast } from "sonner"

// Enhanced toast notifications (client-side only for now)
export const showSuccess = async (message: string) => {
  toast.success(message)
  console.log('Success:', message)
}

export const showError = async (message: string) => {
  toast.error(message)
  // Removed console.error to prevent Next.js dev overlay
}

export const showInfo = async (message: string) => {
  toast.info(message)
  console.log('Info:', message)
}

export const showWarning = async (message: string) => {
  toast.warning(message)
  console.warn('Warning:', message)
}

// Enhanced confirmation dialogs
export const confirmDelete = async (itemName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`
    )
    if (confirmed) {
      showInfo(`Menghapus ${itemName}...`)
    }
    resolve(confirmed)
  })
}

export const confirmAction = async (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message)
    if (confirmed) {
      showInfo('Memproses...')
    }
    resolve(confirmed)
  })
}

// Show custom notification with action
export const showAction = async (
  message: string, 
  actionText: string, 
  action: () => void,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) => {
  const toastId = toast[type](message, {
    action: {
      label: actionText,
      onClick: action,
    },
  })
  return toastId
}

// Get notifications from database
export const getNotifications = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return []
    
    return await db.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

// Mark notification as read
export const markNotificationAsRead = async (id: string) => {
  try {
    await db.notification.update({
      where: { id },
      data: {
        status: 'read',
        readAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}