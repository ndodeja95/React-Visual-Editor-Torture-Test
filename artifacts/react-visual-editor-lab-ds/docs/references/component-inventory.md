# React Visual Editor Lab primitive inventory

Source: `artifacts/react-visual-editor-torture-test`

The source app is a single client-side lab rather than a standalone component
library. This normalized inventory captures the reusable visual primitives that
can be safely consumed by other lab and documentation surfaces. Product-specific
fixture compositions, navigation, and state remain in the source app.

| Family | Reference | Source evidence | Dependencies | Chunk | Status |
|---|---|---|---|---|---|
| LabButton | `components/lab-button.md` | `App.tsx` control actions; `index.css` `.control-button` | token CSS only | 1 | implemented |
| LabCard | `components/lab-card.md` | `App.tsx` `TestCard`; `index.css` `.test-card` | token CSS only | 1 | implemented |
| LabInput | `components/lab-input.md` | `App.tsx` form controls; `index.css` `.control-input` | token CSS only | 1 | implemented |
| SourceChip | `components/source-chip.md` | `App.tsx` source-pattern metadata; `index.css` `.source-chip` | token CSS only | 1 | implemented |
| StatusDot | `components/status-dot.md` | `App.tsx` compatibility/live indicator; `index.css` `.status-dot` | token CSS only | 1 | implemented |

## Runtime contract

- Client-side React/Vite package with no backend or database.
- Space Grotesk is the sans/UI family and IBM Plex Mono is the technical family.
- Both light and dark modes are supported; dark is the primary visual mode.
- Focus-visible controls use a two-layer background-plus-primary ring.
- Reusable primitives must consume generated token variables rather than copying
  palette values.

## Later chunks

There are no later source-backed component chunks. The source app's semantic
fixture patterns (`article`, `hgroup`, `pre`, `select`, `slot`, and related
elements) are test content, not reusable visual components.