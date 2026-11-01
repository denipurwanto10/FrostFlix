import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} />
}

export default Skeleton
