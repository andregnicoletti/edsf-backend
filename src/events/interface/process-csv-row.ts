import { RecordRow } from "../../services/data-load-service";
import { EventResponse } from "../event";

export interface ProcessCsvRow {

  getCode(): string

  execute (row: RecordRow): Promise<EventResponse>;

}