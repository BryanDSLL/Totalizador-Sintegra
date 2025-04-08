const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 575,
        autoHideMenuBar: true, 
        icon: path.join(__dirname, 'IMG', 'logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

// Garante que a janela abre corretamente ao iniciar o app
app.whenReady().then(createWindow);

// Para macOS: reabre a janela quando o ícone do app é clicado
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Fecha totalmente o app quando todas as janelas são fechadas (exceto no macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Escuta evento para abrir seletor de arquivo
ipcMain.handle('open-file-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    return filePaths[0] || null;
});

// Processa o arquivo e totaliza o registro 74
ipcMain.handle('process-file', async (_, filePath) => {
    if (!filePath) return { error: 'Nenhum arquivo selecionado' };

    let totalValor = 0;
    let totalEstoque = 0;
    let totalProdutos = 0;

    try {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            if (line.startsWith('74')) {
                totalProdutos++; // Conta quantos produtos (linhas 74)

                // Extrai o valor corretamente (posição 37 a 50)
                const valorStr = line.substring(37, 50).trim(); 
                const valor = parseInt(valorStr, 10) / 100;
                totalValor += isNaN(valor) ? 0 : valor;

                // Extrai a quantidade de estoque corretamente (posição 25 a 36)
                const qtdEstoqueStr = line.substring(25, 36).trim();

                // Remove o ponto (separador de milhar) e converte para número
                const qtdEstoqueLimpa = qtdEstoqueStr.replace(/\./g, ''); // Remove pontos
                const qtdEstoque = parseInt(qtdEstoqueLimpa, 10) / 100; // Divide por 100 para ter duas casas decimais

                if (!isNaN(qtdEstoque) && qtdEstoque < 10000000) {
                    totalEstoque += qtdEstoque;
                } else {
                    console.error(`Quantidade de estoque inválida: ${qtdEstoqueStr}`);
                }
            }
        }

        return {
            totalValor: `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            totalEstoque: totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            totalProdutos: totalProdutos
        };
    } catch (error) {
        return { error: error.message };
    }
});
