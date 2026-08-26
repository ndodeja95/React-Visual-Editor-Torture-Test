import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity,
  ArrowDownAZ,
  ArrowUpDown,
  Beaker,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Code2,
  Filter,
  GripVertical,
  Layers3,
  Menu,
  Moon,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import * as THREE from 'three';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type FilterMode =
  | 'all'
  | 'direct-edit'
  | 'fallback'
  | 'all-instance'
  | 'selection-only'
  | 'stateful'
  | 'media'
  | 'form'
  | 'svg'
  | 'difficult';

type CatalogItem = {
  id: string;
  title: string;
  category: string;
  pattern: string;
  expected: 'Direct edit' | 'Fallback' | 'All instances' | 'Selection only' | 'Agent fallback expected';
  filters: FilterMode[];
  instruction: string;
};

const catalog: CatalogItem[] = [
  { id: 'HEAD-001', title: 'Heading ladder', category: 'Headings & grouping', pattern: 'h1 → h6 siblings', expected: 'All instances', filters: ['all-instance'], instruction: 'Select each heading level and compare source mapping for repeated heading tags.' },
  { id: 'HEAD-002', title: 'Grouping primitives', category: 'Headings & grouping', pattern: 'div / p / blockquote', expected: 'Direct edit', filters: ['direct-edit'], instruction: 'Try editing the callout quote and paragraph independently. The attribution must remain stable.' },
  { id: 'PARA-001', title: 'Standalone paragraph', category: 'Headings & grouping', pattern: 'literal p element', expected: 'Direct edit', filters: ['direct-edit'], instruction: 'Select this paragraph as a standalone source target, edit its text, then verify the neighboring note stays unchanged.' },
  { id: 'HEAD-003', title: 'Heading group', category: 'Headings & grouping', pattern: 'hgroup / heading + summary', expected: 'Direct edit', filters: ['direct-edit'], instruction: 'Select the heading and supporting summary inside the hgroup. Verify the group boundary remains clear.' },
  { id: 'LIST-001', title: 'List topology', category: 'Lists', pattern: 'ul / ol / dl', expected: 'All instances', filters: ['all-instance'], instruction: 'Select a list item, term, and definition. Check whether repeated siblings map to their own source nodes.' },
  { id: 'INLINE-001', title: 'Inline semantics', category: 'Inline semantics', pattern: 'strong / em / code / mark', expected: 'Direct edit', filters: ['direct-edit'], instruction: 'Edit the marked phrase and the inline code separately. Preserve the surrounding sentence.' },
  { id: 'MEDIA-001', title: 'Safe media fixture', category: 'Media', pattern: 'data URL / figure', expected: 'Selection only', filters: ['media', 'selection-only'], instruction: 'Select the image, figcaption, and SVG label. No network request should be needed.' },
  { id: 'MEDIA-002', title: 'Media controls', category: 'Media', pattern: 'video / audio controls', expected: 'Fallback', filters: ['media', 'fallback'], instruction: 'Focus the media controls and inspect the fallback text. Confirm an unavailable source does not break the card.' },
  { id: 'SVG-001', title: 'Inline vector target', category: 'SVG', pattern: 'svg / path / text', expected: 'Selection only', filters: ['svg', 'selection-only'], instruction: 'Select the SVG wrapper, path, and text label separately. Compare vector hit-testing with HTML.' },
  { id: 'TABLE-001', title: 'Data table', category: 'Tables', pattern: 'caption / thead / tbody', expected: 'All instances', filters: ['all-instance'], instruction: 'Select a header cell and a body cell with the same text. Compare their source locations.' },
  { id: 'FORM-001', title: 'Controlled field', category: 'Forms', pattern: 'React value + onChange', expected: 'Direct edit', filters: ['form', 'direct-edit'], instruction: 'Type into the controlled field. Its mirrored value should update without a reload.' },
  { id: 'FORM-002', title: 'Uncontrolled field', category: 'Forms', pattern: 'defaultValue + ref', expected: 'Fallback', filters: ['form', 'fallback'], instruction: 'Type a value, then read it through the ref button. The DOM owns the value.' },
  { id: 'FORM-003', title: 'Submit prevention', category: 'Forms', pattern: 'onSubmit preventDefault', expected: 'Direct edit', filters: ['form', 'direct-edit'], instruction: 'Submit the form. The URL must not change; the result should record the submitted value.' },
  { id: 'FORM-004', title: 'Datalist suggestions', category: 'Forms', pattern: 'input list / datalist', expected: 'Selection only', filters: ['form', 'selection-only'], instruction: 'Focus the input and open its suggestions. Select the datalist and option source nodes separately.' },
  { id: 'FORM-005', title: 'Multiline textarea', category: 'Forms', pattern: 'textarea / controlled value', expected: 'Direct edit', filters: ['form', 'direct-edit'], instruction: 'Edit multiple lines in the textarea and verify the line count updates without navigation.' },
  { id: 'FORM-006', title: 'Grouped select options', category: 'Forms', pattern: 'select / optgroup / option', expected: 'Selection only', filters: ['form', 'selection-only'], instruction: 'Open the select and inspect the select, optgroup, and option source hierarchy.' },
  { id: 'INT-001', title: 'Counter ownership', category: 'Interactive elements', pattern: 'useState / button', expected: 'Direct edit', filters: ['stateful', 'direct-edit'], instruction: 'Increment and decrement the counter. Verify only the owning target changes.' },
  { id: 'INT-002', title: 'Toggle and tabs', category: 'Interactive elements', pattern: 'aria-pressed / tablist', expected: 'All instances', filters: ['stateful', 'all-instance'], instruction: 'Toggle the status, then switch tabs. Active state and panel content should move together.' },
  { id: 'INT-003', title: 'Disclosure controls', category: 'Interactive elements', pattern: 'accordion / select menu', expected: 'Selection only', filters: ['stateful', 'selection-only'], instruction: 'Open the accordion and the command menu. Test nested hit areas and Escape-friendly focus.' },
  { id: 'INT-004', title: 'Details and dialog', category: 'Interactive elements', pattern: 'details / dialog state', expected: 'Selection only', filters: ['stateful', 'selection-only'], instruction: 'Open the details disclosure and modal. Close both using their explicit controls.' },
  { id: 'SRC-001', title: 'Source-only seam', category: 'Nonvisual & source-only', pattern: 'sr-only / data attribute', expected: 'Fallback', filters: ['fallback'], instruction: 'Use the source map to locate the visually hidden status. It should not create a visible layout shift.' },
  { id: 'SRC-002', title: 'Noscript source example', category: 'Nonvisual & source-only', pattern: 'escaped noscript markup', expected: 'Fallback', filters: ['fallback'], instruction: 'Inspect the escaped noscript example. It must remain source documentation, never a live selectable noscript node.' },
  { id: 'REACT-003', title: 'Slot boundary', category: 'React patterns', pattern: 'slot / fallback content', expected: 'Agent fallback expected', filters: ['fallback'], instruction: 'Select the slot host and fallback content. Record whether the editor understands native slot semantics outside Shadow DOM.' },
  { id: 'REACT-001', title: 'Repeated ownership', category: 'React patterns', pattern: 'map() / stable key', expected: 'All instances', filters: ['all-instance'], instruction: 'Select the second repeated row, then reorder it. The instance identity should follow its key.' },
  { id: 'REACT-002', title: 'Prop boundary', category: 'React patterns', pattern: 'Custom Badge component', expected: 'Direct edit', filters: ['direct-edit'], instruction: 'Change the prop-driven label via the control and select the rendered badge. Compare prop/source ownership.' },
  { id: 'STYLE-001', title: 'Class source switch', category: 'Tailwind & style source', pattern: 'className conditional', expected: 'Direct edit', filters: ['direct-edit', 'stateful'], instruction: 'Switch the class-driven target between alert and calm. Inspect the changing class source.' },
  { id: 'STYLE-002', title: 'Inline style source', category: 'Tailwind & style source', pattern: 'style={{ }} object', expected: 'Selection only', filters: ['selection-only'], instruction: 'Move the inline style slider. The source object and rendered width should stay correlated.' },
  { id: 'STATE-001', title: 'Suspense-like delay', category: 'Stateful demos', pattern: 'setTimeout / pending shell', expected: 'Fallback', filters: ['stateful', 'fallback'], instruction: 'Start the delayed fixture. Observe the stable pending shell before content is inserted.' },
  { id: 'STATE-002', title: 'Inserted state content', category: 'Stateful demos', pattern: 'conditional JSX insertion', expected: 'Selection only', filters: ['stateful', 'selection-only'], instruction: 'Insert the runtime note. It should appear without changing surrounding target coordinates.' },
  { id: 'STATE-003', title: 'List mutations', category: 'Stateful demos', pattern: 'add / remove / sort / reverse', expected: 'All instances', filters: ['stateful', 'all-instance'], instruction: 'Add, remove, sort, and reverse rows. Check selection stability across every mutation.' },
  { id: 'STATE-004', title: 'Ticking text', category: 'Stateful demos', pattern: 'interval / text node', expected: 'Direct edit', filters: ['stateful', 'direct-edit'], instruction: 'Watch the timestamp change. Try selecting the text between ticks.' },
  { id: 'HIT-001', title: 'Drag and reorder', category: 'Difficult hit-testing', pattern: 'pointer drag / list order', expected: 'Selection only', filters: ['difficult', 'stateful', 'selection-only'], instruction: 'Drag a handle to a new slot. The handle is the intended hit target; the card remains selectable.' },
  { id: 'HIT-002', title: 'Editable island', category: 'Difficult hit-testing', pattern: 'contentEditable div', expected: 'Direct edit', filters: ['difficult', 'direct-edit'], instruction: 'Edit the note in place, then blur it. Source selection should not swallow caret interactions.' },
  { id: 'HIT-003', title: 'Canvas surface', category: 'Difficult hit-testing', pattern: 'canvas / pointer draw', expected: 'Selection only', filters: ['difficult', 'selection-only'], instruction: 'Draw two strokes. The canvas is one stable target despite its internal pixels.' },
  { id: 'HIT-004', title: 'srcDoc island', category: 'Difficult hit-testing', pattern: 'iframe srcDoc', expected: 'Fallback', filters: ['difficult', 'fallback'], instruction: 'Select the iframe boundary and its internal button. The parent document should remain safe.' },
  { id: 'HIT-005', title: 'Popover fallback', category: 'Difficult hit-testing', pattern: 'anchored overlay / Escape', expected: 'Selection only', filters: ['difficult', 'selection-only'], instruction: 'Open the anchored panel, then close it. Check overlay selection and outside-click behavior.' },
  { id: 'HIT-006', title: 'Shadow boundary', category: 'Difficult hit-testing', pattern: 'attachShadow / custom node', expected: 'Fallback', filters: ['difficult', 'fallback'], instruction: 'Select the shadow host and its internal text. Record whether the source map crosses the boundary.' },
];

