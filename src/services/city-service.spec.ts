import { beforeEach, describe, expect, it } from "vitest";
import { CityService } from "./city-service";
import { InMemoryCityRepository } from "../repositories/in-memory/in-memory-city-repository";
import { ServiceError } from "../errors/service-error";

let service: CityService;

describe('City Service Tests', () => {

    beforeEach(() => {
        const repository = new InMemoryCityRepository();
        service = new CityService(repository);
    });

    it('should return all cities', async () => {
        const list = await service.findAll();
        console.log('findAll:', list);

        expect(list.length).toBeGreaterThanOrEqual(1);
    });

    it('should return a list of cities by name', async () => {
        const cityName: string = 'Rio';

        const list = await service.findCityByName(cityName);
        console.log('findCityByName:', list);

        expect(list.length).toBeGreaterThanOrEqual(1);
    });

    it('should return a city by name and state', async () => {
        const cityName: string = 'Campinas';
        const state: string = 'SP';

        const { city } = await service.findCityByNameAndUf(cityName, state);
        console.log('findCityByNameAndUf:', city);

        expect(city.city).equals(cityName);
    });

    it('should return an error if city name is empty', async () => {
        const cityName: string = '';
        const state: string = 'SP';
        await expect(service.findCityByNameAndUf(cityName, state)).rejects.toThrowError(ServiceError);
    });

    it('should return an error if state is empty', async () => {
        const cityName: string = 'Campinas';
        const state: string = '';
        await expect(service.findCityByNameAndUf(cityName, state)).rejects.toThrowError(ServiceError);
    });

    it('should return an error if state is wrong', async () => {
        const cityName: string = 'Campinas';
        const state: string = 'XSP';
        await expect(service.findCityByNameAndUf(cityName, state)).rejects.toThrowError(ServiceError);
    });

    it('should return an error if city is not found', async () => {
        const cityName: string = 'Campinas';
        const state: string = 'RJ';
        await expect(service.findCityByNameAndUf(cityName, state)).rejects.toThrowError(ServiceError);
    });

    it('should return an error if city id not found', async () => {
        const cityId: string = '0';
        await expect(service.getCity(cityId)).rejects.toThrowError(ServiceError);
    });

    it('should return a list of cities by names of cities and names of states', async () => {
        const cities: string[] = ['Campinas', 'São Paulo'];
        const states: string[] = ['SP'];

        const list = await service.getCities(cities, states);
        console.log('getCities:', list);

        expect(list.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all cities', async () => {
        const list = await service.listAllCities();
        console.log('listAllCities:', list);

        expect(list.length).toBeGreaterThanOrEqual(1);
    });

    it('should find cities by a city id list', async () => {
        const citiesId: string[] = ['1', '3'];

        const list = await service.listCitiesNameByCitiesIds(citiesId);
        console.log('listCitiesNameByCitiesIds:', list);

        expect(list.length).equal(2);
    });

    it('should return a cities by id', async () => {
        const citieId = '1';

        const city = await service.getCity(citieId);
        console.log('getCity:', city);

        expect(city.id).equal(citieId);
    });

});