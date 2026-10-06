<script setup lang="ts">
import { computed } from "vue";
import { activeThemeId, themeById } from "@/lib/themes";
import { useStore } from "@/store";

/**
 * A scene for the empty graph in the colors of the theme: a jazz club, a neon horizon, an
 * aurora... It is made of CSS and inline SVG only, stays behind the hint, and takes no
 * pointer events.
 *
 * It is built to cost little: soft shapes are radial gradients, never `filter: blur`;
 * motion only changes `transform` and `opacity`, which the compositor runs without
 * painting; the scene is `contain: strict`; and nothing moves when the system asks for
 * less motion.
 */
const store = useStore();
const theme = computed(() => themeById(activeThemeId(store.state.appearance)));

/**
 * Places of the small things that drift (notes, sparkles, embers, fireflies, dust), in
 * percent of the screen, with a delay and a duration in seconds, and a size. Fixed values,
 * so the scene looks the same on each visit.
 */
const FLOATERS = [
  { x: 8, y: 72, delay: 0, duration: 22, size: 1 },
  { x: 18, y: 30, delay: 6, duration: 26, size: 0.7 },
  { x: 27, y: 85, delay: 11, duration: 20, size: 0.9 },
  { x: 36, y: 18, delay: 3, duration: 28, size: 0.6 },
  { x: 63, y: 80, delay: 8, duration: 24, size: 0.8 },
  { x: 72, y: 24, delay: 14, duration: 21, size: 1 },
  { x: 82, y: 64, delay: 2, duration: 27, size: 0.7 },
  { x: 91, y: 38, delay: 9, duration: 23, size: 0.9 },
  { x: 47, y: 90, delay: 17, duration: 25, size: 0.6 },
  { x: 55, y: 12, delay: 5, duration: 29, size: 0.8 },
  { x: 4, y: 44, delay: 13, duration: 31, size: 0.5 },
  { x: 96, y: 86, delay: 19, duration: 26, size: 0.6 },
];

/**
 * Soft out-of-focus lights (bokeh), in percent of the screen, with a size in vmin, a
 * color token and a delay for their slow drift.
 */
const BOKEH = [
  { x: 12, y: 22, size: 9, color: "brand", delay: 0 },
  { x: 24, y: 64, size: 5, color: "accent-strong", delay: 4 },
  { x: 78, y: 18, size: 12, color: "teal", delay: 2 },
  { x: 88, y: 58, size: 6, color: "brand-soft", delay: 7 },
  { x: 66, y: 82, size: 8, color: "brand", delay: 5 },
  { x: 38, y: 12, size: 4, color: "brand-soft", delay: 9 },
  { x: 6, y: 86, size: 7, color: "accent-strong", delay: 3 },
];

/** Bars of the equalizer, with their tempo. Heights are fixed shapes, not random. */
const BARS = Array.from({ length: 32 }, (_, index) => ({
  height: 22 + ((index * 37) % 62),
  duration: 1.4 + ((index * 7) % 9) / 6,
  delay: ((index * 5) % 11) / 10,
}));

/**
 * A phrase on the staff: the place across, in percent, and the step from the top line
 * down (0 is the top line, 1 the space under it, 8 the bottom line).
 */
const NOTES = [
  { x: 10, step: 6 },
  { x: 16, step: 4 },
  { x: 22, step: 3 },
  { x: 28, step: 5 },
  { x: 34, step: 7 },
  { x: 66, step: 2 },
  { x: 72, step: 3 },
  { x: 78, step: 1 },
  { x: 84, step: 4 },
  { x: 90, step: 2 },
];

/** The staff lines are at 30 % to 83.3 % of the score height, 6.67 % apart per step. */
const noteTop = (step: number) => 30 + (step * 53.3) / 8;

/** A city skyline for the hip hop scene: blocks of fixed widths and heights. */
const SKYLINE =
  "M0 200 " +
  Array.from({ length: 30 }, (_, index) => {
    const x = index * 40;
    const top = 200 - (40 + ((index * 47) % 110));
    return `L${x} ${top} L${x + 32} ${top} L${x + 32} 170 L${x + 40} 170`;
  }).join(" ") +
  " L1200 200 Z";

/** Gauges of a seven-string set from the low B to the high E, as pixels on screen. */
const GAUGES = [3.2, 2.6, 2.1, 1.7, 1.3, 1.05, 0.85];

/** Places of the inlays along the fretboard, in percent: the 3rd, 5th, 7th, 9th and 12th frets. */
const INLAYS = [18, 30, 41, 51, 64];

/** Angles of the laser beams from straight down, in degrees. */
const LASERS = [-42, -24, -8, 8, 24, 42];

/**
 * A harmonograph trace: the figure that two pendulums at slightly different frequencies
 * draw as they decay. Sampled once into an SVG path in a 200 × 200 box.
 */
