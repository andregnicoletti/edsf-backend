import { FastifyReply, FastifyRequest } from "fastify";
import { makeDashboardService } from "../../../services/factories/make-dashboard-service";
import { DashboardDetailedExtract } from "../../../@types/dashboard-detailed-extract";

export const detailed = async (request: FastifyRequest<{ Body: DashboardDetailedExtract }>, response: FastifyReply) => {

    try {

        const userId = request.user.sub;
        const { cities, states, courses, monthFrom, yearFrom, monthTo, yearTo } = request.body;

        const service = makeDashboardService();
        const { data, filters } = await service.detailedExtract(userId, cities, states, courses, yearFrom, monthFrom, yearTo, monthTo);

        response.status(200).send({ status: true, data, filters });
    } catch (error) {
        if (error instanceof Error)
            return response.status(500).send({ status: false, message: error.message });
    }
}