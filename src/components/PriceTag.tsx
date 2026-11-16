import { useLocale, useTranslations } from "next-intl";
import type { Price } from "@/domain/types";
import { priceAmount } from "@/domain/format";

export function PriceTag({ price, className = "" }: { price: Price; className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const amount = priceAmount(price, locale);

  if (!amount) {
    return <span className={`rounded-full bg-teal-100 px-2.5 py-0.5 font-bold text-ink ${className}`}>{t("free")}</span>;
  }
  return (
    <span className={className}>
      <span className="font-bold">{amount}</span>
      {price.unit && <span className="text-sm text-muted"> {t(price.unit)}</span>}
    </span>
  );
}
