import { describe, expect, it } from "vitest";
import { makePanelService } from "./make-panel-service";
import { PanelService } from "../panel-service";

describe('Panel Factory Tests', () => {

    it('should create panel service', async () => {
        const service = await makePanelService();
        expect(service).instanceof(PanelService);
    });

});