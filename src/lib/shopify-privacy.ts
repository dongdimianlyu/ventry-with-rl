import { ShopifyConnection, ShopifyConnectionSettings } from '@/types'

// Data Privacy and Consent Management

export interface DataPrivacySettings {
  id: string
  userId: string
  dataRetentionDays: number
  allowAnalytics: boolean
  allowTaskGeneration: boolean
  allowDataSharing: boolean
  consentDate: Date
  lastUpdated: Date
  version: string
}

export interface DataExportRequest {
  id: string
  userId: string
  requestDate: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  expiresAt?: Date
}

export interface DataDeletionRequest {
  id: string
  userId: string
  requestDate: Date
  scheduledDate: Date
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'cancelled'
  deletionScope: 'all' | 'insights' | 'raw_data'
}

// Default privacy settings
export const DEFAULT_PRIVACY_SETTINGS: Omit<DataPrivacySettings, 'id' | 'userId' | 'consentDate' | 'lastUpdated'> = {
  dataRetentionDays: 90,
  allowAnalytics: true,
  allowTaskGeneration: true,
  allowDataSharing: false,
  version: '1.0'
}

// Privacy consent management
export function recordUserConsent(userId: string, settings: Partial<DataPrivacySettings>): DataPrivacySettings {
  const privacySettings: DataPrivacySettings = {
    id: `privacy-${userId}-${Date.now()}`,
    userId,
    ...DEFAULT_PRIVACY_SETTINGS,
    ...settings,
    consentDate: new Date(),
    lastUpdated: new Date()
  }

  savePrivacySettings(privacySettings)
  return privacySettings
}

export function updatePrivacySettings(userId: string, updates: Partial<DataPrivacySettings>): DataPrivacySettings | null {
  const existing = getPrivacySettings(userId)
  if (!existing) {
    throw new Error('No existing privacy settings found')
  }

  const updated: DataPrivacySettings = {
    ...existing,
    ...updates,
    lastUpdated: new Date()
  }

  savePrivacySettings(updated)
  return updated
}

export function getPrivacySettings(userId: string): DataPrivacySettings | null {
  try {
    const data = localStorage.getItem('shopify_privacy_settings')
    if (!data) return null

    const allSettings: DataPrivacySettings[] = JSON.parse(data)
    return allSettings.find(s => s.userId === userId) || null
  } catch (error) {
    console.error('Error retrieving privacy settings:', error)
    return null
  }
}

function savePrivacySettings(settings: DataPrivacySettings): void {
  try {
    const data = localStorage.getItem('shopify_privacy_settings')
    const allSettings: DataPrivacySettings[] = data ? JSON.parse(data) : []
    
    const existingIndex = allSettings.findIndex(s => s.userId === settings.userId)
    if (existingIndex >= 0) {
      allSettings[existingIndex] = settings
    } else {
      allSettings.push(settings)
    }
    
    localStorage.setItem('shopify_privacy_settings', JSON.stringify(allSettings))
  } catch (error) {
    console.error('Error saving privacy settings:', error)
  }
}

// Data retention management
export function cleanupExpiredData(userId: string): void {
  const privacySettings = getPrivacySettings(userId)
  if (!privacySettings) return

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - privacySettings.dataRetentionDays)

  try {
    // Clean up insights
    const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
    const filteredInsights = insights.filter((insight: any) => 
      insight.userId !== userId || new Date(insight.generatedAt) > cutoffDate
    )
    localStorage.setItem('shopify_insights', JSON.stringify(filteredInsights))

    // Clean up insight summaries
    const summaries = JSON.parse(localStorage.getItem('shopify_insight_summaries') || '[]')
    const filteredSummaries = summaries.filter((summary: any) => 
      summary.userId !== userId || new Date(summary.generatedAt) > cutoffDate
    )
    localStorage.setItem('shopify_insight_summaries', JSON.stringify(filteredSummaries))

    console.log(`🧹 Cleaned up Shopify data older than ${privacySettings.dataRetentionDays} days for user ${userId}`)
  } catch (error) {
    console.error('Error cleaning up expired data:', error)
  }
}

// Data export functionality
export async function requestDataExport(userId: string): Promise<DataExportRequest> {
  const exportRequest: DataExportRequest = {
    id: `export-${userId}-${Date.now()}`,
    userId,
    requestDate: new Date(),
    status: 'pending'
  }

  // Save export request
  saveDataExportRequest(exportRequest)

  // In a real implementation, this would trigger a background job
  // For now, we'll simulate processing
  setTimeout(() => {
    processDataExport(exportRequest.id)
  }, 1000)

  return exportRequest
}

function processDataExport(requestId: string): void {
  const request = getDataExportRequest(requestId)
  if (!request) return

  try {
    // Update status to processing
    request.status = 'processing'
    saveDataExportRequest(request)

    // Gather all user data
    const userData = gatherUserData(request.userId)
    
    // Create export file (in real implementation, this would be uploaded to secure storage)
    const exportData = {
      exportDate: new Date(),
      userId: request.userId,
      data: userData,
      privacySettings: getPrivacySettings(request.userId)
    }

    // Simulate file creation
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)

    // Update request with download URL
    request.status = 'completed'
    request.downloadUrl = downloadUrl
    request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    saveDataExportRequest(request)

    console.log(`📦 Data export completed for user ${request.userId}`)
  } catch (error) {
    console.error('Error processing data export:', error)
    request.status = 'failed'
    saveDataExportRequest(request)
  }
}

