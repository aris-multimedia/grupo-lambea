import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

interface PageHeroProps {
  tagline: string
  TaglineIcon?: LucideIcon
  headline: string
  headlineEm?: string
  description?: string
  image?: string
  imageAlt?: string
  minHeight?: number
}

/**
 * Standard hero for all public pages.
 * Background: #1E92D8 (brand blue) + 0.22 dark overlay for WCAG AA compliance.
 * Effective contrast white-on-background ≈ 4.5:1.
 */
export function PageHero({
  tagline,
  TaglineIcon,
  headline,
  headlineEm,
  description,
  image,
  imageAlt = '',
  minHeight = 360,
}: PageHeroProps) {
  return (
    <section
      className="relative flex items-end overflow-hidden"
      style={{ background: '#1E92D8', minHeight }}
    >
      {/* Optional photo texture */}
      {image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            style={{ opacity: 0.2 }}
            priority
          />
        </div>
      )}

      {/* Accessibility overlay: darkens blue to ≈ #1874AC → 4.5:1 contrast with white */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.22)' }}
      />

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[660px]">
          <div className="flex items-center gap-2.5 mb-4">
            {TaglineIcon && (
              <TaglineIcon
                size={13}
                strokeWidth={1.8}
                style={{ color: 'rgba(255,255,255,0.82)' }}
              />
            )}
            <span
              className="text-[12px] uppercase tracking-[0.22em] font-semibold"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              {tagline}
            </span>
          </div>

          <h1
            className="font-(family-name:--font-lora) font-medium text-white mb-4"
            style={{
              fontSize: 'clamp(30px, 4.2vw, 50px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
            }}
          >
            {headline}
            {headlineEm && (
              <>
                {' '}
                <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.88)', fontWeight: 400 }}>
                  {headlineEm}
                </em>
              </>
            )}
          </h1>

          {description && (
            <p
              className="text-[16px] leading-[1.7] max-w-[520px]"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
