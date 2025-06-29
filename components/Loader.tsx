import { cn } from "@/lib/utils"
import GeminiIcon from "./GeminiIcon"

export default function Loader ({name,className}:{name:string,className?:string}){
return <div className={cn("flex items-center justify-center",className)}><GeminiIcon className="animate-spin size-6 invert dark:invert-0"/> Loading {name}</div>
}