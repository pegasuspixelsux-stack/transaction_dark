export function WatermarkIcon() {
  return (
    <div
      aria-hidden
      data-watermark
      className="flex items-center justify-center gap-2 opacity-25 sm:gap-8"
    >
      <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-white text-2xl font-bold text-white sm:size-24 sm:text-6xl lg:size-32 lg:text-7xl">
        T
      </div>
      <span className="text-2xl font-normal uppercase tracking-wordmark text-white sm:text-7xl lg:text-8xl">
        Transaction
      </span>
    </div>
  );
}
