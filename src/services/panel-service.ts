import { t } from "i18next";
import { PanelServiceErrors } from "../errors/code-errors";
import { ServiceError } from "../errors/service-error";
import { PanelRepository } from "../repositories/interface/panel-repository";
import { AuthenticateService } from "./authenticate-service";
import { BarChart, DashboardService, DataResult } from "./dashboard-service";
import logger from "../config/logger";
import { CityService } from "./city-service";

// Enum para tipos de painel
const PanelTypes = ["bar_chart", "line_chart", "table", "horizontal_bar"] as const;
type PanelType = typeof PanelTypes[number];

export interface FiltersPanel {
    cities: string[],
    states: string[],
    producers: string[],
}

export enum OrderTable {
    asc = 'asc',
    desc = 'desc',
    none = 'none',
}

export interface Order {
    column: string,
    order: OrderTable,
}

export interface AttributesTable {
    columnsName: string[];
    order: Order[]; // Alterado para ser um array de objetos Order
}

export interface ConfigurationPanel {
    goal: boolean,
    criterion: string,
    indicator: string,
    dataSelection: string[],
    attributes?: AttributesTable
    filters: FiltersPanel,
}

export interface FormattedTableData {
    headers: string[];
    rows: Record<string, object>[];
}

export interface ProducerStats {
    producerId: string,
    producerDescription: string | null,
    producerCode: string,
    cityId: string,
    state: string,
    city: string,
    achievement: boolean,
    value: number | 0,
}

export class PanelService {

    constructor(
        private panelRepository: PanelRepository,
        private authenticateService: AuthenticateService,
        private dashboardService: DashboardService,
        private citiesService: CityService,
    ) { }

    listPanel = async (userId: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        const panelsList = await this.panelRepository.findAll(company_id);

        for (const panel of panelsList) {
            const json = JSON.parse(panel.configuration)
            console.log("json: ", json)

            // Alterando os campos 'cities' para IDs
            const filters = json.filters;

            let cities: string[] = [];
            let states: string[] = [];
            // Transformando 'cities' em IDs
            if (filters.cities && Array.isArray(filters.cities)) {
                cities = filters.cities;
            }

            // Transformando 'producers' em IDs
            if (filters.states && Array.isArray(filters.states)) {
                states = filters.states;
            }

            if (cities.length != 0) {
                const citiesFilter = await this.citiesService.getCities(cities, states);
                console.log("citiesFilter: ", citiesFilter);

                // Garantindo que 'cities' contenha apenas IDs únicos
                const uniqueCityIds = [...new Set(citiesFilter.map(city => city.id))]; // Usando Set para garantir IDs únicos

                // Atribuindo os IDs únicos de cidades ao filtro
                filters.cities = uniqueCityIds;
            }

            // Atualizando a configuração do painel com as alterações
            panel.configuration = json;
        }

        return panelsList;

    }

    getPanel = async (userId: string, panelId: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        const panel = await this.panelRepository.findById(panelId, company_id);

        if (!panel) {
            throw new ServiceError(t('messages.panel_id_not_found', { panelId }), PanelServiceErrors.ERROR_FIND_PANEL_BY_ID)
        }

        const json = JSON.parse(panel.configuration)
        panel.configuration = json

        return panel;
    }

    // Criação de um painel com validação do tipo e configuração
    createPanel = async (
        userId: string,
        panelName: string,
        panelType: string,
        configuration: object
    ) => {

        const { company_id } = await this.authenticateService.getProfile(userId);

        // Validação do tipo de painel
        if (!PanelTypes.includes(panelType as PanelType)) {
            throw new ServiceError(
                t("messages.invalid_panel_type", { panelType }),
                PanelServiceErrors.ERROR_INVALID_PANEL_TYPE
            );
        }

        // Adaptação do campo `order` na configuração
        const config = configuration as ConfigurationPanel;
        if (config.attributes?.order && !Array.isArray(config.attributes.order)) {
            config.attributes.order = [config.attributes.order];
        }

        const data = {
            userId,
            companyId: company_id,
            name: panelName.trim(),
            type: panelType,
            configuration: JSON.stringify(config),
        };

        return await this.panelRepository.save(data);
    };

