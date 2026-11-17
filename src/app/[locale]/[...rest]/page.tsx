import { notFound } from "next/navigation";

/** Any unknown address inside a language (e.g. a typo) shows Mivora's own "not found" screen. */
export default function CatchAll() {
  notFound();
}
