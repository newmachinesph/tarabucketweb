/**
 * Progress constants shared by server and client.
 *
 * Split out of `progress.ts` because that module is `"use client"` — server components
 * (the quiz page, share cards) need the catalog size for copy without dragging a client
 * module and its hooks across the boundary.
 */

/** Total experiences in the catalog, for the "X of N" framing that is the whole identity
 *  mechanic. ponytail: hardcoded so /profile and the quiz stay static. Phase 0 of PLAN.md
 *  reads the live count. */
export const CATALOG_SIZE = 879;

/** Provinces in the Philippines (82 + NCR is counted separately in most challenge culture;
 *  #Project81 predates Maguindanao's 2022 split). Used for the X/82 flex. */
export const PROVINCE_COUNT = 82;