    deletePanel = async (userId: string, panelId: string) => {
        // Recupera o perfil do usuário e obtém o ID da organização
        const { company_id } = await this.authenticateService.getProfile(userId);

        // Verifica se o painel existe e pertence à organização do usuário
        const panel = await this.panelRepository.findById(panelId, company_id);

        if (!panel) {
            throw new ServiceError(
                t("messages.panel_id_not_found", { panelId }),
                PanelServiceErrors.ERROR_FIND_PANEL_BY_ID
            );
        }

        // Deleta o painel
        await this.panelRepository.delete(panelId);

        return { message: t("messages.panel_deleted_successfully", { panelId }) };
    };

    updatePanel = async (
        userId: string,
        panelId: string,
        panelName: string,
        panelType: string,
        configuration: object
    ) => {
        const { company_id } = await this.authenticateService.getProfile(userId);

        const existingPanel = await this.panelRepository.findById(panelId, company_id);

        if (!existingPanel) {
            throw new ServiceError(
                t("messages.panel_id_not_found", { panelId }),
                PanelServiceErrors.ERROR_FIND_PANEL_BY_ID
            );
        }

        // const config = this.validateConfiguration(configuration);
        const config = JSON.stringify(configuration);

        // Atualiza os dados do painel
        const updatedData = {
            name: panelName.trim(),
            type: panelType,
            configuration: config,
        };

        console.log("panelId: ", panelId);

        const updatedPanel = await this.panelRepository.update(panelId, updatedData, userId);

        return updatedPanel;
    };

    // Método para executar um painel e obter os dados configurados para o gráfico
    executePanel = async (userId: string, panelId: string) => {
        // Recupera o perfil do usuário e obtém o ID da organização
        const { company_id } = await this.authenticateService.getProfile(userId);

        // Busca o painel e verifica se pertence à organização do usuário
        const panel = await this.panelRepository.findById(panelId, company_id);

        if (!panel) {
            throw new ServiceError(
                t("messages.panel_id_not_found", { panelId }),
                PanelServiceErrors.ERROR_FIND_PANEL_BY_ID
            );
        }

        // Extrai os filtros e tipo de painel da configuração
        const { type, configuration } = panel;

        // Validação da configuração
        const filters = this.validateConfiguration(configuration);

        // Retorna os dados 
        return await this.execute(userId, type, filters);

    };

    execute = async (userId: string, type: string, configuration: ConfigurationPanel) => {
        // Construir a consulta dinamicamente de acordo com os filtros e o tipo de painel
        let result;

        switch (type) {
            case "horizontal_bar":
            case "line_chart":
            case "bar_chart":
                result = await this.getChartData(userId, configuration);
                break;
            case "table":
                result = await this.getTableData(userId, configuration);
                break;
            default:
                throw new ServiceError(
                    t("messages.invalid_panel_type", { panelType: type }),
                    PanelServiceErrors.ERROR_INVALID_PANEL_TYPE
                );
        }

        return result;
    }

    // Método auxiliar para validar a configuração
    private validateConfiguration = (configuration: string): ConfigurationPanel => {

        console.log("configuration: ", configuration);
        if (!configuration) {
            throw new ServiceError(
                t("messages.invalid_panel_configuration"),
                PanelServiceErrors.ERROR_INVALID_PANEL_CONFIGURATION
            );
        }

        if (!this.isValidJsonString(configuration)) {
            throw new ServiceError(
                t("messages.invalid_panel_configuration_json"),
                PanelServiceErrors.ERROR_INVALID_PANEL_CONFIGURATION_JSON
            );
        }

        const config = JSON.parse(configuration) as ConfigurationPanel;

        // Adapta o campo `order` para a nova estrutura, caso ainda esteja no formato antigo
        if (config.attributes?.order && !Array.isArray(config.attributes.order)) {
            config.attributes.order = [config.attributes.order];
        }

        return config;
    };


