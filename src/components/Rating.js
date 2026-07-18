export default function Rating({ value, reviews, compact = false }) {
  const ratingValue = Number(value);
  const reviewCount = Number(reviews);
  if (value === null || value === undefined || reviews === null || reviews === undefined) return null;
  if (!Number.isFinite(ratingValue) || !Number.isFinite(reviewCount)) return null;

  return (
    <div className="rating" aria-label={`${ratingValue} out of 5`}>
      <strong>{ratingValue} / 5</strong>
      {!compact && <span>({reviewCount.toLocaleString()} reviews)</span>}
    </div>
  );
}
