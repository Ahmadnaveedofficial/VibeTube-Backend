# 🎬 VibeTube Backend

A production-ready backend API for a YouTube-style video sharing platform built using **Node.js, Express.js, MongoDB, and Mongoose**.

VibeTube allows users to upload videos, manage content, subscribe to creators, like videos, and track watch history — powered by modern backend architecture and MongoDB Aggregation.

---

## 🚀 Live Vision

VibeTube Backend is designed to serve as the core API for a scalable video streaming platform similar to YouTube.

It focuses on:

- Clean architecture
- Secure authentication
- Scalable database structure
- Aggregation pipelines
- Professional backend standards

---

# 🛠️ Tech Stack

- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **MongoDB** – NoSQL database
- **Mongoose** – ODM
- **JWT (JSON Web Token)** – Authentication
- **Multer** – File upload handling
- **Cloudinary** – Cloud media storage
- **MongoDB Aggregation Pipeline** – Advanced querying
- **MVC Architecture**


---

# ✨ Features

## 🔐 Authentication
- User Registration
- User Login
- JWT Access Token
- Protected Routes Middleware

## 🎥 Video Management
- Upload Video with Thumbnail
- Store media on Cloudinary
- Get All Videos (Search + Sort + Pagination)
- Get Video By ID
- Update Video
- Delete Video
- Toggle Publish / Unpublish

## 👍 Likes System
- Like / Unlike Videos
- Like Count using Aggregation

## 🔔 Subscription System
- Subscribe / Unsubscribe to Channels
- Subscriber Count

## 👀 Watch History
- Add video to watch history
- Increment video views automatically

## 💬 Comments (If Implemented)
- Add Comment
- Get Comments per Video

---

# 🗂️ Data Models
-- VibeTube Backend uses the following MongoDB models:
check out the 
```bash 
https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj
```

# 🧠 Advanced Concepts Used

- MongoDB Aggregation Pipeline
- $lookup for joining collections
- $addFields
- $project
- Pagination using aggregatePaginate
- Middleware chaining
- MVC Pattern
- Error Handling using custom ApiError
- Standardized API Response structure

---

# 📥 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Ahmadnaveedofficial/VibeTube-Backend.git

## 2️⃣ Install Dependencies
npm install

## 3️⃣Start Development Server
npm run server



