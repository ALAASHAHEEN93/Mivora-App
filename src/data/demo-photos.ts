/**
 * DEMO DATA — stock photos for the fictional demo listings.
 * All from Unsplash under the Unsplash License (free commercial use, no attribution
 * required; we credit anyway). Chosen to avoid recognisable children's faces.
 * Real listings must use photos the provider owns, with confirmed image rights.
 */
import type { Photo } from "@/domain/types";

const unsplash = (id: string, credit: string, sourceUrl: string): Photo => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`,
  credit,
  sourceUrl,
  license: "unsplash",
});

export const DEMO_PHOTOS: Record<string, Photo> = {
  a1: unsplash("1686749143613-0eeacff36894", "Marea Wellness", "https://unsplash.com/photos/b0pE3GNhOdQ"),
  a2: unsplash("1589051088132-06f36a22012a", "Anne Nygård", "https://unsplash.com/photos/G4IB-r6nsJI"),
  a3: unsplash("1527430253228-e93688616381", "Emilipothèse", "https://unsplash.com/photos/R4WCbazrD1g"),
  a4: unsplash("1455884981818-54cb785db6fc", "Annie Spratt", "https://unsplash.com/photos/O1TNdLNvJLM"),
  a5: unsplash("1545558014-8692077e9b5c", "Vanessa Bucceri", "https://unsplash.com/photos/gDiRwIYAMA8"),
  a6: unsplash("1771363340736-e3cc8d30cb11", "Mavi Atlas", "https://unsplash.com/photos/arKRetSfOjI"),
  a7: unsplash("1588052356599-939841f42126", "Markus Spiske", "https://unsplash.com/photos/F9FFiYu8tIA"),
  a8: unsplash("1508700929628-666bc8bd84ea", "Michael Afonso", "https://unsplash.com/photos/z8Tul255kGg"),
  a9: unsplash("1523689119443-df96632084a1", "Lee Pigott", "https://unsplash.com/photos/OJ4m4_yIgjY"),
  a10: unsplash("1669896857224-cc0068a0b608", "Hongbin", "https://unsplash.com/photos/fbNsB_9wIzA"),
  a11: unsplash("1579952363873-27f3bade9f55", "Connor Coyne", "https://unsplash.com/photos/OgqWLzWRSaI"),
  a12: unsplash("1603354350317-6f7aaa5911c5", "Robo Wunderkind", "https://unsplash.com/photos/hLvQ4-QEBAE"),
  a13: unsplash("1592484806287-7bc9c8af5405", "Lavi Perchik", "https://unsplash.com/photos/ksGmUF1aE2I"),
};
