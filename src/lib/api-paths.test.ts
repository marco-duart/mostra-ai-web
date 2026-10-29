import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { NOVIDADES_PATHS } from "./api-paths.ts";

describe("caminhos da API de Novidades", () => {
  it("usam o prefixo /api/v1 como o resto do web", () => {
    assert.equal(NOVIDADES_PATHS.list, "/api/v1/novidades");
    assert.equal(NOVIDADES_PATHS.events, "/api/v1/novidades/events");
  });
});
