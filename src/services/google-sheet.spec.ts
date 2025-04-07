
import { beforeEach, describe, expect, it } from 'vitest'
import { GoogleSheetService } from './google-sheet';

let service: GoogleSheetService;

describe('Google Sheet Service', () => {

    beforeEach(() => {
        service = new GoogleSheetService();
    });

    it('should get metadata from the sheet', async () => {
        const auth = await service.getAuth()
        expect(service.metadata(auth)).resolves.toEqual(expect.any(Object))
    });

    it('should get read values from the sheet', async () => {
        const auth = await service.getAuth()
        expect(service.readSheet(auth)).resolves.toEqual(expect.any(Object))

    });

});