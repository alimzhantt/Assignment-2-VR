# PA2 — Matrix Transformations and Perspective (AR/VR/XR Applications)

Interactive 3D WebGL scene featuring an animated spinning cube, an orbiting and self-rotating square pyramid, and real-time camera projection controls. Developed as part of Practical Assignment 2 (PA2) for the AR/VR/XR Applications course.

## Student Information & Personal Variant
* **Student ID:** `23010300`
* **Assigned Solid:** Square Pyramid (`0`)
* **Orbit Period ($T$):** 12.0 s (`6 + 6` based on ID rules)
* **Cube Spin Axis:** y-axis (`0 mod 3 = 0`)
* **Orbit Plane:** Horizontal around y-axis (`0 mod 3 = 0`)
* **Camera Configuration:** Eye `(0, 2.5, 7)`, FOV `45°` (`0 mod 2 = 0`)

---

## Features
* **Model Transformations:** Clean separation of model, view, and projection matrices (`$P \times V \times M \times \text{aPosition}$`).
* **Animation Loop:** Frame-rate independent animation driven by `requestAnimationFrame` using delta-time (`dt`) with a safety clamp (`0.1s`).
* **Projections:** Toggle between Perspective and Orthographic projection modes.
* **Interactive Controls:** Full keyboard support for pausing, zooming, orbiting, and resetting.
* **Status Bar:** Real-time on-screen telemetry displaying Student ID, projection type, FOV, elapsed simulation time ($t$), and FPS.

---

## Key Map
| Key | Action |
| :---: | :---|
| `P` / `p` | Pause / Resume animation |
| `O` / `o` | Toggle between Perspective and Orthographic projections |
| `+` / `=` / `-` | Adjust Field of View (FOV ±5°, limits: 20°–100°, Perspective only) |
| `←` / `→` | Orbit camera eye around the y-axis by 5° per press |
| `R` / `r` | Reset camera view and simulation time to defaults |

---

## Project Structure
```text
├── index.html        # Main HTML file containing canvas, status overlay, and script inclusions
├── index.js          # WebGL initialization, shaders, geometry buffers, and animation loop
└── README.md         # Project documentation
