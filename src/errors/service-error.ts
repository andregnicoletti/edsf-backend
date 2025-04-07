import { GenericError } from "./generic-error";

export class ServiceError extends GenericError {

    constructor(message: string, code: string) {
        super(message, code);
    }

}