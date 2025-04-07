import { describe, expect, it } from "vitest";
import { makeChannelLeadsService } from "./make-channel-leads-service";
import { ChannelLeadsService } from "../channel-leads-service";

describe('Channel Leads Factory Tests', () => {

    it('should create chanel leads service', async () => {
        const service = await makeChannelLeadsService();
        expect(service).instanceof(ChannelLeadsService);
    });

});