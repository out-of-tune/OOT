// @vitest-environment jsdom
import "fake-indexeddb/auto";
import IndexedDbService from "../IndexedDbService";

afterEach(() => vi.restoreAllMocks());

describe("IndexedDbService", () => {
  it("rejects a save whose transaction does not commit", async () => {
    const put = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<IDBObjectStore["put"]>
    ) {
      const request = put.apply(this, args);
      // The write succeeds, then the commit fails.
      request.addEventListener("success", () => this.transaction.abort());
      return request;
    });
    await expect(
      IndexedDbService.saveConfiguration("broken", {} as never),
    ).rejects.toThrow();
    vi.restoreAllMocks();
    await expect(IndexedDbService.getConfiguration("broken")).rejects.toThrow(
      "Configuration not existing",
    );
  });

  it("resolves a save once the record can be read", async () => {
    await IndexedDbService.saveConfiguration("kept", {} as never);
    await expect(IndexedDbService.getConfiguration("kept")).resolves.toEqual(
      {},
    );
  });
});