function harmonograph(
  [f1, f2, f3, f4]: number[],
  [p1, p2]: number[],
  decay: number,
) {
  const points: string[] = [];
  for (let step = 0; step <= 2400; step++) {
    const t = step * 0.05;
    const fade = Math.exp(-decay * t);
    const x = 46 * Math.sin(f1 * t + p1) * fade + 46 * Math.sin(f2 * t) * fade;
    const y = 46 * Math.sin(f3 * t + p2) * fade + 46 * Math.sin(f4 * t) * fade;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}

const HARMONOGRAPH_A = harmonograph([2, 3.01, 3, 2.002], [0.4, 1.3], 0.012);
const HARMONOGRAPH_B = harmonograph([3, 2.005, 2, 3.003], [1.1, 0.2], 0.016);

/** Readouts of the IDM scene: measures and codes, as on a sleeve or a test print. */
const READOUTS = [
  "CAT-0101",
  "Δt 0.618 s",
  "BPM 172.4",
  "FFT 1024",
  "0x7F3A",
  "SR 44.1 kHz",
  "φ 1.6180",
  "L/R −3 dB",
  "GRN 064",
  "SEQ 07/16",
  "RND 0.3337",
  "Ø 0.00",
];

/**
 * Tape loops of the ambient scene, in seconds, in the spirit of the tape loops of Music
 * for Airports. Lengths with no common measure keep the tones from meeting the same way.
 */
const LOOPS = [
  { seconds: 17.8, offset: 3, label: "loop 1 · 17.8 s" },
  { seconds: 20.1, offset: 11, label: "loop 2 · 20.1 s" },
  { seconds: 23.5, offset: 7, label: "loop 3 · 23.5 s" },
  { seconds: 25.875, offset: 19, label: "loop 4 · 25.9 s" },
  { seconds: 29.9375, offset: 2, label: "loop 5 · 29.9 s" },
  { seconds: 31.6, offset: 24, label: "loop 6 · 31.6 s" },
];

/**
 * The knobs of the amp, from left to right, with the angle of their pointers: -150° is 0,
 * 150° is 10. The volume goes one further.
 */
const KNOBS = [
  { label: "Presence", turn: 30 },
  { label: "Bass", turn: 60 },
  { label: "Middle", turn: 0 },
  { label: "Treble", turn: 90 },
  { label: "Volume", turn: 165 },
];

/** A bolt of lightning: a jagged path down the sky, with a short fork. */
const LIGHTNING =
  "M70 0 L58 70 L76 78 L48 160 L66 168 L38 260 L54 266 L30 400 " +
  "M48 160 L22 205 L30 208 L14 250";

/** Tongues of the stage fire along the bottom: place, size and flicker, all fixed. */
const FLAMES = Array.from({ length: 14 }, (_, index) => ({
  x: (index / 13) * 100,
  height: 14 + ((index * 23) % 16),
  width: 9 + ((index * 7) % 6),
  duration: 0.7 + ((index * 5) % 7) / 10,
  delay: ((index * 3) % 10) / 10,
}));

/** Rain streaks on the window: place across, length, speed and delay, all fixed. */
const RAIN = Array.from({ length: 36 }, (_, index) => ({
  x: (index * 37) % 100,
  length: 4 + ((index * 13) % 9),
  duration: 0.9 + ((index * 7) % 10) / 10,
  delay: ((index * 11) % 17) / 10,
}));

/** Drops that cling to the glass. */
const DROPLETS = Array.from({ length: 22 }, (_, index) => ({
  x: (index * 41 + 7) % 100,
  y: (index * 29 + 13) % 100,
  size: 0.5 + ((index * 17) % 10) / 10,
}));

/** The same lights on the other side and lower, for a fuller city. */
const mirrored = (light: (typeof BOKEH)[number]) => ({
  ...light,
  x: 100 - light.x,
  y: Math.min(light.y + 18, 92),
  delay: light.delay + 2,
});

/** Strokes of the 3-2 son clave over sixteen sixteenths. */
const CLAVE = [1, 4, 7, 11, 13];
/** One bar at 100 BPM: 60 / 100 × 4 = 2.4 s. */
const CLAVE_BAR = 2.4;

/**
 * A palm frond: a curved rib with narrow leaves on both sides. Each leaf is a closed
 * shape that is widest in the middle and droops a little; leaves are longest near the
 * middle of the rib and short at its base and tip.
 */
const FROND = (() => {
  const rib = { start: [20, 380], control: [160, 200], end: [380, 120] };
  const at = (t: number, axis: 0 | 1) =>
    (1 - t) ** 2 * rib.start[axis] +
    2 * (1 - t) * t * rib.control[axis] +
    t ** 2 * rib.end[axis];
  const parts = [
    `M${rib.start.join(" ")} Q ${rib.control.join(" ")} ${rib.end.join(" ")}`,
  ];
  for (let index = 1; index < 18; index++) {
    const t = index / 18;
    const [x, y] = [at(t, 0), at(t, 1)];
    // Direction of the rib at t.
    const dx = at(t + 0.001, 0) - x;
    const dy = at(t + 0.001, 1) - y;
    const norm = Math.hypot(dx, dy);
    const [ux, uy] = [dx / norm, dy / norm];
    const length = 25 + 135 * Math.sin(Math.PI * Math.min(t * 1.15, 1));
    for (const side of [1, -1]) {
      // Leaves point forward along the rib and out to the side.
      const lx = -uy * side * 0.78 + ux * 0.62;
      const ly = ux * side * 0.78 + uy * 0.62;
      const tip = [x + lx * length, y + ly * length - length * 0.12];
      const width = length * 0.07;
      const mid = [(x + tip[0]) / 2, (y + tip[1]) / 2 - length * 0.08];
      const [px, py] = [-ly * width, lx * width];
      parts.push(
        `M${x.toFixed(1)} ${y.toFixed(1)} Q ${(mid[0] + px).toFixed(1)} ${(mid[1] + py).toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} Q ${(mid[0] - px).toFixed(1)} ${(mid[1] - py).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`,
      );
    }
  }
  return parts.join(" ");
})();

const floaterStyle = (floater: (typeof FLOATERS)[number]) => ({
  left: `${floater.x}%`,
  top: `${floater.y}%`,
  animationDelay: `-${floater.delay}s`,
  animationDuration: `${floater.duration}s`,
  "--size": String(floater.size),
});

const bokehStyle = (light: (typeof BOKEH)[number]) => ({
  left: `${light.x}%`,
  top: `${light.y}%`,
  width: `${light.size}vmin`,
  height: `${light.size}vmin`,
  "--light": `var(--color-${light.color})`,
  animationDelay: `-${light.delay * 3}s`,
});
</script>

<template>
  <div
    class="theme-backdrop pointer-events-none fixed inset-0"
    :class="`scene-${theme.id}`"
    aria-hidden="true"
  >
    <!-- The sky: a soft gradient in the colors of the theme. Every scene has it. -->
    <div class="sky" />

    <!-- out-of-tune: two quiet glows in the brand colors. -->
    <template v-if="theme.id === 'default'">
      <div class="soft soft-a" />
      <div class="soft soft-b" />
    </template>

    <!-- Jazz: spotlights on a small stage, haze, warm lights out of focus, rising notes. -->
    <template v-else-if="theme.id === 'jazz'">
      <div class="spot spot-left" />
      <div class="spot spot-right" />
      <div class="stage-glow" />
      <div class="haze" />
      <span
        v-for="(light, index) in BOKEH"
        :key="`b${index}`"
        class="bokeh"
        :style="bokehStyle(light)"
      />
      <span
        v-for="(floater, index) in FLOATERS.slice(0, 8)"
        :key="index"
        class="floater glyph rise"
        :style="floaterStyle(floater)"
      />
    </template>

    <!--
      Rock: the gear of a rock stage. The gold control panel of a valve amp head, its
      knobs set high and the volume past the last mark; a cabinet in black tolex with a
      woven grille; a stage fire, and lightning now and then.
    -->
    <template v-else-if="theme.id === 'rock'">
      <div class="warm-light" />
      <div class="storm-flash" />
      <svg class="lightning" viewBox="0 0 120 400" preserveAspectRatio="none">
        <path class="lightning-glow" :d="LIGHTNING" />
        <path class="lightning-core" :d="LIGHTNING" />
      </svg>
      <div class="flames">
        <span
          v-for="(flame, index) in FLAMES"
          :key="index"
          class="flame"
          :style="{
            left: `${flame.x}%`,
            height: `${flame.height}vh`,
            width: `${flame.width}vw`,
            animationDuration: `${flame.duration}s`,
            animationDelay: `-${flame.delay}s`,
          }"
        />
      </div>
      <div class="cab">
        <div class="cab-grille"><span class="cab-plate" /></div>
      </div>
      <div class="amp-head">
        <div class="faceplate">
          <span class="jewel" />
          <div v-for="knob in KNOBS" :key="knob.label" class="control">
            <span class="dial">
              <span class="scale" />
              <span class="knob" :style="{ rotate: `${knob.turn}deg` }" />
            </span>
            <span class="control-label">{{ knob.label }}</span>
          </div>
        </div>
      </div>
    </template>

    <!--
      Metal: seven strings of a down-tuned guitar cross the dark, wound strings below,
      plain ones above; a cold light from behind, stage fog, a red light low.
    -->
    <template v-else-if="theme.id === 'metal'">
      <div class="backlight" />
      <div class="red-light" />
      <div class="strings">
        <div class="fretboard">
          <span
            v-for="fret in INLAYS"
            :key="fret"
            class="inlay"
            :style="{ left: `${fret}%` }"
          />
        </div>
        <span
          v-for="(gauge, index) in GAUGES"
          :key="index"
          class="string"
          :class="{ wound: index < 4 }"
          :style="{ height: `${gauge}px` }"
        />
        <div class="glint" />
      </div>
      <div class="fog fog-a" />
      <div class="fog fog-b" />
    </template>

    <!--
      Techno: a warehouse. Concrete, a lighting truss, green lasers that sweep through the
      haze, and a drum machine that steps through one bar at 128 BPM.
    -->
    <template v-else-if="theme.id === 'electronic'">
      <div class="concrete" />
      <div class="truss" />
      <div class="haze-band" />
      <div class="lasers">
        <span
          v-for="angle in LASERS"
          :key="angle"
          class="laser"
          :style="{ rotate: `${angle}deg` }"
        />
      </div>
      <div class="sequencer">
        <span
          v-for="step in 16"
          :key="step"
          class="pad"
          :class="{ beat: (step - 1) % 4 === 0 }"
          :data-beat="(step - 1) % 4 === 0 ? (step - 1) / 4 + 1 : undefined"
        />
        <span class="cursor" />
      </div>
    </template>

    <!--
      IDM: a technical drawing of sound. Two harmonograph traces (the figure that two
      decaying pendulums draw) turn slowly on a fine grid, with registration marks in
      the corners, columns of readouts, and a rare glitch.
    -->
    <template v-else-if="theme.id === 'idm'">
      <div class="blueprint" />
      <span
        v-for="corner in ['tl', 'tr', 'bl', 'br']"
        :key="corner"
        class="registration"
        :class="`registration-${corner}`"
      />
      <svg class="harmonograph" viewBox="-100 -100 200 200">
        <path class="trace trace-a" :d="HARMONOGRAPH_A" />
        <path class="trace trace-b" :d="HARMONOGRAPH_B" />
      </svg>
      <div class="readouts readouts-left">
        <div class="readouts-roll">
          <span
            v-for="(line, index) in [...READOUTS, ...READOUTS]"
            :key="index"
            >{{ line }}</span
          >
        </div>
      </div>
      <div class="readouts readouts-right">
        <div class="readouts-roll">
          <span
            v-for="(line, index) in [...READOUTS, ...READOUTS].reverse()"
            :key="index"
            >{{ line }}</span
          >
        </div>
      </div>
      <div class="glitch" />
    </template>

    <!-- Hip hop: a skyline at night, halftone, an equalizer and a record. -->
    <template v-else-if="theme.id === 'hiphop'">
      <div class="halftone halftone-left" />
      <div class="halftone halftone-right" />
      <svg class="skyline" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path :d="SKYLINE" />
      </svg>
      <div class="equalizer">
        <span
          v-for="(bar, index) in BARS"
          :key="index"
          :style="{
            height: `${bar.height}%`,
            animationDuration: `${bar.duration}s`,
            animationDelay: `-${bar.delay}s`,
          }"
        />
      </div>
      <div class="vinyl"><div class="vinyl-shine" /></div>
    </template>

    <!--
      R&B and soul: late at night behind a window in the rain. City lights out of focus,
      drops that run down the glass, a few that cling to it.
    -->
    <template v-else-if="theme.id === 'rnb'">
      <span
        v-for="(light, index) in [...BOKEH, ...BOKEH.map(mirrored)]"
        :key="`b${index}`"
        class="bokeh city"
        :style="bokehStyle(light)"
      />
      <div class="rain">
        <span
          v-for="(drop, index) in RAIN"
          :key="index"
          class="streak"
          :style="{
            left: `${drop.x}%`,
            height: `${drop.length}vh`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `-${drop.delay}s`,
          }"
        />
      </div>
      <span
        v-for="(drop, index) in DROPLETS"
        :key="`d${index}`"
        class="droplet"
        :style="{
          left: `${drop.x}%`,
          top: `${drop.y}%`,
          width: `${drop.size}vmin`,
          height: `${drop.size * 1.15}vmin`,
        }"
      />
    </template>

    <!-- Pop: glossy color fields, a thin ring, sparkles. -->
    <template v-else-if="theme.id === 'pop'">
      <div class="soft field-a" />
      <div class="soft field-b" />
      <div class="soft field-c" />
      <div class="ring" />
      <span
        v-for="(floater, index) in FLOATERS"
        :key="index"
        class="floater glyph twinkle"
        :style="floaterStyle(floater)"
      />
    </template>

    <!--
      Ambient: loops of tape of different lengths, as in music for airports. Each loop
      carries one soft tone around at its own speed, so they meet in a pattern that does
      not repeat for a long time. Fog fields drift behind.
    -->
    <template v-else-if="theme.id === 'ambient'">
      <div class="soft fog-field fog-field-a" />
      <div class="soft fog-field fog-field-b" />
      <div class="soft fog-field fog-field-c" />
      <div class="loops">
        <div
          v-for="(loop, index) in LOOPS"
          :key="index"
          class="loop"
          :style="{ top: `${(index / (LOOPS.length - 1)) * 100}%` }"
        >
          <span class="loop-label">{{ loop.label }}</span>
          <span class="loop-line" />
          <span
            class="loop-runner"
            :style="{
              animationDuration: `${loop.seconds}s`,
              animationDelay: `-${loop.offset}s`,
            }"
          >
            <span class="loop-tone" />
          </span>
        </div>
      </div>
    </template>

    <!-- Reggae: a sun that rises with its rays, the three colors along the bottom. -->
    <template v-else-if="theme.id === 'reggae'">
      <div class="rays" />
      <div class="sunrise" />
      <div class="tricolor" />
    </template>

    <!--
      Latin: a warm tropical night. Palm fronds sway against the last light, and the
      clave, the key rhythm of salsa and son, plays its five strokes in a 3-2 pattern.
    -->
    <template v-else-if="theme.id === 'latin'">
      <div class="dusk-sun" />
      <svg
        v-for="side in ['left', 'right']"
        :key="side"
        class="frond"
        :class="`frond-${side}`"
        viewBox="0 0 400 400"
      >
        <path :d="FROND" />
      </svg>
      <div class="clave">
        <span
          v-for="step in 16"
          :key="step"
          class="clave-step"
          :class="{ stroke: CLAVE.includes(step) }"
          :style="{ animationDelay: `${((step - 1) / 16) * CLAVE_BAR}s` }"
        />
      </div>
    </template>

    <!-- Folk and country: a moon over hills at dusk, stars, fireflies. -->
    <template v-else-if="theme.id === 'folk'">
      <span
        v-for="(floater, index) in FLOATERS.slice(0, 8)"
        :key="`s${index}`"
        class="star"
        :style="floaterStyle(floater)"
      />
      <div class="moon" />
      <svg class="hills" viewBox="0 0 1200 300" preserveAspectRatio="none">
        <path
          class="hill-far"
          d="M0 170 Q 150 90 300 150 T 600 130 T 900 110 T 1200 150 V300 H0Z"
        />
        <path
          class="hill-near"
          d="M0 230 Q 200 170 400 220 T 800 200 T 1200 230 V300 H0Z"
        />
      </svg>
      <span
        v-for="(floater, index) in FLOATERS"
        :key="index"
        class="firefly"
        :style="floaterStyle(floater)"
      />
    </template>

    <!-- Classical: the warm light of a hall, gold dust, a phrase on the staff. -->
    <template v-else-if="theme.id === 'classical'">
      <div class="hall-light" />
      <span
        v-for="(light, index) in BOKEH"
        :key="`b${index}`"
        class="bokeh"
        :style="bokehStyle(light)"
      />
      <span
        v-for="(floater, index) in FLOATERS"
        :key="index"
        class="dust"
        :style="floaterStyle(floater)"
      />
      <div class="score">
        <svg class="staff" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <line
            v-for="line in 5"
            :key="line"
            x1="0"
            :y1="20 + line * 16"
            x2="1200"
            :y2="20 + line * 16"
          />
        </svg>
        <span
          v-for="(note, index) in NOTES"
          :key="index"
          class="note"
          :style="{ left: `${note.x}%`, top: `${noteTop(note.step)}%` }"
        />
      </div>
    </template>

    <!-- Film grain and a vignette over every scene, as on a print. -->
    <div class="grain" />
    <div class="vignette" />
  </div>
