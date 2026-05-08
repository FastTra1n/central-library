import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import BookCard from "../components/BookCard.jsx";
import Pagination from "../components/Pagination.jsx";

const books = [
  {
    id: 1,
    title: "Великий Гэтсби",
    author: "Фрэнсис Скотт Фицджеральд",
    genre: "Классика",
    rating: 4.8,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 2,
    title: "Убийство в Восточном экспрессе",
    author: "Агата Кристи",
    genre: "Детектив",
    rating: 4.9,
    status: "Выдана",
    statusType: "borrowed",
  },
  {
    id: 3,
    title: "Дюна",
    author: "Фрэнк Герберт",
    genre: "Фантастика",
    rating: 5.0,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 4,
    title: "1984",
    author: "Джордж Оруэлл",
    genre: "Классика",
    rating: 4.7,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 5,
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    genre: "Классика",
    rating: 4.7,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 6,
    title: "Война и мир",
    author: "Лев Толстой",
    genre: "Классика",
    rating: 4.8,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 7,
    title: "Медный всадник",
    author: "Александр Пушкин",
    genre: "Классика",
    rating: 4.5,
    status: "В наличии",
    statusType: "available",
  },
  {
    id: 8,
    title: "Вий",
    author: "Николай Гоголь",
    genre: "Классика",
    rating: 4.9,
    status: "В наличии",
    statusType: "available",
  },
];

const CatalogPage = () => {
  return (
    <div className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <div className="layout__main">
        <TopBar searchPlaceholder="Поиск книг или авторов..." />
        <main className="layout__content">
          <section className="catalog">
            <div className="catalog__header">
              <div className="catalog__titles">
                <h1 className="catalog__title">Каталог книг</h1>
                <p className="catalog__subtitle">
                  Исследуйте нашу коллекцию из 12,450 произведений
                </p>
              </div>
              <div className="catalog__actions">
                <button className="button button--light" type="button">
                  <i className="bi bi-funnel"></i>
                  Фильтры
                </button>
                <button className="button button--primary" type="button">
                  <i className="bi bi-plus-lg"></i>
                  Добавить книгу
                </button>
              </div>
            </div>

            <div className="catalog__grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            <div className="catalog__footer">
              <span className="catalog__meta">Показано 8 из 12,450 книг</span>
              <Pagination />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
