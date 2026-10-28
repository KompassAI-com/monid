import { assert, assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
import { fromFileUrl } from "@std/path";
import {
    assertInputAccepted,
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const chains = fromFileUrl(new URL("../../fixtures/", import.meta.url));
const ID = "fuse#data/companies/count";
const QUERY = "Series B fintech companies in New York with 50 to 200 employees";

const run = async (fixture: string, body: Json) =>
    runEndpoint({
        unit: await testSealedUnit(ID),
        input: { body },
        mode: "replay",
        fixture: await loadFixture(`${chains}${fixture}`),
    });

Deno.test("fuse#data/companies/count: a count answers live, free", async () => {
    const result = await run("synthetic-companies-count.json", {
        query: QUERY,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const output = result.output as Record<string, unknown>;
    assertEquals(output.total, 1287);
    assertEquals(output.unresolvedCriteria, []);
    assertEquals("creditsCharged" in output, false);
});

Deno.test("fuse#data/companies/count: a refusal is zero-billed data", async () => {
    const result = await run("synthetic-rate-limited.json", { query: QUERY });
    assertEquals(result.httpStatus, 429);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("fuse#data/companies/count: the gate rejects no source and an unknown filter, and passes filters", async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(
        `${chains}synthetic-companies-count.json`,
    );
    const refused: Json[] = [{}, { filters: { headquarters: ["New York"] } }];
    for (const body of refused) {
        await assertRejects(
            () =>
                runEndpoint({ unit, input: { body }, mode: "replay", fixture }),
            Error,
            "INVALID_INPUT",
        );
    }
    await assertInputAccepted({
        unit,
        input: {
            body: {
                filters: {
                    headquartersCity: ["New York, New York, United States"],
                },
            },
        },
        mode: "replay",
        fixture,
    });
});

Deno.test({
    name: "fuse#data/companies/count live: a sentence counts to a total",
    ignore: liveSkip("fuse"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit(ID),
            input: { body: { query: "fintech companies in New York" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assert(
            typeof (result.output as Record<string, unknown>).total ===
                "number",
        );
    },
});