</template>

<style scoped>
.theme-backdrop {
  /* Nothing inside changes the layout or the paint of the rest of the page. */
  contain: strict;
  overflow: hidden;
  /* The middle stays darker, so the hint reads well. */
  mask-image: radial-gradient(
    ellipse 38% 28% at 50% 50%,
    rgb(0 0 0 / 0.4),
    #000 100%
  );
}

/* Every layer is placed on the scene. */
.theme-backdrop > * {
  position: absolute;
}

/* ---------- Shared layers ---------- */

.sky {
  inset: 0;
  background:
    radial-gradient(
      120% 70% at 50% 110%,
      color-mix(in srgb, var(--color-accent) 22%, transparent),
      transparent 60%
    ),
    radial-gradient(
      90% 60% at 50% -10%,
      color-mix(in srgb, var(--color-brand) 12%, transparent),
      transparent 60%
    );
}

/* Static grain from SVG noise: it breaks up the banding of large gradients. */
.grain {
  inset: 0;
  opacity: 0.07;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.vignette {
  inset: 0;
  background: radial-gradient(
    ellipse 75% 70% at 50% 50%,
    transparent 55%,
    rgb(0 0 0 / 0.65) 100%
  );
}

/* A soft light: a radial gradient, so it needs no blur filter. */
.soft {
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--soft) 45%, transparent),
    transparent
  );
}

