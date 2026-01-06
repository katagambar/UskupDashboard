# API Reference

Base URL: `/api`

## AI Assistant

### Chat Completion

Send a message to the Magisterium AI and receive a theological response.

- **Endpoint**: `POST /ai/chat`
- **Auth**: Required
- **Body**:

  ```json
  {
    "messages": [
      { "role": "user", "content": "Apa itu Ekaristi?" }
    ],
    "useCase": "general", // optional
    "temperature": 0.7   // optional
  }
  ```

- **Response**:

  ```json
  {
    "success": true,
    "data": {
      "message": "Ekaristi adalah...",
      "citations": [
        {
          "title": "Catechism of the Catholic Church",
          "author": "Vatican",
          "reference": "CCC 1324",
          "excerpt": "..."
        }
      ],
      "relatedQuestions": ["..."],
      "usage": { "total_tokens": 150 }
    }
  }
  ```

## Task Management

### Get All Tasks

- **Endpoint**: `GET /tasks`
- **Auth**: Required
- **Response**: List of tasks.

### Create Task

- **Endpoint**: `POST /tasks`
- **Body**:

  ```json
  {
    "judul": "Review Laporan Keuangan",
    "deskripsi": "Laporan Q1 2026",
    "prioritas": "Tinggi",
    "deadline": "2026-02-01",
    "kategori": "Keuangan",
    "penanggungJawab": "RD. Ekonom"
  }
  ```

### Update Task

- **Endpoint**: `PATCH /tasks/[id]`
- **Body**: Partial Task object (e.g., just `progress`).

### Delete Task

- **Endpoint**: `DELETE /tasks/[id]`

## Authentication

### Login

- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: Session token / cookie.
