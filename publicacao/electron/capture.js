/* Captura screenshots de todos os módulos em resolução desktop (1440x900).
   Uso: npx electron capture.js */
const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const OUT_DIR = path.join(__dirname, "..", "..", "screenshots");
const appDir = path.join(__dirname, "..", "app");
const W = 1440;
const H = 900;

const MODULES = [
    { law: 0, name: "01-lei-zero" },
    { law: 1, name: "02-primeira-lei" },
    { law: 2, name: "03-segunda-lei" },
    { law: 3, name: "04-terceira-lei" },
    { law: 4, name: "05-conceitos-ciclos" },
    { law: 5, name: "06-mitos-conceitos" },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (msg) => console.log("[capture]", msg);

// Timeout de segurança: nunca deixar o processo preso
setTimeout(() => { console.error("TIMEOUT GLOBAL"); app.exit(1); }, 90000);

process.on("unhandledRejection", (e) => {
    console.error("unhandledRejection:", e);
    app.exit(1);
});

app.whenReady().then(async () => {
    try {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        const win = new BrowserWindow({
            width: W,
            height: H,
            show: true,
            backgroundColor: "#0b0e14",
            webPreferences: { contextIsolation: true, nodeIntegration: false },
        });
        win.webContents.on("console-message", (e, level, message) => {
            if (level >= 3) console.error("[renderer]", message);
        });
        win.webContents.on("did-finish-load", () => log("pagina carregada"));
        win.webContents.on("did-fail-load", (e, code, desc) => {
            console.error("did-fail-load", code, desc);
        });

        log("carregando index.html...");
        await win.loadFile(path.join(appDir, "index.html"));
        log("aguardando WebGL inicializar...");
        await wait(3000);

        log("fechando modal de tutorial...");
        await win.webContents.executeJavaScript(
            `document.getElementById('tutorial-modal').classList.add('hidden');`
        );
        await wait(500);

        const saveCapture = async (name) => {
            for (let attempt = 1; attempt <= 3; attempt++) {
                const buf = (await win.webContents.capturePage()).toPNG();
                if (buf && buf.length > 5000) {
                    fs.writeFileSync(path.join(OUT_DIR, name + ".png"), buf);
                    log("salvo " + name + " (" + buf.length + " bytes, tentativa " + attempt + ")");
                    return;
                }
                log("captura vazia em " + name + ", tentativa " + attempt + "...");
                await wait(1200);
            }
            throw new Error("falhou ao capturar " + name);
        };

        for (const mod of MODULES) {
            log("navegando para law " + mod.law);
            await win.webContents.executeJavaScript(
                `document.querySelector('[data-law="${mod.law}"]').click();`
            );
            await wait(1800);
            log("capturando " + mod.name);
            await saveCapture(mod.name);
        }

        log("captura extra: modo claro");
        await win.webContents.executeJavaScript(
            `document.querySelector('[data-law="0"]').click();`
        );
        await wait(1200);
        await win.webContents.executeJavaScript(
            `document.getElementById('theme-toggle').click();`
        );
        await wait(900);
        await saveCapture("07-modo-claro");

        log("concluido");
        app.quit();
    } catch (err) {
        console.error("ERRO:", err);
        app.exit(1);
    }
});
