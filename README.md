# My Social App

This is a full-stack social media application where users can register, log in, create, edit, and delete their own posts, and interact with other users' posts by liking and commenting.

## Features

* **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
* **Post Management:** Create, edit, and delete posts.
* **Post Interaction:** Like and comment on posts.
* **Image Uploads:** Upload images with posts.
* **Responsive Design:** Mobile-friendly user interface.

## Technologies Used

### Frontend
* **HTML5**
* **CSS3**
* **JavaScript (Vanilla JS):** For client-side logic.
* **Font Awesome:** For icons.

### Backend
* **Node.js & Express:** For the server-side environment and API.
* **MongoDB & Mongoose:** For database management.
* **JSON Web Token (JWT):** For authentication.
* **Bcrypt.js:** For password hashing.
* **Express-Validator:** For data validation.
* **CORS:** For Cross-Origin Resource Sharing.

## Project Structure
This project is divided into two main parts: the frontend and the backend. The key directories and files are structured as follows:

SOCIAL-MEDIA-APP/
├── config/
│   ├── db.js
│   └── default.json
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── create-post.html
│   ├── create-post-script.js
│   ├── register.html
│   ├── login.html
│   └── style.css
├── middleware/
│   └── auth.js
├── models/
│   ├── Post.js
│   ├── Comment.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── posts.js
│   └── users.js
├── routes/
│   ├── post images store in this folder
├── server.js
├── package.json
├── package-lock.json
└── README.md



## Prerequisites

* Node.js (LTS version)
* npm (Node Package Manager)
* MongoDB (either a local installation or a MongoDB Atlas account)

## Installation and Setup

### 1. Clone the Repository
bash
git clone <https://github.com/KumarDhobale/codealpha-task2>
cd SOCIAL-MEDIA-APP

### 2. Backend Setup
In your terminal, from the project's root directory, run the following command to install dependencies:
Bash
npm install

### 3. Configure Environment Variables
Create a file in the config folder named default.json to store your database connection string and JWT secret.

config/default.json
JSON
{
  "mongoURI": "Your MongoDB connection string here",
  "jwtSecret": "Your own secret token here"
}

### 4. Run the Backend Server
Bash
npm run dev
# or
node server.js

The server should start and you will see the message Server started on port 5000.

### 5. Run the Frontend
The frontend does not require a separate server. Simply open the frontend/index.html file in your browser.

Usage
1. Open index.html in your browser.

2. Register or Log In to start using the app.


## Author
Kumar Dhobale - [https://github.com/KumarDhobale]