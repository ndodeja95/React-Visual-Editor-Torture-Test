# LabButton

## Source evidence

- `artifacts/react-visual-editor-torture-test/src/App.tsx`: repeated
  `button.control-button` actions in the command bar and fixture cards.
- `artifacts/react-visual-editor-torture-test/src/index.css`: `.control-button`,
  `.control-button:hover`, `.control-button:active`, `.control-button.primary`,
  and `.control-button.ghost`.

## Contract

Compact inline-flex action with default, primary, and ghost variants. Preserve
visible hover, one-pixel active movement, disabled browser behavior, and the
source app's five-pixel control radius.