import { FastifyReply, FastifyRequest } from "fastify";
import { makeDashboardService } from "../../../services/factories/make-dashboard-service";
import { DashboardStackedColumnChart } from "../../../@types/dashboard-stacked-column-chart";

export const lineChart = async (request: FastifyRequest<{ Body: DashboardStackedColumnChart }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { cities, courses, sort, states, total, yearFrom, monthFrom, yearTo, monthTo, indicators } = request.body.filters;

        const service = makeDashboardService();
        const result = await service.lineChart(userId, sort, total, courses, states, cities, indicators, yearFrom, monthFrom, yearTo, monthTo);

        response.status(200).send({ status: true, filter: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}