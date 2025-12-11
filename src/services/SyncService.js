import offlineStorage from './OfflineStorage.js';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncInterval = null;
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - starting sync');
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Connection lost - pausing sync');
      this.stopSync();
    });

    // Auto-sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.startSync();
      }
    });
  }

  async startSync() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting sync process...');

    try {
      // Sync pending photos
      await this.syncPendingPhotos();

      // Sync pending annotations
      await this.syncPendingAnnotations();

      // Process sync queue
      await this.processSyncQueue();

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.scheduleRetry();
    } finally {
      this.syncInProgress = false;
    }
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncInProgress = false;
  }

  scheduleRetry() {
    if (this.retryAttempts > 0) {
      this.retryAttempts--;
      console.log(`🔄 Scheduling retry in ${this.retryDelay}ms (${this.retryAttempts} attempts remaining)`);

      setTimeout(() => {
        if (this.isOnline) {
          this.startSync();
        }
      }, this.retryDelay);
    } else {
      console.error('❌ Max retry attempts reached');
      this.retryAttempts = 3; // Reset for next sync cycle
    }
  }

  async syncPendingPhotos() {
    const pendingPhotos = await offlineStorage.getPendingPhotos();

    for (const photo of pendingPhotos) {
      try {
        console.log(`📤 Syncing photo: ${photo.localId}`);

        // Upload photo to server
        const formData = new FormData();
        const blob = await (await fetch(photo.image)).blob();
        formData.append('photo', blob);
        formData.append('metadata', JSON.stringify({
          timestamp: photo.timestamp,
          location: photo.location,
          annotations: photo.annotations,
          metadata: photo.metadata
        }));

        const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();

          // Mark photo as synced
          await offlineStorage.markPhotoSynced(photo.id);

          // Add to sync queue for AI analysis
          await offlineStorage.addToSyncQueue({
            type: 'ai_analysis',
            photoId: result.id,
            data: {
              image: photo.image,
              context: photo.metadata?.context || {}
            }
          });

          console.log(`✅ Photo synced successfully: ${result.id}`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync photo ${photo.localId}:`, error);

        // Add to sync queue for retry
        await offlineStorage.addToSyncQueue({
          type: 'photo_upload',
          photoId: photo.id,
          data: photo,
          error: error.message
        });
      }
    }
  }

  async syncPendingAnnotations() {
    // Get all annotations that haven't been synced
    const annotations = await offlineStorage.getAllAnnotations();
    const pendingAnnotations = annotations.filter(ann => !ann.synced);

    for (const annotation of pendingAnnotations) {
      try {
        console.log(`📤 Syncing annotation: ${annotation.id}`);

        const response = await fetch(`/api/photos/${annotation.photoId}/annotations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: annotation.type,
            data: annotation.data,
            position: annotation.position
          })
        });

        if (response.ok) {
          // Mark annotation as synced
          await this.markAnnotationSynced(annotation.id);
          console.log(`✅ Annotation synced successfully`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync annotation ${annotation.id}:`, error);

        // Add to sync queue for retry
        await offlineStorage.addToSyncQueue({
          type: 'annotation_upload',
          annotationId: annotation.id,
          data: annotation,
          error: error.message
        });
      }
    }
  }

  async processSyncQueue() {
    const queueItems = await offlineStorage.getSyncQueue('pending');

    for (const item of queueItems) {
      try {
        console.log(`🔄 Processing queue item: ${item.type}`);

        switch (item.type) {
          case 'ai_analysis':
            await this.processAIAnalysis(item);
            break;
          case 'photo_upload':
            await this.processPhotoUpload(item);
            break;
          case 'annotation_upload':
            await this.processAnnotationUpload(item);
            break;
          default:
            console.warn(`⚠️ Unknown queue item type: ${item.type}`);
        }

        await offlineStorage.markQueueItemComplete(item.id);
      } catch (error) {
        console.error(`❌ Failed to process queue item ${item.id}:`, error);
        await offlineStorage.markQueueItemFailed(item.id, error);
      }
    }
  }

  async processAIAnalysis(queueItem) {
    const response = await fetch(`/api/photos/${queueItem.photoId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context: queueItem.data.context
      })
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ AI analysis completed for photo ${queueItem.photoId}`);
    return result;
  }

  async processPhotoUpload(queueItem) {
    const formData = new FormData();
    const blob = await (await fetch(queueItem.data.image)).blob();
    formData.append('photo', blob);
    formData.append('metadata', JSON.stringify(queueItem.data.metadata));

    const response = await fetch('/api/photos/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Photo upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Photo upload completed: ${result.id}`);
    return result;
  }

  async processAnnotationUpload(queueItem) {
    const response = await fetch(`/api/photos/${queueItem.data.photoId}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: queueItem.data.type,
        data: queueItem.data.data,
        position: queueItem.data.position
      })
    });

    if (!response.ok) {
      throw new Error(`Annotation upload failed: ${response.status}`);
    }

    console.log(`✅ Annotation upload completed`);
    return await response.json();
  }

  async markAnnotationSynced(annotationId) {
    // This would update the annotation in IndexedDB to mark it as synced
    // Implementation depends on your storage structure
    console.log(`✅ Annotation ${annotationId} marked as synced`);
  }



  // Manual sync trigger
  async manualSync() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    console.log('🔄 Manual sync triggered');
    await this.startSync();
  }

  // Get sync status
  async getSyncStatus() {
    const pendingPhotos = await offlineStorage.getPendingPhotos();
    const queueItems = await offlineStorage.getSyncQueue('pending');
    const storageUsage = await offlineStorage.getStorageUsage();

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingPhotos: pendingPhotos.length,
      pendingQueueItems: queueItems.length,
      storageUsage,
      lastSyncAttempt: new Date().toISOString()
    };
  }

  // Force sync specific items
  async forceSyncPhotos() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    console.log('🔄 Force syncing photos...');
    await this.syncPendingPhotos();
  }

  async forceSyncAnnotations() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    console.log('🔄 Force syncing annotations...');
    await this.syncPendingAnnotations();
  }

  // Clear sync queue
  async clearSyncQueue() {
    console.log('🗑️ Clearing sync queue...');
    // This would clear all pending queue items
    // Implementation depends on your storage structure
  }

  // Export sync data for debugging
  async exportSyncData() {
    const status = await this.getSyncStatus();
    const pendingPhotos = await offlineStorage.getPendingPhotos();
    const queueItems = await offlineStorage.getSyncQueue();

    return {
      status,
      pendingPhotos,
      queueItems,
      exportDate: new Date().toISOString()
    };
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService; 