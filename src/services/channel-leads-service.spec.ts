
import { beforeEach, describe, expect, it } from 'vitest'
import { ChannelLeadsService } from './channel-leads-service';
import { InMemoryChannelLeadsRepository } from '../repositories/in-memory/in-memory-channel-leads-repository';

let service: ChannelLeadsService;

describe('Channel leads service', () => {

    beforeEach(() => {
        const repository = new InMemoryChannelLeadsRepository();
        service = new ChannelLeadsService(repository)
    });

    it('should get all channel leads', async () => {
        const data = await service.findAllChannelLeads();
        expect(data.channels.map(i => i.channelName)).toEqual(['Redes sociais', 'Eventos', 'Indicação de parceiro'])
    });

});