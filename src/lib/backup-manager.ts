import { GlobalTemplateSettingsData } from './validation';

interface BackupData {
  id: string;
  timestamp: string;
  data: GlobalTemplateSettingsData;
  description?: string;
  version: string;
}

interface BackupManagerConfig {
  maxBackups: number;
  autoBackupInterval: number; // in minutes
  storageKey: string;
}

class BackupManager {
  private config: BackupManagerConfig;
  private autoBackupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<BackupManagerConfig> = {}) {
    this.config = {
      maxBackups: 10,
      autoBackupInterval: 30, // 30 minutes
      storageKey: 'global_template_backups',
      ...config,
    };
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBackups(): BackupData[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load backups from localStorage:', error);
      return [];
    }
  }

  private saveBackups(backups: BackupData[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(backups));
    } catch (error) {
      console.error('Failed to save backups to localStorage:', error);
    }
  }

  private cleanupOldBackups(backups: BackupData[]): BackupData[] {
    // Sort by timestamp (newest first) and keep only maxBackups
    const sortedBackups = backups.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedBackups.slice(0, this.config.maxBackups);
  }

  // Create a new backup
  createBackup(data: GlobalTemplateSettingsData, description?: string): BackupData {
    const backup: BackupData = {
      id: this.generateBackupId(),
      timestamp: new Date().toISOString(),
      data: { ...data },
      description,
      version: '1.0.0',
    };

    const backups = this.getBackups();
    backups.unshift(backup); // Add to beginning
    const cleanedBackups = this.cleanupOldBackups(backups);
    this.saveBackups(cleanedBackups);

    return backup;
  }

  // Get all backups
  getBackupsList(): BackupData[] {
    return this.getBackups();
  }

  // Get a specific backup by ID
  getBackup(id: string): BackupData | null {
    const backups = this.getBackups();
    return backups.find(backup => backup.id === id) || null;
  }

  // Restore a backup
  restoreBackup(id: string): GlobalTemplateSettingsData | null {
    const backup = this.getBackup(id);
    if (!backup) {
      throw new Error(`Backup with ID ${id} not found`);
    }

    // Create a new backup before restoring (safety measure)
    this.createBackup(backup.data, `Pre-restore backup before restoring ${id}`);

    return { ...backup.data };
  }

  // Delete a backup
  deleteBackup(id: string): boolean {
    const backups = this.getBackups();
    const filteredBackups = backups.filter(backup => backup.id !== id);
    
    if (filteredBackups.length === backups.length) {
      return false; // Backup not found
    }

    this.saveBackups(filteredBackups);
    return true;
  }

  // Export backups (for backup purposes)
  exportBackups(): string {
    const backups = this.getBackups();
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      backups,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import backups
  importBackups(backupJson: string): { success: boolean; message: string; count: number } {
    try {
      const importData = JSON.parse(backupJson);
      
      if (!importData.backups || !Array.isArray(importData.backups)) {
        throw new Error('Invalid backup format');
      }

      // Validate backup structure
      const validBackups = importData.backups.filter((backup: any) => {
        return backup.id && backup.timestamp && backup.data && backup.version;
      });

      if (validBackups.length === 0) {
        throw new Error('No valid backups found in import data');
      }

      // Merge with existing backups
      const existingBackups = this.getBackups();
      const mergedBackups = [...existingBackups, ...validBackups];
      const cleanedBackups = this.cleanupOldBackups(mergedBackups);
      
      this.saveBackups(cleanedBackups);

      return {
        success: true,
        message: `Successfully imported ${validBackups.length} backups`,
        count: validBackups.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        count: 0,
      };
    }
  }

  // Clear all backups
  clearAllBackups(): void {
    this.saveBackups([]);
  }

  // Auto-backup functionality
  startAutoBackup(dataGetter: () => GlobalTemplateSettingsData): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }

    this.autoBackupTimer = setInterval(() => {
      try {
        const data = dataGetter();
        this.createBackup(data, 'Auto-backup');
      } catch (error) {
        console.error('Auto-backup failed:', error);
      }
    }, this.config.autoBackupInterval * 60 * 1000); // Convert minutes to milliseconds
  }

  stopAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  // Get backup statistics
  getBackupStats(): {
    totalBackups: number;
    oldestBackup: string | null;
    newestBackup: string | null;
    totalSize: number;
  } {
    const backups = this.getBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        oldestBackup: null,
        newestBackup: null,
        totalSize: 0,
      };
    }

    const sortedBackups = backups.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const totalSize = JSON.stringify(backups).length;

    return {
      totalBackups: backups.length,
      oldestBackup: sortedBackups[0].timestamp,
      newestBackup: sortedBackups[sortedBackups.length - 1].timestamp,
      totalSize,
    };
  }

  // Check if data has changed since last backup
  hasDataChanged(currentData: GlobalTemplateSettingsData): boolean {
    const backups = this.getBackups();
    if (backups.length === 0) return true;

    const lastBackup = backups[0]; // Most recent backup
    return JSON.stringify(currentData) !== JSON.stringify(lastBackup.data);
  }

  // Create backup if data has changed
  createBackupIfChanged(currentData: GlobalTemplateSettingsData, description?: string): BackupData | null {
    if (this.hasDataChanged(currentData)) {
      return this.createBackup(currentData, description);
    }
    return null;
  }
}

// Create singleton instance
export const backupManager = new BackupManager();

// React hook for backup management
export function useBackupManager() {
  return {
    createBackup: (data: GlobalTemplateSettingsData, description?: string) => 
      backupManager.createBackup(data, description),
    getBackups: () => backupManager.getBackupsList(),
    restoreBackup: (id: string) => backupManager.restoreBackup(id),
    deleteBackup: (id: string) => backupManager.deleteBackup(id),
    exportBackups: () => backupManager.exportBackups(),
    importBackups: (backupJson: string) => backupManager.importBackups(backupJson),
    clearAllBackups: () => backupManager.clearAllBackups(),
    getBackupStats: () => backupManager.getBackupStats(),
    hasDataChanged: (data: GlobalTemplateSettingsData) => backupManager.hasDataChanged(data),
    createBackupIfChanged: (data: GlobalTemplateSettingsData, description?: string) => 
      backupManager.createBackupIfChanged(data, description),
  };
}




