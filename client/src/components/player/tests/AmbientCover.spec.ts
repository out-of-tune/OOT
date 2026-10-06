// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import AmbientCover from "../AmbientCover.vue";

it("blurs the smallest cover, and shows nothing without one", () => {
  const cover = mount(AmbientCover, {
    props: {
      images: [
        { url: "big.jpg", width: 640 },
        { url: "small.jpg", width: 64 },
      ],
    },
  });
  const style = cover.get(".ambient-cover").attributes("style");
  expect(style).toContain("small.jpg");
  expect(cover.get(".ambient-cover").attributes("aria-hidden")).toBe("true");
  expect(mount(AmbientCover, { props: { images: [] } }).html()).not.toContain(
    "ambient-cover",
  );
});
