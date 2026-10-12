export function WatermarkIcon() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-2 sm:gap-8">
      <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-white/50 text-2xl font-bold text-white/50 sm:size-24 sm:text-6xl lg:size-32 lg:text-7xl">
        T
      </div>
      <span className="text-2xl font-normal uppercase tracking-wordmark text-white/50 sm:text-7xl lg:text-8xl">
        Transaction
      </span>
    </div>
  );
}
