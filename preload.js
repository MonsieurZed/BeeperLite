const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body, icon) => {
    return ipcRenderer.invoke('show-notification', title, body, icon);
  }
});

contextBridge.exposeInMainWorld('beeperWebView', {
  version: '1.0.0',
  platform: process.platform
});

// Simple notification override for Beeper
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 BeeperLite loaded with notification support');
  
  // Override Notification to use native notifications
  if (window.Notification) {
    const OriginalNotification = window.Notification;
    
    window.Notification = function(title, options = {}) {
      console.log('🔔 Notification requested:', title, options.body);
      
      // Send to main process for native notification
      if (window.electronAPI && window.electronAPI.showNotification) {
        window.electronAPI.showNotification(title, options.body || '', options.icon || '');
      }
      
      // Return a simple object that mimics Notification behavior
      return {
        title: title,
        body: options.body || '',
        onclick: null,
        close: function() {}
      };
    };
    
    // Set permission as granted
    window.Notification.permission = 'granted';
    window.Notification.requestPermission = function() {
      return Promise.resolve('granted');
    };
  }
});
