export default function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-sm text-muted">Not rated yet</span>;
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <span className="text-gold text-base" aria-hidden>
        ★
      </span>
      <span className="font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}
