# BeeperLite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](#)

---

A minimal **Electron app** for **chat.beeper.com** — run a second Beeper instance on your desktop.

---

## ✨ Features

* Embed client of chat.beeper.com
* Native Windows notifications
* System tray integration
* Auto-start with Windows

---

## 📦 Download & Installation

### Option 1: Download Prebuilt Release

Get the latest version from the [Releases page](https://github.com/MonsieurZed/BeeperLite/releases):

* **`BeeperLite.Setup.X.X.X.exe`** – Full installer (auto-start option)
* **`BeeperLite.Portable.X.X.X.exe`** – Portable version (no installation required)

### Option 2: Build from Source

```bash
git clone https://github.com/MonsieurZed/BeeperLite.git
cd BeeperLite
npm install
npm start
```

---

## 🔧 Build

```bash
# Build portable version
npm run build

# Build installer
npm run build-installer

# Build both
npm run build-all
```

The compiled files will appear in the `dist/` folder:

* `BeeperLite.Portable.X.X.X.exe`
* `BeeperLite.Setup.X.X.X.exe`

---

## ⚠️ Disclaimer

This project is **not affiliated with Beeper**.
It embeds the official Beeper web interface inside an Electron WebView.
Use at your own risk — if Beeper updates its web client, this app may stop working.

---

## ⚖️ License

Released under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests and issues are welcome.
Feel free to submit improvements or suggestions.

---

## 👤 Author

**MonsieurZed**
[GitHub Profile](https://github.com/MonsieurZed)
