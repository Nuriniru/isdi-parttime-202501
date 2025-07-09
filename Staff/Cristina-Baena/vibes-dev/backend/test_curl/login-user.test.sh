curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test2@example.com", "password": "TestPass123!"}' -v