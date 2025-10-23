import * as vscode from 'vscode';

export enum KeyAssignmentStrategy {
    Filename = 'filename',
    LeftHand = 'leftHand',
    RightHand = 'rightHand',
    HomeRow = 'homeRow'
}

export type LabelPatterns = Record<string, string> | undefined;

export interface TabInfo {
    group: vscode.TabGroup;
    tab: vscode.Tab;
    key: string;
    index: number;
    uri?: vscode.Uri;
}
