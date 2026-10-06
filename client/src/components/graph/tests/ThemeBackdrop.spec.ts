// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";
import { THEMES } from "@/lib/themes";
import { key } from "@/store";
import ThemeBackdrop from "../ThemeBackdrop.vue";

const mountWith = (uiTheme: string, autoTheme = "default") =>
  mount(ThemeBackdrop, {
    global: {
      plugins: [
        [createStore({ state: { appearance: { uiTheme, autoTheme } } }), key],
      ],
    },
  });

it.each(THEMES.map((theme) => theme.id))(
  "draws a scene for the %s theme, hidden from assistive technology",
  (id) => {
    const root = mountWith(id).get(".theme-backdrop");
    expect(root.classes()).toContain(`scene-${id}`);
    expect(root.attributes("aria-hidden")).toBe("true");
    expect(root.element.children.length).toBeGreaterThan(0);
  },
);

it("follows the graph in auto mode", () => {
  expect(
    mountWith("auto", "reggae").get(".theme-backdrop").classes(),
  ).toContain("scene-reggae");
});

it("puts the notes of the classical staff on lines and spaces", () => {
  const notes = mountWith("classical").findAll(".note");
  expect(notes.length).toBeGreaterThan(0);
  for (const note of notes) {
    const top = parseFloat((note.element as HTMLElement).style.top);
    const step = ((top - 30) * 8) / 53.3;
    expect(Math.abs(step - Math.round(step))).toBeLessThan(1e-6);
  }
});
