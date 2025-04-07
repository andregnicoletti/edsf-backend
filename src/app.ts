import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ZodError } from "zod";
import { env } from "./env";
import { healthController } from "./http/controllers/healthController/routes";
import { leadsController } from "./http/controllers/leadsController/routes";
import cors from "@fastify/cors";
import { CodeErrorConstant } from "./errors/code-errors";
import { producerController } from "./http/controllers/producerController/routes";
import { cityController } from "./http/controllers/cityController/routes";
import { courseController } from "./http/controllers/courseController/routes";
import fastifyMultipart from "@fastify/multipart";
import { dataLoadController } from "./http/controllers/dataLoadController/routes";
import { dashboardController } from "./http/controllers/dashboardController/routes";
import fastifyJwt from "@fastify/jwt";
import loggerPlugin from "./config/logger-plugin";
import { setLanguage } from "./config/i18n";
import { authorizationController } from "./http/controllers/authorizationController/routes";
import fastifyMailer from "fastify-mailer";
import { markdownController } from "./http/controllers/textController/routes";
import { indicatorController } from "./http/controllers/indicatorController/routes";
import { panelController } from "./http/controllers/panelController/routes";
import fastifyCookie from '@fastify/cookie';
import { UserController } from "./http/controllers/userController/routes";

// Defina o idioma em algum lugar inicial do seu código
setLanguage('pt'); // Define o idioma para português


export const app = fastify({
    logger: true,
    keepAliveTimeout: env.KEEP_ALIVE_TIMEOUT,
    pluginTimeout: env.KEEP_ALIVE_TIMEOUT,
});

app.register(fastifyCookie)
app.register(loggerPlugin);

app.register(fastifyMultipart, {
    limits: {
        fileSize: env.FILE_SIZE * 1000, //garante que erro será tratado na requisição
    }
});

app.register(fastifyJwt, {
    secret: env.JWT_SECRET
});

//Configuração swagger
app.register(fastifySwagger, {
    swagger: {
        schemes: ['http'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
        info: {
            title: 'EDSF',
            description: 'Especificação da API para back-end da aplicação',
            version: '1.0.0'
        },
        securityDefinitions: {
            BearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
            },
        },
        security: [{ BearerAuth: [] }],
    },
});


app.register(fastifyMailer, {
    transport: {
        service: 'gmail', // Exemplo com Gmail
        auth: {
            user: 'test@cpqd.com.br',
            pass: '1234',
        },
    },
});

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})


// Registra o plugin de CORS
app.register(cors, {
    origin: '*',  // Permite qualquer origem. Você pode personalizar com um domínio específico.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos HTTP permitidos.
    allowedHeaders: ['Content-Type', 'Authorization'],  // Cabeçalhos permitidos.
    exposedHeaders: ['Content-Disposition']
});


const optional = { prefix: 'api/' }
app.register(authorizationController, optional);
app.register(UserController, optional);
app.register(healthController, optional);
app.register(panelController, optional);
app.register(dashboardController, optional);
app.register(leadsController, optional);
app.register(producerController, optional);
app.register(cityController, optional);
app.register(courseController, optional);
app.register(dataLoadController, optional);
app.register(markdownController, optional);
app.register(indicatorController, optional);

app.setErrorHandler((error, _request, response) => {
    if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => err.message);
        console.log(errorMessages)

        return response.status(400).send({
            status: false,
            message: errorMessages[0],
            code: CodeErrorConstant.ERROR_VALIDATE_FIELD,
        })
    }

    if (env.NODE_ENV !== "production") {
        console.log(error);
    } else {
        //TODO: Hwere we should log to an external tool like Datadog/NewRelic/Sentry
    }

    return response.status(500).send({
        status: false,
        message: 'Internal server error',
    })
})