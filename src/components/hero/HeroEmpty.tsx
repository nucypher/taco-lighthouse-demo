export function HeroEmpty() {
  return (
    <div className="relative h-[500px] rounded-sm overflow-hidden mb-8 border border-border">
      <div className="absolute inset-0 glass-overlay flex items-center justify-center">
        <p>No tracks available</p>
      </div>
    </div>
  );
}