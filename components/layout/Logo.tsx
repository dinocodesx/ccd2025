"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/" className={`${className}`}>
      <Image
        src="/images/GDGCK.png"
        alt="GDG Cloud Kolkata"
        width={120}
        height={48}
        className="h-10 md:h-8 lg:h-12 min-h-6 w-auto mr-2"
        style={{
          filter:
            mounted && resolvedTheme === "dark"
              ? "brightness(0) saturate(100%) invert(98%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
              : "none",
        }}
      />
    </Link>
  );
}
