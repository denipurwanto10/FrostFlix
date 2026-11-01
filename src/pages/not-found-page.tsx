import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="page-enter wrap flex min-h-[80vh] flex-col justify-center pb-10 pt-28">
      <p className="kicker mb-6">Error 404</p>
      <h1 className="font-display text-[clamp(5rem,20vw,16rem)] leading-[0.8] tracking-tight">
        Cut<span className="text-primary">.</span>
      </h1>
      <p className="mt-8 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        This reel doesn’t exist — the page was moved, or never shot.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/" className={buttonVariants({ size: 'lg' })}>
          Back to home
        </Link>
        <Link to="/explore" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          Explore films
        </Link>
      </div>
    </section>
  )
}
