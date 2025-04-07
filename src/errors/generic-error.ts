export class GenericError extends Error {

    public code: string;

    constructor(message: string, code: string) {

        super(message);
        this.code = code;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GenericError);
        }
    }

}