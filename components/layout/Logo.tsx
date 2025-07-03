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
        src={mounted && resolvedTheme === "dark" ? "/images/gdgck-white.svg" : "/images/gdgck-color.svg"}
        alt="GDG Cloud Kolkata"
        width={200}
        height={48}
        className="h-10 md:h-8 lg:h-12 min-h-6 w-auto mr-2"
      />
    </Link>
  );
}
