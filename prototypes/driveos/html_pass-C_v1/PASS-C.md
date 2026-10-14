# DriveOS v0.1 — Pass C cockpit environment

## Added in Pass C

- Separable dark soft-touch cockpit material, metallic trim, reflection, and ambient-light layers.
- A separately addressable, replaceable photorealistic environment plate inside the windshield surface.
- Restrained dark steering-wheel material rendered as an overlay on the approved F geometry.
- Inactive glass treatment for the registered cluster and wide dashboard surfaces.
- Full Debug Surfaces behavior: rendered materials, trim, reflections, and ambient treatment hide while Pass B registration guides and base geometry appear.

## Debug contract

Debug Surfaces is a presentation-only state stored on the viewport shell. It does not move or resize surfaces, alter the environment layer, modify feature content, or introduce vehicle/media state. The base Pass A geometry and Pass B masks remain mounted in both modes.

## Provisional visual decisions

- No approved production environment image or numeric material/lighting values were supplied. The forest-road plate is a replaceable photorealistic asset generated specifically for Gate C from the supplied moodboard and windshield-first references; it contains no cockpit or UI.
- Material, trim, reflection, and ambient-light values are layered provisional interpretations of the supplied dark navy/charcoal cockpit direction, with soft-touch grain, metallic highlights, vent slats, speaker mesh, glazing, and restrained blue ambient spill kept independently toggleable.
- No final lighting animation, startup treatment, vehicle state, instrument data, media UI, or steering-wheel interaction is included.

## Gate C QA viewports

- Desktop landscape: 1600 × 1000
- Tablet landscape: 1024 × 768
- Unsupported portrait: 768 × 1024