.bokeh {
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--light) 50%, transparent) 0 55%,
    color-mix(in srgb, var(--light) 18%, transparent) 70%,
    transparent
  );
  opacity: 0.35;
}

.floater {
  width: 22px;
  height: 22px;
  scale: var(--size);
  color: var(--color-brand-soft);
  opacity: 0.2;
}

/* The glyph of the theme, which lib/themes.ts sets as --theme-glyph, in the text color. */
.glyph {
  background-color: currentColor;
  mask: var(--theme-glyph) center / contain no-repeat;
}

.star {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  scale: var(--size);
  opacity: 0.5;
}

/* ---------- out-of-tune ---------- */

.soft-a {
  --soft: var(--color-accent);
  left: -20vmax;
  top: -25vmax;
  width: 70vmax;
  height: 70vmax;
}

.soft-b {
  --soft: var(--color-brand);
  right: -25vmax;
  bottom: -30vmax;
  width: 70vmax;
  height: 70vmax;
}

/* ---------- Jazz ---------- */

.spot {
  top: 0;
  width: 46vw;
  height: 110vh;
  opacity: 0.55;
  /* A cone from the top that points down: 180deg is straight down. */
  background: conic-gradient(
    from 0deg at 50% 0%,
    transparent 166deg,
    color-mix(in srgb, var(--color-brand-soft) 35%, transparent) 174deg,
    color-mix(in srgb, var(--color-brand) 80%, transparent) 180deg,
    color-mix(in srgb, var(--color-brand-soft) 35%, transparent) 186deg,
    transparent 194deg
  );
  mask-image: linear-gradient(180deg, #000 10%, transparent 92%);
  transform-origin: 50% 0;
}

.spot-left {
  left: -6vw;
  rotate: -15deg;
}

.spot-right {
  right: -6vw;
  rotate: 15deg;
}

.stage-glow {
  left: 15vw;
  right: 15vw;
  bottom: -12vh;
  height: 34vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--color-brand) 30%, transparent),
    transparent
  );
}

.haze {
  inset: 30vh -10vw 0;
  background:
    radial-gradient(40% 50% at 30% 60%, rgb(225 225 240 / 0.07), transparent),
    radial-gradient(40% 40% at 72% 40%, rgb(225 225 240 / 0.06), transparent);
}

/* ---------- Rock ---------- */

.warm-light {
  left: -15vw;
  top: -20vh;
  width: 80vw;
  height: 80vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--color-accent-strong) 22%, transparent),
    transparent
  );
}

