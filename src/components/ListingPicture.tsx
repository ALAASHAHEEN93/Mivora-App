import Image from "next/image";
import type { Activity } from "@/domain/types";
import { Artwork } from "./Artwork";

/**
 * Listing picture: the photo when the listing has one, otherwise the illustrated scene.
 * Photos are decorative (the title sits right next to them), so alt is empty.
 * They go through Next's image optimizer, so visitors' browsers never contact the photo host.
 */
export function ListingPicture({
  activity,
  className,
  sizes,
  priority = false,
}: {
  activity: Activity;
  /** Size/aspect classes, e.g. "aspect-[4/3] w-full". */
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!activity.photo) {
    return <Artwork accent={activity.accent} category={activity.categories[0]!} className={className} />;
  }
  return (
    <div className={`relative overflow-hidden bg-coral-100 ${className}`}>
      <Image src={activity.photo.src} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
