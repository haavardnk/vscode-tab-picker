import * as vscode from 'vscode';
import { TabInfo, LabelPatterns } from './types.js';

let originalLabels: LabelPatterns;

export async function applyLabels(tabs: TabInfo[]): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    originalLabels = config.get('workbench.editor.customLabels.patterns');

    const tabsByUri = new Map<string, TabInfo[]>();
    for (const tab of tabs) {
        if (tab.uri) {
            const uri = tab.uri.scheme === 'file' ? tab.uri.fsPath : tab.uri.toString();
            if (!tabsByUri.has(uri)) {
                tabsByUri.set(uri, []);
            }
            tabsByUri.get(uri)!.push(tab);
        }
    }

    const customLabels: LabelPatterns = {};
    for (const [uri, tabs] of tabsByUri) {
        const keys = tabs.map(t => t.key.toUpperCase()).join('/');
        customLabels[uri] = `[${keys}] \${filename}`;
    }

    const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
    await config.update('workbench.editor.customLabels.patterns', customLabels, target);
    await new Promise(resolve => setTimeout(resolve, 100));
}

export async function restoreLabels(): Promise<void> {
    const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
    await vscode.workspace.getConfiguration().update(
        'workbench.editor.customLabels.patterns',
        originalLabels,
        target
    );
}

export async function cleanupLabels(context: vscode.ExtensionContext): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const labels = config.get('workbench.editor.customLabels.patterns') as any;
    const wasActive = context.workspaceState.get('tabPickerActive', false);

    const hasPickerPattern = labels && typeof labels === 'object' &&
        Object.values(labels).some((p: any) =>
            typeof p === 'string' && /^\[([A-Z]|[A-Z]\/[A-Z]+)\]\s+\$\{filename\}$/.test(p)
        );

    if (hasPickerPattern || wasActive) {
        const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
        await config.update('workbench.editor.customLabels.patterns', {}, target);
        await context.workspaceState.update('tabPickerActive', false);
    }
}