/* A fire along the front of the stage: tongues of light that flicker upward. */
.flames {
  inset: auto -5vw 0;
  height: 32vh;
  mask-image: linear-gradient(0deg, #000 30%, transparent);
}

.flame {
  position: absolute;
  bottom: -4vh;
  translate: -50% 0;
  transform-origin: 50% 100%;
  border-radius: 50% 50% 20% 20% / 70% 70% 30% 30%;
  background: radial-gradient(
    ellipse 50% 60% at 50% 85%,
    #fff2c8 0 8%,
    var(--color-accent-strong) 28%,
    color-mix(in srgb, var(--color-accent) 70%, transparent) 55%,
    transparent 75%
  );
  opacity: 0.55;
}

/* Lightning: a bright core inside a wide soft stroke, so it needs no blur. */
.lightning {
  left: 30vw;
  top: 0;
  width: 9vw;
  height: 46vh;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
}

.lightning-glow {
  stroke: rgb(170 190 255 / 0.25);
  stroke-width: 10;
  vector-effect: non-scaling-stroke;
}

.lightning-core {
  stroke: #f4f6ff;
  stroke-width: 1.6;
  vector-effect: non-scaling-stroke;
}

/* The whole sky lights up for an instant with the strike. */
.storm-flash {
  inset: 0;
  background: radial-gradient(
    80% 60% at 35% 0%,
    rgb(200 210 255 / 0.18),
    transparent 70%
  );
  opacity: 0;
}

/* A cabinet: black tolex with a fine diamond grain, a woven grille behind white piping. */
.cab {
  left: 5vw;
  bottom: -3vh;
  width: 46vmin;
  height: 40vmin;
  border-radius: 1.2vmin;
  background:
    repeating-linear-gradient(
      45deg,
      rgb(255 255 255 / 0.025) 0 1px,
      transparent 1px 3px
    ),
    repeating-linear-gradient(
      -45deg,
      rgb(255 255 255 / 0.025) 0 1px,
      transparent 1px 3px
    ),
    #0d0b0a;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 30px 60px rgb(0 0 0 / 0.6);
  opacity: 0.9;
}

.cab-grille {
  position: absolute;
  inset: 2.4vmin 2.4vmin 5vmin;
  border-radius: 0.5vmin;
  background:
    repeating-linear-gradient(
      0deg,
      color-mix(in srgb, var(--color-teal) 30%, transparent) 0 1px,
      transparent 1px 3px
    ),
    repeating-linear-gradient(
      90deg,
      color-mix(in srgb, var(--color-teal) 22%, transparent) 0 1px,
      transparent 1px 3px
    ),
    #19140d;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--color-brand) 55%, transparent),
    inset 0 0 30px rgb(0 0 0 / 0.6);
}

/* The plate where a maker puts its name. It stays blank. */
.cab-plate {
  position: absolute;
  left: 50%;
  top: 1.2vmin;
  width: 9vmin;
  height: 2.2vmin;
  translate: -50% 0;
  border-radius: 0.5vmin;
  background: linear-gradient(180deg, #f5ecd6, #cbbf9f);
  opacity: 0.75;
}

/* The head of a valve amp: black tolex around a brushed gold faceplate. */
.amp-head {
  right: 5vw;
  bottom: 7vh;
  width: 64vmin;
  height: 19vmin;
  border-radius: 1.2vmin;
  background:
    repeating-linear-gradient(
      45deg,
      rgb(255 255 255 / 0.025) 0 1px,
      transparent 1px 3px
    ),
    repeating-linear-gradient(
      -45deg,
      rgb(255 255 255 / 0.025) 0 1px,
      transparent 1px 3px
    ),
    #0d0b0a;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 30px 60px rgb(0 0 0 / 0.6);
}

.faceplate {
  position: absolute;
  inset: 2.4vmin 2.2vmin;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding-left: 5vmin;
  border-radius: 0.4vmin;
  background:
    repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 0.07) 0 1px,
      transparent 1px 3px
    ),
    linear-gradient(180deg, #ecc96d, #b98a2b 55%, #d8b25a);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.5),
    inset 0 -1px 0 rgb(0 0 0 / 0.4);
}

/* The pilot lamp: a red jewel that glows while the amp is on. */
.jewel {
  position: absolute;
  left: 2vmin;
  top: 50%;
  width: 2.2vmin;
  height: 2.2vmin;
  translate: 0 -50%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    #ffd0c8 0 10%,
    #e3261b 35%,
    #6e0a06 80%
  );
  box-shadow:
    0 0 0 0.3vmin #2a1a06,
    0 0 1.6vmin 0.3vmin rgb(255 60 40 / 0.55);
}

.control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vmin;
}

.dial {
  position: relative;
  width: 6vmin;
  height: 6vmin;
}

/* The scale around a knob: eleven marks over 300°, none at the bottom. */
.scale {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from -151deg,
    rgb(50 32 6 / 0.8) 0 2deg,
    transparent 2deg 30deg
  );
  mask:
    radial-gradient(closest-side, transparent 80%, #000 82%),
    conic-gradient(from 155deg, transparent 0 50deg, #000 50deg);
  mask-composite: intersect;
}

.knob {
  position: absolute;
  inset: 16%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #4b4b4b, #121212 60%, #000);
  box-shadow:
    0 0.3vmin 0.6vmin rgb(0 0 0 / 0.6),
    inset 0 1px 0 rgb(255 255 255 / 0.15);
}

/* A gold cap and a white pointer line. */
.knob::before {
  content: "";
  position: absolute;
  inset: 32%;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #f6dc8e, #a77b22);
}

.knob::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 6%;
  width: 2px;
  height: 30%;
  translate: -50% 0;
  border-radius: 1px;
  background: #f4efe2;
}

.control-label {
  font:
    700 0.95vmin / 1 ui-sans-serif,
    system-ui,
    sans-serif;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #3a2a0c;
}

/* ---------- Metal ---------- */

.backlight {
  left: 50%;
  top: -40vh;
  width: 120vmax;
  height: 90vh;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgb(214 222 236 / 0.2),
    rgb(214 222 236 / 0.05) 55%,
    transparent
  );
}

.red-light {
  right: -10vw;
  bottom: -30vh;
  width: 70vmax;
  height: 70vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--color-brand) 40%, transparent),
    transparent
  );
}

/* Seven strings across the screen; each is shaded like a steel cylinder. */
.strings {
  inset: -30vmax;
  rotate: -24deg;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.6vmin;
  opacity: 0.6;
}

/* Positioned, so the strings lie over the fretboard. */
.string {
  position: relative;
  display: block;
  background: linear-gradient(
    180deg,
    #24272b,
    #e3e7ec 45%,
    #6d727a 70%,
    #17191c
  );
}

/*
 * The fretboard under the strings: dark ebony, nickel frets, and sharp triangular inlays
 * as on the necks of shred guitars.
 */
.fretboard {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 19vmin;
  translate: 0 -50%;
  background:
    repeating-linear-gradient(
      90deg,
      rgb(200 205 214 / 0.35) 0 2px,
      transparent 2px 6.2vmin
    ),
    linear-gradient(180deg, #0c0b0b, #17140f 50%, #0c0b0b);
  box-shadow:
    0 -1px 0 rgb(255 255 255 / 0.06),
    0 1px 0 rgb(255 255 255 / 0.06);
}

.inlay {
  position: absolute;
  top: 8%;
  bottom: 8%;
  width: 4.2vmin;
  translate: -50% 0;
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: linear-gradient(
    135deg,
    rgb(240 242 246 / 0.55),
    rgb(160 170 190 / 0.25)
  );
}

/* Wound strings: a fine winding across the steel. */
.string.wound {
  background:
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.35) 0 1px,
      transparent 1px 2px
    ),
    linear-gradient(180deg, #24272b, #d5d9df 45%, #646970 70%, #17191c);
}

/* A glint of light that travels along the strings. */
.glint {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 18vmin;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 0.16),
    transparent
  );
  translate: -30vmin 0;
}

.fog {
  left: -20vw;
  width: 140vw;
  height: 30vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgb(170 178 192 / 0.12),
    transparent
  );
}

.fog-a {
  bottom: -6vh;
}

.fog-b {
  bottom: 8vh;
  opacity: 0.7;
}

/* ---------- Techno ---------- */

.concrete {
  inset: 0;
  background:
    radial-gradient(60% 40% at 28% 72%, rgb(255 255 255 / 0.03), transparent),
    radial-gradient(50% 50% at 76% 28%, rgb(255 255 255 / 0.025), transparent),
    linear-gradient(180deg, #0b0b0b, #121212);
}

/* A lighting truss under the ceiling: two chords and their bracing. */
.truss {
  left: 0;
  right: 0;
  top: 7vh;
  height: 3.2vh;
  background:
    linear-gradient(
      180deg,
      rgb(255 255 255 / 0.12) 0 1px,
      transparent 1px calc(100% - 1px),
      rgb(255 255 255 / 0.12) calc(100% - 1px)
    ),
    repeating-linear-gradient(
      60deg,
      transparent 0 14px,
      rgb(255 255 255 / 0.07) 14px 15px
    ),
    repeating-linear-gradient(
      -60deg,
      transparent 0 14px,
      rgb(255 255 255 / 0.07) 14px 15px
    );
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 15%,
    #000 85%,
    transparent
  );
}

