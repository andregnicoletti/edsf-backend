import { DashStackedEntity, DashTotalCertified, DashTotalGoal, DashTotalProducers, DashTotalStudents, DashTotalSubscribers, WorkerCourseAssocRepository } from "../repositories/interface/worker-course-assoc-repository";
import { CourseService } from "./course-service";
import { CityService } from "./city-service";
import { ProducerService } from "./producer-service";
import { IndicatorService } from "./indicator-service";
import { AuthenticateService } from "./authenticate-service";
import logger from "../config/logger";
import { ResultPanel } from "../@types/dashboard-result-panel";
import { ProducerPanel } from "../@types/dashboard-producer-panel";
import { ConfigurationPanel, ProducerStats } from "./panel-service";
import { t } from "i18next";
import { CourseEntity } from "@prisma/client";
import { convertMinutesToHHMM } from "../lib/date-utils";
import { startOfMonth as startOfMonthFn, endOfMonth as endOfMonthFn, parseISO, format } from 'date-fns';

interface FilterIndicators {
    indicatorCode: string,
    indicatorId: string,
    indicatorDescription: string,
}

interface FilterCourses {
    courseCode: string,
    courseId: string,
    courseDescription: string,
}

interface FilterProducers {
    producerCode: string,
    producerId: string,
    producerDescription: string,
    cityId: string,
    achievement: boolean,
}

interface Filters {
    indicators: FilterIndicators[],
    courses: FilterCourses[],
    producers: FilterProducers[],
    cities: string[],
    states: string[],
}

interface SummarizedData {
    municipioId: string,
    municipio: string,
    estado: string | undefined,
    totalInscricao: number,
    totalCertificado?: number,
    totalProdutores?: number,
    produtoresMetaAtingida?: number,
    courses?: string[],
}

export interface ProducerPerYear {
    year: string,
    value: number | 0,
    goal: number | 0,
}

export interface BarChart {
    producerId: string,
    producer: string | null,
    city: string,
    cityName: string,
    state: string,
    indicator: string,
    producerPerYear: ProducerPerYear[],
}

export interface DataResult {
    data: ResultPanel[],
    producersStats: ProducerStats[],
    datasets: BarChart[],
}

interface ChartDataEntry {
    city: string;
    state: string;
    total: number;
    [courseCode: string]: string | number; // Campos dinâmicos para os códigos dos cursos
}

interface DashboardSummary {
    indicators: Indicators;
    courses: Courses;
}

interface Indicators {
    targetProducers: number;
    producersWhoMetGoal: {
        value: number;
        percentage: number;
    };
    certifiedPeople: number;
    peopleInTraining: number;
    availableTrainings: {
        quantity: number;
        totalDurationHours: string;
    };
    registeredPeople: number;
}

interface Courses {
    courseWithMostRegistrations: CourseDetails;
    courseWithFewestRegistrations: CourseDetails;
}

interface CourseDetails {
    name: string;
    certifiedPeople: number;
    peopleInTraining: number;
    lessons: {
        quantity: number;
        averageDurationMinutes: number;
    };
}

export class DashboardService {

    constructor(
        private workerCourseAssocRepository: WorkerCourseAssocRepository,
        private courseService: CourseService,
        private cityService: CityService,
        private producerService: ProducerService,
        private indicatorService: IndicatorService,
        private authenticateService: AuthenticateService,
    ) { }

