/* Slide 01 materials use each plane's local coordinates. Keep these static
   fills separate from the existing assembly, spring and Surface Tilt transforms. */
const shapes = {
  teal: 'M76.47,154.79c30-77,84-102,160-80l370,120c74,24,85,62,45,130l-185,325c-34,59-84,70-150,30L38.6,498.11C15.71,479.03-3.25,452.42.47,419.79c12.74-111.96,76-265,76-265Z',
  pink: 'M184.66,19.42c46.06-35.44,79.96-15.74,105.44,6.61l271.84,251.51c35.48,34.35,35.15,69.82-13.06,107.69l-281.21,234.53c-37.99,31.29-71.95,7.22-91.74-28.8-19.79-36.02-133.99-243.88-164.92-300.22-7.81-14.22-17.8-53.02-4.53-80.24C28.33,165.66,131.79,60.1,184.66,19.42Z',
  gold: 'M108.32,285.27c-24.57-49.72-20.29-67.08,28.15-85.48l320-105c56-18,89-2,110,55l110,330c21,61,4,84-50,105l-250,90c-56.93,19.63-76.7,3.65-99-42.28-61.07-125.74-150.09-308.68-169.15-347.24Z',
};

export function createPlanesArtwork(prefix) {
  const id = name => `${prefix}-${name}`;
  const url = name => `url(#${id(name)})`;
  const ink = name => `var(--planes-${name})`;
  const tint = (name, amount) => `color-mix(in srgb, ${ink(name)} ${amount}%, ${ink('paper')})`;
  const stops = values => values.map(([offset, color, opacity = 1]) =>
    `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`).join('');
  const linear = (name, coordinates, values) => `<linearGradient id="${id(name)}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops(values)}</linearGradient>`;
  const radial = (name, coordinates, values) => `<radialGradient id="${id(name)}" gradientUnits="userSpaceOnUse" ${coordinates}>${stops(values)}</radialGradient>`;
  const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;

  const definitions = [
    linear('teal', 'x1="110" y1="90" x2="530" y2="650"', [
      [0, tint('teal', 30), .75], [.28, tint('teal', 48), .8],
      [.56, tint('teal', 78), .82], [.8, tint('teal', 55), .78], [1, ink('teal'), .8],
    ]),
    linear('pink', 'x1="190" y1="25" x2="355" y2="620"', [
      [0, tint('pink', 40)], [.5, tint('pink', 55)], [1, tint('pink', 85)],
    ]),
    linear('gold', 'x1="200" y1="170" x2="560" y2="640"', [
      [0, tint('yellow', 68), .95], [.27, tint('yellow', 48), .93],
      [.48, tint('yellow', 73), .92], [.74, ink('yellow'), .9],
      [1, `color-mix(in srgb, ${ink('yellow')} 92%, #d9a441)`, .93],
    ]),
    radial('gold-light', 'cx="275" cy="300" r="330" gradientTransform="translate(0 135) scale(1 .55)"', [
      [0, tint('yellow', 10), .42], [.42, tint('yellow', 18), .2], [1, tint('yellow', 25), 0],
    ]),
    `<clipPath id="${id('teal-clip')}">${path(shapes.teal, '#fff')}</clipPath>`,
    // One static, two-octave alpha wash. No blur, displacement or silhouette change.
    // The path clip follows the filter so its rectangular output cannot leak.
    `<filter id="${id('teal-frost')}" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".12 .24" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .18 0"/>
    </filter>`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="610 40 850 820" preserveAspectRatio="xMidYMin meet" focusable="false">
    <defs>${definitions}</defs>
    <g transform="translate(1035 450) scale(0.75) translate(-1035 -450) translate(-150 -120)">
      <g class="interlocking-planes__assembly">
        <g class="interlocking-planes__plane" data-plane="teal">
          <g transform="translate(850 100)">
            ${path(shapes.teal, url('teal'))}
            <g clip-path="${url('teal-clip')}">${path(shapes.teal, ink('paper'), `filter="${url('teal-frost')}"`)}</g>
          </g>
        </g>
        <g class="interlocking-planes__plane interlocking-planes__rear" data-plane="pink">
          <g transform="translate(850 100)">
            ${path(shapes.pink, url('pink'), 'fill-opacity=".6"')}
          </g>
        </g>
        <g class="interlocking-planes__plane interlocking-planes__middle" data-plane="gold">
          <g transform="translate(850 100)">
            ${path(shapes.gold, url('gold'))}
            ${path(shapes.gold, url('gold-light'))}
          </g>
        </g>
      </g>
    </g>
  </svg>`;
}
