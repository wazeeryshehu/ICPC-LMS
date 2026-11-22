const LOGO_SRC = "/images/icpc-logo.png";
const EMBLEM_SRC = "/images/icpc-emblem.png";
const LOGO_ALT = "Independent Corrupt Practices and Other Related Offences Commission";

export function IcpcLogo({
  className = "h-9 w-auto",
  emblem = false,
}: {
  className?: string;
  emblem?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={emblem ? EMBLEM_SRC : LOGO_SRC}
      alt={LOGO_ALT}
      className={`block shrink-0 ${className}`}
    />
  );
}

export function LogoPlate({
  className = "",
  imageClassName = "h-8 w-auto",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow-[0_1px_3px_rgba(6,20,43,0.28)] ring-1 ring-black/5 ${className}`}
    >
      <IcpcLogo className={imageClassName} />
    </span>
  );
}
