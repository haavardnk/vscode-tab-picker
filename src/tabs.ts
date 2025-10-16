import * as vscode from 'vscode';
import { TabInfo } from './types.js';
import { KEYS } from './constants.js';

export function collectTabs(): TabInfo[] {
    const tabs: TabInfo[] = [];
    const usedKeys = new Set<string>();

    for (const group of vscode.window.tabGroups.all) {
        for (let index = 0; index < group.tabs.length; index++) {
            const tab = group.tabs[index];
            const label = extractLabel(tab);
            if (!label) {
                continue;
            }

            const key = assignKey(label, usedKeys);

            if (key) {
                const info: TabInfo = { group, tab, key, index, uri: extractUri(tab) };
                tabs.push(info);
                usedKeys.add(key);

                if (usedKeys.size >= KEYS.length) {
                    return tabs;
                }
            }
        }
    }

    return tabs;
}

export function extractLabel(tab: vscode.Tab): string | undefined {
    if (tab.label) {
        return tab.label;
    }

    const input = tab.input;
    if (input instanceof vscode.TabInputText ||
        input instanceof vscode.TabInputNotebook ||
        input instanceof vscode.TabInputCustom) {
        return input.uri.path.split('/').pop() || undefined;
    }
    if (input instanceof vscode.TabInputWebview) {
        return input.viewType;
    }
}

export function extractUri(tab: vscode.Tab): vscode.Uri | undefined {
    const input = tab.input;
    if (input instanceof vscode.TabInputText ||
        input instanceof vscode.TabInputNotebook ||
        input instanceof vscode.TabInputCustom) {
        return input.uri;
    }
}

export function assignKey(filename: string, usedKeys: Set<string>): string | undefined {
    const name = filename.replace(/\.[^/.]+$/, '').toLowerCase();

    for (const char of name) {
        if (/[a-z]/.test(char) && !usedKeys.has(char) && KEYS.includes(char)) {
            return char;
        }
    }

    return KEYS.find(k => !usedKeys.has(k));
}

export async function jump(tab: TabInfo): Promise<void> {
    if (await focusGroup(tab.group)) {
        await vscode.commands.executeCommand('workbench.action.openEditorAtIndex', tab.index);
    }
}

export async function remove(tab: TabInfo): Promise<void> {
    if (await focusGroup(tab.group)) {
        await vscode.commands.executeCommand('workbench.action.openEditorAtIndex', tab.index);
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    }
}

export async function focusGroup(targetGroup: vscode.TabGroup): Promise<boolean> {
    const target = vscode.window.tabGroups.all.find(g => g.viewColumn === targetGroup.viewColumn);
    if (!target) {
        return false;
    }

    const current = vscode.window.tabGroups.activeTabGroup;
    if (current.viewColumn !== target.viewColumn) {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];
        const ordinal = ordinals[target.viewColumn - 1];
        if (ordinal) {
            await vscode.commands.executeCommand(`workbench.action.focus${ordinal}EditorGroup`);
        }
    }

    return true;
}
