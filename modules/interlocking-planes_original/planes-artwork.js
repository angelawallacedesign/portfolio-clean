/* Native vector interpretation of the approved Version 2 study. All color is
   resolved from the host's tokens; no baked white background or raster asset. */
const shapes = {
  teal: 'M720 235 C750 158 804 133 880 155 L1250 275 C1324 299 1335 337 1295 405 L1110 730 C1076 789 1026 800 960 760 L700 590 C643 554 636 514 670 450 Z',
  pink: 'M960 95 C994 75 1026 81 1065 110 L1370 350 C1410 383 1414 422 1370 470 L1115 765 C1080 805 1053 792 1025 755 L855 529 C816 477 822 431 861 376 L980 216 C1017 166 1018 137 960 95 Z',
  gold: 'M755 370 C720 321 730 299 780 280 L1100 175 C1156 157 1189 173 1210 230 L1320 560 C1341 621 1324 644 1270 665 L1020 755 C962 775 938 760 920 710 Z',
  front: 'M720 235 C750 158 804 133 880 155 L1250 275 C1324 299 1335 337 1295 405 L1235 510 C1203 549 1143 538 1090 495 L890 345 C831 300 791 313 755 370 C728 332 726 275 720 235 Z',
};
const fold = 'M755 370 C791 313 831 300 890 345 L1090 495 C1143 538 1203 549 1235 510';

