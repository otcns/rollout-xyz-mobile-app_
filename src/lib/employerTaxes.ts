// US States list and estimated SUTA (State Unemployment Tax Act) rates for employers
// These are approximate "new employer" rates and vary by experience rating.

export const US_STATES = [
  { abbr: "AL", name: "Alabama" },
  { abbr: "AK", name: "Alaska" },
  { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" },
  { abbr: "CA", name: "California" },
  { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" },
  { abbr: "DE", name: "Delaware" },
  { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" },
  { abbr: "HI", name: "Hawaii" },
  { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" },
  { abbr: "IN", name: "Indiana" },
  { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" },
  { abbr: "KY", name: "Kentucky" },
  { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" },
  { abbr: "MD", name: "Maryland" },
  { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" },
  { abbr: "MN", name: "Minnesota" },
  { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" },
  { abbr: "MT", name: "Montana" },
  { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" },
  { abbr: "NH", name: "New Hampshire" },
  { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" },
  { abbr: "NY", name: "New York" },
  { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" },
  { abbr: "OH", name: "Ohio" },
  { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" },
  { abbr: "PA", name: "Pennsylvania" },
  { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" },
  { abbr: "SD", name: "South Dakota" },
  { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" },
  { abbr: "UT", name: "Utah" },
  { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" },
  { abbr: "WA", name: "Washington" },
  { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" },
  { abbr: "WY", name: "Wyoming" },
  { abbr: "DC", name: "District of Columbia" },
];

// Approximate new-employer SUTA rates by state (as decimal)
// Source: general averages — actual rates depend on experience rating
const SUTA_RATES: Record<string, number> = {
  AL: 0.025, AK: 0.0178, AZ: 0.02, AR: 0.032,
  CA: 0.034, CO: 0.0171, CT: 0.031, DE: 0.018,
  FL: 0.027, GA: 0.027, HI: 0.036, ID: 0.0116,
  IL: 0.0325, IN: 0.025, IA: 0.01, KS: 0.027,
  KY: 0.027, LA: 0.0109, ME: 0.024, MD: 0.023,
  MA: 0.0168, MI: 0.027, MN: 0.01, MS: 0.012,
  MO: 0.0, MT: 0.013, NE: 0.012, NV: 0.0275,
  NH: 0.025, NJ: 0.0268, NM: 0.01, NY: 0.041,
  NC: 0.01, ND: 0.0108, OH: 0.027, OK: 0.015,
  OR: 0.023, PA: 0.036, RI: 0.0199, SC: 0.006,
  SD: 0.012, TN: 0.025, TX: 0.027, UT: 0.012,
  VT: 0.01, VA: 0.025, WA: 0.015, WV: 0.027,
  WI: 0.037, WY: 0.0094, DC: 0.027,
};

/**
 * Returns the estimated SUTA rate for a given state abbreviation.
 * Falls back to a national average of ~2.7% if not found.
 */
export function getStateSUTA(stateAbbr: string): number {
  if (!stateAbbr) return 0.027;
  return SUTA_RATES[stateAbbr] ?? 0.027;
}
