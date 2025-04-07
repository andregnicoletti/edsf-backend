import { FastifyReply, FastifyRequest } from "fastify";
import { makeChannelLeadsService } from "../../../services/factories/make-channel-leads-service";

export const getLeadsChannel = async (_request: FastifyRequest, response: FastifyReply) => {

    const channelService = makeChannelLeadsService();
    const data = await channelService.findAllChannelLeads();

    response.status(200).send(data);

}