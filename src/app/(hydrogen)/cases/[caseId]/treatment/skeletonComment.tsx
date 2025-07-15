import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export function CommentSkeleton({length}: {length:number}) {
  useEffect(()=>
  {
    // console.log("length of messages inside comments", length)
  })
    return (
      <div className="space-y-6">
        {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className="flex items-start space-x-3 p-4 rounded-md animate-pulse"
        >
          {/* Skeleton Avatar */}
          <div className="h-8 w-8 xl:h-12 xl:w-12 rounded-full"></div>
          {/* Skeleton Message Content */}
          <div className="flex-1 space-y-2">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
          </div>
        </div>
      ))}
      </div>
    )
  }
  