    summarizeProducers = async (userId: string, configuration: ConfigurationPanel): Promise<DataResult> => {
        //resolvendo filtros de cidade estado
        const { cities, states } = configuration.filters;
        const citiesFilters = (await this.cityService.getCities(cities, states)).map(c => c.id); //TODO Arrumar chamada

        const out: ResultPanel[] = [];
        const producersStats: ProducerStats[] = [];
        const datasets: BarChart[] = [];

        const { company_id } = await this.authenticateService.getProfile(userId);
        const indicador = await this.indicatorService.getIndicator(userId, configuration.indicator);

        let citiesId = await this.producerService.listCitiesWhereThereAreProducers(company_id);
        if (citiesFilters.length != 0) {
            citiesId = citiesId.filter(city => citiesFilters.includes(city));
        }

        console.log("citiesId: ", citiesId);
        for (const cityId of citiesId) {
            const city = await this.cityService.getCity(cityId);
            console.log("city: ", city);

            // Lista todos os produtores da cidade
            const producersResult: ProducerPanel[] = []
            const producers = await this.producerService.listProducerByCityId(company_id, cityId);

            for (const producer of producers) {

                const producerId = producer.id;
                const producerCode = producer.code;
                let achievement = false;

                const producersValues: ProducerPerYear[] = [];

                let performaceGoal: number = 0;
                if (configuration.criterion === 'performance') {
                    const anoAtual = new Date().getFullYear();  // Saída: 2024 (exemplo)
                    const goal = await this.indicatorService.getGoal(configuration.indicator, producerId, String(anoAtual));
                    const indicatorValue = await this.indicatorService.getSumValueIndicatorById(String(anoAtual), indicador.id, producerId);
                    if (goal && Number(goal.percentageAccomplished) >= 100) {
                        achievement = true;
                    }

                    performaceGoal = Number(goal?.percentageAccomplished);
                    const producerPerYear: ProducerPerYear = {
                        year: String(anoAtual),
                        goal: goal ? Number(goal?.goal) : 0,
                        value: indicatorValue ? Number(indicatorValue.indicatorValue) : 0,
                    };

                    producersValues.push(producerPerYear);

                } else if (configuration.criterion === 'comparison') {
                    const years: string[] = configuration.dataSelection;
                    for (const year of years) {
                        const goal = await this.indicatorService.getGoal(configuration.indicator, producerId, String(year));
                        const indicatorValue = await this.indicatorService.getSumValueIndicatorById(String(year), indicador.id, producerId);
                        if (goal && Number(goal.percentageAccomplished) >= 100) {
                            achievement = true;
                        }

                        const producerPerYear: ProducerPerYear = {
                            year: String(year),
                            goal: goal ? Number(goal?.goal) : 0,
                            value: indicatorValue ? Number(indicatorValue.indicatorValue) : 0,
                        };
                        producersValues.push(producerPerYear);
                    }
                }

                //Faz o filtro por produtores apenas para o gráfico
                const filterProducer = configuration.filters.producers;
                if (filterProducer.includes(producer.code) || filterProducer.length === 0) {
                    const chart: BarChart = {
                        city: city.id,
                        cityName: city.city,
                        state: city.state_id,
                        producer: producer.description,
                        producerId: producer.id,
                        producerPerYear: producersValues,
                        indicator: indicador.indicatorDescription,
                    };
                    datasets.push(chart);
                }

                const producerPanel: ProducerPanel = { producerId, producerCode, achievement };
                producersResult.push(producerPanel);

                //Salvar produtor em uma lista para poder selecionar 20 melhores e 20 piores
                const producerStats: ProducerStats = {
                    cityId: city.id,
                    city: city.city,
                    state: city.state_id,
                    producerId: producer.id,
                    producerDescription: producer.description,
                    producerCode: producer.code,
                    achievement,
                    value: !performaceGoal ? 0 : performaceGoal,
                }
                producersStats.push(producerStats);

                const resultPanel: ResultPanel = {
                    cityId,
                    city: city.city,
                    state: city.state_id,
                    producers: producersResult
                }

                out.push(resultPanel)

            }
        }

        return { data: out, producersStats, datasets };

    }

    stackedColumnChart = async (
        userId: string,
        sort: string = 'asc',
        total: number = 10,
        courses: string[] = [],
        states: string[] = [],
        cities: string[] = [],
        indicators: string[] = [],
        yearFrom?: string,
        monthFrom?: string,
        yearTo?: string,
        monthTo?: string,
    ) => {

        // Determinar ano e mês correntes se não forem fornecidos
        const currentDate = new Date();
        const currentYear = format(currentDate, 'yyyy');
        const currentMonth = format(currentDate, 'MM');

        const resolvedYearFrom = yearFrom || currentYear;
        const resolvedMonthFrom = monthFrom || currentMonth;
        const resolvedYearTo = yearTo || currentYear;
        const resolvedMonthTo = monthTo || currentMonth;

        // Validar e construir as datas de início e fim do mês
        const startOfMonth = startOfMonthFn(parseISO(`${resolvedYearFrom}-${resolvedMonthFrom}-01`));
        const endOfMonth = endOfMonthFn(parseISO(`${resolvedYearTo}-${resolvedMonthTo}-01`));

        const { company_id } = await this.authenticateService.getProfile(userId);

        // 1- Achar todos os cursos de uma organização
        const _coursesId = await this.indicatorService.findAssocIndicatorCourseByCompanyId(company_id);

        const filterdCities = await this.cityService.getCities(cities, states);
        const citiesIds = filterdCities.map(i => i.id);

        console.log('filterdCities: ', filterdCities)
        console.log('citiesIds: ', citiesIds)
        console.log('startOfMonth: ', startOfMonth)
        console.log('endOfMonth: ', endOfMonth)

        const totalStudents = await this.workerCourseAssocRepository.getTopCitiesByRegistrations(
            company_id,
            startOfMonth,
            endOfMonth,
            citiesIds,
            courses,
            total,
            sort,
            indicators,
        );
        console.log('totalStudents: ', totalStudents);

        if (totalStudents.length === 0) {
            return [];
        }

        const dash = await this.workerCourseAssocRepository.dashStackedColumnChartCoursesCompleted(
            company_id,
            startOfMonth,
            endOfMonth,
            sort,
            courses,
            totalStudents.map(i => i.city_id),
            indicators,
        );
        console.log("completed: ", dash);

        const dash2 = await this.workerCourseAssocRepository.dashStackedColumnChartCoursesNotCompleted(
            company_id,
            startOfMonth,
            endOfMonth,
            sort,
            courses,
            totalStudents.map(i => i.city_id),
            indicators,
        );
        console.log("not completed: ", dash2);

        const completed = this.transformToChartData(dash, true);
        const notCompleted = this.transformToChartData(dash2, false);
        console.log("t1: ", completed);
        console.log("t2: ", notCompleted);

        // Adicionar dados de `completed` ao mapa
        const mergedData: Record<string, ChartDataEntry> = {};
        completed.forEach(item => {
            const key = `${item.city}-${item.state}`;
            if (!mergedData[key]) {
                mergedData[key] = { ...item };
            } else {
                mergedData[key].total += item.total;

                // Adiciona os cursos dinamicamente
                Object.keys(item).forEach(course => {
                    if (course !== 'city' && course !== 'state' && course !== 'total') {
                        mergedData[key][course] = Number(mergedData[key][course] ?? 0) + Number(item[course] ?? 0);
                    }
                });
            }
        });

        // Adicionar dados de `notCompleted` ao mapa
        notCompleted.forEach(item => {
            const key = `${item.city}-${item.state}`;
            if (!mergedData[key]) {
                mergedData[key] = {
                    // city: item.city,
                    // state: item.state,
                    // total: item.total
                    ...item
                };
            } else {
                mergedData[key].total += item.total;

                // Adiciona os cursos dinamicamente
                Object.keys(item).forEach(course => {
                    if (course !== 'city' && course !== 'state' && course !== 'total') {
                        mergedData[key][course] = Number(mergedData[key][course] ?? 0) + Number(item[course] ?? 0);
                    }
                });
            }
        });

        // Converta o mapa de volta para um array
        const mergedArray = Object.values(mergedData);
        console.log("Merged Data: ", mergedArray);

        const ordened = this.sortChartData(mergedArray);

        return ordened;

    }

