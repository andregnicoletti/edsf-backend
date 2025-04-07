import { ServiceError } from "../errors/service-error";
import { GoalIndicatorRepository } from "../repositories/interface/goal-indicator-repository";
import { ProducerService } from "./producer-service";
import { IndicatorService } from "./indicator-service";
import { GoalIndicatorServiceErrors } from "../errors/code-errors";
import { t } from "i18next";
import logger from "../config/logger";

export class GoalIndicatorService {

    constructor(
        private goalIndicatorRepository: GoalIndicatorRepository,
        private producerService: ProducerService,
        private indicatorService: IndicatorService,

    ) {
        // Iniciar o intervalo para calcular o progresso periodicamente
        this.startPeriodicCalculation();
    }

    findGoalByCode = async (code: string) => {
        const goal = await this.goalIndicatorRepository.findByCode(code);
        if (!goal) {
            throw new ServiceError(t('messages.goal_code_does_not_exist', { code }),
                GoalIndicatorServiceErrors.ERROR_GOAL_CODE_DOESNT_EXISTIS);
        }
        return { goal }
    }

    createNewGoal = async (
        goalCode: string,
        producerCode: string,
        indicatorCode: string,
        goalYear: string,
        goal: string,
        percentageAccomplished: number) => {

        //validações
        if (!goalCode) {
            throw new ServiceError(t('messages.indicator_goal_is_required'),
                GoalIndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED)
        } else if (!producerCode) {
            throw new ServiceError(t('messages.producer_code_is_required'),
                GoalIndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED)
        } else if (!indicatorCode) {
            throw new ServiceError(t('messages.indicator_code_is_required'),
                GoalIndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED)
        } else if (!goalYear) {
            throw new ServiceError(t('messages.year_goal_is_required'),
                GoalIndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED)
        } else if (!goal) {
            throw new ServiceError(t('messages.goal_is_required'),
                GoalIndicatorServiceErrors.ERROR_FIELD_IS_REQUIRED)
        } else if (goalCode.length > 4) {
            throw new ServiceError(t('messages.goal_code_must_have_four_characters_or_less'),
                GoalIndicatorServiceErrors.ERROR_GOAL_CODE_SIZE)
        } else if (isNaN(Number(goalYear)) || !Number.isInteger(Number(goalYear))) {
            throw new ServiceError(t('messages.year_goal_must_be_a_number'),
                GoalIndicatorServiceErrors.ERROR_INVALID_FIELD)
        } else if (isNaN(Number(goal)) || !Number.isInteger(Number(goal))) {
            throw new ServiceError(t('messages.goal_value_is_invalid'),
                GoalIndicatorServiceErrors.ERROR_INVALID_FIELD)
        }

        const { indicator } = await this.indicatorService.findIndicatorByCode(indicatorCode);
        const { producer } = await this.producerService.findProducerByCode(producerCode);

        let goalEntity;
        try {
            goalEntity = await this.findGoalByCode(goalCode);

        } catch (_error) {
            //ignora erro
        }

        if (goalEntity && goalEntity.goal) {
            throw new ServiceError(t('messages.indicator_goal_code_already_exists', { goalCode }),
                GoalIndicatorServiceErrors.ERROR_GOAL_CODE_ALREADY_EXISTS)
        }

        const entity = await this.goalIndicatorRepository.save({
            code: goalCode,
            goal: parseFloat(goal),
            goalYear,
            percentageAccomplished,
            indicatorId: indicator.id,
            producerId: producer.id
        });

        return { goal: entity }
    }

    calculatePercentageRealized = async () => {
        logger.info('Iniciando o cálculo de percentuais realizados.');

        //buscar todos os CAD_INDICADOR_META
        const allGoalIndicators = await this.goalIndicatorRepository.findAll();

        for (const goalIndicator of allGoalIndicators) {
            const { goalYear, indicatorId, producerId, goal } = goalIndicator;

            try {
                // try - se não existir o indicatorValue alertar mais não parar processo
                // Buscar o valor do indicador
                const indicatorData = await this.indicatorService.getSumValueIndicatorById(goalYear, indicatorId, producerId);

                if (!indicatorData || indicatorData.indicatorValue === undefined) {
                    // Logar caso não haja valor de indicador
                    logger.warn(t('messages.there_is_not_indicator_value_to_goal', {
                        info: `Indicator value not found for goalYear: ${goalYear}, indicatorId: ${indicatorId}, producerId: ${producerId}`
                    }));
                    continue; // Pular para o próximo indicador
                }

                const { indicatorValue } = indicatorData;

                const percentRealized = (Number(indicatorValue) / Number(goal)) * 100;
                // const percentRealized = (100 * Number(goal)) / Number(indicatorValue);   
                logger.info(`goal: ${goal}, indicatorValue: ${indicatorValue}, percent realized: ${percentRealized} %`);

                // Salva o calculo na tabela cad_indicador_meta
                await this.goalIndicatorRepository.updatePercentAccomplished(
                    goalIndicator.goalYear,
                    goalIndicator.indicatorId,
                    goalIndicator.producerId,
                    percentRealized
                );

            } catch (error) {
                if (error instanceof Error) {
                    logger.warn(t('messages.there_is_not_indicator_value_to_goal', { info: error.message }));
                }
            };
        }
    }

    // Método para iniciar a execução periódica
    private startPeriodicCalculation = () => {
        const intervalTime = 1000 * 60 * 60; // 1 hora em milissegundos
        setInterval(() => {
            this.calculatePercentageRealized()
                .then(() => logger.info('Cálculo de porcentagem realizado com sucesso'))
                .catch((error) => logger.error(`Erro ao executar cálculo periódico: ${error.message}`));
        }, intervalTime);
    }
}