const categories = [
  'Headings & grouping',
  'Lists',
  'Inline semantics',
  'Media',
  'SVG',
  'Tables',
  'Forms',
  'Interactive elements',
  'Nonvisual & source-only',
  'React patterns',
  'Tailwind & style source',
  'Stateful demos',
  'Difficult hit-testing',
];

const imageFixture = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="160" viewBox="0 0 480 160"><rect width="480" height="160" fill="#162338"/><path d="M0 126L88 72l58 42 76-79 98 91 64-40 96 40v34H0z" fill="#f26b45"/><circle cx="106" cy="47" r="24" fill="#f3c969"/><path d="M0 18h480" stroke="#9bc9b9" stroke-width="2" opacity=".6"/></svg>`)}`;

const initialRows = ['Source node', 'Repeated node', 'Moved node'];

type TestCardProps = CatalogItem & { children: ReactNode; result?: string };

function TestCard({ id, title, pattern, expected, instruction, children, result }: TestCardProps) {
  return (
    <article className="test-card rounded-lg p-4" id={`card-${id}`} data-testid={`card-${id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
        <div>
          <div className="mono text-[11px] font-semibold text-[hsl(var(--primary))]" data-testid={`text-id-${id}`}>{id}</div>
          <h3 className="mt-1 text-[15px] font-semibold tracking-[-.02em]" data-testid={`text-title-${id}`}>{title}</h3>
        </div>
        <span className="rounded-full border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.1)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#2cf233]" data-testid={`badge-expected-${id}`}>{expected}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 pl-2">
        <span className="source-chip mono rounded px-2 py-1 text-[10px]" data-testid={`text-pattern-${id}`}>{pattern}</span>
      </div>
      <div className="target-well mt-4 min-h-[74px] rounded-md p-3" data-testid={`${id}-target`}>{children}</div>
      <div className="mt-3 grid gap-2 border-t border-[hsl(var(--border))] pt-3 pl-2 text-xs">
        <div className="flex gap-2 text-[hsl(var(--muted-foreground))]"><CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" /><span>{instruction}</span></div>
        {result && <div className="mono flex gap-2 text-[11px] text-[hsl(var(--secondary-foreground))]" data-testid={`result-${id}`}><Check className="h-3.5 w-3.5 shrink-0" />{result}</div>}
      </div>
    </article>
  );
}

function AppShell() {
  const [dark, setDark] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [matrix, setMatrix] = useState(false);
  const [activity, setActivity] = useState<string[]>(['Lab ready. Runtime state is clean.']);
  const [counter, setCounter] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [activeTab, setActiveTab] = useState('markup');
  const [accordion, setAccordion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [controlled, setControlled] = useState('editable signal');
  const [textareaValue, setTextareaValue] = useState('First source line\nSecond source line');
  const [selectedOption, setSelectedOption] = useState('stable');
  const uncontrolledRef = useRef<HTMLInputElement>(null);
  const [uncontrolledRead, setUncontrolledRead] = useState('No read yet');
  const [submitted, setSubmitted] = useState('Awaiting submit');
  const [badgeLabel, setBadgeLabel] = useState('prop: stable');
  const [classAlert, setClassAlert] = useState(false);
  const [styleWidth, setStyleWidth] = useState(64);
  const [delayed, setDelayed] = useState<'idle' | 'pending' | 'done'>('idle');
  const [inserted, setInserted] = useState(false);
  const [rows, setRows] = useState(initialRows);
  const [tick, setTick] = useState(new Date());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editable, setEditable] = useState('Click twice: this is a live source island.');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const footerCanvasRef = useRef<HTMLCanvasElement>(null);

  const log = (message: string) => setActivity((current) => [`${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}  ${message}`, ...current].slice(0, 8));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const host = shadowRef.current;
    if (!host || host.shadowRoot) return;
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `:host{display:block;font-family:ui-monospace,monospace;color:#162338}span{display:inline-block;border:1px solid #9bc9b9;background:#e6f0eb;border-radius:4px;padding:6px 8px;font-size:11px}`;
    const span = document.createElement('span');
    span.textContent = 'shadow text boundary';
    shadow.append(style, span);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#f7f5ed';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#f26b45';
    context.lineWidth = 3;
    context.lineCap = 'round';
  }, []);

  useEffect(() => {
    const canvas = footerCanvasRef.current;
    if (!canvas) return;

    const probe = document.createElement('canvas');
    const webglAvailable = Boolean(
      probe.getContext('webgl2') ?? probe.getContext('webgl'),
    );

    if (!webglAvailable) {
      const context = canvas.getContext('2d');
      if (!context) return;
      let frame = 0;
      const drawFallback = () => {
        const width = Math.max(canvas.clientWidth, 150);
        const height = Math.max(canvas.clientHeight, 32);
        const scale = Math.min(window.devicePixelRatio, 1.5);
        if (canvas.width !== width * scale || canvas.height !== height * scale) {
          canvas.width = width * scale;
          canvas.height = height * scale;
          context.setTransform(scale, 0, 0, scale, 0, 0);
        }
        const time = performance.now() * 0.001;
        context.clearRect(0, 0, width, height);
        context.strokeStyle = 'rgba(155, 201, 185, .72)';
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(width / 2, height / 2, 26, 9, time * 0.35, 0, Math.PI * 2);
        context.stroke();
        context.strokeStyle = 'rgba(242, 107, 69, .8)';
        context.beginPath();
        context.arc(
          width / 2 + Math.cos(time * 1.8) * 17,
          height / 2 + Math.sin(time * 1.8) * 7,
          8,
          0,
          Math.PI * 2,
        );
        context.stroke();
        frame = window.requestAnimationFrame(drawFallback);
      };
      drawFallback();
      return () => window.cancelAnimationFrame(frame);
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.z = 5.4;

    const field = new THREE.Group();
    const orange = new THREE.MeshBasicMaterial({
      color: 0xf26b45,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const mint = new THREE.MeshBasicMaterial({
      color: 0x9bc9b9,
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.76, 1), orange);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.018, 8, 48), mint);
    orbit.rotation.set(0.8, 0.3, 0.2);
    field.add(core, orbit);
    scene.add(field);

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 150);
      const height = Math.max(canvas.clientHeight, 32);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const animate = () => {
      if (!reduceMotion) {
        core.rotation.x += 0.004;
        core.rotation.y += 0.009;
        orbit.rotation.z -= 0.006;
        field.rotation.y = Math.sin(performance.now() * 0.0006) * 0.12;
      }
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      core.geometry.dispose();
      orbit.geometry.dispose();
      orange.dispose();
      mint.dispose();
      renderer.dispose();
    };
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesFilter = filter === 'all' || item.filters.includes(filter);
      const matchesSearch = !query || `${item.id} ${item.title} ${item.category} ${item.pattern}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const visibleByCategory = useMemo(() => categories.map((category) => ({
    category,
    items: visible.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0), [visible]);

  const reset = () => {
    setCounter(0); setToggle(false); setActiveTab('markup'); setAccordion(false); setMenuOpen(false);
    setControlled('editable signal'); setTextareaValue('First source line\nSecond source line'); setSelectedOption('stable'); setUncontrolledRead('No read yet'); setSubmitted('Awaiting submit');
    setBadgeLabel('prop: stable'); setClassAlert(false); setStyleWidth(64); setDelayed('idle'); setInserted(false);
    setRows(initialRows); setEditable('Click twice: this is a live source island.'); setDialogOpen(false); setPopoverOpen(false);
    setActivity(['Lab reset. Runtime state is clean.']); setMobileNav(false);
  };

  const scrollToCategory = (category: string) => {
    document.getElementById(`section-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileNav(false);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || event.buttons !== 1) return;
    const bounds = canvas.getBoundingClientRect();
    context.lineTo((event.clientX - bounds.left) * (canvas.width / bounds.width), (event.clientY - bounds.top) * (canvas.height / bounds.height));
    context.stroke();
  };

  const filterOptions: { id: FilterMode; label: string }[] = [
    { id: 'all', label: 'All cases' }, { id: 'direct-edit', label: 'Direct edit' },
    { id: 'fallback', label: 'Fallback' }, { id: 'all-instance', label: 'All-instance' },
    { id: 'selection-only', label: 'Selection-only' }, { id: 'stateful', label: 'Stateful' },
    { id: 'media', label: 'Media' }, { id: 'form', label: 'Form' },
    { id: 'svg', label: 'SVG' }, { id: 'difficult', label: 'Difficult hit' },
  ];

  return (
    <div className="lab-shell">
      <aside className={`lab-sidebar ${mobileNav ? '!fixed !inset-y-0 !left-0 !z-70 !block !w-[280px]' : ''}`}>
        <div className="flex items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-5 py-5">
          <div>
            <div className="eyebrow text-[hsl(var(--sidebar-primary))]">Field notebook / 01</div>
            <div className="mt-2 flex items-center gap-2 text-base font-bold"><Beaker className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />V.E. torture test</div>
          </div>
          {mobileNav && <button className="control-button ghost !text-[hsl(var(--sidebar-foreground))]" onClick={() => setMobileNav(false)} data-testid="button-close-mobile-nav" aria-label="Close navigation"><X className="h-4 w-4" /></button>}
        </div>
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between px-1 text-[10px] uppercase tracking-[.14em] text-[hsl(var(--sidebar-foreground)/.55)]"><span>Protocol map</span><span className="mono">{catalog.length} cases</span></div>
          <nav className="grid gap-1" aria-label="Test categories">
            {categories.map((category, index) => (
              <button key={category} className="group flex items-center gap-2 rounded px-2 py-2 text-left text-xs text-[hsl(var(--sidebar-foreground)/.72)] transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]" onClick={() => scrollToCategory(category)} data-testid={`nav-category-${index}`}>
                <span className="mono w-5 text-[10px] text-[hsl(var(--sidebar-primary)/.82)]">{String(index + 1).padStart(2, '0')}</span><span>{category}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 hidden border-t border-[hsl(var(--sidebar-border))] p-4 lg:block">
          <div className="mono text-[10px] leading-5 text-[hsl(var(--sidebar-foreground)/.55)]">SELECT / MAP / EDIT<br />A compatibility lab for source-aware tooling.</div>
        </div>
      </aside>

      <main className="lab-main">
        <header className="command-bar">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
            <button className="control-button ghost mobile-only" onClick={() => setMobileNav(true)} data-testid="button-open-mobile-nav" aria-label="Open navigation"><Menu className="h-4 w-4" /></button>
            <div className="relative min-w-[220px] flex-1 md:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input className="control-input pl-9" type="search" placeholder="Find a test ID, tag, or pattern" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-search" aria-label="Search test cases" />
            </div>
            <div className="flex items-center gap-2">
              <span className="eyebrow hidden text-[hsl(var(--muted-foreground))] sm:inline">View</span>
              <button className={`control-button ${!matrix ? 'primary' : ''}`} onClick={() => setMatrix(false)} data-testid="button-grid-view"><Layers3 className="h-3.5 w-3.5" />Grid</button>
              <button className={`control-button ${matrix ? 'primary' : ''}`} onClick={() => setMatrix(true)} data-testid="button-matrix-view"><ClipboardCheck className="h-3.5 w-3.5" />Matrix</button>
              <button className="control-button ghost" onClick={() => setDark((value) => !value)} data-testid="button-theme-toggle" aria-label="Toggle theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              <button className="control-button ghost" onClick={reset} data-testid="button-reset-runtime"><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span></button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          <section className="hero-grid relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.74)] p-5 sm:p-7 lg:p-9" data-testid="section-lab-intro">
            <div className="relative z-10 max-w-3xl">
              <div className="eyebrow flex items-center gap-2 text-[hsl(var(--primary))]"><span className="status-dot live" />Compatibility lab / client-side only</div>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[.98] tracking-[-.06em] sm:text-6xl">Break the editor<br /><span className="text-[hsl(var(--primary))]">before users do.</span></h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">A deliberate set of source-mapping traps for React 19, TypeScript, Vite, and Tailwind. Select an element. Edit it. Move it. Make it appear.</p>
            </div>
             <span className="absolute right-24 top-12 z-20 h-5 w-5 rounded-full bg-green-400 ring-4 ring-green-300/20 shadow-[0_0_18px_6px_rgba(74,222,128,0.7)]" data-testid="hero-glow" role="img" aria-label="Glowing green status indicator" />
            <div className="absolute -right-8 -top-8 hidden h-56 w-56 rotate-12 border-[20px] border-[hsl(var(--primary)/.16)] sm:block" aria-hidden="true" />
            <div className="mt-7 grid max-w-3xl grid-cols-2 gap-2 border-t border-[hsl(var(--border))] pt-4 sm:grid-cols-4">
              <div><div className="mono text-xl font-semibold text-[hsl(var(--primary))]">{catalog.length}</div><div className="eyebrow mt-1 text-[hsl(var(--muted-foreground))]">test cases</div></div>
              <div><div className="mono text-xl font-semibold">13</div><div className="eyebrow mt-1 text-[hsl(var(--muted-foreground))]">categories</div></div>
              <div><div className="mono text-xl font-semibold">0</div><div className="eyebrow mt-1 text-[hsl(var(--muted-foreground))]">network deps</div></div>
              <div><div className="mono text-xl font-semibold text-[hsl(var(--secondary-foreground))]">19</div><div className="eyebrow mt-1 text-[hsl(var(--muted-foreground))]">react target</div></div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="rounded-lg border border-[hsl(var(--primary)/.38)] bg-[hsl(var(--primary)/.07)] p-5" data-testid="section-manual-protocol">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-[hsl(var(--primary))] p-2 text-[hsl(var(--primary-foreground))]"><MousePointer2 className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="eyebrow text-[hsl(var(--primary))]">Manual protocol</div>
                  <h2 className="mt-1 text-lg font-semibold">One pass. Three questions.</h2>
                  <div className="mt-3 grid gap-2 text-sm text-[hsl(var(--muted-foreground))] sm:grid-cols-3">
                    <div><span className="mono mr-2 text-[hsl(var(--primary))]">01</span>Can I select the intended node?</div>
                    <div><span className="mono mr-2 text-[hsl(var(--primary))]">02</span>Does source mapping land on the JSX?</div>
                    <div><span className="mono mr-2 text-[hsl(var(--primary))]">03</span>Does the target survive state?</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.74)] p-5" data-testid="section-interaction-log">
              <div className="flex items-center justify-between"><div className="eyebrow text-[hsl(var(--muted-foreground))]">Interaction log</div><Activity className="h-4 w-4 text-[hsl(var(--primary))]" /></div>
              <div className="mt-3 grid gap-1.5">
                {activity.slice(0, 4).map((entry, index) => <div key={`${entry}-${index}`} className="log-row mono truncate pl-2 text-[10px] text-[hsl(var(--muted-foreground))]" data-testid={`log-entry-${index}`}>{entry}</div>)}
              </div>
            </div>
          </section>

          <section className="mt-8" data-testid="section-filters">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><div className="eyebrow text-[hsl(var(--primary))]">Test matrix / live filter</div><h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">{visible.length} visible cases</h2></div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><Filter className="h-3.5 w-3.5" /><span>Stable targets, explicit IDs</span></div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="toolbar" aria-label="Filter test cases">
              {filterOptions.map((option) => <button key={option.id} className="filter-pill shrink-0 rounded-full px-3 py-1.5 text-xs" data-active={filter === option.id} onClick={() => setFilter(option.id)} data-testid={`filter-${option.id}`}>{option.label}</button>)}
            </div>
          </section>

          {!matrix ? (
            <div className="mt-5 grid gap-8">
              {visibleByCategory.map(({ category, items }) => (
                <section key={category} id={`section-${category}`} className="scroll-mt-24" data-testid={`section-${category}`}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="eyebrow text-[hsl(var(--primary))]">{String(categories.indexOf(category) + 1).padStart(2, '0')}</div>
                    <h2 className="text-lg font-semibold tracking-[-.03em]">{category}</h2>
                    <span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{items.length} {items.length === 1 ? 'case' : 'cases'}</span>
                    <div className="h-px flex-1 bg-[hsl(var(--border))]" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                      if (item.id === 'HEAD-001') return <TestCard key={item.id} {...item}><div className="space-y-1" data-testid="HEAD-001-target-heading-ladder"><h1 className="text-xl font-bold">Heading one</h1><h2 className="text-base font-semibold">Heading two</h2><h3 className="text-sm font-semibold">Heading three</h3><h4 className="text-xs font-semibold">Heading four</h4></div></TestCard>;
                      if (item.id === 'HEAD-002') return <TestCard key={item.id} {...item}><div data-testid="HEAD-002-target-group"><p className="text-xs">A paragraph with a clear grouping boundary.</p><blockquote className="mt-2 border-l-2 border-[hsl(var(--primary))] pl-3 text-xs italic">“Map the node, not the noise.”</blockquote><cite className="mt-1 block text-[10px] text-[hsl(var(--muted-foreground))]">— protocol note</cite></div></TestCard>;
                      if (item.id === 'PARA-001') return <TestCard key={item.id} {...item} result="Standalone paragraph target"><div className="grid gap-2"><p className="rounded border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--accent)/.18)] p-3 text-sm leading-6" data-testid="PARA-001-target-paragraph">A paragraph with its own source boundary.<br />This second line stays inside the same paragraph element for direct-edit testing.</p><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]" data-testid="PARA-001-neighbor">neighboring note remains separate</span></div></TestCard>;
                      if (item.id === 'HEAD-003') return <TestCard key={item.id} {...item}><hgroup className="rounded border border-[hsl(var(--border))] p-3" data-testid="HEAD-003-target-hgroup"><h3 className="text-base font-semibold">Grouped heading</h3><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Supporting summary inside one hgroup.</p></hgroup></TestCard>;
                      if (item.id === 'LIST-001') return <TestCard key={item.id} {...item}><div className="grid grid-cols-3 gap-3 text-xs" data-testid="LIST-001-target-lists"><ul className="list-disc pl-4"><li>unordered</li><li>siblings</li></ul><ol className="list-decimal pl-4"><li>ordered</li><li>sequence</li></ol><dl><dt className="font-semibold">term</dt><dd className="text-[hsl(var(--muted-foreground))]">definition</dd></dl></div></TestCard>;
                      if (item.id === 'INLINE-001') return <TestCard key={item.id} {...item}><p className="text-sm" data-testid="INLINE-001-target-inline">Select <strong>strong signal</strong>, <em>quiet emphasis</em>, <code className="rounded bg-[hsl(var(--muted))] px-1 py-0.5 text-[11px]">node.id</code>, or <mark className="bg-[hsl(var(--accent))] px-1">marked seam</mark>.</p></TestCard>;
                      if (item.id === 'MEDIA-001') return <TestCard key={item.id} {...item}><figure className="flex items-center gap-3" data-testid="MEDIA-001-target-figure"><img className="h-16 w-40 rounded object-cover" src={imageFixture} alt="Abstract orange mountain fixture" data-testid="img-media-fixture" /><figcaption className="text-xs"><strong>Local fixture</strong><br /><span className="text-[hsl(var(--muted-foreground))]">SVG data URL · no network</span></figcaption></figure></TestCard>;
                      if (item.id === 'MEDIA-002') return <TestCard key={item.id} {...item}><div data-testid="MEDIA-002-target-controls" className="grid gap-2"><video className="h-8 w-full rounded bg-[hsl(var(--sidebar))]" controls aria-label="Unavailable local video fixture" /><audio className="w-full" controls aria-label="Unavailable local audio fixture" /><p className="text-[10px] text-[hsl(var(--muted-foreground))]">Fallback: media source intentionally omitted.</p></div></TestCard>;
                      if (item.id === 'SVG-001') return <TestCard key={item.id} {...item}><svg viewBox="0 0 320 76" className="h-20 w-full" role="img" aria-label="Inline vector fixture" data-testid="SVG-001-target-svg"><rect x="1" y="1" width="318" height="74" rx="5" fill="hsl(164 30% 78% / .45)" stroke="hsl(222 18% 80%)" /><path d="M20 56L76 20l40 24 44-30 50 42 30-18 40 18" fill="none" stroke="hsl(17 88% 56%)" strokeWidth="5" strokeLinecap="round" /><text x="20" y="18" fill="hsl(222 31% 17%)" fontSize="10" fontFamily="monospace">vector / selectable nodes</text></svg></TestCard>;
                      if (item.id === 'TABLE-001') return <TestCard key={item.id} {...item}><table className="w-full text-left text-xs" data-testid="TABLE-001-target-table"><caption className="mb-2 text-left text-[10px] text-[hsl(var(--muted-foreground))]">Selector coverage sample</caption><thead><tr><th className="pb-2 font-semibold">Node</th><th className="pb-2 font-semibold">Mode</th><th className="pb-2 font-semibold">Result</th></tr></thead><tbody><tr><td className="border-t border-[hsl(var(--border))] py-2">heading</td><td className="border-t border-[hsl(var(--border))] py-2">direct</td><td className="border-t border-[hsl(var(--border))] py-2 text-[hsl(var(--secondary-foreground))]">ready</td></tr><tr><td className="py-2">portal</td><td className="py-2">fallback</td><td className="py-2 text-[hsl(var(--muted-foreground))]">observe</td></tr></tbody></table></TestCard>;
                      if (item.id === 'FORM-001') return <TestCard key={item.id} {...item} result={`Controlled value: ${controlled}`}><label className="grid gap-2 text-xs" data-testid="FORM-001-target-label">Controlled value<input className="control-input" value={controlled} onChange={(event) => { setControlled(event.target.value); log('FORM-001 controlled value changed'); }} data-testid="input-controlled" /></label><div className="mono text-[10px] text-[hsl(var(--muted-foreground))]">mirror → {controlled}</div></TestCard>;
                      if (item.id === 'FORM-002') return <TestCard key={item.id} {...item} result={uncontrolledRead}><label className="grid gap-2 text-xs" data-testid="FORM-002-target-label">Uncontrolled value<input className="control-input" defaultValue="DOM-owned signal" ref={uncontrolledRef} data-testid="input-uncontrolled" /></label><button className="control-button mt-2" onClick={() => { const value = uncontrolledRef.current?.value ?? ''; setUncontrolledRead(`Read through ref: ${value}`); log('FORM-002 read DOM value through ref'); }} data-testid="button-read-uncontrolled">Read ref</button></TestCard>;
                      if (item.id === 'FORM-003') return <TestCard key={item.id} {...item} result={submitted}><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const value = String(data.get('submission') ?? ''); setSubmitted(`Prevented navigation · ${value}`); log('FORM-003 submit prevented'); }} data-testid="FORM-003-target-form" className="flex gap-2"><input className="control-input" name="submission" defaultValue="safe submit" data-testid="input-submit-value" /><button className="control-button primary" type="submit" data-testid="button-submit-form">Submit</button></form></TestCard>;
                      if (item.id === 'FORM-004') return <TestCard key={item.id} {...item}><label className="grid gap-2 text-xs" data-testid="FORM-004-target-datalist">Fixture name<input className="control-input" list="fixture-names" defaultValue="source" placeholder="Choose a fixture" data-testid="input-datalist" /><datalist id="fixture-names" data-testid="FORM-004-datalist"><option value="source" data-testid="FORM-004-option-source">Source mapping</option><option value="runtime" data-testid="FORM-004-option-runtime">Runtime state</option><option value="fallback" data-testid="FORM-004-option-fallback">Agent fallback</option></datalist></label></TestCard>;
                      if (item.id === 'FORM-005') return <TestCard key={item.id} {...item} result={`${textareaValue.split('\n').length} lines`}><label className="grid gap-2 text-xs" data-testid="FORM-005-target-textarea">Multiline source<textarea className="control-input min-h-20 resize-y leading-5" value={textareaValue} onChange={(event) => { setTextareaValue(event.target.value); log('FORM-005 textarea changed'); }} data-testid="textarea-multiline" /></label></TestCard>;
                      if (item.id === 'FORM-006') return <TestCard key={item.id} {...item} result={`Selected: ${selectedOption}`}><label className="grid gap-2 text-xs" data-testid="FORM-006-target-select">Source mode<select className="control-input" value={selectedOption} onChange={(event) => { setSelectedOption(event.target.value); log('FORM-006 select changed'); }} data-testid="select-grouped-options"><optgroup label="Stable fixtures" data-testid="FORM-006-optgroup-stable"><option value="stable" data-testid="FORM-006-option-stable">Stable target</option><option value="mapped" data-testid="FORM-006-option-mapped">Mapped target</option></optgroup><optgroup label="Runtime fixtures" data-testid="FORM-006-optgroup-runtime"><option value="runtime" data-testid="FORM-006-option-runtime">Runtime target</option></optgroup></select></label></TestCard>;
                      if (item.id === 'INT-001') return <TestCard key={item.id} {...item} result={`Counter is ${counter}`}><div className="flex items-center gap-2" data-testid="INT-001-target-counter"><button className="control-button" onClick={() => { setCounter((value) => value - 1); log('INT-001 decremented'); }} data-testid="button-counter-decrement">−</button><output className="mono min-w-10 text-center text-lg font-semibold" data-testid="output-counter">{counter}</output><button className="control-button primary" onClick={() => { setCounter((value) => value + 1); log('INT-001 incremented'); }} data-testid="button-counter-increment">+</button></div></TestCard>;
                      if (item.id === 'INT-002') return <TestCard key={item.id} {...item} result={`${toggle ? 'Toggle on' : 'Toggle off'} · tab ${activeTab}`}><div className="grid gap-3" data-testid="INT-002-target-tabs"><button className={`control-button w-fit ${toggle ? 'primary' : ''}`} aria-pressed={toggle} onClick={() => { setToggle((value) => !value); log('INT-002 toggle changed'); }} data-testid="button-toggle-status">{toggle ? 'Enabled' : 'Disabled'}</button><div role="tablist" className="flex gap-1 border-b border-[hsl(var(--border))]"><button className={`px-2 py-1 text-xs ${activeTab === 'markup' ? 'border-b-2 border-[hsl(var(--primary))] font-semibold' : 'text-[hsl(var(--muted-foreground))]'}`} onClick={() => setActiveTab('markup')} role="tab" aria-selected={activeTab === 'markup'} data-testid="tab-markup">Markup</button><button className={`px-2 py-1 text-xs ${activeTab === 'runtime' ? 'border-b-2 border-[hsl(var(--primary))] font-semibold' : 'text-[hsl(var(--muted-foreground))]'}`} onClick={() => setActiveTab('runtime')} role="tab" aria-selected={activeTab === 'runtime'} data-testid="tab-runtime">Runtime</button></div><div className="text-xs text-[hsl(var(--muted-foreground))]" role="tabpanel" data-testid="tabpanel-active">{activeTab === 'markup' ? 'The source-shaped panel is active.' : 'The state-shaped panel is active.'}</div></div></TestCard>;
                      if (item.id === 'INT-003') return <TestCard key={item.id} {...item} result={accordion ? 'Accordion open' : 'Accordion closed'}><div className="grid gap-2" data-testid="INT-003-target-disclosures"><button className="flex items-center justify-between rounded border border-[hsl(var(--border))] p-2 text-left text-xs" onClick={() => { setAccordion((value) => !value); log('INT-003 accordion toggled'); }} data-testid="button-accordion"><span>Accordion trigger</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${accordion ? 'rotate-180' : ''}`} /></button>{accordion && <div className="rounded bg-[hsl(var(--accent)/.22)] p-2 text-xs" data-testid="text-accordion-panel">Inserted panel content.</div>}<div className="relative"><button className="control-button" onClick={() => { setMenuOpen((value) => !value); log('INT-003 command menu toggled'); }} data-testid="button-command-menu">Command menu <ChevronDown className="h-3 w-3" /></button>{menuOpen && <div className="absolute left-0 top-10 z-10 grid min-w-36 gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-lg" data-testid="menu-command-options"><button className="rounded px-2 py-1 text-left text-xs hover:bg-[hsl(var(--accent)/.3)]" onClick={() => { setMenuOpen(false); log('INT-003 selected inspect'); }} data-testid="menu-option-inspect">Inspect</button><button className="rounded px-2 py-1 text-left text-xs hover:bg-[hsl(var(--accent)/.3)]" onClick={() => { setMenuOpen(false); log('INT-003 selected source'); }} data-testid="menu-option-source">Source map</button></div>}</div></div></TestCard>;
                      if (item.id === 'INT-004') return <TestCard key={item.id} {...item}><div className="flex flex-wrap items-center gap-3" data-testid="INT-004-target-dialog"><details className="text-xs"><summary className="cursor-pointer font-semibold">Details / summary</summary><p className="mt-2 text-[hsl(var(--muted-foreground))]">Native disclosure surface.</p></details><button className="control-button primary" onClick={() => { setDialogOpen(true); log('INT-004 dialog opened'); }} data-testid="button-open-dialog">Open dialog</button></div></TestCard>;
                      if (item.id === 'SRC-001') return <TestCard key={item.id} {...item}><div className="relative text-xs" data-testid="SRC-001-target-source"><span className="sr-only" data-testid="SRC-001-target-hidden">Source-only status: hidden but mapped.</span><span className="rounded border border-[hsl(var(--border))] px-2 py-1 text-[hsl(var(--muted-foreground))]">Visible layout has no hidden shift.</span></div></TestCard>;
                      if (item.id === 'SRC-002') return <TestCard key={item.id} {...item}><div className="grid gap-2" data-testid="SRC-002-target-noscript"><div className="eyebrow text-[hsl(var(--primary))]">Escaped source example</div><pre className="overflow-auto rounded border border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] p-3 text-xs text-[hsl(var(--sidebar-foreground))]"><code>{'<noscript>Enable JavaScript to continue.</noscript>'}</code></pre><span className="text-[10px] text-[hsl(var(--muted-foreground))]">Documented only; no live noscript element is rendered.</span></div></TestCard>;
                      if (item.id === 'REACT-001') return <TestCard key={item.id} {...item}><div className="grid gap-1.5" data-testid="REACT-001-target-repeated">{rows.map((row, index) => <div key={row} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex === null || dragIndex === index) return; const next = [...rows]; const [moved] = next.splice(dragIndex, 1); next.splice(index, 0, moved); setRows(next); setDragIndex(null); log(`REACT-001 moved ${moved}`); }} className="flex items-center gap-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background)/.6)] px-2 py-1.5 text-xs" data-testid={`REACT-001-row-${row.toLowerCase().replaceAll(' ', '-')}`}><GripVertical className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />{row}<span className="mono ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">key:{row.split(' ')[0].toLowerCase()}</span></div>)}</div></TestCard>;
                      if (item.id === 'REACT-002') return <TestCard key={item.id} {...item} result={`Rendered prop: ${badgeLabel}`}><div className="flex flex-wrap items-center gap-2" data-testid="REACT-002-target-prop"><span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-semibold">{badgeLabel}</span><button className="control-button" onClick={() => { setBadgeLabel((value) => value === 'prop: stable' ? 'prop: changed' : 'prop: stable'); log('REACT-002 custom prop changed'); }} data-testid="button-change-prop">Change prop</button></div></TestCard>;
                      if (item.id === 'REACT-003') return <TestCard key={item.id} {...item}><div className="grid gap-2 rounded border border-dashed border-[hsl(var(--primary)/.5)] p-3 text-xs" data-testid="REACT-003-target-slot"><div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">slot="label"</span><span slot="label" className="ml-2 rounded bg-[hsl(var(--accent))] px-2 py-1">assigned label</span></div><slot name="label">Fallback slot content</slot></div></TestCard>;
                      if (item.id === 'STYLE-001') return <TestCard key={item.id} {...item} result={classAlert ? 'className → alert' : 'className → calm'}><button className={`w-full rounded px-3 py-3 text-left text-xs font-semibold transition-colors ${classAlert ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]'}`} onClick={() => { setClassAlert((value) => !value); log('STYLE-001 conditional class changed'); }} data-testid="STYLE-001-target-class">className={classAlert ? '"bg-signal"' : '"bg-mint"'} · click to switch</button></TestCard>;
                      if (item.id === 'STYLE-002') return <TestCard key={item.id} {...item} result={`Inline width: ${styleWidth}%`}><div data-testid="STYLE-002-target-style"><div className="mb-2 h-3 rounded bg-[hsl(var(--primary))]" style={{ width: `${styleWidth}%` }} /><label className="flex items-center gap-2 text-xs">style.width <input className="w-full accent-[hsl(var(--primary))]" type="range" min="20" max="100" value={styleWidth} onChange={(event) => setStyleWidth(Number(event.target.value))} data-testid="input-style-width" /></label></div></TestCard>;
                      if (item.id === 'STATE-001') return <TestCard key={item.id} {...item} result={delayed === 'done' ? 'Delayed fixture resolved' : delayed === 'pending' ? 'Pending shell active' : 'Idle'}><div className="flex items-center justify-between gap-3" data-testid="STATE-001-target-delay">{delayed === 'pending' && <div className="h-5 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" data-testid="skeleton-delayed" />}{delayed === 'done' && <span className="text-xs text-[hsl(var(--secondary-foreground))]">Delayed content arrived safely.</span>}{delayed === 'idle' && <span className="text-xs text-[hsl(var(--muted-foreground))]">Fixture is idle.</span>}<button className="control-button primary" disabled={delayed === 'pending'} onClick={() => { setDelayed('pending'); log('STATE-001 pending shell mounted'); window.setTimeout(() => { setDelayed('done'); log('STATE-001 delayed content inserted'); }, 1200); }} data-testid="button-start-delay"><Play className="h-3.5 w-3.5" />Start delay</button></div></TestCard>;
                      if (item.id === 'STATE-002') return <TestCard key={item.id} {...item} result={inserted ? 'Runtime note inserted' : 'No runtime insertion'}><div className="flex items-center gap-3" data-testid="STATE-002-target-inserted"><button className="control-button" onClick={() => { setInserted((value) => !value); log(inserted ? 'STATE-002 runtime note removed' : 'STATE-002 runtime note inserted'); }} data-testid="button-insert-state">{inserted ? 'Remove note' : 'Insert note'}</button>{inserted && <span className="rounded bg-[hsl(var(--accent))] px-2 py-1 text-xs" data-testid="text-inserted-note">Runtime note: mounted now</span>}</div></TestCard>;
                      if (item.id === 'STATE-003') return <TestCard key={item.id} {...item}><div className="flex flex-wrap gap-2" data-testid="STATE-003-target-list-controls"><button className="control-button" onClick={() => { setRows((value) => [...value, `Added ${value.length + 1}`]); log('STATE-003 added row'); }} data-testid="button-add-row"><Plus className="h-3.5 w-3.5" />Add</button><button className="control-button" onClick={() => { setRows((value) => value.slice(0, -1)); log('STATE-003 removed last row'); }} data-testid="button-remove-row"><Trash2 className="h-3.5 w-3.5" />Remove</button><button className="control-button" onClick={() => { setRows((value) => [...value].sort()); log('STATE-003 sorted rows'); }} data-testid="button-sort-rows"><ArrowDownAZ className="h-3.5 w-3.5" />Sort</button><button className="control-button" onClick={() => { setRows((value) => [...value].reverse()); log('STATE-003 reversed rows'); }} data-testid="button-reverse-rows"><ArrowUpDown className="h-3.5 w-3.5" />Reverse</button><div className="mt-1 flex w-full flex-wrap gap-1">{rows.map((row) => <span key={row} className="mono rounded bg-[hsl(var(--muted))] px-2 py-1 text-[10px]">{row}</span>)}</div></div></TestCard>;
                      if (item.id === 'STATE-004') return <TestCard key={item.id} {...item}><div className="flex items-center gap-3" data-testid="STATE-004-target-ticking"><span className="status-dot live" /><span className="mono text-xs">{tick.toLocaleTimeString()}</span><span className="text-xs text-[hsl(var(--muted-foreground))]">text node updates / 1s</span></div></TestCard>;
                      if (item.id === 'HIT-001') return <TestCard key={item.id} {...item}><div className="grid gap-1.5" data-testid="HIT-001-target-drag-list">{['Grip A', 'Grip B', 'Grip C'].map((label, index) => <div key={label} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex === null || dragIndex === index) return; log(`HIT-001 dropped ${label}`); setDragIndex(null); }} className="flex cursor-grab items-center gap-2 rounded border border-[hsl(var(--border))] px-2 py-1.5 text-xs active:cursor-grabbing" data-testid={`HIT-001-drag-${index}`}><GripVertical className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />{label}<span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">drag handle</span></div>)}</div></TestCard>;
                      if (item.id === 'HIT-002') return <TestCard key={item.id} {...item} result="Blur saved local content"><div className="rounded border border-dashed border-[hsl(var(--primary)/.6)] bg-[hsl(var(--accent)/.15)] p-3 text-xs" contentEditable suppressContentEditableWarning onInput={(event) => setEditable(event.currentTarget.textContent ?? '')} onBlur={() => log('HIT-002 contentEditable blurred')} data-testid="HIT-002-target-editable">{editable}</div></TestCard>;
                      if (item.id === 'HIT-003') return <TestCard key={item.id} {...item}><canvas ref={canvasRef} width={520} height={100} className="h-[100px] w-full touch-none rounded border border-[hsl(var(--border))]" onPointerDown={(event) => { const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (!canvas || !context) return; const bounds = canvas.getBoundingClientRect(); context.beginPath(); context.moveTo((event.clientX - bounds.left) * (canvas.width / bounds.width), (event.clientY - bounds.top) * (canvas.height / bounds.height)); canvas.setPointerCapture(event.pointerId); log('HIT-003 canvas stroke started'); }} onPointerMove={draw} data-testid="HIT-003-target-canvas" aria-label="Drawing canvas" /></TestCard>;
                      if (item.id === 'HIT-004') return <TestCard key={item.id} {...item}><iframe title="Safe srcDoc fixture" className="h-20 w-full rounded border border-[hsl(var(--border))]" srcDoc={`<!doctype html><html><body style="font-family:monospace;background:#f7f5ed;color:#162338;padding:10px"><button style="padding:6px;border:1px solid #f26b45;background:#fff;border-radius:4px">iframe button</button></body></html>`} data-testid="HIT-004-target-iframe" /></TestCard>;
                      if (item.id === 'HIT-005') return <TestCard key={item.id} {...item}><div className="relative" data-testid="HIT-005-target-popover"><button className="control-button primary" onClick={() => { setPopoverOpen((value) => !value); log(popoverOpen ? 'HIT-005 popover closed' : 'HIT-005 popover opened'); }} data-testid="button-open-popover">Open anchored panel</button>{popoverOpen && <div className="absolute left-0 top-10 z-10 w-56 rounded border border-[hsl(var(--primary)/.45)] bg-[hsl(var(--card))] p-3 shadow-lg" role="dialog" data-testid="popover-panel"><div className="eyebrow text-[hsl(var(--primary))]">Overlay target</div><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A stable fallback for native popover support.</p><button className="control-button ghost mt-2" onClick={() => setPopoverOpen(false)} data-testid="button-close-popover">Close</button></div>}</div></TestCard>;
                      if (item.id === 'HIT-006') return <TestCard key={item.id} {...item}><div ref={shadowRef} className="min-h-8" data-testid="HIT-006-target-shadow-host" /></TestCard>;
                      return null;
                    })}
                  </div>
                </section>
              ))}
              {visible.length === 0 && <div className="rounded-lg border border-dashed border-[hsl(var(--primary)/.5)] p-12 text-center" data-testid="empty-filter-state"><SlidersHorizontal className="mx-auto h-6 w-6 text-[hsl(var(--primary))]" /><h3 className="mt-3 font-semibold">No cases match this lens.</h3><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Clear the search or return to all cases.</p><button className="control-button primary mx-auto mt-4" onClick={() => { setFilter('all'); setSearch(''); }} data-testid="button-clear-filters">Clear filters</button></div>}
            </div>
          ) : (
            <section className="mt-5 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)]" data-testid="section-condensed-matrix">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] p-4"><div><div className="eyebrow text-[hsl(var(--primary))]">Condensed view</div><h2 className="mt-1 font-semibold">Direct edit test matrix</h2></div><div className="mono text-[10px] text-[hsl(var(--muted-foreground))]">Result column is intentionally blank</div></div>
              <div className="max-h-[680px] overflow-auto"><table className="matrix-table min-w-[850px] w-full text-xs" data-testid="table-condensed-matrix"><thead><tr><th>ID</th><th>Case</th><th>Category</th><th>Source pattern</th><th>Expected</th><th>Instruction</th><th>Result</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td className="mono font-semibold text-[hsl(var(--primary))]">{item.id}</td><td className="font-semibold">{item.title}</td><td>{item.category}</td><td className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{item.pattern}</td><td>{item.expected}</td><td className="max-w-[260px] text-[hsl(var(--muted-foreground))]">{item.instruction}</td><td className="mono text-[10px] text-[hsl(var(--muted-foreground))]">Not tested</td></tr>)}</tbody></table></div>
            </section>
          )}

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] py-6 text-xs text-[hsl(var(--muted-foreground))]" data-testid="footer-lab">
            <div className="relative flex min-h-8 items-center gap-2 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)] pr-2" data-testid="footer-fixture-animation">
              <canvas ref={footerCanvasRef} className="pointer-events-none h-8 w-24 shrink-0" aria-hidden="true" />
              <Code2 className="relative z-10 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
              <span className="relative z-10">No backend · no database · safe local fixtures</span>
            </div>
            <div className="mono flex items-center gap-3"><span>React 19</span><span>TypeScript</span><span>Vite</span><span>Tailwind</span></div>
          </footer>
        </div>
      </main>

      {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}><div className="modal-panel rounded-lg p-5" role="dialog" aria-modal="true" aria-labelledby="dialog-title" data-testid="modal-dialog"><div className="flex items-start justify-between"><div><div className="eyebrow text-[hsl(var(--primary))]">Modal target</div><h2 id="dialog-title" className="mt-1 text-lg font-semibold">Selection boundary</h2></div><button className="control-button ghost" onClick={() => setDialogOpen(false)} data-testid="button-close-dialog" aria-label="Close dialog"><X className="h-4 w-4" /></button></div><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">This dialog is rendered by the same client-side runtime. Close it, then inspect whether focus returns to the trigger.</p><button className="control-button primary mt-5" onClick={() => setDialogOpen(false)} data-testid="button-confirm-dialog"><Check className="h-3.5 w-3.5" />Return to fixture</button></div></div>}
    </div>
  );
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={AppShell} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;