    private sortChartData = (
        data: ChartDataEntry[],
    ): ChartDataEntry[] => {

        return data.sort((a, b) => {
            return a.city.localeCompare(b.city)
        });

    }

    private transformToChartData = (data: DashStackedEntity[], completed: boolean): ChartDataEntry[] => {
        // Objeto auxiliar para organizar os dados por cidade
        const groupedData: Record<string, ChartDataEntry> = {};

        // Objeto de mapeamento de códigos de curso para descrições
        const courseDescriptionMap: Record<string, string> = {};

        // Preencher o mapeamento de course_code para course_description
        data.forEach((item) => {
            courseDescriptionMap[item.course_code] = item.course_description;
        });

        data.forEach((item) => {
            const cityKey = `${item.city_name}-${item.state}`; // Identificador único para cidade + estado

            // Inicialize o objeto da cidade se ainda não existir
            if (!groupedData[cityKey]) {
                groupedData[cityKey] = {
                    city: item.city_name,
                    state: item.state,
                    total: 0, // Inicializa o total
                };
            }

            // Obtenha a descrição do curso usando o código
            const courseDescription = courseDescriptionMap[item.course_code];

            if (completed) {
                // Substitua o código do curso pela descrição no objeto de dados do gráfico
                groupedData[cityKey][courseDescription] = item.total_distinct_cpfs;
            } else {
                // Atualize o total apenas dos inscritos 
                groupedData[cityKey].total += item.total_distinct_cpfs;
            }

        });

        // Converta o objeto agrupado em uma lista de objetos
        return Object.values(groupedData);
    }

