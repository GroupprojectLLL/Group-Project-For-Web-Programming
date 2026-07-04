export default function Rating({ value, reviews, compact = false }) {
  return (
    <div className="rating" aria-label={`${value} out of 5`}>
      <strong>{value} / 5</strong>
      {!compact && <span>({reviews.toLocaleString()} reviews)</span>}
    </div>
  );
}
