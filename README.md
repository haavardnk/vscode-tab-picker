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

## Configuration

### Key Assignment Strategy

Control how keys are assigned to tabs via `tabPicker.keyAssignmentStrategy`:

- **`filename`** (default) - Assigns keys based on letters in the filename, then falls back to sequential order
  - Example: `tabs.ts` gets `t`, `picker.ts` gets `p`, `extension.ts` gets `e`
  
- **`leftHand`** - Prioritizes keys on the left side of the keyboard (ideal for left-hand navigation)
  - Order: `a, s, d, f` → `q, w, e, r, t` → `z, x, c, v` → right-hand keys as fallback
  
- **`rightHand`** - Prioritizes keys on the right side of the keyboard (ideal for right-hand navigation)
  - Order: `j, k, l, h` → `u, i, o, p, y` → `n, m` → left-hand keys as fallback
  
- **`homeRow`** - Prioritizes home row keys first (balanced, comfortable typing position)
  - Order: `a, s, d, f, g, h, j, k, l` → `q, w, e, r, t, y, u, i, o, p` → `z, x, c, v, b, n, m`

**To change the setting:**

1. Open VS Code Settings (`Cmd+,` / `Ctrl+,`)
2. Search for `Tab Picker: Key Assignment Strategy`
3. Select your preferred strategy

## Limitations

### Duplicate Tabs

When the same file is open multiple times, all instances show **all keys**:

```text
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