export function createPlanesArtwork(prefix) {
  const id = name => `${prefix}-${name}`;
  const url = name => `url(#${id(name)})`;
  const ink = name => `var(--planes-${name})`;
  const tint = (name, amount) => `color-mix(in srgb, ${ink(name)} ${amount}%, ${ink('paper')})`;
  const shade = (name, amount) => `color-mix(in srgb, ${ink(name)} ${amount}%, ${ink('ink')})`;
  const stops = values => values.map(([offset, color, opacity = 1]) =>
    `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('');
  const linear = (name, coordinates, values) => `<linearGradient id="${id(name)}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops(values)}</linearGradient>`;
  const radial = (name, coordinates, values) => `<radialGradient id="${id(name)}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops(values)}</radialGradient>`;
  const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const clipped = (name, content) => `<g clip-path="${url(`${name}-clip`)}">${content}</g>`;
  const wash = name => `<rect x="620" y="60" width="820" height="760" fill="${url(name)}"/>`;

  // Fine directional traces describe curvature. Static geometry, never noise
  // or an animated displacement filter; deliberately barely perceptible.
  const mix = (a, b, t) => (a + (b - a) * t).toFixed(2);
  const traces = Array.from({ length: 70 }, (_, i) => {
    const t = (i + 1) / 71;
    return `<path d="M${mix(723, 755, t)} ${mix(235, 370, t)} C${mix(755, 791, t)} ${mix(158, 313, t)} ${mix(812, 831, t)} ${mix(133, 300, t)} ${mix(880, 890, t)} ${mix(155, 345, t)} C${mix(1000, 970, t)} ${mix(195, 408, t)} ${mix(1185, 1155, t)} ${mix(250, 580, t)} ${mix(1300, 1235, t)} ${mix(330, 510, t)}"/>`;
  }).join('');
  const goldTraces = Array.from({ length: 48 }, (_, i) => {
    const t = i / 48;
    return `<path d="M${mix(765, 830, t)} ${mix(365, 320, t)} C${mix(820, 940, t)} ${mix(450, 520, t)} ${mix(975, 1130, t)} ${mix(740, 705, t)} ${mix(1275, 1320, t)} ${mix(660, 545, t)}"/>`;
  }).join('');

  const definitions = [
    linear('teal', 'x1="700" y1="180" x2="1100" y2="790"', [
      [0, tint('teal', 32), .75], [.32, tint('teal', 67), .88], [.57, ink('teal'), .72], [.82, tint('teal', 44), .55], [1, tint('teal', 24), .08],
    ]),
    linear('pink', 'x1="975" y1="100" x2="1240" y2="765"', [
      [0, tint('pink', 30), .8], [.22, tint('pink', 62), .9], [.48, ink('pink'), .7], [.7, tint('pink', 55), .58], [1, tint('pink', 30), .08],
    ]),
    linear('gold', 'x1="850" y1="200" x2="1180" y2="770"', [
      [0, tint('yellow', 55), .95], [.27, ink('yellow'), .9], [.52, tint('yellow', 75), .9], [.76, tint('yellow', 45), .7], [1, tint('yellow', 30), .1],
    ]),
    linear('front', 'x1="800" y1="180" x2="1245" y2="535"', [
      [0, tint('teal', 33), .88], [.25, tint('teal', 53), .94], [.55, tint('teal', 85), .9], [.76, tint('teal', 70), .87], [1, tint('yellow', 20), .68],
    ]),
    linear('edge', 'x1="780" y1="180" x2="1280" y2="570"', [
      [0, ink('edge'), .75], [.4, ink('edge'), .45], [.72, ink('edge'), .08], [1, ink('edge'), .7],
    ]),
    radial('front-light', 'cx="930" cy="290" r="300" gradientTransform="translate(0 145) scale(1 .5)"', [
      [0, ink('paper'), .45], [.4, ink('paper'), .24], [1, ink('paper'), 0],
    ]),
    radial('front-depth', 'cx="1125" cy="397" r="205" gradientTransform="translate(0 100) scale(1 .75)"', [
      [0, shade('teal', 76), .21], [.5, ink('teal'), .07], [1, ink('teal'), 0],
    ]),
    radial('gold-fold', 'cx="896" cy="410" r="210" gradientTransform="translate(298 0) scale(.67 1)"', [
      [0, shade('yellow', 86), .38], [.38, ink('yellow'), .25], [1, ink('yellow'), 0],
    ]),
    radial('gold-light', 'cx="804" cy="383" r="140"', [
      [0, ink('paper'), .48], [.3, ink('paper'), .2], [1, ink('paper'), 0],
    ]),
    radial('pink-depth', 'cx="1320" cy="405" r="220"', [
      [0, ink('pink'), .3], [.6, ink('pink'), .09], [1, ink('pink'), 0],
    ]),
    ...Object.entries(shapes).map(([name, d]) => `<clipPath id="${id(`${name}-clip`)}">${path(d, '#fff')}</clipPath>`),
    `<filter id="${id('contact')}" x="-20%" y="-30%" width="140%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="6"/></filter>`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="610 40 850 820" preserveAspectRatio="xMidYMin meet" focusable="false">
    <defs>${definitions}</defs>
    <g class="interlocking-planes__assembly">
      ${path(shapes.teal, url('teal'))}
      <g class="interlocking-planes__rear">
        ${path(shapes.pink, url('pink'))}
        ${clipped('pink', wash('pink-depth'))}
        ${path('M960 95 C994 75 1026 81 1065 110 L1370 350 C1410 383 1414 422 1370 470', 'none', `stroke="${url('edge')}" stroke-width="1.1"`)}
      </g>
      <g class="interlocking-planes__middle">
        ${path(shapes.gold, url('gold'))}
        ${clipped('gold', `${wash('gold-fold')}${wash('gold-light')}<g fill="none" stroke="${ink('paper')}" stroke-width=".65" opacity=".075">${goldTraces}</g>`)}
        ${path('M755 370 C720 321 730 299 780 280 L1100 175 C1156 157 1189 173 1210 230', 'none', `stroke="${url('edge')}" stroke-width="1.4"`)}
        ${clipped('gold', path(fold, 'none', `stroke="${shade('teal', 60)}" stroke-opacity=".15" stroke-width="14" filter="${url('contact')}" transform="translate(0 9)"`))}
      </g>
      ${path(shapes.front, url('front'))}
      ${clipped('front', `${wash('front-light')}${wash('front-depth')}<g fill="none" stroke="${ink('paper')}" stroke-width=".65" opacity=".10">${traces}</g>`)}
      ${path('M720 235 C750 158 804 133 880 155 L1250 275 C1324 299 1335 337 1295 405', 'none', `stroke="${url('edge')}" stroke-width="1.1"`)}
      ${path(fold, 'none', `stroke="${ink('edge')}" stroke-opacity=".72" stroke-width="1.65"`)}
    </g>
  </svg>`;
}
