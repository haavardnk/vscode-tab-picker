import * as vscode from 'vscode';

export interface TabInfo {
    group: vscode.TabGroup;
    tab: vscode.Tab;
    key: string;
    index: number;
    uri?: vscode.Uri;
}

export type LabelPatterns = Record<string, string> | undefined;
