# StatusDot

## Source evidence

- `artifacts/react-visual-editor-torture-test/src/App.tsx`: live compatibility
  marker in the lab shell and footer fixture.
- `artifacts/react-visual-editor-torture-test/src/index.css`: `.status-dot`
  and `.status-dot.live`, including the primary halo.

## Contract

Use a seven-pixel circular marker for binary runtime status. The live state
uses the primary color and a subtle three-pixel halo; inactive state uses the
secondary foreground.