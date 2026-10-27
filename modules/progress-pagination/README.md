# Progress pagination

Standalone decorative progress strip. Include its CSS and module, then supply
one span per segment. It loops every four seconds, independently of other UI,
and pauses when hidden or offscreen. Reduced motion shows a static active line.
It does not navigate slides or control a carousel.

```html
<link rel="stylesheet" href="/modules/progress-pagination/progress-pagination.css">
<div class="progress-pagination" data-progress-pagination aria-hidden="true">
  <span class="is-active">01</span><span>02</span><span>03</span>
</div>
<script type="module" src="/modules/progress-pagination/progress-pagination.js"></script>
```

The parent controls width and placement. Optional CSS properties:
`--progress-pagination-gap`, `--progress-pagination-duration`,
`--progress-pagination-track`, and `--progress-pagination-accent`.
Colors inherit generic theme tokens when available and have standalone defaults.

For dynamically mounted strips, import `initProgressPagination(element)`;
its returned controller exposes `select(zeroBasedIndex)` and `destroy()`.
Initialize each element once and call `destroy()` before removing it.

Interactive consumers may supply buttons instead of spans, with `aria-label`
and `aria-controls` on each button. Initialize without the auto-mount attribute:
`initProgressPagination(root, { duration: 6000, onChange(index, { manual }) {} })`.
Use `controller.select(index, { manual: true })` for user selection and
`controller.setPaused(true/false)` for a play/pause control. Progress pauses
when offscreen or the document is hidden and preserves its remaining time.
Reduced motion defaults to paused; explicit resume is available to consumers.
