import "@fastify/jwt"

declare module "@fastify/jwt" {

    export interface FastifyJWT {
        payload: { 
            company: string,
            role: string,
            department: string, 
            companyDescription: string,
        } // payload type is used for signing and verifying
        user: {
            sub: string //ID do Usuario
            company: string;
            role: string;
            department: string;
            companyDescription: string;
        } // user type is return type of `request.user` object
    }

}
