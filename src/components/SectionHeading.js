import Icon from './Icon';

export default function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <button className="text-button" onClick={onAction}>{action}<Icon name="arrow" size={16} /></button>}
    </div>
  );
}
