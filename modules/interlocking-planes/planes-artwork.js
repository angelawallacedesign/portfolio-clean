/* Native vector interpretation of the approved Version 2 study. All color is
   resolved from the host's tokens; no baked white background or raster asset. */
const shapes = {
  teal: 'M76.47,154.79c30-77,84-102,160-80l370,120c74,24,85,62,45,130l-185,325c-34,59-84,70-150,30L38.6,498.11C15.71,479.03-3.25,452.42.47,419.79c12.74-111.96,76-265,76-265Z',
  pink: 'M184.66,19.42c46.06-35.44,79.96-15.74,105.44,6.61l271.84,251.51c35.48,34.35,35.15,69.82-13.06,107.69l-281.21,234.53c-37.99,31.29-71.95,7.22-91.74-28.8-19.79-36.02-133.99-243.88-164.92-300.22-7.81-14.22-17.8-53.02-4.53-80.24C28.33,165.66,131.79,60.1,184.66,19.42Z',
  gold: 'M108.32,285.27c-24.57-49.72-20.29-67.08,28.15-85.48l320-105c56-18,89-2,110,55l110,330c21,61,4,84-50,105l-250,90c-56.93,19.63-76.7,3.65-99-42.28-61.07-125.74-150.09-308.68-169.15-347.24Z',
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
    <g transform="translate(1035 450) scale(0.75) translate(-1035 -450) translate(-150 -120)">
      <g class="interlocking-planes__assembly">
      <g class="interlocking-planes__plane" data-plane="teal">
        <g transform="translate(850 100)">
          ${path(shapes.teal, url('teal'))}
        </g>
      </g>
      <g class="interlocking-planes__plane interlocking-planes__rear" data-plane="pink">
        <g transform="translate(850 100)">
          ${path(shapes.pink, url('pink'))}
        </g>
        ${clipped('pink', wash('pink-depth'))}
      </g>
      <g class="interlocking-planes__plane interlocking-planes__middle" data-plane="gold">
        <g transform="translate(850 100)">
          ${path(shapes.gold, url('gold'))}
        </g>
        </g>
      </g>
        ${clipped('gold', `${wash('gold-fold')}${wash('gold-light')}<g fill="none" stroke="${ink('paper')}" stroke-width=".65" opacity=".075">${goldTraces}</g>`)}
      </g>
      </g>
    </g>
  </svg>`;
}
