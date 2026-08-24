# Direct edit test matrix

Use this matrix during a manual pass in the Visual Editor. Every rendered fixture has a stable `data-testid` target using the ID below plus `-target`. Record observed behavior in **Result** and details in **Notes**.

| Test ID | Category | HTML tag or component | Source pattern | Expected selection behavior | Expected direct-edit behavior | Expected edit scope | Manual steps | Pass criteria | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-001 | Document & sectioning | article, header, nav, footer | JSX / semantic shell | Select each landmark | Direct edit | One source node | Select article, header, nav, and footer; edit one label | Correct landmark maps and only its label changes | Not tested. | |
| DOC-002 | Document & sectioning | section | Nested section tags | Select nested landmark | Selection only | One target | Select each nested section label | Nested target is distinguishable from wrapper | Not tested. | |
| HEAD-001 | Headings & grouping | h1 through h6 | Explicit sibling JSX | Select each heading level | Direct edit | One heading | Select every level and compare source mapping | Correct heading source is identified | Not tested. | |
| HEAD-002 | Headings & grouping | div, p, blockquote | Grouping primitives | Select quote and paragraph | Direct edit | One target | Edit quote and attribution independently | Neighboring text remains unchanged | Not tested. | |
| LIST-001 | Lists | ul, ol, dl, li, dt, dd | Mixed list topology | Select item, term, definition | All instances | Matching source instance | Select a list item, term, and definition | Repeated siblings map to intended source | Not tested. | |
| INLINE-001 | Inline semantics | strong, em, code, mark | Nested inline semantics | Select nested inline node | Direct edit | One inline node | Edit marked phrase and inline code | Surrounding sentence is preserved | Not tested. | |
| MEDIA-001 | Media | figure, img, figcaption, svg | Safe data URL fixture | Select image and caption | Selection only | One target | Select image, caption, and SVG label | No network request or layout break | Not tested. | |
| MEDIA-002 | Media | video, audio | Media controls with safe fallback | Select media boundary | Agent fallback expected | One media fixture | Focus media controls and inspect fallback | Unavailable source does not break the card | Not tested. | |
| SVG-001 | SVG | svg, path, text | Inline vector target | Select wrapper, path, label | Selection only | One vector node | Select SVG wrapper, path, and text | Vector hit-testing remains stable | Not tested. | |
| TABLE-001 | Tables | table, caption, thead, tbody, tr, th, td | Semantic data table | Select header/body cells | Direct edit | One cell | Select same-text header and body cells | Correct row/column source is identified | Not tested. | |
| FORM-001 | Forms | label, input | Controlled value + onChange | Select label and field | Direct edit | One field | Type into the controlled field | Mirror updates without reload | Not tested. | |
| FORM-002 | Forms | input, button | defaultValue + ref | Select DOM-owned field | Agent fallback expected | One field | Type, then read value through ref button | DOM value is read without navigation | Not tested. | |
| FORM-003 | Forms | form, input, button | onSubmit + preventDefault | Select form and submit target | Direct edit | One form | Submit the form | URL does not change and result updates | Not tested. | |
| INT-001 | Interactive elements | button, output | useState counter | Select button/output | Direct edit | Owning state target | Increment and decrement | Counter still works after edit | Not tested. | |
| INT-002 | Interactive elements | button, tablist, tab, panel | aria-pressed / tab state | Select toggle and active tab | All instances | State owner plus active panel | Toggle status and switch tabs | aria state and panel move together | Not tested. | |
| INT-003 | Interactive elements | accordion, menu | Disclosure and command menu | Select nested controls | Selection only | One control | Open accordion and command menu | Nested hit areas remain usable | Not tested. | |
| INT-004 | Interactive elements | details, summary, dialog | Native disclosure + state | Select summary and modal | Selection only | One surface | Open and close disclosure and dialog | Both close controls work | Not tested. | |
| SRC-001 | Nonvisual & source-only | sr-only status | Hidden source seam | Source map only | Agent fallback expected | One hidden node | Locate hidden status without layout shift | Hidden content stays visually hidden | Not tested. | |
| REACT-001 | React patterns | mapped div rows | map() / stable key | Select a repeated row | All instances | One keyed instance | Select second row, reorder it, follow its key | Identity follows stable key | Not tested. | |
| REACT-002 | React patterns | Badge component | Prop-driven custom component | Select rendered badge | Direct edit | Shared component call site | Change prop label and select badge | Prop/source ownership is clear | Not tested. | |
| STYLE-001 | Tailwind & style source | div target | Conditional className | Select target | Direct edit | One target/state branch | Switch alert and calm classes | Visual state and class source stay coupled | Not tested. | |
| STYLE-002 | Tailwind & style source | div target | Inline style object | Select target | Selection only | One style target | Move width slider and compare source | Rendered width tracks source value | Not tested. | |
| STATE-001 | Stateful demos | delayed target | setTimeout / pending shell | Select pending shell and result | Agent fallback expected | Inserted runtime content | Start delayed fixture and wait | Pending shell stays stable before insertion | Not tested. | |
| STATE-002 | Stateful demos | conditional p | Conditional JSX insertion | Select inserted node | Selection only | Runtime-inserted node | Insert runtime note | Surrounding coordinates remain stable | Not tested. | |
| STATE-003 | Stateful demos | mapped rows | add / remove / sort / reverse | Select rows through mutations | All instances | Keyed row instance | Run add, remove, sort, reverse | Selection remains stable after each mutation | Not tested. | |
| STATE-004 | Stateful demos | time text | Interval / text node | Select ticking text | Direct edit | One text node | Select between ticks | Interval continues without console errors | Not tested. | |
| HIT-001 | Difficult hit-testing | draggable rows | Pointer drag / list order | Select handle and row | Selection only | One dragged row | Drag a handle to a new slot | Card stays selectable and order updates | Not tested. | |
| HIT-002 | Difficult hit-testing | contentEditable div | Editable source island | Select editable region | Direct edit | One editable island | Edit in place and blur | Caret and source selection remain local | Not tested. | |
| HIT-003 | Difficult hit-testing | canvas | Canvas / pointer draw | Select one canvas surface | Selection only | Whole canvas | Draw two strokes | Canvas remains one stable target | Not tested. | |
| HIT-004 | Difficult hit-testing | iframe | Same-origin srcDoc island | Select iframe boundary | Agent fallback expected | Iframe document boundary | Select frame and internal button | Parent document remains safe | Not tested. | |
| HIT-005 | Difficult hit-testing | anchored overlay | Popover fallback / Escape | Select anchor and overlay | Selection only | One overlay | Open and close anchored panel | Overlay opens and closes without navigation | Not tested. | |
| HIT-006 | Difficult hit-testing | Shadow host | attachShadow / custom node | Select host; internal mapping may fail | Agent fallback expected | Shadow boundary | Select host and internal text | Boundary behavior is recorded without errors | Not tested. | |

## Manual test protocol

1. Activate Replit Visual Editor.
2. Select the target bearing the displayed test ID.
3. Confirm the correct element is highlighted.
4. Confirm whether related instances are also highlighted.
5. Attempt the change described on the card.
6. Verify the preview.
7. Discard once and verify restoration.
8. Repeat and save.
9. Inspect the resulting source file.
10. Verify only the expected source location changed.
11. Exercise the element’s interaction again.
12. Reload the application.
13. Confirm the change persisted.
14. Check the browser console and build output.
15. Record Pass, Fail, Partial, or Agent fallback in **Result**.