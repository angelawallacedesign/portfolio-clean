# Design Inspector coming soon

`coming-soon.html` opens with the existing interactive intro presentation and
animated blueprint background. The original centered Coming Soon content,
static SVG concept preview, and email request form follow in `#updates`.

The prototype continues to use the single CSS/JS implementation in
`modules/live-component-preview/`. `intro.js`, `intro.css`, and
`intro-background-motion.css` own this page's background and presentation
integration. The loader still reads the original Pass 5 blueprint markup and
stylesheet from `modules/designing-with-ai-hero/pass-5/`; its shadow root keeps
those styles isolated. Keep those source files available when serving the page.

`modules/intro-presentation/intro-presentation.css` contains the intro layout
used by both this page and the portfolio homepage. The homepage retains its
`#intro` container, copy, empty `[data-intro-visual-slot]`, and independently
loaded progress pagination for later restoration of the laptop/phone visual.
It does not load the Inspector prototype or background.

The update form validates the visitor's email and opens an encoded email request
to `hello@angelawallace.net`. It does not add an address to a mailing service or
claim that a subscription succeeded. The visible helper and status text explain
that the visitor must send the request from their email app. A native mailto
form action remains available without JavaScript.
