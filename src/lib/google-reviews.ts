/**
 * Google review data for the trust section.
 * Replace `reviews` with real Google reviews (e.g. from the Places API) and set
 * `placeUrl` / `writeUrl` to the Google Business profile. While `reviews` is empty,
 * the section shows clearly marked sample quotes instead.
 */
export type GoogleReview = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** ISO date, e.g. "2026-10-12" */
  date: string;
  avatarUrl?: string;
};

export const googleReviews: {
  rating: number | null;
  total: number | null;
  placeUrl: string | null;
  writeUrl: string | null;
  reviews: GoogleReview[];
} = {
  rating: null,
  total: null,
  placeUrl: null,
  writeUrl: null,
  reviews: [],
};
