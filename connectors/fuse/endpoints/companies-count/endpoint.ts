import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCountCompaniesBody } from "./schema/inputs.ts";

/** `POST /data/companies/count` — how many companies match a search, free.
 *  SYNC: counted live, in the same call. */
export default defineEndpoint({
    meta: {
        displayName: "Count Companies",
        summary:
            "Count the companies matching a plain-English description or company-search filters, free.",
        description: "Count how many companies match a plain-English " +
            "sentence or company-search filters (industry, headquarters " +
            "location, headcount, revenue, funding stage, technologies, " +
            "keywords). Free: nothing is charged and no companies are " +
            'listed. Send exactly one of `query`, e.g. "Series B fintech ' +
            'companies in New York with 50 to 200 employees", or `filters` ' +
            "in the `fuse#companies/search` vocabulary. Counted live, in the " +
            "same call. The answer carries `total` (the companies matching), " +
            "`filters` (what was counted: send them to " +
            "`fuse#companies/search` to list the companies) and, with a " +
            "`query`, `unresolvedCriteria` (parts of the sentence no filter " +
            "could express). Use it to size or tune a search before paying " +
            "for rows.",
        categories: ["company-enrichment"],
        notes: [
            "`filters.headquartersCity` names that geocode to nothing are " +
            "dropped; only when none resolves is the count refused (422 " +
            "CITY_FILTER_UNRESOLVED).",
        ],
    },
    request: { method: "POST", path: "/data/companies/count" },
    input: { schema: { body: zCountCompaniesBody } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