    lineChart = async (
        userId: string,
        sort: string = 'asc',
        total: number = 10,
        courses: string[] = [],
        states: string[] = [],
        cities: string[] = [],
        indicators: string[] = [],
        yearFrom?: string,
        monthFrom?: string,
        yearTo?: string,
        monthTo?: string,
    ) => {

        const currentDate = new Date();
        const resolvedYearFrom = parseInt(yearFrom || format(currentDate, 'yyyy'), 10);
        const resolvedMonthFrom = parseInt(monthFrom || format(currentDate, 'MM'), 10);
        const resolvedYearTo = parseInt(yearTo || format(currentDate, 'yyyy'), 10);
        const resolvedMonthTo = parseInt(monthTo || format(currentDate, 'MM'), 10);

        const startOfMonth = startOfMonthFn(new Date(resolvedYearFrom, resolvedMonthFrom - 1, 1));
        const endOfMonth = endOfMonthFn(new Date(resolvedYearTo, resolvedMonthTo - 1, 1));
    
        console.log('startOfMonth: ', startOfMonth)
        console.log('endOfMonth: ', endOfMonth)
        console.log('resolvedYearFrom: ', resolvedYearFrom)
        console.log('resolvedMonthFrom: ', resolvedMonthFrom)

        const results = [];
        const { company_id } = await this.authenticateService.getProfile(userId);

        const intervals = this.getLastSixMonthsDynamic(resolvedYearFrom, resolvedMonthFrom, resolvedYearTo, resolvedMonthTo);

        const filteredCities = await this.cityService.getCities(cities, states);
        let citiesIds = filteredCities.map(i => i.id);

        const totalStudents = await this.workerCourseAssocRepository.getTopCitiesByRegistrations(
            company_id,
            startOfMonth,
            endOfMonth,
            citiesIds,
            courses,
            total,
            sort,
            indicators,
        );

        citiesIds = totalStudents.map(i => i.city_id);

        if (citiesIds.length === 0) { return [] }

        const dataCurrentMonth = await this.workerCourseAssocRepository.dashLineChart(
            company_id,
            startOfMonth,
            endOfMonth,
            sort,
            total,
            courses,
            citiesIds,
            indicators,
        );

        if (dataCurrentMonth.length === 0) {
            return [];
        }

        const citiesInfoMap = new Map<string, { city_name: string, state: string, city_id: string }>();

        // Armazena os dados das cidades do mês corrente
        dataCurrentMonth.forEach(item => {
            citiesInfoMap.set(item.city_id, {
                city_name: item.city_name,
                state: item.state,
                city_id: item.city_id,
            });
        });

        const citiesToFilter = Array.from(citiesInfoMap.keys());

        for (const { start, end } of intervals) {
            const data = await this.workerCourseAssocRepository.dashLineChart(
                company_id,
                start,
                end,
                sort,
                total,
                courses,
                citiesToFilter,
                indicators
            );

            const dataMap = new Map(data.map(item => [item.city_id, item]));

            const completeData = citiesToFilter.map(cityId => {
                return dataMap.get(cityId) || {
                    city_name: citiesInfoMap.get(cityId)?.city_name || 'Desconhecida',
                    state: citiesInfoMap.get(cityId)?.state || 'Desconhecido',
                    total_enrolled: 0,
                    certified: 0,
                    in_training: 0,
                    city_id: cityId,
                };
            });

            const month = t(`months.short.${start.toLocaleString('default', { month: 'short' }).toUpperCase()}`);

            results.push({
                month: `${month} ${start.getFullYear()}`,
                data: completeData,
            });
        }

        return results;
    }

    private getLastSixMonthsDynamic = (yearFrom: number, monthFrom: number, yearTo: number, monthTo: number): { start: Date; end: Date }[] => {
        const fromDate = new Date(yearFrom, monthFrom - 1, 1);
        const toDate = new Date(yearTo, monthTo - 1, 1);

        const diffInMonths = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());

        const result: { start: Date; end: Date }[] = [];

