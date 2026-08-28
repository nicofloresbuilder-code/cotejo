export function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3H14L19 8V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V4C5 3.45 5.45 3 6 3Z"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3V8H19" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M8.5 12H15.5M8.5 15H15.5M8.5 18H12.5"
        stroke="var(--color-accent)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path
        d="M6 19C6.8 15.8 9.1 14.2 12 14.2C14.9 14.2 17.2 15.8 18 19"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="11" rx="1.6" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M4 10H20" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M7.5 14H12" stroke="var(--color-accent)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
