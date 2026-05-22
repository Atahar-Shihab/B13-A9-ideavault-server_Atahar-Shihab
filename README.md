<div align="center">

# ⚙️ IdeaVault — Server

### REST API Backend for the IdeaVault Platform

*Express + MongoDB + JWT — the engine behind the ideas.*

[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Argon2](https://img.shields.io/badge/Argon2-Hashed-512BD4?style=for-the-badge&logo=letsencrypt&logoColor=white)](https://github.com/ranisalt/node-argon2)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

<br/>

[Client Repository](https://github.com/Atahar-Shihab/B13-A9-ideavault-client_Atahar-Shihab) &nbsp;•&nbsp; [Live Demo](https://b13-a9-ideavault-client-atahar-shih-tau.vercel.app)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Collections](#️-database-collections)
- [Author](#-author)

---

## 📖 Overview

This is the **standalone REST API backend** for IdeaVault, built with **Express 5** and the native **MongoDB** driver. It handles authentication (JWT + Argon2 + Google verification), full CRUD for ideas and comments, a trending algorithm, likes, and bookmarks — all with server-side ownership checks.



---

## ✨ Features

- 🔐 **JWT Authentication** — Tokens generated on login, stored in secure httpOnly cookies, verified on every protected route
- 🌐 **Google OAuth Verification** — Verifies Google ID tokens server-side via `google-auth-library`
- 💡 **Ideas CRUD** — Create, read, update, delete with author-only authorization
- 💬 **Comments CRUD** — Add, edit, delete own comments with comment-count syncing
- 🔥 **Trending Aggregation** — MongoDB `$aggregate` pipeline scoring likes + comments + recency
- ❤️ **Likes & 🔖 Bookmarks** — Toggle endpoints backed by dedicated collections
- 🛡️ **CORS with credentials** — Multi-origin support for local + production clients
- 🧱 **Clean MVC Architecture** — Separated config, middleware, controllers, and routes

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | MongoDB Atlas (native driver) |
| **Auth** | jsonwebtoken (JWT) + Argon2 + google-auth-library |
| **Middleware** | cors, cookie-parser, dotenv |
| **Dev** | nodemon |

---

## 🏗️ Architecture

The server follows a layered **MVC pattern** — each concern lives in its own module:

```
IdeaVault-server/
├── index.js                       # Thin entry point — boots app + DB connection
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection + collection getters
│   ├── middleware/
│   │   └── verifyToken.js         # JWT verification middleware
│   ├── utils/
│   │   └── token.js               # signAndSend + cookie options
│   ├── controllers/               # Business logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── idea.controller.js
│   │   ├── comment.controller.js
│   │   ├── bookmark.controller.js
│   │   └── interaction.controller.js
│   ├── routes/                    # URL → controller mapping
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── idea.routes.js
│   │   ├── comment.routes.js
│   │   ├── bookmark.routes.js
│   │   └── interaction.routes.js
│   └── app.js                     # Express setup + middleware + route mounting
├── seed.js                        # Seed script (10 demo startup ideas)
├── backfill-likes.js              # One-off script to add likes to existing ideas
└── .env                           # (gitignored)
```

**Request flow:** `index.js` → `app.js` (middleware) → `routes/*` → `controllers/*` → `config/db.js`

---

## 📡 API Reference

### 🔐 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register with Argon2-hashed password |
| `POST` | `/auth/login` | Login + issue JWT cookie |
| `POST` | `/auth/google` | Verify Google ID token + issue JWT |
| `POST` | `/auth/logout` | Clear session cookie |
| `GET`  | `/auth/me` | Get current user (protected) |

### 💡 Ideas
| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/ideas` | List with `search`, `category`, date filters |
| `GET`  | `/ideas/trending` | Top 6 via `$aggregate` + `$limit` |
| `GET`  | `/ideas/my/:email` | Logged-in user's ideas (protected) |
| `GET`  | `/ideas/:id` | Single idea (protected) |
| `POST` | `/ideas` | Create idea (protected) |
| `PUT`  | `/ideas/:id` | Update — author only (protected) |
| `DELETE` | `/ideas/:id` | Delete — author only (protected) |
| `POST` | `/ideas/:id/like` | Toggle like (protected) |

### 💬 Comments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/comments` | Add comment (protected) |
| `GET`  | `/comments/:ideaId` | Get comments for an idea |
| `PUT`  | `/comments/:id` | Edit own comment (protected) |
| `DELETE` | `/comments/:id` | Delete own comment (protected) |

### 🔖 Bookmarks & Interactions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/bookmarks` | Add bookmark (protected) |
| `DELETE` | `/bookmarks/:ideaId` | Remove bookmark (protected) |
| `GET`  | `/bookmarks/:email` | User's bookmarked ideas (protected) |
| `GET`  | `/bookmarks/check/:email` | Bookmarked idea IDs (protected) |
| `GET`  | `/interactions/:email` | Ideas the user commented on (protected) |
| `PATCH` | `/users/:email` | Update profile (protected) |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create .env (see below)

# 3. Run in dev mode
npm run dev

# 4. (Optional) Seed the database with 10 demo ideas
node seed.js
```

Server runs on **http://localhost:5000** 🚀

---

## 🔑 Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> 💡 `CLIENT_URL` accepts a comma-separated list for multiple allowed origins (local + production).

---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `users` | Registered users (Argon2 hash or Google) |
| `ideas` | Startup ideas with likes array + comment count |
| `comments` | Comments linked to ideas |
| `bookmarks` | User ↔ idea bookmark mappings |

---

## 👤 Author

**Atahar Shihab**

[![GitHub](https://img.shields.io/badge/GitHub-Atahar--Shihab-181717?style=flat&logo=github)](https://github.com/Atahar-Shihab)

---

<div align="center">

### Built with 💜 using Node.js, Express & MongoDB

⭐ **Star this repo if you found it helpful!**

</div>
