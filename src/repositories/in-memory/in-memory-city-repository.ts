import { CityEntity } from "@prisma/client";
import { CityRepository } from "../interface/city-repository";

const repository: CityEntity[] = [
    {
        city: 'São Paulo',
        cityNormalized: 'Sao Paulo',
        id: '1',
        state_id: 'SP',
    },
    {
        city: 'Rio de Janeiro',
        cityNormalized: 'Rio de Janeiro',
        id: '2',
        state_id: 'RJ',
    },
    {
        city: 'Campinas',
        cityNormalized: 'Campinas',
        id: '3',
        state_id: 'SP',
    }
];

export class InMemoryCityRepository implements CityRepository {

    async getById(cityId: string): Promise<CityEntity | null> {
        const data = repository.find((item) => item.id === cityId);
        return data || null;
    }

    async findByIds(citiesId: string[]): Promise<CityEntity[]> {
        return repository.filter((item) => citiesId.includes(item.id));
    }

    async dashboardFilterCities(cities: string[], states: string[]): Promise<CityEntity[]> {
        return repository.filter((item) =>
            (cities.length === 0 || cities.includes(item.city)) &&
            (states.length === 0 || states.includes(item.state_id))
        );
    }

    async findAllCitiesByName(cityName: string): Promise<CityEntity[]> {
        const normalizedCityName = cityName.toLowerCase();
        return repository.filter((item) => item.city.toLowerCase().includes(normalizedCityName));
    }

    async findByNameAndUf(name: string, uf: string): Promise<CityEntity | null> {
        const data = repository.find(
            (item) => item.city.toLowerCase() === name.toLowerCase() && item.state_id.toLowerCase() === uf.toLowerCase()
        );
        return data || null;
    }

    async findAll(): Promise<CityEntity[]> {
        return repository;
    }

}