class OfflineStorage {
  constructor() {
    this.dbName = 'PhotoCaptureDB';
    this.version = 1;
    this.db = null;
    this.initDatabase();
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create photos store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
          photoStore.createIndex('status', 'status', { unique: false });
          photoStore.createIndex('synced', 'synced', { unique: false });
        }

        // Create annotations store
        if (!db.objectStoreNames.contains('annotations')) {
          const annotationStore = db.createObjectStore('annotations', { keyPath: 'id', autoIncrement: true });
          annotationStore.createIndex('photoId', 'photoId', { unique: false });
          annotationStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        console.log('✅ IndexedDB schema created');
      };
    });
  }

  // Photo storage methods
  async savePhoto(photoData) {
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    const photo = {
      ...photoData,
      timestamp: new Date().toISOString(),
      status: 'pending',
      synced: false,
      localId: Date.now().toString()
    };

    return new Promise((resolve, reject) => {
      const request = store.add(photo);
      request.onsuccess = () => {
        console.log('✅ Photo saved to offline storage');
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('❌ Failed to save photo:', request.error);
        reject(request.error);
      };
    });
  }

  async getPhotos(status = null) {
    const transaction = this.db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');

    return new Promise((resolve, reject) => {
      const request = status 
        ? store.index('status').getAll(status)
        : store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('❌ Failed to get photos:', request.error);
        reject(request.error);
      };
    });
  }

  async getPendingPhotos() {
    return this.getPhotos('pending');
  }

  async markPhotoSynced(photoId) {
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(photoId);
      getRequest.onsuccess = () => {
        const photo = getRequest.result;
        if (photo) {
          photo.synced = true;
          photo.status = 'synced';
          photo.syncTimestamp = new Date().toISOString();

          const updateRequest = store.put(photo);
          updateRequest.onsuccess = () => {
            console.log('✅ Photo marked as synced');
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('❌ Failed to update photo:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Photo not found'));
        }
      };
      getRequest.onerror = () => {
        console.error('❌ Failed to get photo:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Annotation storage methods
  async saveAnnotation(annotationData) {
    const transaction = this.db.transaction(['annotations'], 'readwrite');
    const store = transaction.objectStore('annotations');

    const annotation = {
      ...annotationData,
      timestamp: new Date().toISOString(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(annotation);
      request.onsuccess = () => {
        console.log('✅ Annotation saved to offline storage');
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('❌ Failed to save annotation:', request.error);
        reject(request.error);
      };
    });
  }

  async getAnnotations(photoId) {
    const transaction = this.db.transaction(['annotations'], 'readonly');
    const store = transaction.objectStore('annotations');

    return new Promise((resolve, reject) => {
      const request = store.index('photoId').getAll(photoId);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('❌ Failed to get annotations:', request.error);
        reject(request.error);
      };
    });
  }

  // Sync queue methods
  async addToSyncQueue(item) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    const queueItem = {
      ...item,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => {
        console.log('✅ Item added to sync queue');
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('❌ Failed to add to sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async getSyncQueue(status = 'pending') {
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
      const request = store.index('status').getAll(status);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('❌ Failed to get sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async markQueueItemComplete(queueId) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(queueId);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'completed';
          item.completedAt = new Date().toISOString();

          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => {
            console.log('✅ Queue item marked as completed');
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('❌ Failed to update queue item:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Queue item not found'));
        }
      };
      getRequest.onerror = () => {
        console.error('❌ Failed to get queue item:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async markQueueItemFailed(queueId, error) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(queueId);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = error.message;
          item.failedAt = new Date().toISOString();

          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => {
            console.log('✅ Queue item marked as failed');
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('❌ Failed to update queue item:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Queue item not found'));
        }
      };
      getRequest.onerror = () => {
        console.error('❌ Failed to get queue item:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Storage management
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  }

  async clearOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const transaction = this.db.transaction(['photos', 'annotations', 'syncQueue'], 'readwrite');
    
    // Clear old photos
    const photoStore = transaction.objectStore('photos');
    const photoRequest = photoStore.index('timestamp').openCursor(IDBKeyRange.upperBound(cutoffDate.toISOString()));
    
    photoRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.synced) {
          photoStore.delete(cursor.primaryKey);
        }
        cursor.continue();
      }
    };

    // Clear old annotations
    const annotationStore = transaction.objectStore('annotations');
    const annotationRequest = annotationStore.index('timestamp').openCursor(IDBKeyRange.upperBound(cutoffDate.toISOString()));
    
    annotationRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.synced) {
          annotationStore.delete(cursor.primaryKey);
        }
        cursor.continue();
      }
    };

    // Clear completed sync queue items
    const syncStore = transaction.objectStore('syncQueue');
    const syncRequest = syncStore.index('status').openCursor('completed');
    
    syncRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        syncStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        console.log('✅ Old data cleared');
        resolve();
      };
    });
  }

  // Export/Import functionality
  async exportData() {
    const photos = await this.getPhotos();
    const annotations = await this.getAllAnnotations();
    const syncQueue = await this.getSyncQueue();

    return {
      photos,
      annotations,
      syncQueue,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  async getAllAnnotations() {
    const transaction = this.db.transaction(['annotations'], 'readonly');
    const store = transaction.objectStore('annotations');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('❌ Failed to get all annotations:', request.error);
        reject(request.error);
      };
    });
  }

  async importData(data) {
    if (data.version !== '1.0') {
      throw new Error('Unsupported data version');
    }

    const transaction = this.db.transaction(['photos', 'annotations', 'syncQueue'], 'readwrite');
    
    // Import photos
    const photoStore = transaction.objectStore('photos');
    for (const photo of data.photos || []) {
      photoStore.add(photo);
    }

    // Import annotations
    const annotationStore = transaction.objectStore('annotations');
    for (const annotation of data.annotations || []) {
      annotationStore.add(annotation);
    }

    // Import sync queue
    const syncStore = transaction.objectStore('syncQueue');
    for (const item of data.syncQueue || []) {
      syncStore.add(item);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ Data imported successfully');
        resolve();
      };
      transaction.onerror = () => {
        console.error('❌ Failed to import data:', transaction.error);
        reject(transaction.error);
      };
    });
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage; 