    private generateData = async (userId: string, configuration: ConfigurationPanel) => {
        console.log("configuration: ", configuration)
        //buscar todos os produtores por empresa:
        return await this.dashboardService.summarizeProducers(userId, configuration);
    }

    private sortData = async (resultPanel: DataResult, criterion: string, dataSelection: string[]) => {

        // criterion= performance
        // dataSelection= producerBestResult ou producerWorstResult
        let sortedProducers: ProducerStats[] = resultPanel.producersStats;
        if (criterion === 'performance' && dataSelection[0] === 'producerBestResult') {
            //ordena por melhores resultados e retorna apenas 20
            sortedProducers = resultPanel.producersStats.sort((a, b) => b.value - a.value);

        } else if (criterion === 'performance' && dataSelection[0] === 'producerWorstResult') {
            //ordena pelos piores resultados e retorna apenas 20
            sortedProducers = resultPanel.producersStats.sort((a, b) => a.value - b.value);
        }

        return sortedProducers;
    }

    // Método auxiliar para buscar dados para gráficos
    private getChartData = async (userId: string, configuration: ConfigurationPanel) => {
        const resultPanel = await this.generateData(userId, configuration);
        console.log('resultPanel: ', resultPanel);

        const { criterion, dataSelection } = configuration;

        const sortedProducers = await this.sortData(resultPanel, criterion, dataSelection);
        const top20Producers = sortedProducers.slice(0, 20);
        console.log(top20Producers);

        //Ordenação do resultado 
        const order = dataSelection[0] === 'producerBestResult' ? 'desc' : 'asc';
        const datasets = this.sortBarChartByProducerValue(resultPanel.datasets, order)

        // return { filter: resultPanel.data, producers: top20Producers, datasets };
        return { filter: resultPanel.data, producers: sortedProducers, datasets };

    };

    private sortBarChartByProducerValue(barCharts: BarChart[], order: 'asc' | 'desc' = 'asc'): BarChart[] {
        return barCharts.sort((a, b) => {
            const sumA = a.producerPerYear.reduce((sum, year) => sum + (year.value || 0), 0);
            const sumB = b.producerPerYear.reduce((sum, year) => sum + (year.value || 0), 0);

            if (order === 'asc') {
                return sumA - sumB; // Ordem crescente
            } else {
                return sumB - sumA; // Ordem decrescente
            }
        });
    }

    // Método auxiliar para buscar dados para tabelas
    private getTableData = async (userId: string, configuration: ConfigurationPanel) => {
        const resultPanel = await this.generateData(userId, configuration);
        const { criterion, dataSelection, attributes } = configuration;

        const sortedProducers = await this.sortData(resultPanel, criterion, dataSelection);
        const top20Producers = sortedProducers.slice(0, 20);
        console.log(top20Producers);

        if (!attributes) {
            throw new Error("Não tem atributos")
        }
        //Ordenação do resultado 
        const order = dataSelection[0] === 'producerBestResult' ? 'desc' : 'asc';
        resultPanel.datasets = this.sortBarChartByProducerValue(resultPanel.datasets, order).slice(0, 20);

        const tableData = this.transformDataResultToSpreadsheet(resultPanel);

        // Ordena e filtra os itens da tabela com base nos atributos fornecidos
        const sortedAndFilteredItems = this.sortAndFilterItems(tableData, attributes);

        return { filter: resultPanel.data, producers: sortedProducers, datasets: { headers: attributes.columnsName, rows: sortedAndFilteredItems } }

    };

    private isValidJsonString = (jsonString: string) => {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (error) {
            logger.warn('Erro ao converter string para json: ', error)
            return false;
        }
    }

    adjustmentPanel = async (userId: string, _panelName: string, panelType: string, configuration: object) => {
        if (panelType && configuration) {
            const conf = configuration as ConfigurationPanel;
            if (conf.criterion && conf.dataSelection && conf.indicator) {
                //gera os valores do filtro
                return await this.executePanelTemp(userId, panelType, conf);
            }
        }

        return []
    }

