import { PrismaPanelRepository } from "../../repositories/prisma/prisma-panel-repository";
import { PanelService } from "../panel-service";
import { makeAuthenticateService } from "./make-authenticate-service";
import { makeCityService } from "./make-city-service";
import { makeDashboardService } from "./make-dashboard-service";

export const makePanelService = () => {

    const panelRepository = new PrismaPanelRepository();
    const authenticateService = makeAuthenticateService();
    const dashboardService = makeDashboardService();
    const citiesService = makeCityService();

    const service = new PanelService(
        panelRepository,
        authenticateService,
        dashboardService,
        citiesService
    );

    return service;

}