import { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/verify-jwt";
import { listPanels } from "./list-panel";
import { createPanel } from "./create-panel";
import { PanelCreate } from "../../../@types/panel-create";
import { getPanel } from "./get-panel";
import { PanelFind } from "../../../@types/panel-find";
import { deletePanel } from "./delete-panel";
import { updatePanel } from "./update-panel";
import { executePanel } from "./execute-panel";
import { adjustmentPanel } from "./adjustment-panel";
import { PanelUpdate } from "../../../@types/panel-update";
import { verifyRole } from "../../middlewares/verify-role";
import { getYearsData } from "./get-years-data";

const tags: [string] = ['Painel'];

export const panelController = async (app: FastifyInstance) => {

    //GET /panels/:id: Retorna os detalhes de um painel específico.
    app.get<{ Params: PanelFind }>('/panels/execute/:panelId', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Executa um painel específico.',
            params: {
                type: 'object',
                properties: {
                    panleId: { type: 'string' }
                }
            }
        }
    }, executePanel);

    //GET /panels: Lista todos os painéis de uma organização.
    app.get('/panels', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os painéis de uma organização.',
        }
    }, listPanels);

    //GET /panels/:id: Retorna os detalhes de um painel específico.
    app.get<{ Params: PanelFind }>('/panels/:panelId', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Retorna os detalhes de um painel específico.',
            params: {
                type: 'object',
                properties: {
                    panelId: { type: 'string' }
                }
            }
        }
    }, getPanel);

    //POST /panels: Cria um novo painel com base nas configurações fornecidas.
    app.post<{ Body: PanelCreate }>('/panels', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Cria um novo painel com base nas configurações fornecidas.',
            body: {
                type: 'object',
                required: ['panelType', 'panelName', 'configuration'],
                properties: {
                    panelType: {
                        type: 'string',
                        description: 'Tipo do painel',
                        enum: ['bar_chart', 'line_chart', 'table', 'horizontal_bar'],
                    },
                    panelName: {
                        type: 'string',
                        description: 'Nome do painel',
                    },
                    configuration: {
                        type: 'object',
                        required: ['indicator', 'criterion', 'dataSelection', 'goal', 'filters'],
                        properties: {
                            indicator: {
                                type: 'string',
                                description: 'Indicador selecionado',

                            },
                            criterion: {
                                type: 'string',
                                description: 'Critério de avaliação do painel',
                                enum: ['performance', 'comparison'],
                            },
                            dataSelection: {
                                type: 'array',
                                description: 'Seleção de dados para o painel',
                                items: {
                                    type: 'string',
                                },
                            },
                            goal: {
                                type: 'boolean',
                                description: 'Indica se a meta deve ser exibida',
                            },
                            filters: {
                                type: 'object',
                                description: 'Filtros de seleção múltipla',
                                properties: {
                                    states: {
                                        type: 'array',
                                        description: 'Lista de estados selecionados',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    cities: {
                                        type: 'array',
                                        description: 'Lista de cidades selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    producers: {
                                        type: 'array',
                                        description: 'Lista de produtores selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    }, createPanel);

    //PUT /panels/:id: Atualiza as configurações de um painel existente.
    app.put<{ Body: PanelUpdate, Params: PanelFind }>('/panels/:panelId', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Atualiza as configurações de um painel existente.',
            params: {
                type: 'object',
                properties: {
                    panleId: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['panelType', 'panelName', 'configuration'],
                properties: {
                    panelType: {
                        type: 'string',
                        description: 'Tipo do painel',
                        enum: ['bar_chart', 'line_chart', 'table', 'horizontal_bar'],
                    },
                    panelName: {
                        type: 'string',
                        description: 'Nome do painel',
                    },
                    configuration: {
                        type: 'object',
                        required: ['indicator', 'criterion', 'dataSelection', 'goal', 'filters'],
                        properties: {
                            indicator: {
                                type: 'string',
                                description: 'Indicador selecionado',
                            },
                            criterion: {
                                type: 'string',
                                description: 'Critério de avaliação do painel',
                                enum: ['performance', 'comparison'],
                            },
                            dataSelection: {
                                type: 'array',
                                description: 'Seleção de dados para o painel',
                                items: {
                                    type: 'string',
                                },
                            },
                            goal: {
                                type: 'boolean',
                                description: 'Indica se a meta deve ser exibida',
                            },
                            filters: {
                                type: 'object',
                                description: 'Filtros de seleção múltipla',
                                properties: {
                                    states: {
                                        type: 'array',
                                        description: 'Lista de estados selecionados',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    cities: {
                                        type: 'array',
                                        description: 'Lista de cidades selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    producers: {
                                        type: 'array',
                                        description: 'Lista de produtores selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    }, updatePanel);

    //DELETE /panels/:id: Remove um painel.
    app.delete<{ Params: PanelFind }>('/panels/:panelId', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Remove um painel.',
            params: {
                type: 'object',
                properties: {
                    panleId: { type: 'string' }
                }
            }
        }
    }, deletePanel);

    //POST /panels: Cria um novo painel com base nas configurações fornecidas.
    app.post<{ Body: PanelCreate }>('/panels/edit', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Cria um novo painel com base nas configurações fornecidas.',
            body: {
                type: 'object',
                required: ['panelType', 'panelName', 'configuration'],
                properties: {
                    panelType: {
                        type: 'string',
                        description: 'Tipo do painel',
                        enum: ['bar_chart', 'line_chart', 'table', 'horizontal_bar'],
                    },
                    panelName: {
                        type: 'string',
                        description: 'Nome do painel',
                    },
                    configuration: {
                        type: 'object',
                        required: ['indicator', 'criterion', 'dataSelection', 'goal', 'filters'],
                        properties: {
                            indicator: {
                                type: 'string',
                                description: 'Indicador selecionado',
                            },
                            criterion: {
                                type: 'string',
                                description: 'Critério de avaliação do painel',
                                enum: ['performance', 'comparison'],
                            },
                            dataSelection: {
                                type: 'array',
                                description: 'Seleção de dados para o painel',
                                items: {
                                    type: 'string',
                                },
                            },
                            goal: {
                                type: 'boolean',
                                description: 'Indica se a meta deve ser exibida',
                            },
                            filters: {
                                type: 'object',
                                description: 'Filtros de seleção múltipla',
                                properties: {
                                    states: {
                                        type: 'array',
                                        description: 'Lista de estados selecionados',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    cities: {
                                        type: 'array',
                                        description: 'Lista de cidades selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                    producers: {
                                        type: 'array',
                                        description: 'Lista de produtores selecionadas',
                                        items: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    }, adjustmentPanel);

    //GET /years: Lista todos os anos com data.
    app.get('/panels/years-data', {
        onRequest: [verifyJWT, verifyRole(['admin', 'organization'])],
        schema: {
            tags,
            security: [{ BearerAuth: [] }],
            summary: 'Lista todos os painéis de uma organização.',
        }
    }, getYearsData);


}