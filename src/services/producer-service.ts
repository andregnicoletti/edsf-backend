import { ProducerRepository } from "../repositories/interface/producer-repository";
import { ProducerServiceErrors } from "../errors/code-errors";
import { ProducerEntity } from "@prisma/client";
import { ServiceError } from "../errors/service-error";
import { CityService } from "./city-service";
import { CompanyService } from "./company-service";
import { t } from "i18next";
import { AuthenticateService } from "./authenticate-service";
import { ProducerStats } from "./panel-service";

interface ProducerServiceResponse {
    producer: ProducerEntity
}

export class ProducerService {

    constructor(
        private producerRepository: ProducerRepository,
        private cityService: CityService,
        private companyService: CompanyService,
        private authenticateService: AuthenticateService,
    ) { }

    findProducerByCode = async (code: string): Promise<ProducerServiceResponse> => {
        const producer = await this.producerRepository.findByCode(code);
        if (producer == null) {
            throw new ServiceError(t("messages.producer_with_code_does_not_exist", { code }),
                ProducerServiceErrors.ERROR_FIND_PRODUCER_BY_ID);
        }
        return { producer }
    }

    listAllProducers = async () => {
        const allProducers = await this.producerRepository.findAll();
        console.log(allProducers)
        return allProducers;
    }

    createNewProducer = async (producerCode: string, companyCode: string, city: string, uf: string, description?: string) => {

        if (!producerCode) {
            throw new ServiceError(t("messages.producer_code_is_required"),
                ProducerServiceErrors.ERROR_PRODUCER_CODE_IS_REQUIRED);
        } else if (producerCode.trim() === "") {
            throw new ServiceError(t("messages.producer_code_cannot_be_empty"),
                ProducerServiceErrors.ERROR_PRODUCER_CODE_EMPTY);
        } else if (producerCode.length > 4) {
            throw new ServiceError(t("messages.producer_code_must_have_4_characters_or_less"),
                ProducerServiceErrors.ERROR_PRODUCER_CODE_SIZE);
        } else if (!description) {
            throw new ServiceError(t("messages.producer_description_is_required"),
                ProducerServiceErrors.ERROR_PRODUCER_DESCRIPTION_IS_REQUIRED);
        } else if (description && description.length > 20) {
            throw new ServiceError(t("messages.producer_description_must_have_20_characters_or_less"),
                ProducerServiceErrors.ERROR_PRODUCER_DESCRIPTION_SIZE);
        } else if (!companyCode) {
            throw new ServiceError(t("messages.company_is_required"),
                ProducerServiceErrors.ERROR_COMPANY_CODE_IS_REQUIRED);
        } else if (companyCode.trim() === "") {
            throw new ServiceError(t("messages.company_code_cannot_be_empty"),
                ProducerServiceErrors.ERROR_COMPANY_CODE_EMPTY);
        }

        let producer;
        try {
            producer = await this.findProducerByCode(producerCode)
        } catch (_error) {
            //ignora erro
        }

        if (producer) {
            throw new ServiceError(t("messages.producer_with_code_already_exists", { producerCode }),
                ProducerServiceErrors.ERROR_PRODUCER_CODE_ALREADY_EXISTS)
        }

        const cityEntity = await this.cityService.findCityByNameAndUf(city, uf);

        const companyEntity = await this.companyService.findCompanyByCode(companyCode);

        const newProducer = await this.producerRepository.save({
            city_id: cityEntity.city.id,
            company_id: companyEntity.company.id,
            code: producerCode,
            description
        });

        return newProducer;
    }

    listProducerByCity = async (userId: string, cityName: string) => {
        const { company_id } = await this.authenticateService.getProfile(userId);

        const cities = await this.cityService.findCityByName(cityName);

        const ids = cities.map(item => {
            return item.id;
        });

        return await this.producerRepository.findProducerByCities(company_id, ids);
    }

    listProducerByCityId = async (companyId: string, cityId: string) => {
        return await this.producerRepository.findProducerByCityId(companyId, cityId);
    }

    getProducerById = async (producerId: string) => {
        const producer = await this.producerRepository.getById(producerId);
        if (!producer) {
            throw new ServiceError(`Producer with id ${producerId} not found.`, ProducerServiceErrors.ERROR_PRODUCER_ID_DOES_NOT_EXISTS)
        }
        return producer;
    }

    listProducerByCompanyId = async (companyId: string) => {
        return this.producerRepository.findAllByCompany(companyId);
    }

    listProducerByCompanyIds = async (companiesIds: string[]) => {
        return this.producerRepository.findAllByCompanies(companiesIds);
    }

    countProducerByCityId = async (cityId: string) => {
        return await this.producerRepository.countByCity(cityId);
    }

    listCitiesWhereThereAreProducers = async (companyId: string) => {
        const producers = await this.producerRepository.findAllByCompaniesDistinctByCityAndState(companyId);
        return producers.map(producer => producer.city_id);
    }

    listProducerByCityIds = async (userId: string, ids: string[]) => {
        const result: ProducerStats[] = [];
        const { company_id } = await this.authenticateService.getProfile(userId);

        console.log(ids);

        for (const id of ids) {
            const producers = await this.listProducerByCityId(company_id, id);

            for (const producer of producers) {
                const achievement = await this.producerReachTarget(producer.id);
                const prodStat: ProducerStats = {
                    cityId: producer.city_id,
                    producerCode: producer.code,
                    producerId: producer.id,
                    producerDescription: producer.description,
                    city: producer.city.city,
                    state: producer.city.state_id,
                    achievement,
                    value: 0            // não precisa exibir esse valor % aqui
                }
                result.push(prodStat)
            }
        };
        return result;
    }

    producerReachTarget = async (producerId: string) => {
        let achievement = false;
        const producersWithGoal = await this.producerRepository.getById(producerId);
        if (producersWithGoal) {
            producersWithGoal.goalIndicator.forEach(item => {
                if (Number(item.percentageAccomplished) >= 100) {
                    achievement = true;
                }
            })
        }
        return achievement
    }

    findProducersByFilter = async (companyId: string, cities: string[], states: string[]) => {
        const citiesFilter = await this.cityService.getCities(cities, states);
        const citiesId = citiesFilter.map(c => c.id);
        return await this.producerRepository.findProducerByCities(companyId, citiesId)
    }

    listAllProducerByFilters = async (userId: string, startOfMonth: Date, endOfMonth: Date, indicators: string[] = [], citiesId: string[]) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        return await this.producerRepository.findAllByFilters(company_id, startOfMonth, endOfMonth, indicators, citiesId);
    }

}