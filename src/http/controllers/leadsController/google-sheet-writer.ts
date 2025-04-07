import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleSheetService } from "../../../services/google-sheet";
import { ErrorSchema } from "../../../schemas/error-schema";
import { GenericError } from "../../../errors/generic-error";
import { InvalidInputRequest } from "../../../errors/validation-object-error";
import { CodeErrorConstant } from "../../../errors/code-errors";
import { z } from "zod";
import { CreateLeadType } from "../../../@types/create-lead-type";
import { t } from "i18next";

export const writerRows = async (request: FastifyRequest<{ Body: CreateLeadType }>, response: FastifyReply) => {

    try {

        // const { name, company, phone, email, referralSource, message } = request.body as ChannelLeadsSchema;
        const { name, company, phone, email, referralSource, message } = request.body.data;

        if (!phone && !email) {
            throw new InvalidInputRequest(t("messages.you_must_send_phone_or_email"),
                CodeErrorConstant.ERROR_VALIDADE_INPUT_DATA);
        }

        // Validação usando safeParse para evitar exceções
        if (phone) {
            //1️ Validar formatos aceitos (com ou sem máscara) e garantir que não haja letras
            const phoneFormatValidation = z
                .string()
                .regex(/^(\(\d{2}\)\d{4,5}-\d{4}|\d{10,11})$/, { message: t("messages.you_must_send_valid_phone_value") })
                .safeParse(phone);

            if (!phoneFormatValidation.success) {
                throw new InvalidInputRequest(
                    phoneFormatValidation.error.issues[0].message,
                    CodeErrorConstant.ERROR_VALIDADE_INPUT_DATA
                );
            }

            // Remover máscara para armazenar apenas números
            const phoneSanitized = phone.replace(/[^\d]/g, "");

            //3️ Garantir que apenas números passaram (evita letras ocultas) e validar o tamanho
            const phoneDigitsValidation = z
                .string()
                .regex(/^\d{10,11}$/, { message: t("messages.you_must_send_valid_phone_value") })
                .safeParse(phoneSanitized);

            if (!phoneDigitsValidation.success) {
                throw new InvalidInputRequest(
                    phoneDigitsValidation.error.issues[0].message,
                    CodeErrorConstant.ERROR_VALIDADE_INPUT_DATA
                );
            }

        }

        if (email) {
            const emailValidation = z
                .string()
                .email({ message: t("messages.you_must_send_valid_email_value") })
                .max(100)
                .safeParse(email);

            if (!emailValidation.success) {
                throw new InvalidInputRequest(
                    emailValidation.error.issues[0].message,
                    CodeErrorConstant.ERROR_VALIDADE_INPUT_DATA
                );
            }
        }

        z.string().max(100).parse(name);
        z.string().max(100).parse(company);
        z.string().max(500).optional().parse(message);
        z.string().parse(referralSource);

        const googleSheetService = new GoogleSheetService();
        const auth = await googleSheetService.getAuth();
        const data = await googleSheetService.writeSheet(auth, { name, company, phone, email, referralSource, message })

        response.send({ status: true, data: data });

    } catch (error) {
        if (error instanceof GenericError) {
            response.status(400).send(new ErrorSchema(error));
        }

        throw error;
    }

}