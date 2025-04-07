import { GenericError } from "../errors/generic-error";

export class ErrorSchema {

    private status: boolean;
    private message: string;
    private code: string;

    constructor(error: GenericError) {
        this.status = false;
        this.message = error.message;
        this.code = error.code;
    }

    setStatus = (status: boolean) => {
        this.status = status;
    }

    setMessage = (message: string) => {
        this.message = message;
    }

    setCode = (code: string) => {
        this.code = code;
    }

}