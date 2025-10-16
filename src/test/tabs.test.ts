import * as assert from 'assert';
import { assignKey, extractLabel, extractUri } from '../tabs.js';
import { KEYS } from '../constants.js';
import * as vscode from 'vscode';

suite('Tabs Module Tests', () => {
    suite('assignKey', () => {
        test('should assign letter from filename', () => {
            const used = new Set<string>();
            const key = assignKey('README.md', used);
            assert.strictEqual(key, 'r');
        });

        test('should skip already used keys', () => {
            const used = new Set(['r', 'e', 'a', 'd', 'm']);
            const key = assignKey('README.md', used);
            assert.strictEqual(key, 's');
        });

        test('should fallback to home row keys', () => {
            const used = new Set<string>();
            const key = assignKey('123.txt', used);
            assert.strictEqual(key, 'a');
        });

        test('should handle all keys used', () => {
            const used = new Set(KEYS);
            const key = assignKey('test.txt', used);
            assert.strictEqual(key, undefined);
        });

        test('should prioritize filename letters in order', () => {
            const used = new Set<string>();
            const key1 = assignKey('extension.ts', used);
            assert.strictEqual(key1, 'e');

            used.add('e');
            const key2 = assignKey('extension.ts', used);
            assert.strictEqual(key2, 'x');
        });

        test('should ignore non-letter characters', () => {
            const used = new Set<string>();
            const key = assignKey('123-test.txt', used);
            assert.strictEqual(key, 't');
        });

        test('should be case insensitive', () => {
            const used = new Set<string>();
            const key = assignKey('README.MD', used);
            assert.strictEqual(key, 'r');
        });
    });

    suite('extractLabel', () => {
        test('should return tab label if present', () => {
            const mockTab = {
                label: 'My Custom Label'
            } as vscode.Tab;

            const label = extractLabel(mockTab);
            assert.strictEqual(label, 'My Custom Label');
        });

        test('should extract filename from URI path', () => {
            const mockUri = vscode.Uri.file('/path/to/file.ts');
            const mockTab = {
                label: '',
                input: new vscode.TabInputText(mockUri)
            } as vscode.Tab;

            const label = extractLabel(mockTab);
            assert.strictEqual(label, 'file.ts');
        });

        test('should return undefined for empty path', () => {
            const mockUri = vscode.Uri.file('/path/to/');
            const mockTab = {
                label: '',
                input: new vscode.TabInputText(mockUri)
            } as vscode.Tab;

            const label = extractLabel(mockTab);
            assert.strictEqual(label, undefined);
        });

        test('should handle webview tabs', () => {
            const mockTab = {
                label: '',
                input: new vscode.TabInputWebview('markdown.preview')
            } as vscode.Tab;

            const label = extractLabel(mockTab);
            assert.strictEqual(label, 'markdown.preview');
        });

        test('should return undefined for unknown tab types', () => {
            const mockTab = {
                label: '',
                input: {} as any
            } as vscode.Tab;

            const label = extractLabel(mockTab);
            assert.strictEqual(label, undefined);
        });
    });

    suite('extractUri', () => {
        test('should extract URI from text input', () => {
            const mockUri = vscode.Uri.file('/path/to/file.ts');
            const mockTab = {
                input: new vscode.TabInputText(mockUri)
            } as vscode.Tab;

            const uri = extractUri(mockTab);
            assert.strictEqual(uri?.fsPath, mockUri.fsPath);
        });

        test('should return undefined for webview input', () => {
            const mockTab = {
                input: new vscode.TabInputWebview('markdown.preview')
            } as vscode.Tab;

            const uri = extractUri(mockTab);
            assert.strictEqual(uri, undefined);
        });

        test('should return undefined for unknown input', () => {
            const mockTab = {
                input: {} as any
            } as vscode.Tab;

            const uri = extractUri(mockTab);
            assert.strictEqual(uri, undefined);
        });
    });
});
