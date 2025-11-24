import supportedEditors, { registerEditor } from './supportedEditors';

describe('Pluggable Editors', () => {
    it('should allow registering a new editor', () => {
        const MockEditor = () => <div>Mock Editor</div>;
        const newBlockType = 'test-block-type';

        expect(supportedEditors[newBlockType]).toBeUndefined();

        registerEditor(newBlockType, MockEditor);

        expect(supportedEditors[newBlockType]).toBe(MockEditor);
    });

    it('should allow overwriting an existing editor', () => {
        const MockEditor = () => <div>New Mock Editor</div>;
        const existingBlockType = 'html'; // Assuming 'html' exists

        const originalEditor = supportedEditors[existingBlockType];
        expect(originalEditor).toBeDefined();

        registerEditor(existingBlockType, MockEditor);

        expect(supportedEditors[existingBlockType]).toBe(MockEditor);

        // Restore original editor for other tests
        registerEditor(existingBlockType, originalEditor);
    });
});
