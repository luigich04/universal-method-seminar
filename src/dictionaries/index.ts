import { it, Dictionary } from "./it";
import { en } from "./en";

export type { Dictionary };
export type Locale = "it" | "en";

export const dictionaries: Record<Locale, Dictionary> = {
  it,
  en,
};

export const getDictionary = (locale: string): Dictionary => {
  if (locale === "en") return en;
  return it;
};
