export function Logo() {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path
          d="M8 21l5-5 4 3 7-8"
          fill="none"
          stroke="var(--positive)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo__name">MarginFlow</span>
    </span>
  )
}
