import { coverArtByKey } from '../config/assets';

export default function ProductArt({ product, className = '' }) {
  const artKey = product.art || 'nebula';
  const artImage = coverArtByKey[artKey] || coverArtByKey.nebula;

  return (
    <div className={`product-art art-${artKey} has-art-image ${className}`}>
      <img className="art-image" src={artImage} alt="" />
      <span className="art-label">{product.type}</span>
      <strong>{product.title}</strong>
    </div>
  );
}
