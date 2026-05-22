import pytest


@pytest.mark.asyncio
async def test_auth_register_login_me(async_client):
    register_payload = {
        "full_name": "Иван Петров",
        "email": "ivan.petrov@example.com",
        "phone": "+79990000001",
        "password": "secret123",
    }

    register_response = await async_client.post(
        "/api/auth/register", json=register_payload
    )
    assert register_response.status_code == 201
    register_data = register_response.json()
    assert register_data["user"]["email"] == register_payload["email"]

    login_response = await async_client.post(
        "/api/auth/login",
        json={"identifier": register_payload["email"], "password": "secret123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await async_client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == register_payload["email"]
