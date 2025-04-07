import { ServiceError } from "../errors/service-error";
import { CityServiceErrors } from "../errors/code-errors";
import { CityEntity } from "@prisma/client";
import { CityRepository } from "../repositories/interface/city-repository";
import { t } from "i18next";
import { AuthenticateService } from "./authenticate-service";

interface CityServiceResponse {
    city: CityEntity
}

interface FindCitiesByName {
    id: string,
    city: string,
    state: string,
}

export class CityService {

    constructor(
        private cityRepository: CityRepository,
        private authenticateService: AuthenticateService,
    ) { }

    findCityByNameAndUf = async (cityName: string, uf: string): Promise<CityServiceResponse> => {

        if (!cityName) {
            throw new ServiceError(t("messages.city_name_is_required"), CityServiceErrors.ERROR_CITY_NAME_IS_REQUIRED);
        } else if (!uf) {
            throw new ServiceError(t("messages.state_name_is_required"), CityServiceErrors.ERROR_UF_IS_REQUIRED);
        } else if (uf.trim().length > 2) {
            throw new ServiceError(t("messages.state_name_is_required"), CityServiceErrors.ERROR_UF_SIZE);
        }

        const city = await this.cityRepository.findByNameAndUf(cityName, uf);

        if (!city) {
            throw new ServiceError(t("messages.city_does_not_exist", { cityName, uf }), CityServiceErrors.ERROR_FIND_CITY_BY_NAME_AND_UF);
        }

        return { city }

    }

    listAllCities = async () => {
        return await this.cityRepository.findAll();
    }

    listAllCitiesByFilters = async (userId: string, startOfMonth: Date, endOfMonth: Date, courses: string[], indicators: string[]) => {
        const { company_id } = await this.authenticateService.getProfile(userId);
        return await this.cityRepository.findAllByFilters(company_id, startOfMonth, endOfMonth, courses, indicators);
    }

    findCityByName = async (cityName: string): Promise<FindCitiesByName[]> => {

        const result = await this.cityRepository.findAllCitiesByName(cityName);

        const cities: FindCitiesByName[] = [];

        result.forEach(item => {
            cities.push({ id: item.id, city: item.city, state: item.state_id });
        })

        return Promise.resolve(cities);
    }

    getCities = async (cities: string[], ufs: string[]) => {
        return await this.cityRepository.dashboardFilterCities(cities, ufs)
    }

    findAll = async () => {
        return await this.cityRepository.findAll();
    }

    listCitiesNameByCitiesIds = async (citiesId: string[]) => {
        const cities = await this.cityRepository.findByIds(citiesId);
        return cities.map(city => city.city);
    }

    getCity = async (cityId: string) => {
        const city = await this.cityRepository.getById(cityId);
        if (!city) {
            throw new ServiceError(t("messages.city_id_not_found", { cityId }), CityServiceErrors.ERROR_FIND_CITY_BY_ID);
        }
        return city;
    }
}