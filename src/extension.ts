import * as vscode from 'vscode';
import * as picker from './picker.js';
import { cleanupLabels } from './labels.js';

export async function activate(context: vscode.ExtensionContext) {
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	await vscode.commands.executeCommand('setContext', 'tabPickerActive', false);

	await cleanupLabels(context);
	picker.initialize(context, statusBar);

	context.subscriptions.push(
		statusBar,
		vscode.commands.registerCommand('tab-picker.pickTab', async () => await picker.show(false)),
		vscode.commands.registerCommand('tab-picker.deleteTab', async () => await picker.show(true)),
		vscode.commands.registerCommand('tab-picker.cleanup', async () => {
			await cleanupLabels(context);
			vscode.window.showInformationMessage('Tab Picker: Cleanup completed!');
		}),
		vscode.commands.registerCommand('tab-picker.keyPress', (args) =>
			picker.isActive() && args?.key && picker.handleKey(args.key)
		),
		vscode.commands.registerCommand('tab-picker.cancel', async () => await picker.hide())
	);

	return {
		isPickerActive: () => picker.isActive(),
		handleKey: (key: string) => picker.handleKey(key)
	};
}

export async function deactivate() {
	if (picker.isActive()) {
		await picker.hide();
	}
}
