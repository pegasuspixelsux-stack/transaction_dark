export function Trident({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 21v-9" />
      <path d="M12 3v9" />
      <path d="M7 5v3a5 5 0 0 0 10 0V5" />
      <path d="M9.5 21h5" />
    </svg>
  );
}
