import { cn } from '@/lib/utils';

interface ArabianPatternProps {
  className?: string;
  opacity?: number;
}

/**
 * ArabianPattern
 *
 * Pure SVG tessellating geometric texture inspired by traditional girih
 * (Islamic geometric) ornament. Renders an 8-pointed star woven with an
 * octagonal interlace on a 64x64 tile using `currentColor` strokes only —
 * parent components control hue and intensity via `color` and `opacity`.
 *
 * The pattern is abstract (no figurative motifs), accessibility-hidden,
 * and safe for both server and client rendering (no hooks).
 */
export default function ArabianPattern({
  className,
  opacity = 0.06,
}: ArabianPatternProps) {
  return (
    <svg
      role="presentation"
      aria-hidden="true"
      className={cn('w-full h-full', className)}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="aquador-girih-tile"
          patternUnits="userSpaceOnUse"
          width="64"
          height="64"
          patternTransform="rotate(0)"
        >
          {/*
            Girih-inspired tessellation on a 64x64 cell.
            Construction:
              - Outer square frame (tile boundary, thin).
              - Inner octagon (8-gon) centered at (32,32), radius 22.
              - 8-pointed star formed by two overlaid squares rotated 45deg
                inscribed in the octagon (radius 22).
              - Short connector strokes at each tile edge midpoint to weave
                neighbouring tiles into a continuous mesh.
            Stroke-only, no fill, thin hairlines — reads as fine texture
            when tiled at scale rather than literal motif.
          */}

          {/* Outer tile frame — very faint guideline that weaves tiles */}
          <path
            d="M0 0 H64 V64 H0 Z"
            stroke="currentColor"
            strokeWidth="0.35"
            fill="none"
            opacity="0.5"
          />

          {/* Central octagon (8 vertices at radius 22 around 32,32) */}
          <path
            d="
              M 54 32
              L 47.56 47.56
              L 32 54
              L 16.44 47.56
              L 10 32
              L 16.44 16.44
              L 32 10
              L 47.56 16.44
              Z
            "
            stroke="currentColor"
            strokeWidth="0.55"
            fill="none"
          />

          {/* 8-pointed star — Square A (axis-aligned, inscribed r=22) */}
          <path
            d="
              M 54 32
              L 32 54
              L 10 32
              L 32 10
              Z
            "
            stroke="currentColor"
            strokeWidth="0.55"
            fill="none"
          />

          {/* 8-pointed star — Square B (rotated 45deg, inscribed r=22) */}
          <path
            d="
              M 47.56 47.56
              L 16.44 47.56
              L 16.44 16.44
              L 47.56 16.44
              Z
            "
            stroke="currentColor"
            strokeWidth="0.55"
            fill="none"
          />

          {/* Connector strokes at edge midpoints — weave into neighbour tiles */}
          <path
            d="
              M 32 0 L 32 10
              M 32 54 L 32 64
              M 0 32 L 10 32
              M 54 32 L 64 32
            "
            stroke="currentColor"
            strokeWidth="0.45"
            fill="none"
          />

          {/* Fine corner chamfers — reinforce the lattice rhythm */}
          <path
            d="
              M 0 0 L 16.44 16.44
              M 64 0 L 47.56 16.44
              M 0 64 L 16.44 47.56
              M 64 64 L 47.56 47.56
            "
            stroke="currentColor"
            strokeWidth="0.35"
            fill="none"
            opacity="0.7"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#aquador-girih-tile)" />
    </svg>
  );
}
