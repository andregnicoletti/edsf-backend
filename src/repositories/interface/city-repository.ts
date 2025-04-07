import { CityEntity } from "@prisma/client";

export interface CityVO {
    id: string,
    city: string,
    state_id: string,
}


export interface CityRepository {
    
    findAllByFilters(company_id: string, startOfMonth: Date, endOfMonth: Date, courses: string[], indicators: string[]): Promise<CityVO[]>;

    getById(cityId: string): Promise<CityEntity | null>;

    findByIds(citiesId: string[]): Promise<CityEntity[]>;

    dashboardFilterCities(cities: string[], states: string[]): Promise<CityEntity[]>;

    findAllCitiesByName(cityName: string): Promise<CityEntity[]>

    findByNameAndUf(name: string, uf: string): Promise<CityEntity | null>

    findAll(): Promise<CityEntity[]>

}