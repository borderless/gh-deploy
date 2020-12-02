import { deploy } from "./index";

describe("deploy", () => {
  it("should export a deploy function", () => {
    expect(deploy).toBeInstanceOf(Function);
  });
});
