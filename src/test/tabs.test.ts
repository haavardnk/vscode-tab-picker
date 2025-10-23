import * as assert from 'assert';
import { assignKey, extractLabel, extractUri, getKeyOrder } from '../tabs.js';
import { HOME_ROW_KEYS, LEFT_HAND_KEYS, RIGHT_HAND_KEYS } from '../constants.js';
import { KeyAssignmentStrategy } from '../types.js';
import * as vscode from 'vscode';

suite('Tabs Module Tests', () => {
    suite('assignKey', () => {
        test('should assign letter from filename', () => {
            const used = new Set<string>();
            const key = assignKey('README.md', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, 'r');
        });

        test('should skip already used keys', () => {
            const used = new Set(['r', 'e', 'a', 'd', 'm']);
            const key = assignKey('README.md', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, 's');
        });

        test('should fallback to home row keys', () => {
            const used = new Set<string>();
            const key = assignKey('123.txt', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, 'a');
        });

        test('should handle all keys used', () => {
            const used = new Set(HOME_ROW_KEYS);
            const key = assignKey('test.txt', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, undefined);
        });

        test('should prioritize filename letters in order', () => {
            const used = new Set<string>();
            const key1 = assignKey('extension.ts', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key1, 'e');

            used.add('e');
            const key2 = assignKey('extension.ts', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key2, 'x');
        });

        test('should ignore non-letter characters', () => {
            const used = new Set<string>();
            const key = assignKey('123-test.txt', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, 't');
        });

        test('should be case insensitive', () => {
            const used = new Set<string>();
            const key = assignKey('README.MD', used, KeyAssignmentStrategy.Filename, HOME_ROW_KEYS);
            assert.strictEqual(key, 'r');
        });
    });

    suite('assignKey - strategy: leftHand', () => {
        test('should prioritize left hand keys', () => {
            const used = new Set<string>();
            const key = assignKey('test.txt', used, KeyAssignmentStrategy.LeftHand, LEFT_HAND_KEYS);
            assert.strictEqual(key, 'a');
        });

        test('should follow left hand key order', () => {
            const used = new Set<string>();
            const keys: string[] = [];

            for (let i = 0; i < 5; i++) {
                const key = assignKey(`file${i}.txt`, used, KeyAssignmentStrategy.LeftHand, LEFT_HAND_KEYS);
                if (key) {
                    keys.push(key);
                    used.add(key);
                }
            }

            assert.deepStrictEqual(keys, ['a', 's', 'd', 'f', 'q']);
        });

        test('should not use filename letters in leftHand strategy', () => {
            const used = new Set<string>();
            const key = assignKey('zzz.txt', used, KeyAssignmentStrategy.LeftHand, LEFT_HAND_KEYS);
            assert.strictEqual(key, 'a');
        });

        test('should fallback to right hand keys when left exhausted', () => {
            const used = new Set(['a', 's', 'd', 'f', 'q', 'w', 'e', 'r', 't', 'z', 'x', 'c', 'v', 'g', 'b']);
            const key = assignKey('test.txt', used, KeyAssignmentStrategy.LeftHand, LEFT_HAND_KEYS);
            assert.strictEqual(key, 'h');
        });
    });

    suite('assignKey - strategy: rightHand', () => {
        test('should prioritize right hand keys', () => {
            const used = new Set<string>();
            const key = assignKey('test.txt', used, KeyAssignmentStrategy.RightHand, RIGHT_HAND_KEYS);
            assert.strictEqual(key, 'j');
        });

        test('should follow right hand key order', () => {
            const used = new Set<string>();
            const keys: string[] = [];

            for (let i = 0; i < 5; i++) {
                const key = assignKey(`file${i}.txt`, used, KeyAssignmentStrategy.RightHand, RIGHT_HAND_KEYS);
                if (key) {
                    keys.push(key);
                    used.add(key);
                }
            }

            assert.deepStrictEqual(keys, ['j', 'k', 'l', 'h', 'u']);
        });

        test('should not use filename letters in rightHand strategy', () => {
            const used = new Set<string>();
            const key = assignKey('aaa.txt', used, KeyAssignmentStrategy.RightHand, RIGHT_HAND_KEYS);
            assert.strictEqual(key, 'j');
        });
    });

    suite('assignKey - strategy: homeRow', () => {
        test('should prioritize home row keys', () => {
            const used = new Set<string>();
            const key = assignKey('test.txt', used, KeyAssignmentStrategy.HomeRow, HOME_ROW_KEYS);
            assert.strictEqual(key, 'a');
        });

        test('should follow home row order then top/bottom rows', () => {
            const used = new Set<string>();
            const keys: string[] = [];

            for (let i = 0; i < 12; i++) {
                const key = assignKey(`file${i}.txt`, used, KeyAssignmentStrategy.HomeRow, HOME_ROW_KEYS);
                if (key) {
                    keys.push(key);
                    used.add(key);
                }
            }

            assert.deepStrictEqual(keys, ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'q', 'w', 'e']);
        });

        test('should not use filename letters in homeRow strategy', () => {
            const used = new Set<string>();
            const key = assignKey('zzz.txt', used, KeyAssignmentStrategy.HomeRow, HOME_ROW_KEYS);
            assert.strictEqual(key, 'a');
        });
    });

    suite('getKeyOrder', () => {
        test('should return LEFT_HAND_KEYS for leftHand strategy', () => {
            const order = getKeyOrder(KeyAssignmentStrategy.LeftHand);
            assert.strictEqual(order, LEFT_HAND_KEYS);
        });

        test('should return RIGHT_HAND_KEYS for rightHand strategy', () => {
            const order = getKeyOrder(KeyAssignmentStrategy.RightHand);
            assert.strictEqual(order, RIGHT_HAND_KEYS);
        });

        test('should return HOME_ROW_KEYS for homeRow strategy', () => {
            const order = getKeyOrder(KeyAssignmentStrategy.HomeRow);
            assert.strictEqual(order, HOME_ROW_KEYS);
        });

        test('should return KEYS for filename strategy', () => {
            const order = getKeyOrder(KeyAssignmentStrategy.Filename);
            assert.strictEqual(order, HOME_ROW_KEYS);
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
