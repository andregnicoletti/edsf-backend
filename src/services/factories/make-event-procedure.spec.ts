import { describe, expect, it } from "vitest";
import { makeEventProcedure } from "./make-event-procedure";
import { EventProcedure } from "../../events/event";

describe('Event procedure Factory Tests', () => {

    it('should create event procedure service', async () => {
        const service = await makeEventProcedure();
        expect(service).instanceof(EventProcedure);
    });

});