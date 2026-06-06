// Search the `keywords` array to match. Mix real memories + F-13 breadcrumbs.

export type Memory = {
  id: number;
  keywords: string[];
  caption: string;
  text: string;
  /** Optional photo URL. If null, render a styled empty polaroid block. */
  image?: string | null;
  /** Breadcrumb memories read like they're observed from outside, not shared. */
  breadcrumb?: boolean;
};

export const memories: Memory[] = [
  // [FILL: real memories of your friend]
  // {
  //   id: 1,
  //   keywords: ["school", "lunch", "2019"],
  //   caption: "the great lunch incident",
  //   text: "[YOUR MEMORY HERE]",
  // },

  // F-13 breadcrumbs (will be filled in content pass)
  // {
  //   id: 100,
  //   keywords: ["1961"],
  //   caption: "an old year",
  //   text: "[BREADCRUMB — references the lab year]",
  //   breadcrumb: true,
  // },
];
