import { t } from "i18next";
import { RecordRow } from "../services/data-load-service";
import { EventResponse } from "./event";
import { ProcessCsvRow } from "./interface/process-csv-row";

export class EventError implements ProcessCsvRow {

    constructor() { }

    getCode(): string {
        return 'EVENT_NOT_FOUND'
    }

    execute = async (row: RecordRow): Promise<EventResponse> => {

        let schema: { [key: string]: string | boolean } = {};

        Object.entries(row).forEach(([k, v]) => {
            schema[k] = v;
        })

        // Definir uma mensagem padrão se o campo estiver vazio
        const eventName = row['TIPO_CADASTRO']?.trim();
        const formattedEventName = eventName && eventName !== ""
            ? eventName
            : t('messages.empty_event_name'); // Mensagem traduzida para evento vazio

        schema = {
            ...schema,
            status: false,
            error: t('messages.event_is_not_supported', { eventName: formattedEventName })
        };

        const out: EventResponse = {
            code: this.getCode(),
            status: false,
            schema,
        }

        return Promise.resolve(out);

    }

}