    executePanelTemp = async (userId: string, panelType: string, configuration: ConfigurationPanel) => {
        return await this.execute(userId, panelType, configuration);
    }

    private transformDataResultToSpreadsheet = (dataResult: DataResult) => {
        const spreadsheetData: Record<string, unknown>[] = [];

        // Processar cada conjunto de dados no datasets
        dataResult.datasets.forEach((barChart) => {
            barChart.producerPerYear.forEach((producerYear) => {
                // Verificar se goal é válido e diferente de zero
                const percentageRealized = producerYear.goal && producerYear.goal !== 0
                    ? Math.floor((producerYear.value * 100) / producerYear.goal * 100) / 100
                    : 0; // Se goal for 0 ou inválido, atribui 0

                spreadsheetData.push({
                    producerDescription: barChart.producer,
                    cityName: barChart.cityName,
                    state: barChart.state,
                    year: producerYear.year,
                    value: percentageRealized,
                    goal: producerYear.goal,
                    indicator: barChart.indicator,
                });
            });
        });

        return spreadsheetData;
    }

    private sortAndFilterItems(items: Record<string, unknown>[], attributes: AttributesTable): Record<string, unknown>[] {
        const { columnsName, order } = attributes;

        // Verifica se há uma ordem especificada e se ela é válida
        if (!Array.isArray(order) || order.length === 0) {
            throw new Error("A propriedade 'order' deve ser um array de objetos com as colunas e a ordem.");
        }

        // Ordena os itens com base no array de `order`
        const sortedItems = items.sort((a, b) => {
            for (const ord of order) {
                const column = ord.column;

                if (!columnsName.includes(column)) {
                    throw new Error(`Column "${column}" not found in columnsName: ${columnsName}`);
                }

                // Verifica se a ordenação deve ser ignorada
                if (ord.order === "none") {
                    continue; // Ignora a ordenação dessa coluna
                }

                const valueA = a[column] as string | number | null;
                const valueB = b[column] as string | number | null;

                if (valueA == null || valueB == null) {
                    return 0;
                }

                // Compara os valores com base na ordem especificada
                if (valueA < valueB) {
                    return ord.order === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return ord.order === 'asc' ? 1 : -1;
                }
            }

            // Se os valores forem iguais, mantém a ordem original (0)
            return 0;
        });

        // Filtra os atributos de acordo com columnsName
        return sortedItems.map(item => {
            const filteredItem: Record<string, unknown> = {};
            columnsName.forEach(column => {
                if (Object.prototype.hasOwnProperty.call(item, column)) {
                    filteredItem[column] = item[column];
                }
            });
            return filteredItem;
        });
    }



    private sortAndFilterItemsOld(items: Record<string, unknown>[], attributes: AttributesTable): Record<string, unknown>[] {
        const { columnsName, order } = attributes;

        // Ordenar os itens com base no array de `order`
        const sortedItems = items.sort((a, b) => {
            for (const ord of order) {
                const column = ord.column;

                if (!columnsName.includes(column)) {
                    throw new Error(`Column "${column}" not found in columnsName: ${columnsName}`);
                }

                const valueA = a[column] as string | number | null;
                const valueB = b[column] as string | number | null;

                if (valueA == null || valueB == null) {
                    return 0;
                }

                if (valueA < valueB) {
                    return ord.order === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return ord.order === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });

        // Filtrar os atributos de acordo com columnsName
        return sortedItems.map(item => {
            const filteredItem: Record<string, unknown> = {};
            columnsName.forEach(column => {
                if (Object.prototype.hasOwnProperty.call(item, column)) {
                    filteredItem[column] = item[column];
                }
            });
            return filteredItem;
        });
    }

    getYearsData = async (userId: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        console.log("company_id: ", company_id)
        return await this.dashboardService.fetchMinAndMaxYears();
    }

}
