const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'electron-main',
  entry: './main.js',  // Alterar para o arquivo de entrada do seu aplicativo
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: [nodeExternals()],  // Exclui pacotes do node_modules do bundle
  mode: 'production'
};
