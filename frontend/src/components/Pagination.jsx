const buildPages = (page, totalPages) => {
  const pages = new Set();
  pages.add(1);
  pages.add(totalPages);
  pages.add(page);
  pages.add(page - 1);
  pages.add(page + 1);

  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  let last = 0;
  sorted.forEach((value) => {
    if (value - last > 1) {
      result.push("ellipsis");
    }
    result.push(value);
    last = value;
  });

  return result;
};

const Pagination = ({ page = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(page, totalPages);

  return (
    <div className="pagination">
      <button
        className="pagination__button"
        type="button"
        aria-label="Назад"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
      >
        <i className="bi bi-chevron-left"></i>
      </button>
      {pages.map((value, index) =>
        value === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="pagination__ellipsis">
            ...
          </span>
        ) : (
          <button
            key={value}
            className={`pagination__button ${
              value === page ? "pagination__button--active" : ""
            }`}
            type="button"
            onClick={() => onPageChange?.(value)}
          >
            {value}
          </button>
        ),
      )}
      <button
        className="pagination__button"
        type="button"
        aria-label="Вперёд"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
