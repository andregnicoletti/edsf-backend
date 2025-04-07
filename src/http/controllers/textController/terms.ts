import { FastifyReply, FastifyRequest } from "fastify";
import { t } from "i18next";
import path from "path";
import PropertiesReader from "properties-reader";

const file = 'terms.properties'

export const textTerms = async (_request: FastifyRequest, response: FastifyReply) => {

    try {
        // Carrega o arquivo `.properties` da pasta `conf`
        const properties = PropertiesReader(path.join('./conf/' + file));

        // Converte o conteúdo do arquivo para um objeto JSON
        const propertiesJson: { [key: string]: string } = {};
        properties.each((key, value) => {
            propertiesJson[key] = (value as string).replace(/^"(.*)"$/, '$1');
        });

        return response.code(200).send({ status: true, propertiesJson })

    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: t('error.file_not_found', { file }) });
    }
}