.haze-band {
  left: -10vw;
  right: -10vw;
  top: 30vh;
  height: 45vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgb(255 255 255 / 0.05),
    transparent
  );
}

/* The lasers start at one point on the truss and fan out downward. */
.lasers {
  left: 50%;
  top: 9vh;
  width: 0;
  height: 0;
}

.laser {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 130vh;
  transform-origin: 50% 0;
  background: linear-gradient(
    180deg,
    var(--color-teal),
    color-mix(in srgb, var(--color-teal) 35%, transparent) 40%,
    transparent 85%
  );
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-teal) 60%, transparent);
  opacity: 0.5;
}

/* The sixteen steps of one bar. The lit step runs over them at 128 BPM. */
.sequencer {
  --pad: 2vmin;
  --gap: 0.8vmin;
  left: 50%;
  bottom: 13vh;
  display: flex;
  gap: var(--gap);
  translate: -50% 0;
  opacity: 0.75;
}

.pad {
  position: relative;
  width: var(--pad);
  height: var(--pad);
  border-radius: 3px;
  background: #262626;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06);
}

/* The first step of each beat is marked, with its number under it. */
.pad.beat {
  background: #333;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    inset 0 -2px 0 var(--color-accent);
}

.pad.beat::after {
  content: attr(data-beat);
  position: absolute;
  left: 0;
  top: calc(100% + 0.6vmin);
  font:
    600 1.1vmin / 1 ui-monospace,
    monospace;
  color: rgb(255 255 255 / 0.35);
}

.cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--pad);
  height: var(--pad);
  border-radius: 3px;
  background: var(--color-accent-strong);
  box-shadow: 0 0 12px var(--color-accent-strong);
}

/* ---------- IDM ---------- */

.blueprint {
  inset: 0;
  --line: color-mix(in srgb, var(--color-brand) 6%, transparent);
  --major: color-mix(in srgb, var(--color-brand) 12%, transparent);
  background:
    linear-gradient(var(--major) 1px, transparent 1px) 0 0 / 100% 64px,
    linear-gradient(90deg, var(--major) 1px, transparent 1px) 0 0 / 64px 100%,
    linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 100% 8px,
    linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0 / 8px 100%;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 85%);
}

/* A registration mark: a ring with a cross through it, as on a print sheet. */
.registration {
  width: 5vmin;
  height: 5vmin;
  border: 1px solid var(--color-brand);
  border-radius: 50%;
  opacity: 0.55;
}

.registration::before,
.registration::after {
  content: "";
  position: absolute;
  background: var(--color-brand);
}

.registration::before {
  left: 50%;
  top: -40%;
  bottom: -40%;
  width: 1px;
}

.registration::after {
  top: 50%;
  left: -40%;
  right: -40%;
  height: 1px;
}

.registration-tl {
  left: 6vmin;
  top: 14vmin;
}

.registration-tr {
  right: 8vmin;
  top: 14vmin;
}

.registration-bl {
  left: 6vmin;
  bottom: 12vmin;
}

.registration-br {
  right: 8vmin;
  bottom: 12vmin;
}

.harmonograph {
  left: 50%;
  top: 50%;
  width: 78vmin;
  height: 78vmin;
  translate: -50% -50%;
  overflow: visible;
}

.trace {
  fill: none;
  /* One screen pixel, whatever the size of the drawing. */
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.trace-a {
  stroke: color-mix(in srgb, var(--color-brand) 55%, transparent);
}

.trace-b {
  stroke: color-mix(in srgb, var(--color-teal) 40%, transparent);
}

.readouts {
  top: 22vh;
  height: 50vh;
  width: 14ch;
  overflow: hidden;
  font:
    500 10px / 2.2 ui-monospace,
    "SF Mono",
    monospace;
  letter-spacing: 0.14em;
  color: var(--color-brand);
  opacity: 0.4;
  mask-image: linear-gradient(
    180deg,
    transparent,
    #000 20%,
    #000 80%,
    transparent
  );
}

.readouts-left {
  left: 4vw;
}

.readouts-right {
  right: 7vw;
  text-align: right;
}

.readouts-roll {
  display: flex;
  flex-direction: column;
}

/* A slice of the screen that jumps aside for a moment, now and then. */
.glitch {
  left: 0;
  right: 0;
  top: 46vh;
  height: 1.4vh;
  background: linear-gradient(
    90deg,
    transparent 8%,
    color-mix(in srgb, var(--color-teal) 40%, transparent) 8% 31%,
    transparent 31% 52%,
    color-mix(in srgb, var(--color-brand) 35%, transparent) 52% 77%,
    transparent 77%
  );
  opacity: 0;
}

/* ---------- Hip hop ---------- */

.halftone {
  width: 50vmax;
  height: 50vmax;
  background: radial-gradient(circle, var(--color-brand) 2px, transparent 2.6px)
    0 0 / 13px 13px;
  opacity: 0.3;
}

.halftone-left {
  left: -10vmax;
  top: -10vmax;
  mask-image: radial-gradient(circle at 0 0, #000, transparent 70%);
}

.halftone-right {
  right: -10vmax;
  bottom: -10vmax;
  mask-image: radial-gradient(circle at 100% 100%, #000, transparent 70%);
}

.skyline {
  inset: auto 0 0;
  width: 100%;
  height: 26vh;
  fill: #08070a;
  stroke: color-mix(in srgb, var(--color-accent-strong) 35%, transparent);
  stroke-width: 1;
}

.equalizer {
  left: 50%;
  bottom: 30vh;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 14vh;
  translate: -50% 0;
  opacity: 0.32;
}

.equalizer span {
  width: 7px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(0deg, var(--color-accent), var(--color-brand));
  transform-origin: 50% 100%;
}

.vinyl {
  left: -14vmin;
  bottom: -14vmin;
  width: 46vmin;
  height: 46vmin;
  border-radius: 50%;
  opacity: 0.6;
  background:
    radial-gradient(circle, #000 0 2%, transparent 2.5%),
    radial-gradient(
      circle,
      var(--color-brand) 0 17%,
      var(--color-accent) 17.5% 19%,
      transparent 19.5%
    ),
    repeating-radial-gradient(circle, #111 0 2px, #1c1c1c 2px 3px), #111;
  box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06);
}

/* The light on a record stands still while the record turns under it. */
.vinyl-shine {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 30deg,
    transparent 0 20deg,
    rgb(255 255 255 / 0.1) 35deg,
    transparent 50deg 200deg,
    rgb(255 255 255 / 0.07) 215deg,
    transparent 230deg
  );
}

/* ---------- R&B and soul ---------- */

.scene-rnb .sky {
  background:
    radial-gradient(
      120% 70% at 50% 110%,
      color-mix(in srgb, var(--color-accent) 30%, transparent),
      transparent 65%
    ),
    linear-gradient(180deg, #0c0a14, #120d1c);
}

/* City lights, low and large, as through wet glass. */
.city {
  opacity: 0.4;
  scale: 1.6;
}

.rain {
  inset: -10vh 0 0;
  rotate: 6deg;
}

.streak {
  position: absolute;
  top: -15vh;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgb(220 225 255 / 0.35));
}

/* A drop on the glass: a lens that is dark above and catches light below. */
.droplet {
  border-radius: 50% 50% 48% 52% / 55% 55% 45% 45%;
  background: radial-gradient(
    circle at 50% 70%,
    rgb(255 255 255 / 0.35) 0 12%,
    rgb(200 190 230 / 0.12) 40%,
    rgb(0 0 0 / 0.25) 75%
  );
  box-shadow: 0 1px 0 rgb(255 255 255 / 0.12);
  opacity: 0.6;
}

/* ---------- Pop ---------- */

.field-a {
  --soft: var(--color-accent-strong);
  left: -15vmax;
  top: -18vmax;
  width: 65vmax;
  height: 65vmax;
}

.field-b {
  --soft: var(--color-teal);
  right: -18vmax;
  top: 8vh;
  width: 60vmax;
  height: 60vmax;
}

.field-c {
  --soft: var(--color-brand);
  left: 22vw;
  bottom: -32vmax;
  width: 60vmax;
  height: 60vmax;
}

/* A thin glossy ring, like the edge of a CD in the light. */
.ring {
  left: 50%;
  top: 50%;
  width: 70vmin;
  height: 70vmin;
  translate: -50% -50%;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-accent-strong),
    var(--color-brand),
    var(--color-teal),
    var(--color-accent-strong)
  );
  mask-image: radial-gradient(
    closest-side,
    transparent calc(100% - 2px),
    #000 calc(100% - 1px)
  );
  opacity: 0.3;
}

.twinkle {
  color: var(--color-brand);
  opacity: 0.35;
}

/* ---------- Ambient ---------- */

.fog-field-a {
  --soft: var(--color-teal);
  left: -15vw;
  top: -10vh;
  width: 70vmax;
  height: 60vmax;
}

.fog-field-b {
  --soft: var(--color-brand);
  right: -20vw;
  top: 15vh;
  width: 75vmax;
  height: 60vmax;
}

.fog-field-c {
  --soft: var(--color-accent);
  left: 20vw;
  bottom: -40vmax;
  width: 70vmax;
  height: 60vmax;
}

.loops {
  left: 14vw;
  right: 14vw;
  bottom: 15vh;
  height: 24vh;
}

.loop {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
}

.loop-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-brand) 30%, transparent) 12%,
    color-mix(in srgb, var(--color-brand) 30%, transparent) 88%,
    transparent
  );
}

