import { t } from "i18next";
import logger from "../config/logger";

export const parseTextToDate = (textDate: string) => {

    if (textDate) {
        logger.info(`textDate: ${textDate}`)

        // Divide a string nos componentes de dia, mês e ano
        const [dia, mes, ano] = textDate.split('/');//.map(Number);
        logger.info(`dia: ${dia}, mes: ${mes}, ano: ${ano}`)

        if (ano.length < 4) {
            throw new Error(t("messages.year_must_contain_four_characters"))
        }

        // Cria um objeto Date com os valores de ano, mês (baseado em zero) e dia
        const value = new Date(Number(ano), Number(mes) - 1, Number(dia));
        logger.info(`date: ${value}`)

        return value;
    }

}

export const convertMinutesToHHMM = (minutes: number): string => {
    const hours = Math.floor(minutes / 60); // Divide os minutos por 60 para obter as horas
    const remainingMinutes = Math.round(minutes % 60); // O restante dos minutos, arredondado
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}