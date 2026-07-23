import Image from "next/image";
import Link from "next/link";

export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" aria-label="Tara Bucket - home" className={`inline-flex ${className}`}>
      <Image
        src="/tarabucket-full-logo.png"
        alt="Tara Bucket"
        width={260}
        height={150}
        priority={priority}
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}

export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/tarabucket-square-logo-transparent.png"
      alt="Tara Bucket"
      width={size}
      height={size}
      className={className}
    />
  );
}
