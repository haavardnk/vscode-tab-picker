# Change Log

## [0.2.0] - 2025-10-23

### Added

- Configurable key assignment strategies via `tabPicker.keyAssignmentStrategy` setting

  - **Filename** (default) - Assigns keys based on letters in the filename
  - **Left Hand** - Prioritizes keys on the left side of the keyboard
  - **Right Hand** - Prioritizes keys on the right side of the keyboard
  - **Home Row** - Prioritizes home row keys first

## [0.1.0] - 2025-10-16

### Added

- Navigate mode (`Ctrl+'`) - Jump to tabs by letter
- Delete mode (`Ctrl+Shift+'`) - Close tabs by letter
- Smart key assignment from filenames
- Multi-pane support with auto-focus
- Duplicate tab handling
- Status bar mode indicators
- Auto-cancel on ESC or unassigned keys
- Cleanup recovery command

Inspired by [Barbar.nvim](https://github.com/romgrk/barbar.nvim). Requires VS Code 1.105.0+.
