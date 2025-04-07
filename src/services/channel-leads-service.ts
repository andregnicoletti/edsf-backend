import { ChannelLeadsEntity } from "@prisma/client";
import { ChannelLeadsRepository } from "../repositories/interface/channel-leads-repository";

interface ChannelsServiceResponse {
    channels: ChannelLeadsEntity[]
}

export class ChannelLeadsService {

    constructor(private channelLeadsRepository: ChannelLeadsRepository) { }

    findAllChannelLeads = async (): Promise<ChannelsServiceResponse> => {
        const channels = await this.channelLeadsRepository.find();
        return { channels }
    }

}