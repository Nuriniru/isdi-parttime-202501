curl -X POST http://localhost:5000/api/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmQ5MzJkMDk1MWJmM2EzMWI1YzRhMSIsImlhdCI6MTc1MjAxMjk1NiwiZXhwIjoxNzU0NjA0OTU2fQ.RQvbY_aeJcn1wF2goQWJB5C-0aysKb_aKQRfYy713Pw" \
    -d '{"title": "My Test Post", "content": "This is a test post", "hashtags": ["test", "bootcamp"]}' -v