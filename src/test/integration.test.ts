import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Integration Tests', () => {
    let extension: vscode.Extension<any>;
    const isActive = () => extension.exports.isPickerActive();
    const handleKey = (key: string) => extension.exports.handleKey(key);
    const getKey = (label: string) => label.match(/^\[([a-z])\]/i)?.[1].toLowerCase() || 'd';

    suiteSetup(async function () {
        extension = vscode.extensions.getExtension('haavardnk.tab-picker')!;
        if (!extension.isActive) {
            await extension.activate();
        }
        const doc = await vscode.workspace.openTextDocument({ content: 'Test content' });
        await vscode.window.showTextDocument(doc);
    });

    setup(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        if (isActive()) {
            await vscode.commands.executeCommand('tab-picker.cancel');
        }
    });

    suiteTeardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await vscode.commands.executeCommand('tab-picker.cleanup');
    });

    test('Extension should activate', () => {
        assert.ok(extension);
        assert.ok(extension.isActive);
    });

    test('Should activate picker with command', async () => {
        assert.strictEqual(isActive(), false);
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.strictEqual(isActive(), true);
        await vscode.commands.executeCommand('tab-picker.cancel');
        assert.strictEqual(isActive(), false);
    });

    test('Should handle delete mode', async () => {
        assert.strictEqual(isActive(), false);
        await vscode.commands.executeCommand('tab-picker.deleteTab');
        assert.strictEqual(isActive(), true);
        await vscode.commands.executeCommand('tab-picker.cancel');
        assert.strictEqual(isActive(), false);
    });

    test('Should handle cleanup command', async () => {
        await vscode.commands.executeCommand('tab-picker.cleanup');
        assert.strictEqual(isActive(), false);
    });

    test('Should toggle between modes', async () => {
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.cancel');
        await vscode.commands.executeCommand('tab-picker.deleteTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.cancel');
        assert.strictEqual(isActive(), false);
    });

    test('Should handle multiple activations', async () => {
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.cancel');
        assert.strictEqual(isActive(), false);
    });

    test('Should navigate to tab by key', async () => {
        const doc1 = await vscode.workspace.openTextDocument({ content: 'Document 1' });
        const doc2 = await vscode.workspace.openTextDocument({ content: 'Document 2' });
        const doc3 = await vscode.workspace.openTextDocument({ content: 'Document 3' });
        await vscode.window.showTextDocument(doc1);
        await vscode.window.showTextDocument(doc2);
        await vscode.window.showTextDocument(doc3);

        assert.strictEqual(vscode.window.activeTextEditor?.document, doc3);
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await new Promise(resolve => setTimeout(resolve, 150));

        const key = getKey(vscode.window.tabGroups.all.flatMap(g => g.tabs)[0].label);
        await handleKey(key);

        assert.strictEqual(isActive(), false);
        assert.strictEqual(vscode.window.activeTextEditor?.document, doc1);
    });

    test('Should delete tab by key', async () => {
        const doc1 = await vscode.workspace.openTextDocument({ content: 'Document 1' });
        const doc2 = await vscode.workspace.openTextDocument({ content: 'Document 2' });
        await vscode.window.showTextDocument(doc1);
        await vscode.window.showTextDocument(doc2);

        assert.strictEqual(vscode.window.tabGroups.all.reduce((sum, g) => sum + g.tabs.length, 0), 2);
        await vscode.commands.executeCommand('tab-picker.deleteTab');
        assert.ok(isActive());
        await new Promise(resolve => setTimeout(resolve, 150));

        const key = getKey(vscode.window.tabGroups.all.flatMap(g => g.tabs)[0].label);
        await handleKey(key);

        assert.strictEqual(isActive(), false);
        assert.strictEqual(vscode.window.tabGroups.all.reduce((sum, g) => sum + g.tabs.length, 0), 1);
    });

    test('Should switch modes while picker is active', async () => {
        const doc1 = await vscode.workspace.openTextDocument({ content: 'Document 1' });
        const doc2 = await vscode.workspace.openTextDocument({ content: 'Document 2' });
        await vscode.window.showTextDocument(doc1);
        await vscode.window.showTextDocument(doc2);

        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.deleteTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.pickTab');
        assert.ok(isActive());
        await vscode.commands.executeCommand('tab-picker.cancel');
        assert.strictEqual(isActive(), false);
    });
});
