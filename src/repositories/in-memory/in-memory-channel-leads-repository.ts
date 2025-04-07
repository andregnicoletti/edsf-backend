import { ChannelLeadsEntity } from "@prisma/client";
import { randomUUID } from "crypto";
import { ChannelLeadsRepository } from "../interface/channel-leads-repository";

export class InMemoryChannelLeadsRepository implements ChannelLeadsRepository {

    public itens: ChannelLeadsEntity[] = [
        {
            id: randomUUID(),
            channelName: 'Redes sociais',
        },
        {
            id: randomUUID(),
            channelName: 'Eventos',
        },
        {
            id: randomUUID(),
            channelName: 'Indicação de parceiro'
        }
    ];

    async find(): Promise<ChannelLeadsEntity[]> {
        return this.itens;
    }

}