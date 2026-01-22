import { jest } from '@jest/globals';

// Define mocks
jest.unstable_mockModule('@google-cloud/vision', () => ({
    ImageAnnotatorClient: jest.fn(),
    __esModule: true // This helps Jest treat it as module that has named exports?
    // Actually the error "module does not provide export default" was in ocrService.test.js line 9, referring to OCR SERVICE IMPORT?
    // "The requested module '@google-cloud/vision' does not provide an export named 'default'"
    // Oh, the error trace in previous turn said line 9: `import ocrService ...`
    // Wait, the error message in the previous step was: "SyntaxError: The requested module '@google-cloud/vision' does not provide an export named 'default'" 
    // BUT the stack trace pointed to `tests/unit/services/ocrService.test.js:9:33` which is `const { default: ocrService } = ...`
    // This implies that `ocrService.js` is failing to evaluate because IT tries to import `default` from google-vision?
    // Let's re-read `ocrService.js` content from step 382.
    // It has `import { ImageAnnotatorClient } from '@google-cloud/vision';`
    // This is correct ESM.
    // However, if the MOCK in the test file is returning an object, Jest mock system needs to satisfy that named import.
}));


// The error persists. Let's look at the failure again.
// "SyntaxError: The requested module '@google-cloud/vision' does not provide an export named 'default'"
// If `ocrService.js` (compiled/evaluated) has `import img from ...` -> default import.
// I FIXED `ocrService.js` in step 382 to use named import.
// BUT the test failure was AFTER that fix.
// MAYBE the test mock definition is wrong?
// It says `const { ImageAnnotatorClient } = await import('@google-cloud/vision');` in test works?
// Ah wait, `ocrService.js` MIGHT still have an issue if I messed up the replacement.
// Let's replace the mock definition to be safe.
jest.unstable_mockModule('@google-cloud/vision', () => {
    return {
        ImageAnnotatorClient: jest.fn(),
        default: { ImageAnnotatorClient: jest.fn() } // Cover both bases just in case
    };
});

const { ImageAnnotatorClient } = await import('@google-cloud/vision');
const { default: ocrService } = await import('../../../src/services/ocrService.js');

describe('OcrService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('analyzeImage', () => {
        it('should return extracted fields (Mock)', async () => {
            // Mocking the behavior since we won't have real creds in test env usually
            // The service is expected to fallback to mock if client fails or isn't configured
            const mockBuffer = Buffer.from('fake-image');
            
            const result = await ocrService.analyzeImage(mockBuffer);
            
            expect(result).toHaveProperty('idNumber');
            expect(result).toHaveProperty('firstName');
            expect(result).toHaveProperty('lastName');
            expect(result.idNumber).toMatch(/^\d{13}$/); // basic thai ID regex
        });
    });
});
