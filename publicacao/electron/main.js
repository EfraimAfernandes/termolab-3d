const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");

// Local do app: dentro do pacote (empacotado) ou ../app (desenvolvimento)
const appDir = fs.existsSync(path.join(__dirname, "app", "index.html"))
    ? path.join(__dirname, "app")
    : path.join(__dirname, "..", "app");

function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 960,
        minHeight: 640,
        backgroundColor: "#0b0e14",
        icon: path.join(__dirname, "build", "icon.png"),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            spellcheck: false,
        },
    });

    // Aplica carrega arquivos locais (funciona 100% offline)
    win.loadFile(path.join(appDir, "index.html"));

    // Links externos abrem no navegador padrão do sistema
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
