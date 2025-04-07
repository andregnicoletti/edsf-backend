import { GenericError } from "./generic-error";

export class InvalidInputRequest extends GenericError {

    constructor(message: string, code: string) {
        super(message, code);
    }

}