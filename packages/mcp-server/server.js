// Arquivo de entrada para o Node.js que importa diretamente do caminho específico do SDK ESM
// Este arquivo contorna o problema ERR_PACKAGE_PATH_NOT_EXPORTED carregando
// o arquivo diretamente do dist/esm/server
import './dist/index.js';