function gatherUserData(userId: string): any {
  try {
    return {
      shopifyConnection: JSON.parse(localStorage.getItem('shopify_connections') || '[]')
        .filter((c: any) => c.userId === userId),
      insights: JSON.parse(localStorage.getItem('shopify_insights') || '[]')
        .filter((i: any) => i.userId === userId),
      summaries: JSON.parse(localStorage.getItem('shopify_insight_summaries') || '[]')
        .filter((s: any) => s.userId === userId),
      privacySettings: getPrivacySettings(userId)
    }
  } catch (error) {
    console.error('Error gathering user data:', error)
    return {}
  }
}

function saveDataExportRequest(request: DataExportRequest): void {
  try {
    const data = localStorage.getItem('shopify_export_requests')
    const allRequests: DataExportRequest[] = data ? JSON.parse(data) : []
    
    const existingIndex = allRequests.findIndex(r => r.id === request.id)
    if (existingIndex >= 0) {
      allRequests[existingIndex] = request
    } else {
      allRequests.push(request)
    }
    
    localStorage.setItem('shopify_export_requests', JSON.stringify(allRequests))
  } catch (error) {
    console.error('Error saving export request:', error)
  }
}

function getDataExportRequest(requestId: string): DataExportRequest | null {
  try {
    const data = localStorage.getItem('shopify_export_requests')
    if (!data) return null

    const allRequests: DataExportRequest[] = JSON.parse(data)
    return allRequests.find(r => r.id === requestId) || null
  } catch (error) {
    console.error('Error retrieving export request:', error)
    return null
  }
}

export function getUserDataExportRequests(userId: string): DataExportRequest[] {
  try {
    const data = localStorage.getItem('shopify_export_requests')
    if (!data) return []

    const allRequests: DataExportRequest[] = JSON.parse(data)
    return allRequests.filter(r => r.userId === userId)
  } catch (error) {
    console.error('Error retrieving user export requests:', error)
    return []
  }
}

// Data deletion functionality
export async function requestDataDeletion(
  userId: string, 
  scope: 'all' | 'insights' | 'raw_data' = 'all',
  scheduledDays: number = 30
): Promise<DataDeletionRequest> {
  const deletionRequest: DataDeletionRequest = {
    id: `deletion-${userId}-${Date.now()}`,
    userId,
    requestDate: new Date(),
    scheduledDate: new Date(Date.now() + scheduledDays * 24 * 60 * 60 * 1000),
    status: 'scheduled',
    deletionScope: scope
  }

  saveDataDeletionRequest(deletionRequest)
  return deletionRequest
}

export function cancelDataDeletion(requestId: string): boolean {
  try {
    const request = getDataDeletionRequest(requestId)
    if (!request || request.status !== 'scheduled') {
      return false
    }

    request.status = 'cancelled'
    saveDataDeletionRequest(request)
    return true
  } catch (error) {
    console.error('Error cancelling data deletion:', error)
    return false
  }
}

export function processScheduledDeletions(): void {
  try {
    const data = localStorage.getItem('shopify_deletion_requests')
    if (!data) return

    const allRequests: DataDeletionRequest[] = JSON.parse(data)
    const now = new Date()

    allRequests.forEach(request => {
      if (request.status === 'scheduled' && new Date(request.scheduledDate) <= now) {
        processDataDeletion(request.id)
      }
    })
  } catch (error) {
    console.error('Error processing scheduled deletions:', error)
  }
}

function processDataDeletion(requestId: string): void {
  const request = getDataDeletionRequest(requestId)
  if (!request) return

  try {
    request.status = 'processing'
    saveDataDeletionRequest(request)

    switch (request.deletionScope) {
      case 'all':
        deleteAllUserData(request.userId)
        break
      case 'insights':
        deleteUserInsights(request.userId)
        break
      case 'raw_data':
        deleteUserRawData(request.userId)
        break
    }

    request.status = 'completed'
    saveDataDeletionRequest(request)

    console.log(`🗑️ Data deletion completed for user ${request.userId} (scope: ${request.deletionScope})`)
  } catch (error) {
    console.error('Error processing data deletion:', error)
    request.status = 'failed'
    saveDataDeletionRequest(request)
  }
}

