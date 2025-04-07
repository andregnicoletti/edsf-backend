import { randomBytes } from "crypto";
import logger from "../config/logger";

export const uuid = () => {
    // Gerar 3 bytes aleatórios e convertê-los para uma string base64
    const uuid = randomBytes(6).toString('base64').replace(/[/+=]/g, '').toUpperCase();
    logger.info(`uuid gerado: ${uuid}`);
    return uuid;
}