import { icons as sharedIcons } from "../shared/js/icons.js";

// Portfolio icon registry. Icons use the shared SVG-node format so they can be
// rendered by createIcon alongside the rest of the design-system icons.
export const icons = {
  ...sharedIcons,

  menu: [
    {
      type: "path",
      attrs: {
        d: "M3.10852 5.0188H12H20.8915M3.10852 12H20.8915M3.10852 18.9141H20.8915",
      },
    },
  ],
};
