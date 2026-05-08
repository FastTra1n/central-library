const Pagination = () => {
  return (
    <div className="pagination">
      <button className="pagination__button" type="button" aria-label="Назад">
        <i className="bi bi-chevron-left"></i>
      </button>
      <button className="pagination__button pagination__button--active" type="button">
        1
      </button>
      <button className="pagination__button" type="button">
        2
      </button>
      <button className="pagination__button" type="button">
        3
      </button>
      <button className="pagination__button" type="button" aria-label="Вперёд">
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