.loop-label {
  position: absolute;
  right: calc(100% + 1.5vw);
  top: -0.6em;
  font:
    500 10px / 1 ui-monospace,
    "SF Mono",
    monospace;
  letter-spacing: 0.12em;
  white-space: nowrap;
  color: var(--color-brand);
  opacity: 0.35;
}

/* The runner is as wide as the line, so moving it by its own width carries the tone across. */
.loop-runner {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 0;
}

/* A tone fades behind itself, as a sound decays on tape. */
.loop-tone::before {
  content: "";
  position: absolute;
  right: 50%;
  top: 50%;
  width: 16vmin;
  height: 1px;
  translate: 0 -50%;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-brand-soft) 55%, transparent)
  );
}

.loop-tone {
  position: absolute;
  left: 0;
  top: 0;
  width: 2.4vmin;
  height: 2.4vmin;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    var(--color-brand-soft) 0 18%,
    color-mix(in srgb, var(--color-brand) 35%, transparent) 40%,
    transparent
  );
}

/* ---------- Reggae ---------- */

.rays {
  left: 50%;
  bottom: -80vmax;
  width: 160vmax;
  height: 160vmax;
  translate: -50% 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    color-mix(in srgb, var(--color-brand) 40%, transparent) 0 6deg,
    transparent 6deg 18deg
  );
  mask-image: radial-gradient(closest-side, #000 10%, transparent 80%);
  opacity: 0.2;
}

.sunrise {
  left: 50%;
  bottom: -14vmin;
  width: 34vmin;
  height: 34vmin;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    var(--color-brand-soft),
    var(--color-brand) 70%,
    transparent
  );
  opacity: 0.5;
}

.tricolor {
  inset: auto 0 0;
  height: 12px;
  opacity: 0.6;
  background: linear-gradient(
    180deg,
    var(--color-accent-strong) 0 4px,
    var(--color-brand) 4px 8px,
    var(--color-teal) 8px
  );
}

/* ---------- Latin ---------- */

.scene-latin .sky {
  /* The last light of the day: magenta above, mango at the horizon. */
  background: linear-gradient(
    0deg,
    color-mix(in srgb, var(--color-brand) 30%, transparent),
    color-mix(in srgb, var(--color-accent) 22%, transparent) 30%,
    transparent 70%
  );
}

.dusk-sun {
  left: 50%;
  bottom: -18vmin;
  width: 46vmin;
  height: 46vmin;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    var(--color-brand-soft),
    color-mix(in srgb, var(--color-brand) 60%, transparent) 60%,
    transparent
  );
  opacity: 0.45;
}

/*
 * Fronds hang in from the top corners, dark against the sky. The drawing grows from its
 * lower left corner, so a vertical flip hangs it from the top left, and a flip on both
 * axes from the top right. Each sways around the top edge it hangs from.
 */
.frond {
  top: -4vmin;
  width: 64vmin;
  height: 64vmin;
  overflow: visible;
  fill: #050806;
  stroke: #050806;
  stroke-width: 2;
  stroke-linejoin: round;
  opacity: 0.92;
}

.frond-left {
  left: -6vmin;
  scale: 1 -1;
  transform-origin: 0 0;
  translate: 0 64vmin;
}

/* Flipped around the middle of its top edge, so it stays in its box. */
.frond-right {
  right: -6vmin;
  scale: -1 -1;
  transform-origin: 50% 0;
  translate: 0 64vmin;
}

.clave {
  left: 50%;
  bottom: 14vh;
  display: flex;
  gap: 1.1vmin;
  translate: -50% 0;
}

.clave-step {
  width: 0.8vmin;
  height: 0.8vmin;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.18);
}

/* A stroke of the clave lights up on its sixteenth, then fades. */
.clave-step.stroke {
  width: 1.4vmin;
  height: 1.4vmin;
  margin-block: -0.3vmin;
  background: var(--color-brand);
  box-shadow: 0 0 10px var(--color-brand);
  opacity: 0.35;
}

/* ---------- Folk and country ---------- */

.scene-folk .sky {
  /* Dusk: the sky glows where the sun went down, just above the hills. */
  background: linear-gradient(
    0deg,
    transparent 8%,
    color-mix(in srgb, var(--color-brand) 30%, transparent) 24%,
    color-mix(in srgb, var(--color-accent) 12%, transparent) 38%,
    transparent 60%
  );
}

.moon {
  right: 16vw;
  top: 12vh;
  width: 7vmin;
  height: 7vmin;
  border-radius: 50%;
  /* A crescent: the dark of the sky covers most of a bright disc. */
  background: radial-gradient(
    circle at 70% 40%,
    transparent 0 52%,
    var(--color-brand-soft) 54%
  );
  opacity: 0.6;
}

.hills {
  inset: auto 0 0;
  width: 100%;
  height: 34vh;
}

