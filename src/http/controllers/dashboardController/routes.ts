import { FastifyInstance } from "fastify";
import { detailed } from "./dash-detailed-extract";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { DashboardDetailedExtract } from "../../../@types/dashboard-detailed-extract";
import { stackedColumnChart } from "./dash-stacked-column-chart";
import { DashboardStackedColumnChart } from "../../../@types/dashboard-stacked-column-chart";
import { lineChart } from "./dash-line-chart";
import { summary } from "./dash-summary";
import { DashboardSummary } from "../../../@types/dashboard-summary";
import { verifyRole } from "../../middlewares/verify-role";

const tags: [string] = ['Dashboard'];

export const dashboardController = async (app: FastifyInstance) => {

    const dateFiltersSchema = {
        yearFrom: {
            type: 'string',
            description: 'Ano no formato YYYY',
            pattern: '^[0-9]{4}$',
        },
        monthFrom: {
            type: 'string',
            description: 'Mês no formato MM',
            pattern: '^(0[1-9]|1[0-2])$',
        },
        yearTo: {
            type: 'string',
            description: 'Ano no formato YYYY',
            pattern: '^[0-9]{4}$',
        },
        monthTo: {
            type: 'string',
            description: 'Mês no formato MM',
            pattern: '^(0[1-9]|1[0-2])$',
        },
    };

    app.post<{ Body: DashboardDetailedExtract }>('/dashboard/detailed', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Lista todos os cursos com trabalhadores de todos os municipios',
            body: {
                type: 'object',
                properties: {
                    cities: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de cidades'
                    },
                    states: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de estados'
                    },
                    courses: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de cursos'
                    },
                    ...dateFiltersSchema,
                },
            }
        }
    }, detailed);

    app.post<{ Body: DashboardSummary }>('/dashboard/summary', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Extrato Resumido',
            body: {
                type: 'object',
                properties: {
                    cities: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de cidades'
                    },
                    states: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de estados'
                    },
                    courses: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de cursos'
                    },
                    indicators: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de indicadores'
                    },
                    producers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Lista de produtores'
                    },
                    ...dateFiltersSchema,
                },
            }
        }
    }, summary);

    app.post<{ Body: DashboardStackedColumnChart }>('/dashboard/stacked-column-chart', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Gráfico de colunas sobrepostas',
            body: {
                type: 'object',
                properties: {
                    filters: {
                        type: 'object',
                        description: 'Filtros grafico colunas empilhada',
                        properties: {
                            sort: {
                                type: 'string',
                                description: 'Ordenação desc ou asc',
                            },
                            total: {
                                type: 'number',
                                description: 'Total de registros',
                            },
                            courses: {
                                type: 'array',
                                description: 'Filtro por código de cursos',
                            },
                            states: {
                                type: 'array',
                                description: 'Filtro por uf',
                            },
                            cities: {
                                type: 'array',
                                description: 'Filtro por nome de municipio',
                            },
                            indicators: {
                                type: 'array',
                                description: 'Filtro por código de indicadores',
                            },
                            ...dateFiltersSchema,
                        },
                    },
                },
            }
        }
    }, stackedColumnChart);

    app.post<{ Body: DashboardStackedColumnChart }>('/dashboard/line-chart', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            summary: 'Gráfico de linhas',
            body: {
                type: 'object',
                properties: {
                    filters: {
                        type: 'object',
                        description: 'Filtros grafico colunas empilhada',
                        properties: {
                            sort: {
                                type: 'string',
                                description: 'Ordenação desc ou asc',
                            },
                            total: {
                                type: 'number',
                                description: 'Total de registros',
                            },
                            courses: {
                                type: 'array',
                                description: 'Ordenação desc ou asc',
                            },
                            states: {
                                type: 'array',
                                description: 'Ordenação desc ou asc',
                            },
                            cities: {
                                type: 'array',
                                description: 'Ordenação desc ou asc',
                            },
                            indicators: {
                                type: 'array',
                                description: 'Filtro por código de indicadores',
                            },
                            ...dateFiltersSchema,
                        },
                    },
                },
            }
        }
    }, lineChart);

}
