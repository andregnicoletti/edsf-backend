import { app } from "./app";
import { env } from "./env";
import logger from "./config/logger";
import os from "os";

// Função para obter o endereço IP real
function getLocalIP(): string {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        if (!iface) continue;
        for (const details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address; // Retorna o IP da interface não interna
            }
        }
    }
    return '127.0.0.1'; // Fallback para localhost se nenhum IP externo for encontrado
}

const HOST = getLocalIP(); //IP real
const PORT = env.NODE_PORT;

app.listen({
    host: HOST,
    port: PORT,
}).then(() => {
    const baseURL = `http://${HOST}:${PORT}`;
    logger.info(`✅ HTTP Server is running on ${baseURL} in ${env.NODE_ENV} mode`);
    logger.info(`📄 Swagger documentation available at ${baseURL}/docs`);
}).catch((error) => {
    logger.error("❌ Failed to start the HTTP Server:", error);
    process.exit(1); // Encerrar o processo com erro
});