const fallbackImage =
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80";

const HallCard = ({ hall, onDetails }) => {
  const statusType = hall.statusType || "open";
  const statusClass = `hall-card__status hall-card__status--${statusType}`;
  const tags = hall.tags || [];
  const image = hall.image || fallbackImage;

  return (
    <article className="hall-card">
      <div
        className="hall-card__image"
        style={{ backgroundImage: `url(${image})` }}
      >
        <span className={statusClass}>{hall.status}</span>
        <div className="hall-card__occupancy">
          <i className="bi bi-people"></i>
          {hall.occupied} / {hall.capacity} мест
        </div>
      </div>
      <div className="hall-card__body">
        <h3 className="hall-card__name">{hall.name}</h3>
        <p className="hall-card__specialization">
          {hall.specialization || "Общий"}
        </p>
        <div className="hall-card__tags">
          {tags.length === 0 ? (
            <span className="hall-card__tag">Тихая зона</span>
          ) : (
            tags.map((tag) => (
              <span key={tag} className="hall-card__tag">
                {tag}
              </span>
            ))
          )}
        </div>
        <button
          className="button button--primary hall-card__action"
          type="button"
          onClick={() => onDetails?.(hall)}
        >
          Подробнее
        </button>
      </div>
    </article>
  );
};

export default HallCard;
