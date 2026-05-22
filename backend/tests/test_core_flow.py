import pytest


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_core_flow(async_client, admin_token):
    admin_headers = auth_header(admin_token)

    roles_response = await async_client.get("/api/roles", headers=admin_headers)
    assert roles_response.status_code == 200
    roles = roles_response.json()
    role_map = {role["name"]: role["id"] for role in roles}

    librarian_payload = {
        "full_name": "Либ Петров",
        "email": "librarian@example.com",
        "role_id": role_map["Librarian"],
        "card_number": "LIB-0001",
        "password": "lib-pass",
        "phone": "+79990000011",
        "education": "Library",
        "hall_id": None,
    }
    librarian_response = await async_client.post(
        "/api/users", json=librarian_payload, headers=admin_headers
    )
    assert librarian_response.status_code == 201

    login_librarian = await async_client.post(
        "/api/auth/login",
        json={"identifier": librarian_payload["email"], "password": "lib-pass"},
    )
    assert login_librarian.status_code == 200
    librarian_token = login_librarian.json()["access_token"]
    librarian_headers = auth_header(librarian_token)

    author_response = await async_client.post(
        "/api/authors",
        json={"full_name": "Фёдор Достоевский", "country": "Россия"},
        headers=librarian_headers,
    )
    assert author_response.status_code == 201
    author_id = author_response.json()["id"]

    genre_response = await async_client.post(
        "/api/genres",
        json={"name": "Классика"},
        headers=librarian_headers,
    )
    assert genre_response.status_code == 201
    genre_id = genre_response.json()["id"]

    hall_response = await async_client.post(
        "/api/halls",
        json={"name": "Главный зал", "specialization": "Общий", "seats": 10},
        headers=librarian_headers,
    )
    assert hall_response.status_code == 201
    hall_id = hall_response.json()["id"]

    book_response = await async_client.post(
        "/api/books",
        json={
            "title": "Преступление и наказание",
            "genre_id": genre_id,
            "year": 1866,
            "rating": 5,
            "author_ids": [author_id],
            "copy_ciphers": ["C-001"],
        },
        headers=librarian_headers,
    )
    assert book_response.status_code == 201
    book_id = book_response.json()["id"]

    register_response = await async_client.post(
        "/api/auth/register",
        json={
            "full_name": "Читатель",
            "email": "reader@example.com",
            "phone": "+79990000021",
            "password": "reader-pass",
        },
    )
    assert register_response.status_code == 201
    reader_id = register_response.json()["user"]["id"]
    reader_token = register_response.json()["access_token"]

    update_reader = await async_client.patch(
        f"/api/users/{reader_id}",
        json={"hall_id": hall_id},
        headers=admin_headers,
    )
    assert update_reader.status_code == 200

    issue_response = await async_client.post(
        "/api/transactions/issue",
        json={"user_id": reader_id, "book_id": book_id},
        headers=librarian_headers,
    )
    assert issue_response.status_code == 201
    transaction_id = issue_response.json()["id"]

    issued_books = await async_client.get(
        f"/api/analytics/readers/{reader_id}/issued-books",
        headers=librarian_headers,
    )
    assert issued_books.status_code == 200
    assert len(issued_books.json()) == 1

    free_seats = await async_client.get(
        "/api/analytics/halls/free-seats", headers=librarian_headers
    )
    hall_data = [item for item in free_seats.json() if item["hall_id"] == hall_id][0]
    assert hall_data["free"] == 9

    availability = await async_client.get(
        f"/api/analytics/books/availability?book_id={book_id}",
        headers=librarian_headers,
    )
    availability_data = availability.json()
    assert availability_data["available"] is False

    author_books = await async_client.get(
        f"/api/analytics/halls/{hall_id}/author-books?author_id={author_id}",
        headers=librarian_headers,
    )
    author_data = author_books.json()
    assert author_data["issued_copies"] == 1

    single_copy = await async_client.get(
        "/api/analytics/books/single-copy/borrowers", headers=librarian_headers
    )
    assert any(item["user_id"] == reader_id for item in single_copy.json())

    top_rated = await async_client.get(
        "/api/analytics/books/top-rated?limit=1", headers=librarian_headers
    )
    assert top_rated.json()[0]["book_id"] == book_id

    reader_denied = await async_client.get(
        "/api/analytics/halls/free-seats", headers=auth_header(reader_token)
    )
    assert reader_denied.status_code == 403

    return_response = await async_client.post(
        f"/api/transactions/{transaction_id}/return", headers=librarian_headers
    )
    assert return_response.status_code == 200

    issued_books_after = await async_client.get(
        f"/api/analytics/readers/{reader_id}/issued-books",
        headers=librarian_headers,
    )
    assert issued_books_after.status_code == 200
    assert issued_books_after.json() == []
