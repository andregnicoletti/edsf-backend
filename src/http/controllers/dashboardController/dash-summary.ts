import { FastifyReply, FastifyRequest } from "fastify";
import { makeDashboardService } from "../../../services/factories/make-dashboard-service";
import { DashboardSummary } from "../../../@types/dashboard-summary";

export const summary = async (request: FastifyRequest<{ Body: DashboardSummary }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { cities, states, courses, indicators, producers, yearFrom, monthFrom, yearTo, monthTo } = request.body;

        const service = makeDashboardService();
        const result = await service.summary(userId, cities, states, courses, indicators, producers, yearFrom, monthFrom, yearTo, monthTo);

        response.status(200).send({ status: true, filter: result });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}