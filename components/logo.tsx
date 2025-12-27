interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-24 h-12" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 100"
      role="img"
      aria-label="Two overlapping circles with center knocked out"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="
          M 80 50
          m -35 0
          a 35 35 0 1 0 70 0
          a 35 35 0 1 0 -70 0

          M 115 50
          m -35 0
          a 35 35 0 1 0 70 0
          a 35 35 0 1 0 -70 0
        "
      />
    </svg>
  );
}

