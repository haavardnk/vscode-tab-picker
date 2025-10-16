import * as vscode from 'vscode';
import { TabInfo } from './types.js';
import { collectTabs, jump, remove } from './tabs.js';
import { applyLabels, restoreLabels } from './labels.js';

let context: vscode.ExtensionContext;
let statusBar: vscode.StatusBarItem;
let active = false;
let deleteMode = false;
let tabMap = new Map<string, TabInfo>();

export function initialize(ctx: vscode.ExtensionContext, status: vscode.StatusBarItem): void {
    context = ctx;
    statusBar = status;
}

export function isActive(): boolean {
    return active;
}

export async function show(isDeleteMode = false): Promise<void> {
    deleteMode = isDeleteMode;

    if (active) {
        updateStatusBar();
        return;
    }
    active = true;

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        await vscode.window.showTextDocument(activeEditor.document, { preserveFocus: false });
    }

    const tabs = collectTabs();
    tabMap.clear();
    for (const tab of tabs) {
        tabMap.set(tab.key, tab);
    }
    await applyLabels(tabs);

    await vscode.commands.executeCommand('setContext', 'tabPickerActive', true);
    await context.workspaceState.update('tabPickerActive', true);

    updateStatusBar();
    statusBar.show();
}

export async function handleKey(text: string): Promise<void> {
    const key = text.toLowerCase();
    const tab = tabMap.get(key);

    if (tab) {
        deleteMode ? await remove(tab) : await jump(tab);
        await hide();
    } else if (/^[a-z]$/.test(key)) {
        await hide();
    }
}

export async function hide(): Promise<void> {
    await restoreLabels();

    statusBar.hide();
    active = false;
    deleteMode = false;

    await vscode.commands.executeCommand('setContext', 'tabPickerActive', false);
    await context.workspaceState.update('tabPickerActive', false);

    tabMap.clear();
}

function updateStatusBar(): void {
    const mode = deleteMode ? 'DELETE' : 'NAVIGATE';
    const action = deleteMode ? 'delete' : 'open';
    statusBar.text = `$(keyboard) Tab Picker [${mode}] - Type a letter to ${action} tab or ESC to cancel`;
}
