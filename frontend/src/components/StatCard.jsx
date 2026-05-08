const StatCard = ({ icon, label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