.hill-far {
  fill: color-mix(in srgb, var(--color-accent) 22%, #000);
}

.hill-near {
  fill: #090705;
}

.firefly {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  scale: var(--size);
  background: var(--color-brand-soft);
  box-shadow: 0 0 10px 2px var(--color-brand-soft);
  opacity: 0.55;
}

/* ---------- Classical ---------- */

.hall-light {
  left: 50%;
  top: -35vh;
  width: 110vmax;
  height: 80vh;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--color-brand) 22%, transparent),
    transparent
  );
}

.dust {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  scale: var(--size);
  background: var(--color-brand-soft);
  opacity: 0.45;
}

.score {
  left: 0;
  width: 100%;
  bottom: 14vh;
  height: 15vh;
  opacity: 0.32;
}

.staff {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  stroke: var(--color-brand);
  stroke-width: 1;
}

/* A note head, tilted as in print, with its stem up. */
.note {
  position: absolute;
  width: 1.6vh;
  height: 1.1vh;
  translate: -50% -50%;
  rotate: -20deg;
  border-radius: 50%;
  background: var(--color-brand-soft);
}

.note::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 50%;
  width: 1.5px;
  height: 4.5vh;
  rotate: 20deg;
  transform-origin: 100% 100%;
  background: var(--color-brand-soft);
}

/* ---------- Motion: only transform and opacity, slow, and none when asked ---------- */

@media (prefers-reduced-motion: no-preference) {
  .rise {
    animation: rise linear infinite;
  }

  .twinkle,
  .star {
    animation: twinkle ease-in-out infinite;
  }

  .dust {
    animation: ember linear infinite;
  }

  .firefly {
    animation: firefly ease-in-out infinite alternate;
  }

  .bokeh {
    animation: bokeh 18s ease-in-out infinite alternate;
  }

  .haze,
  .haze-band,
  .fog-field-a,
  .field-a,
  .soft-a,
  .fog-a {
    animation: drift 40s ease-in-out infinite alternate;
  }

  .fog-field-b,
  .field-b,
  .soft-b,
  .fog-b {
    animation: drift 52s ease-in-out infinite alternate-reverse;
  }

  .fog-field-c {
    animation: drift 64s ease-in-out infinite alternate;
  }

  .stage-glow,
  .warm-light,
  .red-light {
    animation: breathe 8s ease-in-out infinite;
  }

  .glint {
    animation: glint 9s ease-in-out infinite;
  }

  .streak {
    animation: fall linear infinite;
  }

  .flame {
    animation: flicker ease-in-out infinite alternate;
  }

  /* A strike now and then: two quick flashes, then a long dark sky. */
  .lightning,
  .storm-flash {
    animation: strike-flash 11s linear infinite;
  }

  .frond-left {
    animation: sway-left 9s ease-in-out infinite alternate;
  }

  .frond-right {
    animation: sway-right 11s ease-in-out infinite alternate;
  }

  .clave-step.stroke {
    animation: strike 2.4s ease-out infinite;
  }

  .lasers {
    animation: sweep 14s ease-in-out infinite alternate;
  }

  /* One bar of sixteenths at 128 BPM: 60 / 128 × 4 = 1.875 s. */
  .cursor {
    animation: step 1.875s steps(16, jump-none) infinite;
  }

  .harmonograph {
    animation: turn 140s linear infinite;
  }

  .readouts-roll {
    animation: roll 48s linear infinite;
  }

  .readouts-right .readouts-roll {
    animation-duration: 61s;
  }

  .glitch {
    animation: glitch 9s steps(1, end) infinite;
  }

  .loop-runner {
    animation: loop linear infinite;
  }

  .equalizer span {
    animation: bounce ease-in-out infinite alternate;
  }

  .vinyl {
    animation: turn 1.8s linear infinite;
  }

  .vinyl-shine {
    /* Turns back as fast as the record turns, so the light stands still. */
    animation: turn 1.8s linear infinite reverse;
  }

  .ring {
    animation: turn 60s linear infinite;
  }

  .rays {
    animation: turn 200s linear infinite;
  }
}

@keyframes rise {
  from {
    translate: 0 8vh;
    opacity: 0;
  }
  15%,
  80% {
    opacity: 0.2;
  }
  to {
    translate: 3vw -18vh;
    opacity: 0;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.55;
  }
}

@keyframes ember {
  from {
    translate: 0 10vh;
    opacity: 0;
  }
  20% {
    opacity: 0.75;
  }
  to {
    translate: -2vw -30vh;
    opacity: 0;
  }
}

@keyframes firefly {
  from {
    translate: 0 0;
    opacity: 0.15;
  }
  to {
    translate: 2vw -3vh;
    opacity: 0.7;
  }
}

@keyframes bokeh {
  to {
    translate: calc(-50% + 3vw) calc(-50% - 2vh);
    opacity: 0.2;
  }
}

@keyframes drift {
  to {
    translate: 6vw 3vh;
  }
}

@keyframes breathe {
  50% {
    opacity: 0.75;
  }
}

@keyframes bounce {
  from {
    scale: 1 0.35;
  }
  to {
    scale: 1 1;
  }
}

@keyframes turn {
  to {
    rotate: 360deg;
  }
}

@keyframes glint {
  0% {
    translate: -30vmin 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  60%,
  100% {
    translate: calc(100vw + 60vmax) 0;
    opacity: 0;
  }
}

@keyframes sweep {
  from {
    rotate: -7deg;
  }
  to {
    rotate: 7deg;
  }
}

/* With jump-none, the 16 positions include both ends: from the first pad to the last. */
@keyframes step {
  to {
    translate: calc(15 * (var(--pad) + var(--gap))) 0;
  }
}

/* The list is there twice, so moving it up by half its height starts it again. */
@keyframes roll {
  to {
    translate: 0 -50%;
  }
}

@keyframes glitch {
  0%,
  91%,
  96%,
  100% {
    opacity: 0;
    translate: 0 0;
  }
  92% {
    opacity: 0.9;
    translate: -2.5vw 0;
  }
  93.5% {
    opacity: 0.6;
    translate: 1.8vw 0.4vh;
  }
}

@keyframes loop {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  8%,
  92% {
    opacity: 1;
  }
  100% {
    translate: 100% 0;
    opacity: 0;
  }
}

@keyframes fall {
  to {
    translate: 0 130vh;
  }
}

@keyframes sway-left {
  to {
    rotate: 3deg;
  }
}

@keyframes sway-right {
  to {
    rotate: -3deg;
  }
}

/* The stroke flashes at the start of the bar's loop; each step starts it at its own time. */
@keyframes strike {
  0% {
    opacity: 1;
    scale: 1.25;
  }
  30%,
  100% {
    opacity: 0.35;
    scale: 1;
  }
}

@keyframes flicker {
  0% {
    scale: 1 0.82;
    opacity: 0.45;
  }
  50% {
    scale: 0.92 1.08;
    opacity: 0.6;
  }
  100% {
    scale: 1.05 0.95;
    opacity: 0.5;
  }
}

@keyframes strike-flash {
  0%,
  70%,
  71.2%,
  72.4%,
  74%,
  100% {
    opacity: 0;
  }
  70.4%,
  71.6% {
    opacity: 1;
  }
  72.8% {
    opacity: 0.6;
  }
}
</style>
