"""Basic sanity tests for the Inbox application."""

import pytest
from fastapi.testclient import TestClient

from inbox.server.app import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
