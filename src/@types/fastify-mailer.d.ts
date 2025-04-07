// src/@types/fastify-mailer.d.ts
declare module 'fastify-mailer' {
    import { FastifyPluginCallback } from 'fastify';
    import { Transporter } from 'nodemailer';
  
    interface FastifyMailerOptions {
      transport: Transporter | TransporterOptions;
    }
  
    const fastifyMailer: FastifyPluginCallback<FastifyMailerOptions>;
    export default fastifyMailer;
  }
  
  