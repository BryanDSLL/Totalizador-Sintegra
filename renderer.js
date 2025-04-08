const { ipcRenderer } = require('electron');

// Seleciona o arquivo
document.getElementById('selectFile').addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('open-file-dialog');
    
    if (filePath) {
        document.getElementById('filePath').textContent = `Arquivo selecionado: ${filePath}`;
        document.getElementById('processFile').dataset.filePath = filePath;
    }
});

// Processa o arquivo selecionado
document.getElementById('processFile').addEventListener('click', async () => {
    const filePath = document.getElementById('processFile').dataset.filePath;
    
    if (!filePath) {
        alert('Selecione um arquivo primeiro!');
        return;
    }

    const result = await ipcRenderer.invoke('process-file', filePath);
    
    if (result.error) {
        alert(`Erro: ${result.error}`);
    } else {
        // Exibe os resultados
        document.getElementById('result').style.display = 'block';  // Torna visível a seção de resultados
        document.getElementById('result').innerHTML = `
            <h2>Total Valor: ${result.totalValor}</h2>
            <h2>Total Estoque: ${result.totalEstoque}</h2>
            <h2>Total de Produtos: ${result.totalProdutos}</h2>
        `;
    }
});
