# Tab Picker

Vim-style tab navigation for VS Code, inspired by [Barbar.nvim](https://github.com/romgrk/barbar.nvim)'s BufferPick. Press a key, jump to a tab.

## What It Does

Temporarily adds `[A]`, `[S]`, `[D]` letters to your tab labels. Type the letter to jump to that tab. No popups, no menus.

![tab-picker-demo](https://github.com/user-attachments/assets/8efedafa-161f-4d15-bc0d-a98917cef72d)

## Usage

### Navigate Mode
- **Trigger:** `Ctrl+'` 
- **Action:** Type a letter → Jump to tab
- **Cancel:** `ESC` or any unassigned letter

### Delete Mode
- **Trigger:** `Ctrl+Shift+'`
- **Action:** Type a letter → Close tab
- **Cancel:** `ESC` or any unassigned letter

## How It Works

Uses VS Code's `workbench.editor.customLabels.patterns` API to modify tab labels on-the-fly:

1. Saves your original labels
2. Assigns smart keys (prioritizes filename letters)
3. Applies patterns like `[A] ${filename}` to each tab
4. Intercepts keystrokes to handle selection
5. Restores original labels when done

**Smart key assignment:** Prioritizes letters from the filename first, then falls back to home row → top row → bottom row (max 26 tabs)

## Limitations

### Duplicate Tabs
When the same file is open multiple times, all instances show **all keys**:

```
[A/S] file.ts  ← Both show both keys
[A/S] file.ts
```

Press `A` → jumps to first instance  
Press `S` → jumps to second instance

**Why?** VS Code's `customLabels` uses file path as the pattern key. Same file = same pattern for all instances. No API exists to override individual tab labels.

### Other Limits
- **Untitled files** - Labels don't appear on unsaved "Untitled" files (VS Code API limitation).
- **File tabs only** - Doesn't work with terminals, webviews, or custom editors
- **26 tab maximum** - One key per letter
- **Workspace setting** - Labels temporarily modify workspace config

## Requirements

VS Code 1.105.0+

## Commands

- `Tab Picker: Navigate` - Activate navigate mode
- `Tab Picker: Delete` - Activate delete mode  
- `Tab Picker: Cleanup` - Remove leftover labels (recovery command)

## Inspiration

Based on [Barbar.nvim](https://github.com/romgrk/barbar.nvim)'s BufferPick feature.

---

**MIT License** • Made with ❤️ for Vim refugees