function deleteAllUserData(userId: string): void {
  // Remove Shopify connections
  const connections = JSON.parse(localStorage.getItem('shopify_connections') || '[]')
  const filteredConnections = connections.filter((c: any) => c.userId !== userId)
  localStorage.setItem('shopify_connections', JSON.stringify(filteredConnections))

  // Remove insights and summaries
  deleteUserInsights(userId)

  // Remove privacy settings
  const privacySettings = JSON.parse(localStorage.getItem('shopify_privacy_settings') || '[]')
  const filteredPrivacy = privacySettings.filter((s: any) => s.userId !== userId)
  localStorage.setItem('shopify_privacy_settings', JSON.stringify(filteredPrivacy))

  // Remove export/deletion requests
  const exportRequests = JSON.parse(localStorage.getItem('shopify_export_requests') || '[]')
  const filteredExports = exportRequests.filter((r: any) => r.userId !== userId)
  localStorage.setItem('shopify_export_requests', JSON.stringify(filteredExports))

  const deletionRequests = JSON.parse(localStorage.getItem('shopify_deletion_requests') || '[]')
  const filteredDeletions = deletionRequests.filter((r: any) => r.userId !== userId)
  localStorage.setItem('shopify_deletion_requests', JSON.stringify(filteredDeletions))
}

function deleteUserInsights(userId: string): void {
  const insights = JSON.parse(localStorage.getItem('shopify_insights') || '[]')
  const filteredInsights = insights.filter((i: any) => i.userId !== userId)
  localStorage.setItem('shopify_insights', JSON.stringify(filteredInsights))

  const summaries = JSON.parse(localStorage.getItem('shopify_insight_summaries') || '[]')
  const filteredSummaries = summaries.filter((s: any) => s.userId !== userId)
  localStorage.setItem('shopify_insight_summaries', JSON.stringify(filteredSummaries))
}

function deleteUserRawData(userId: string): void {
  // In a real implementation, this would delete raw Shopify data
  // For this demo, we only store processed insights, so this is the same as deleteUserInsights
  deleteUserInsights(userId)
}

function saveDataDeletionRequest(request: DataDeletionRequest): void {
  try {
    const data = localStorage.getItem('shopify_deletion_requests')
    const allRequests: DataDeletionRequest[] = data ? JSON.parse(data) : []
    
    const existingIndex = allRequests.findIndex(r => r.id === request.id)
    if (existingIndex >= 0) {
      allRequests[existingIndex] = request
    } else {
      allRequests.push(request)
    }
    
    localStorage.setItem('shopify_deletion_requests', JSON.stringify(allRequests))
  } catch (error) {
    console.error('Error saving deletion request:', error)
  }
}

function getDataDeletionRequest(requestId: string): DataDeletionRequest | null {
  try {
    const data = localStorage.getItem('shopify_deletion_requests')
    if (!data) return null

    const allRequests: DataDeletionRequest[] = JSON.parse(data)
    return allRequests.find(r => r.id === requestId) || null
  } catch (error) {
    console.error('Error retrieving deletion request:', error)
    return null
  }
}

export function getUserDataDeletionRequests(userId: string): DataDeletionRequest[] {
  try {
    const data = localStorage.getItem('shopify_deletion_requests')
    if (!data) return []

    const allRequests: DataDeletionRequest[] = JSON.parse(data)
    return allRequests.filter(r => r.userId === userId)
  } catch (error) {
    console.error('Error retrieving user deletion requests:', error)
    return []
  }
}

// Consent verification
export function verifyUserConsent(userId: string, requiredVersion: string = '1.0'): boolean {
  const privacySettings = getPrivacySettings(userId)
  if (!privacySettings) return false

  return privacySettings.version === requiredVersion && privacySettings.allowTaskGeneration
}

export function requiresConsentUpdate(userId: string, currentVersion: string = '1.0'): boolean {
  const privacySettings = getPrivacySettings(userId)
  if (!privacySettings) return true

  return privacySettings.version !== currentVersion
}

// Data usage tracking
export function logDataUsage(userId: string, operation: string, dataType: string): void {
  const privacySettings = getPrivacySettings(userId)
  if (!privacySettings || !privacySettings.allowAnalytics) return

  try {
    const usage = {
      userId,
      operation,
      dataType,
      timestamp: new Date(),
      consentVersion: privacySettings.version
    }

    const data = localStorage.getItem('shopify_data_usage_log')
    const logs = data ? JSON.parse(data) : []
    logs.push(usage)

    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000)
    }

    localStorage.setItem('shopify_data_usage_log', JSON.stringify(logs))
  } catch (error) {
    console.error('Error logging data usage:', error)
  }
}

// Initialize privacy settings for new users
export function initializePrivacyForUser(userId: string): DataPrivacySettings {
  const existing = getPrivacySettings(userId)
  if (existing) return existing

  return recordUserConsent(userId, {})
}

// Periodic cleanup function (should be called regularly)
export function performPeriodicCleanup(): void {
  try {
    // Get all users with privacy settings
    const privacyData = localStorage.getItem('shopify_privacy_settings')
    if (!privacyData) return

    const allSettings: DataPrivacySettings[] = JSON.parse(privacyData)
    
    // Clean up expired data for each user
    allSettings.forEach(settings => {
      cleanupExpiredData(settings.userId)
    })

    // Process scheduled deletions
    processScheduledDeletions()

    console.log('🧹 Periodic privacy cleanup completed')
  } catch (error) {
    console.error('Error during periodic cleanup:', error)
  }
} 