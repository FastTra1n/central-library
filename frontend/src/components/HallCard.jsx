const HallCard = ({ hall }) => {
  const statusClass = `hall-card__status hall-card__status--${hall.statusType}`;

  return (
    <article className="hall-card">
      <div
        className="hall-card__image"
        style={{ backgroundImage: `url(${hall.image})` }}
      >
        <span className={statusClass}>{hall.status}</span>
        <div className="hall-card__occupancy">
          <i className="bi bi-people"></i>
          {hall.occupied} / {hall.capacity} мест
        </div>
      </div>
      <div className="hall-card__body">
        <h3 className="hall-card__name">{hall.name}</h3>
        <p className="hall-card__specialization">{hall.specialization}</p>
        <div className="hall-card__tags">
          {hall.tags.map((tag) => (
            <span key={tag} className="hall-card__tag">
              {tag}
            </span>
          ))}
        </div>
        <button className="button button--primary hall-card__action" type="button">
          Записаться в зал
        </button>
      </div>
    </article>
  );
};

export default HallCard;
