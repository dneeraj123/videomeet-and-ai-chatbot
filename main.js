const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron')
const path = require('path');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
    },
  })

  win.loadURL('http://localhost:3000')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getSources', async () => {
    let arr = await desktopCapturer.getSources({ types: ['window', 'screen'] });    
    console.log(arr);
    return arr;
})