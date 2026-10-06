import { createRootState } from "@/store/state";
import { generateSearchObject, validateSearchObject } from "../searchObject";

it("accepts metadata attributes in the graph search", () => {
  const { schema } = createRootState();
  const searchObject = generateSearchObject("album: mbRating>4");
  expect(searchObject.valid).toBe(true);
  expect(validateSearchObject(searchObject, schema)).toBe(true);
  expect(
    validateSearchObject(generateSearchObject("album: nothing>4"), schema),
  ).toBe(false);
});
