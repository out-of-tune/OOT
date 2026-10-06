import GraphService from "@/services/GraphService";
import { createRootState } from "@/store/state";
import { checkNodesExistence } from "../graphql";

vi.mock("@/services/GraphService");

it("asks the API only for the attributes it has, not for metadata attributes", async () => {
  vi.mocked(GraphService.getNodes).mockResolvedValue({});
  const { schema } = createRootState();
  expect(
    schema.nodeTypes.find((type) => type.label === "artist")
      ?.metadataAttributes,
  ).toContain("mbRating");
  await checkNodesExistence("artist", ["sid"], schema, vi.fn(), {} as never);
  const [query] = vi.mocked(GraphService.getNodes).mock.calls[0];
  expect(query).toContain("name");
  expect(query).not.toContain("mbRating");
});
