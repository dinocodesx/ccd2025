import { cn } from "@/lib/utils"

export default function GeminiIcon({className}:{className?:string}){
    return <img
    src="/images/elements/gemini.svg"
    alt="gemini"
    className={cn("w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 dark:invert",className)}
  />
}