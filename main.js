const { app, BrowserWindow, Menu, Tray, shell, Notification, ipcMain } = require('electron');
const path = require('path');

// Set user data path to avoid quota database errors
app.setPath('userData', path.join(app.getPath('appData'), 'BeeperLite'));

let mainWindow;
let tray = null;

// Auto-start functionality
function setupAutoStart() {
  if (process.platform === 'win32') {
    const autoLaunch = app.getLoginItemSettings();
    console.log('Current auto-start settings:', autoLaunch);
    
    // Set auto-start (this will be configurable via menu later)
    app.setLoginItemSettings({
      openAtLogin: true,
      name: 'BeeperLite',
      path: process.execPath
    });
    
    console.log('✅ Auto-start configured for Windows');
  }
}

// Function to show native notifications (simplified)
function showNotification(title, body, icon) {
  console.log('📱 Showing notification:', { title, body });
  
  if (Notification.isSupported()) {
    try {
      const notification = new Notification({
        title: title || 'BeeperLite',
        body: body || 'Nouveau message',
        icon: icon || path.join(__dirname, 'attached_assets', 'image.ico'),
        silent: false
      });

      notification.on('click', () => {
        console.log('Notification clicked - focusing window');
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
          mainWindow.show();
        }
      });

      notification.show();
      console.log('✅ Notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return false;
    }
  } else {
    console.log('❌ Notifications not supported');
    return false;
  }
}

// Function to create system tray
function createTray() {
  const iconPath = path.join(__dirname, 'attached_assets', 'image.ico');
  tray = new Tray(iconPath);
  
  // Detect system language
  const locale = app.getLocale();
  const isFrench = locale.startsWith('fr');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isFrench ? 'Afficher' : 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: isFrench ? 'Recharger' : 'Reload',
      click: () => {
        if (mainWindow) {
          mainWindow.reload();
        }
      }
    },
    {
      label: isFrench ? 'À propos' : 'About',
      click: () => {
        shell.openExternal('https://github.com/MonsieurZed/BeeperLite');
      }
    },
    {
      label: isFrench ? 'Quitter' : 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('BeeperLite');
  tray.setContextMenu(contextMenu);
  
  // Double-click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'attached_assets', 'image.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      enableRemoteModule: false,
      backgroundThrottling: false
    },
    title: 'BeeperLite',
    show: false
  });

  // Remove the application menu
  Menu.setApplicationMenu(null);

  mainWindow.loadURL('https://chat.beeper.com');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Force title to stay "BeeperLite"
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // Register keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Ctrl+Q to quit
    if (input.control && input.key.toLowerCase() === 'q') {
      event.preventDefault();
      app.isQuiting = true;
      app.quit();
    }
    // Ctrl+R to reload
    if (input.control && input.key.toLowerCase() === 'r') {
      event.preventDefault();
      mainWindow.reload();
    }
  });

  // Handle window close - minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Handle minimize - hide to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  // Enable notifications
  mainWindow.webContents.on('dom-ready', () => {
    // Inject notification interceptor
    mainWindow.webContents.executeJavaScript(`
      // Override Notification constructor to use native notifications
      if (window.Notification) {
        const OriginalNotification = window.Notification;
        
        window.Notification = function(title, options = {}) {
          console.log('Notification requested:', title, options);
          
          // Send to main process for native notification
          if (window.electronAPI && window.electronAPI.showNotification) {
            window.electronAPI.showNotification(title, options.body || '', options.icon || '');
          }
          
          // Create a dummy notification object that behaves like the real one
          const dummyNotification = {
            title: title,
            body: options.body || '',
            icon: options.icon || '',
            onclick: null,
            onshow: null,
            onclose: null,
            onerror: null,
            addEventListener: function(type, listener) {
              if (type === 'click') this.onclick = listener;
            },
            removeEventListener: function() {},
            close: function() {}
          };
          
          // Trigger onshow if it exists
          if (options.onshow) {
            setTimeout(options.onshow, 0);
          }
          
          return dummyNotification;
        };
        
        // Copy static properties
        window.Notification.permission = 'granted';
        window.Notification.requestPermission = function() {
          return Promise.resolve('granted');
        };
      }
      
      // Request notification permission if not already granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    `);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('https://chat.beeper.com') && 
        !url.startsWith('https://beeper.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://chat.beeper.com') && 
        !url.startsWith('https://beeper.com')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'notifications') {
      callback(true);
    } else if (permission === 'media' || permission === 'microphone' || permission === 'camera') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Handle notification events
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  // Focus window when notification is clicked (if minimized)
  mainWindow.on('show', () => {
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Configuration pour Windows
  if (process.platform === 'win32') {
    console.log('🪟 Setting up Windows notifications...');
    app.setAppUserModelId('com.beeper.lite');
    
    // Setup auto-start functionality
    setupAutoStart();
  }

  // Handle IPC for notifications
  ipcMain.handle('show-notification', (event, title, body, icon) => {
    return showNotification(title, body, icon);
  });

  // Create system tray
  createTray();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit the app on window close, keep running in tray
  // Only quit when explicitly requested from tray menu
});
