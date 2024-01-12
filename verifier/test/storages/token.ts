import { suite } from "uvu";
import * as a from "uvu/assert";
import { TokenStorage } from "../../src/storages/token.js";

const test = suite("Token storage tests");

test("set and get token", async () => {
  const subjectId = "mina:publickey:123123";
  const aci = "123";
  const tokenStorage = new TokenStorage();
  const isSet = await tokenStorage.setToken({ subjectId, aci });
  a.ok(isSet);
  const token = await tokenStorage.findToken(subjectId);
  a.ok(token);
  const notSet = await tokenStorage.setToken({
    subjectId: "mina:publickey:456456",
    aci
  });
  a.not.ok(notSet);
  await tokenStorage.deleteAll();
});

test.run();