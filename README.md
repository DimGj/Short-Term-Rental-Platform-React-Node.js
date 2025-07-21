## Project Overview

This is a **full-stack rental platform** designed to connect **hosts and clients** for short-term accommodation bookings. It provides a seamless experience for users to **search, book, and review** rental properties, while enabling hosts to **manage listings and communicate** with clients.

A key feature of the platform is its **personalized recommendation system**, powered by **matrix factorization**, which suggests rooms based on each user's preferences and booking history.

---

### 💻 Tech Stack

- **Frontend** (by [@leandrosK](https://github.com/leandrosK)): Built with **React**, offering a clean, responsive interface for all roles—**clients**, **hosts**, and **administrators**. Users can browse available properties, view detailed listings, manage bookings, and interact with hosts.
- **Backend** (by [@dimgj](https://github.com/dimgj)): Developed with **Node.js**, **Express**, and **Sequelize ORM**. It handles all API endpoints, business logic, and data persistence. The **recommendation engine** is implemented on the backend using matrix factorization algorithms.

---

### 🔐 Key Features

- 🔍 Room search and booking  
- 🏠 Host management dashboard  
- 🔐 Secure authentication and role-based access control  
- 🤖 Smart recommendations via matrix factorization  
- 💬 Messaging system between hosts and clients  
- 🛠 Admin panel for user and listing management  

---

### ⚙️ Backend Notes

- The backend is designed with **scalability and maintainability** in mind, following a modular structure:  
  `models/`, `routes/`, `middleware/`, `utils/`
- **Data storage** is handled via **JSON files** during development, but a **local MySQL database** must be configured for full functionality.
- Ensure your local MySQL database is set up, and update the Sequelize config in `server/config/config.json` or via `.env`.

---

## Getting Started

### 🔧 Prerequisites

- Node.js (v16+ recommended)  
- npm  
- MySQL (with local credentials configured)

---

### 🚀 Running the Project

#### Frontend

```bash
cd client
npm install
npm start

```
Open http://localhost:3000 in your browser.


#### Backend

```bash
cd server
npm install
node index.js
```

The backend will be available at http://localhost:3001.

## 📄 Documentation

For more details, refer to the project-specific documentation:

- Frontend: client/README.md
- Backend: server/README.md

📌 Note: The documentation in both files is written in Greek.

## 👥 Credits

- Frontend Development: @leandrosK
- Backend & Recommendation System: @dimgj
