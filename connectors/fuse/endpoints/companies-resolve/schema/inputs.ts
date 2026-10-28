import { z } from "zod";

const zResolveCompanyFields = z.strictObject({
    name: z.string().min(1).max(255).describe(
        "The company's name, e.g. `Stripe`. The least precise identifier: " +
            "used only when no `domain` or `linkedinUrl` is given.",
    ).optional(),
    domain: z.string().min(1).max(253).describe(
        "The company's website domain, e.g. `stripe.com`; a full URL such " +
            "as `https://www.stripe.com/about` is reduced to its domain.",
    ).optional(),
    linkedinUrl: z.string().min(1).max(2048).describe(
        "The company's LinkedIn page, e.g. " +
            "`https://www.linkedin.com/company/stripe`, `company/stripe` or " +
            "the bare slug `stripe`.",
    ).optional(),
});

/**
 * `POST /data/companies/resolve` body — the mirror of Fuse's published
 * request (design D25), STRICT like the API. Fuse takes AT LEAST ONE of the
 * three identifiers, so the mirror is a union of arms each requiring one.
 */
export const zResolveCompanyBody = z.union([
    zResolveCompanyFields.required({ name: true }),
    zResolveCompanyFields.required({ domain: true }),
    zResolveCompanyFields.required({ linkedinUrl: true }),
]);
