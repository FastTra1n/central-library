const placeholderCover =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80";

const BookCard = ({ book, onDetails }) => {
  const statusClass = `book-card__status book-card__status--${book.statusType}`;

  const cover = book.cover || placeholderCover;

  return (
    <article className="book-card">
      <div
        className="book-card__image"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <span className={statusClass}>{book.status}</span>
      </div>
      <div className="book-card__body">
        <span className="book-card__genre">{book.genre}</span>
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <div className="book-card__footer">
          <span className="book-card__rating">
            <i className="bi bi-star"></i>
            {book.rating}
          </span>
          <button
            className="book-card__link"
            type="button"
            onClick={() => onDetails?.(book)}
          >
            Подробнее
          </button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
