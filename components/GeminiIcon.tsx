import { cn } from "@/lib/utils"
import Image from "next/image"

export default function GeminiIcon({className}:{className?:string}){
    return <Image
    src="/images/elements/gemini.svg"
    alt="gemini"
    width={24}
    height={24}
    className={cn("w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 ",className)}
  />
}