        if (diffInMonths <= 11) {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(yearTo, monthTo - 1);
                date.setMonth(date.getMonth() - i);

                const start = new Date(date.getFullYear(), date.getMonth(), 1);
                const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                result.push({ start, end });
            }
        } else {
            for (let d = new Date(fromDate); d <= toDate; d.setMonth(d.getMonth() + 1)) {
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

                result.push({ start, end });
            }
        }

        return result;
    };

    // Método atualizado para calcular os últimos 6 meses com base no filtro
    private getLastSixMonths = (year: number, month: number): { start: Date; end: Date }[] => {
        const result: { start: Date; end: Date }[] = [];

        for (let i = 5; i >= 0; i--) {
            // Criar uma nova data baseada no mês/ano do filtro e retroceder `i` meses
            const date = new Date(year, month - 1); // -1 porque os meses em JavaScript começam de 0
            date.setMonth(date.getMonth() - i);

            // Determinar o início e o fim do mês
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            result.push({ start, end });
        }

        return result;
    };

    detailedExtract = async (
        userId: string,
        cities: string[] = [],
        states: string[] = [],
        courses: string[] = [],
        yearFrom: string,
        monthFrom: string,
        yearTo: string,
        monthTo: string,
    ) => {
        const resultado: SummarizedData[] = [];

        // Determinar ano e mês correntes se não forem fornecidos
        const currentDate = new Date();
        const currentYear = format(currentDate, 'yyyy');
        const currentMonth = format(currentDate, 'MM');

        const resolvedYearFrom = yearFrom || currentYear;
        const resolvedMonthFrom = monthFrom || currentMonth;

        const resolvedYearTo = yearTo || currentYear;
        const resolvedMonthTo = monthTo || currentMonth;

        // Validar e construir as datas de início e fim do mês
        const startOfMonth = startOfMonthFn(parseISO(`${resolvedYearFrom}-${resolvedMonthFrom}-01`));
        const endOfMonth = endOfMonthFn(parseISO(`${resolvedYearTo}-${resolvedMonthTo}-01`));

        // Recuperar profile do usuário
        const { company_id } = await this.authenticateService.getProfile(userId);
        const filters: Filters = await this.filterProcess(userId, startOfMonth, endOfMonth, cities, states, courses);

        logger.info(`Filtros aplicados: cidades: ${cities}, estados: ${states}, cursos: ${courses}`);
        logger.info(`Data de início do mês: ${startOfMonth}`);
        logger.info(`Data de fim do mês: ${endOfMonth}`);

        // Buscar cidades filtradas
        const citiesFilters = await this.workerCourseAssocRepository.findCitiesIdByFilters(
            company_id,
            startOfMonth,
            endOfMonth,
            cities,
            states,
            courses,
            [],
            [],
        );
        console.log("citiesFilters: ", citiesFilters);

        const citiesStudentsId = citiesFilters.map(i => i.city_id);
        console.log("citiesStudentsId: ", citiesStudentsId);

        // Filtro de produtores e adiciona seus ids na lista de citiesId
        const producersByFilter = await this.producerService.findProducersByFilter(company_id, cities, states);

        // Combinar IDs de cidades
        let citiesId = citiesStudentsId;
        if (courses.length === 0) {
            citiesId = [...new Set([...citiesStudentsId, ...producersByFilter.map(produtor => produtor.city_id)])];
        }
        console.log('citiesId: ', citiesId);

        if (citiesId.length === 0) {
            return { data: resultado, filters };
        }

        // Sumarização dos dados
        // Contar pessoas inscritas por cidade e mês
        const totalStudents = await this.workerCourseAssocRepository.countTotalStudentByFilters(
            company_id,
            startOfMonth,
            endOfMonth,
            citiesId,
            courses,
            [],
            [],
        );
        console.log("totalStudents: ", totalStudents);

        // Contar certificados por cidade
        const totalCertified = await this.workerCourseAssocRepository.countTotalCertifiedByFilters(
            company_id,
            startOfMonth,
            endOfMonth,
            citiesId,
            courses,
            [],
            [],
        );
        console.log("totalCertified: ", totalCertified);

        // Contar produtores por cidade
        const totalProducers = await this.workerCourseAssocRepository.countTotalProducerByFilters(
            company_id,
            citiesId,
            [],
            [],
            yearFrom,
            yearTo,
            []
        );
        console.log("totalProducers: ", totalProducers);

        // Contar metas atingidas por cidade
        const totalGoals = await this.workerCourseAssocRepository.countTotalGoalByFilters(
            company_id,
            resolvedYearFrom,
            resolvedYearTo,
            citiesId,
            [],
            courses,
            []
        );
        console.log("totalGoals: ", totalGoals);

        // Verificar inscrições na tabela ASSOC_TRABALHADOR_CURSO por empresa
        const subscribedStudents = await this.workerCourseAssocRepository.subscribedStudentsAndCompany(
            company_id,
            startOfMonth,
            endOfMonth,
            cities,
            states,
            courses,
            [],
            []
        );
        console.log("subscribedStudents: ", subscribedStudents);

        const allCities = await this.cityService.findAll();
        const summarizedData = this.combineData(allCities, totalStudents, totalCertified, totalProducers, totalGoals);

        return { data: summarizedData, filters };
    };

    private combineData = (
        cities: { id: string, city: string, state_id: string }[],
        totalStudents: DashTotalStudents[],
        totalCertified: DashTotalCertified[],
        totalProducer: DashTotalProducers[],
        totalGoals: DashTotalGoal[]
    ): SummarizedData[] => {
        // Map para acumular os dados por cidade
        const cityMap: Record<string, SummarizedData> = {};

        const cityValues = new Map<string, { id: string, city: string, state_id: string }>();

        // Adiciona dados de cities
        cities.forEach(city => {
            cityValues.set(city.id, city);
        });

        // Adiciona dados de totalStudents
        totalStudents.forEach(({ city_id, total_student }) => {
            if (!cityMap[city_id]) {
                cityMap[city_id] = {
                    municipioId: city_id,
                    municipio: cityValues.get(city_id)?.city || '',
                    estado: cityValues.get(city_id)?.state_id,
                    totalInscricao: 0,
                    totalCertificado: 0,
                    totalProdutores: 0,
                    produtoresMetaAtingida: 0,
                };
            }
            cityMap[city_id].totalInscricao = total_student;
        });

        // Adiciona dados de totalCertified
        totalCertified.forEach(({ city_id, total_certified }) => {
            if (!cityMap[city_id]) {
                cityMap[city_id] = {
                    municipioId: city_id,
                    municipio: cityValues.get(city_id)?.city || '',
                    estado: cityValues.get(city_id)?.state_id,
                    totalInscricao: 0,
                    totalCertificado: 0,
                    totalProdutores: 0,
                    produtoresMetaAtingida: 0,
                };
            }
            cityMap[city_id].totalCertificado = total_certified;
        });

        // Adiciona dados de totalProducer
        totalProducer.forEach(({ city_id, total_producer }) => {
            if (!cityMap[city_id]) {
                cityMap[city_id] = {
                    municipioId: city_id,
                    municipio: cityValues.get(city_id)?.city || '',
                    estado: cityValues.get(city_id)?.state_id,
                    totalInscricao: 0,
                    totalCertificado: 0,
                    totalProdutores: 0,
                    produtoresMetaAtingida: 0,
                };
            }
            cityMap[city_id].totalProdutores = total_producer;
        });

        // Adiciona dados de totalGoals
        totalGoals.forEach(({ city_id, has_achieved_goal }) => {
            if (!cityMap[city_id]) {
                cityMap[city_id] = {
                    municipioId: city_id,
                    municipio: cityValues.get(city_id)?.city || '',
                    estado: cityValues.get(city_id)?.state_id,
                    totalInscricao: 0,
                    totalCertificado: 0,
                    totalProdutores: 0,
                    produtoresMetaAtingida: has_achieved_goal,
                };
            }
            cityMap[city_id].produtoresMetaAtingida = has_achieved_goal;
        });

        // Retorna os dados combinados como uma lista
        return Object.values(cityMap);
    }

    summary = async (
        userId: string,
        cities: string[] = [],
        states: string[] = [],
        courses: string[] = [],
        indicators: string[] = [],
        producers: string[] = [],
        yearFrom: string,
        monthFrom: string,
        yearTo: string,
        monthTo: string,
    ) => {

        // Determinar ano e mês correntes se não forem fornecidos
        const currentDate = new Date();
        const currentYear = format(currentDate, 'yyyy');
        const currentMonth = format(currentDate, 'MM');

        const resolvedYearFrom = yearFrom || currentYear;
        const resolvedMonthFrom = monthFrom || currentMonth;
        const resolvedYearTo = yearTo || currentYear;
        const resolvedMonthTo = monthTo || currentMonth;

        // Validar e construir as datas de início e fim do mês
        const startOfMonth = startOfMonthFn(parseISO(`${resolvedYearFrom}-${resolvedMonthFrom}-01`));
        const endOfMonth = endOfMonthFn(parseISO(`${resolvedYearTo}-${resolvedMonthTo}-01`));

        // Recuperar profile do usuário
        const { company_id } = await this.authenticateService.getProfile(userId);
        const filters: Filters = await this.filterProcess(userId, startOfMonth, endOfMonth, cities, states, courses, indicators, producers);

        logger.info(`Filtros aplicados: cidades: ${cities}, estados: ${states}, cursos: ${courses}, indicators: ${indicators}, producers: ${producers}`);
        logger.info(`Data de início do mês: ${startOfMonth}`);
        logger.info(`Data de fim do mês: ${endOfMonth}`);

        // Buscar cidades filtradas
        const citiesFilters = await this.workerCourseAssocRepository.findCitiesIdByFilters(
            company_id,
            null,//startOfMonth, //não usado nesse momento para realizar o filtro
            endOfMonth,
            cities,
            states,
            courses,
            indicators,
            producers,
        );
        console.log("citiesFilters: ", citiesFilters);

        const citiesStudentsId = citiesFilters.map(i => i.city_id);
        console.log("citiesStudentsId: ", citiesStudentsId);

        //filtro de produtores e adiciona seus ids na lista de citiesId
        const producersByFilter = await this.producerService.findProducersByFilter(company_id, cities, states);

        // Combinar IDs de cidades
        let citiesId = citiesStudentsId;
        if (courses.length === 0) {
            citiesId = [...new Set([...citiesStudentsId, ...producersByFilter.map(produtor => produtor.city_id)])];
        }
        console.log('citiesId: ', citiesId);

        //fazer filtro dos cursos 
        const coursesFiltered = await this.courseService.countTotalCourseByFilters(
            company_id,
            indicators,
            courses,
        );
        console.log("coursesFiltered: ", coursesFiltered);

        // Sumarização dos dados
        // let totalStudents: DashTotalStudents[] = [];
        let totalTrainingPeple: DashTotalSubscribers[] = [];
        let totalCertified: DashTotalCertified[] = [];
        let totalProducers: DashTotalProducers[] = [];
        let totalGoals: DashTotalGoal[] = [];
        let courseWithFewestRegistrations: CourseDetails = {
            certifiedPeople: 0,
            lessons: {
                averageDurationMinutes: 0,
                quantity: 0,
            },
            name: '',
            peopleInTraining: 0
        };
        let courseWithMostRegistrations: CourseDetails = {
            certifiedPeople: 0,
            lessons: {
                averageDurationMinutes: 0,
                quantity: 0,
            },
            name: '',
            peopleInTraining: 0
        };

        if (citiesId.length !== 0) {
            // Conta o total de inscritos por cidade
            totalTrainingPeple = await this.workerCourseAssocRepository.countTotalTrainingByFilters(
                company_id,
                null,// startOfMonth,
                endOfMonth,
                citiesId,
                courses,
                indicators,
                producers,
            );
            console.log("totalTrainingPeple: ", totalTrainingPeple); 

            // Conta o total de certificados por cidade
            totalCertified = await this.workerCourseAssocRepository.countTotalCertifiedByFilters(
                company_id,
                startOfMonth,
                endOfMonth,
                citiesId,
                courses,
                indicators,
                producers,
            );
            console.log("totalCertified: ", totalCertified);

            const coursesCode = coursesFiltered.map(i => i.code);
            courseWithFewestRegistrations = await this.getSummaryStatsCourse(company_id, "asc", startOfMonth, endOfMonth, indicators, coursesCode, citiesId, producers, totalTrainingPeple.length);
            courseWithMostRegistrations = await this.getSummaryStatsCourse(company_id, "desc", startOfMonth, endOfMonth, indicators, coursesCode, citiesId, producers, totalTrainingPeple.length);

        }

        // Conta o total de produtores por cidade
        const filteredCities = await this.cityService.getCities(cities, states);
        const producerCities = filteredCities.map(c => c.id);

        totalProducers = await this.workerCourseAssocRepository.countTotalProducerByFilters(
            company_id,
            producerCities,
            indicators,
            courses,
            yearFrom,
            yearTo,
            producers,
        );
        console.log("totalProducer: ", totalProducers);


        // Conta o Exibe a quantidade de meta atingida por cidade
        totalGoals = await this.workerCourseAssocRepository.countTotalGoalByFilters(
            company_id,
            resolvedYearFrom,
            resolvedYearTo,
            producerCities,
            indicators,
            courses,
            producers,
        );
        console.log("totalGoals: ", totalGoals);

        const producersWhoMetGoalValue = Array.isArray(totalGoals)
            ? totalGoals.reduce((sum, item) => sum + (item.has_achieved_goal || 0), 0)
            : 0;

        const targetProducers = Array.isArray(totalProducers)
            ? totalProducers.reduce((sum, item) => sum + (item.total_producer || 0), 0)
            : 0;

        const producersWhoMetGoalPercent =
            targetProducers > 0
                ? parseFloat(((producersWhoMetGoalValue * 100) / targetProducers).toFixed(2))
                : 0;

        const producersWhoMetGoal = {
            value: producersWhoMetGoalValue,
            percentage: producersWhoMetGoalPercent,
        }

        //Verificar se existem registros na tabela ASSOC_TRABALHADOR_CURSO por empresa
        const subscribedStudents = await this.workerCourseAssocRepository.subscribedStudentsAndCompany(
            company_id,
            startOfMonth,
            endOfMonth,
            cities,
            states,
            courses,
            indicators,
            producers,
        );
        console.log("subscribedStudents: ", subscribedStudents);


        // Soma todos os valores de averageDuration multiplicados por numberClass
        const totalDurationMinutes = coursesFiltered.reduce((sum: number, course) => {
            const totalCourseMinutes = (course.average_duration ?? 0) * (course.number_class ?? 0); // Multiplica averageDuration por numberClass, considerando null/undefined
            return sum + totalCourseMinutes; // Soma o total de minutos
        }, 0);
        console.log('totalDurationMinutes: ', totalDurationMinutes)

        const formattedTime = convertMinutesToHHMM(totalDurationMinutes);
        console.log("formattedTime: ", formattedTime); // Exemplo de saída: "02:30"

        const certifiedPeople = totalCertified.reduce((sum, item) => sum + item.total_certified, 0);
        const peopleInTraining = totalTrainingPeple.reduce((sum, item) => sum + item.total_subscribers, 0);
        const availableTrainings = {
            quantity: coursesFiltered.length,
            totalDurationHours: formattedTime,
        }

        const indicatorsResult: Indicators = {
            availableTrainings,
            certifiedPeople,
            peopleInTraining,
            producersWhoMetGoal,
            registeredPeople: subscribedStudents.length,
            targetProducers
        }

        const dashCourses: Courses = {
            courseWithFewestRegistrations,
            courseWithMostRegistrations,
        }

        const response: DashboardSummary = {
            indicators: indicatorsResult,
            courses: dashCourses
        }

        if (!subscribedStudents || citiesFilters.length == 0) {
            // TODO: Painel ainda não configurado
            // Verificar se há painel configurado
            // return {};
        }

        return { data: response, filters };
    }

    private filterCourses(courses: CourseEntity[], courseCodes: string[]) {
        if (!courseCodes || courseCodes.length === 0) {
            return courses; // Retorna todos os cursos
        }

        // Filtra os cursos com base nos códigos fornecidos
        return courses.filter(course => courseCodes.includes(course.code));
    }

    private getSummaryStatsCourse = async (
        companyId: string,
        order: string,
        startOfMonth: Date | null,
        endOfMonth: Date,
        indicators: string[],
        courses: string[],
        cities: string[],
        producers: string[],
        totalStudents: number,
    ): Promise<CourseDetails> => {

        let courseWithFewestRegistrations: CourseDetails = {
            name: "",
            certifiedPeople: 0,
            peopleInTraining: 0,
            lessons: {
                quantity: 0,
                averageDurationMinutes: 0,
            }
        }

        if (totalStudents !== 0) {
            const data = await this.workerCourseAssocRepository.getCourseWithMostEnrollments(
                companyId,
                startOfMonth,
                endOfMonth,
                order,
                indicators,
                courses,
                cities,
                producers,
            );

            if (data && data.length > 0) {
                courseWithFewestRegistrations = {
                    name: data[0].course_name,
                    certifiedPeople: data[0].certified_people,
                    peopleInTraining: data[0].people_in_training,
                    lessons: {
                        quantity: data[0].total_lessons,
                        averageDurationMinutes: data[0].average_duration,
                    }
                }
            }
        }

        return courseWithFewestRegistrations;
    }

    fetchMinAndMaxYears = async () => {
        const dates = await this.workerCourseAssocRepository.fetchMinAndMaxYears();
        logger.info(`dates: ${JSON.stringify(dates)}`);

        // Verifica se min_date ou max_date são valores válidos
        if (!dates?.min_date || !dates?.max_date) {
            logger.warn(t("error.no_valid_dates"));
            return [];
        }

        // Garante que os valores sejam números antes de passar para makeYearsList
        const anoInicio = Number(dates.min_date);
        const anoFim = Number(dates.max_date);

        // Se os valores convertidos forem 0 ou NaN, retorna uma lista vazia
        if (isNaN(anoInicio) || isNaN(anoFim) || anoInicio === 0 || anoFim === 0) {
            logger.warn(t("error.invalid_values"));
            return [];
        }

        const years = this.makeYearsList(anoInicio, anoFim);
        logger.info(`${t("messages.generated_list")}: ${years}`);

        return years;
    }

    private makeYearsList = (anoInicio: number, anoFim: number) => {
        const anos = [];
        for (let ano = anoInicio; ano <= anoFim; ano++) {
            anos.push(String(ano)); // Converte para string para garantir consistência
        }
        return anos;
    };

    private filterProcess = async (
        userId: string,
        startOfMonth: Date,
        endOfMonth: Date,
        cities: string[] = [],
        states: string[] = [],
        courses: string[] = [],
        indicators: string[] = [],
        _producers: string[] = []
    ): Promise<Filters> => {

        const indicatorsList = courses.length > 0
            ? await this.indicatorService.listAllIndicatorsByCourse(userId, courses)
            : await this.indicatorService.listAllIndicators(userId);

        const filterIndicator: FilterIndicators[] = indicatorsList.map(i => ({
            indicatorCode: i.code,
            indicatorDescription: i.indicatorDescription,
            indicatorId: i.id,
        }));
        console.log('filterIndicator: ', filterIndicator);

        const coursesList = indicators.length > 0
            ? await this.courseService.listAllCoursesByIndicators(userId, indicators)
            : await this.courseService.listAllCourses(userId);

        const filterCourses: FilterCourses[] = coursesList.map(i => ({
            courseCode: i.code,
            courseId: i.id,
            courseDescription: i.courseDescription,
        }));
        console.log('filterCourses: ', filterCourses);

        const citiesList = courses.length > 0
            ? await this.cityService.listAllCitiesByFilters(userId, startOfMonth, endOfMonth, courses, indicators)
            : await this.cityService.listAllCities();
        console.log('citiesList: ', citiesList);

        const filterCities = new Set<string>;
        const filterStates = new Set<string>;

        citiesList.forEach(item => {
            filterStates.add(item.state_id);
        });
        console.log('filterStates: ', filterStates);

        citiesList
            .filter(item => states.length === 0 || states.includes(item.state_id))
            .forEach(item => {
                filterCities.add(item.id);
            });
        console.log('filterCities: ', filterCities);

        // Filtro de produtores 
        const citiesEntity = await this.cityService.getCities(cities, states);
        const citiesIds = citiesEntity.map(i => i.id);
        const producerList = await this.producerService.listAllProducerByFilters(userId, startOfMonth, endOfMonth, indicators, citiesIds);

        const filterProducers: FilterProducers[] = await Promise.all(
            producerList.map(async i => ({
                producerCode: i.producer_code,
                producerDescription: i.producer_description,
                producerId: i.producer_id,
                cityId: i.producer_city_id,
                achievement: await this.producerService.producerReachTarget(i.producer_id),
            }))
        );
        console.log('filterProducers: ', filterProducers);

        return {
            indicators: filterIndicator,
            courses: filterCourses,
            cities: Array.from(filterCities),
            states: Array.from(filterStates),
            producers: filterProducers
        };
    }


}