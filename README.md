# AgroVision

### AI-powered crop disease detection and agricultural support

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Project-Private-555555?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Made%20in-Bangladesh-006a4e?style=for-the-badge" />
</p>

<p align="center">
  <b>AI-assisted agricultural support for farmers and specialists in Bangladesh</b>
</p>

---

## Overview

AgroVision is a full-stack web application for farmers and agricultural specialists in Bangladesh. It combines image-based crop disease analysis, agricultural guidance, location-aware office discovery, and farmer-specialist messaging in one responsive platform.

This is a private personal project owned and maintained by Aitijya Sarker. The repository documentation is prepared for portfolio, demonstration, and authorized technical review.

---

## Core Features

- **AI crop analysis:** Upload a crop image and receive a disease, confidence score, description, treatment, and prevention guidance.
- **Resilient analysis flow:** Gemini Vision is used when `GEMINI_API_KEY` is configured; Sharp image processing and local heuristic analysis provide a fallback.
- **Agricultural assistant:** Ask agriculture-related questions in English or Bengali through the Gemini-backed chat endpoint.
- **Specialist messaging:** Send and retrieve farmer-specialist conversations stored in MongoDB.
- **Office finder:** Explore agricultural offices and calculate location-based distances with Leaflet and OpenStreetMap data.
- **Role-based dashboards:** Farmers and specialists receive purpose-specific dashboard experiences.
- **Persistent scan history:** Save crop analysis results and retrieve them for the authenticated user.

## Roles and Authentication

| Role | Capabilities |
| --- | --- |
| Farmer | Analyze crop images, review scan history, find agricultural offices, and message specialists |
| Specialist | Manage a specialist profile and respond to farmer conversations |
| Guest | Browse public content and access the authentication screens |

Authentication uses JWT bearer tokens. Passwords are hashed with `bcryptjs`, and authenticated API requests send the token through the `Authorization` header.

## Architecture

The current application uses Next.js as both the frontend framework and the primary backend runtime:

```text
Browser
  -> Frontend Next.js App Router UI (/frontend/app)
  -> Next.js API Route Handlers (/frontend/app/api)
  -> Mongoose models (/frontend/models)
  -> MongoDB Atlas

Crop images and chat requests
  -> Gemini API when configured
  -> Local image analysis fallback when Gemini is unavailable
```

The repository also contains an Express implementation in `backend/api/index.js` and `backend/server.js` for standalone or legacy deployments. The Next.js route handlers and MongoDB models are the main application path used by the current frontend.

## Technology Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Leaflet and React Leaflet
- Lucide React icons

### Backend and Services

- Next.js Route Handlers running on Node.js
- Express.js server implementation for standalone deployment
- JWT authentication
- bcryptjs password hashing
- Sharp image processing
- Google Generative AI SDK for Gemini Vision and chat

### Data and Infrastructure

- MongoDB Atlas
- Mongoose ODM
- Vercel configuration for the Next.js application
- Optional Railway, Render, or similar hosting for the standalone Express server

## Project Structure

```text
frontend/            Next.js application, components, assets, models, and services
backend/             Standalone Express/Vercel API, database tooling, and tests
frontend/apiService.ts Frontend API client and JWT token handling
frontend/types.ts    Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB Atlas database, or a local MongoDB instance
- A Gemini API key for AI-powered analysis and chat (optional; local analysis remains available)

### Installation

```bash
git clone https://github.com/AitijyaSarker/MXB2026-Sylhet-Neural-Nodes-AgroVision.git
cd "Agro Vision"
npm install
```

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
```

Start the Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Run the built Next.js application |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run server` | Start the standalone Express server |
| `npm run deploy:check` | Validate deployment environment configuration |

---

## API Surface

The primary Next.js API endpoints include:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a farmer or specialist |
| `POST` | `/api/auth/login` | Authenticate a user and issue a JWT |
| `GET` / `PUT` | `/api/users/profile/:userId` | Read or update a profile |
| `GET` | `/api/specialists` | List available specialists |
| `POST` | `/api/messages` | Send a message |
| `GET` | `/api/messages/:userId` | Retrieve a user's messages |
| `POST` | `/api/predict` | Analyze an uploaded crop image |
| `POST` | `/api/chat` | Generate an agricultural assistant response |
| `POST` | `/api/scans` | Save a scan result |

Protected endpoints use a bearer token in the `Authorization` header.

## Deployment

The repository includes `vercel.json` for deploying the Next.js application and its API route handlers to Vercel. Set the following environment variables in the deployment platform:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
```

The standalone Express server can be deployed separately to Railway, Render, or another Node.js hosting provider. Never commit `.env`, `.env.local`, database credentials, API keys, or JWT secrets.

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/d1599e42-152b-4126-b196-50f0f7cb4dda" width="800" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/1cabc171-aeca-466e-9915-ec109559b59a" width="800" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c00c590d-bb9e-4051-90a7-9dfccee84f9a" width="800" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/8b04bd48-390f-4c28-84f2-1ca695de5d55" width="800" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/1bf96d3a-7d28-49ca-ab2e-a4e1e3cee833" width="800" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/b834557a-2feb-4383-b4d0-3a25b2042b45" width="800" />
</p>

---

## Project Resources

### Project Drive
https://drive.google.com/drive/folders/1-L9Xf2lS2GK6mPM4zxnK8FaT0LmhUOjC

### Demo Video
https://youtu.be/ic_0TmDpWyw

---

## Roadmap

- Improve disease-classification accuracy and evaluation coverage
- Add analytics for scan history and disease trends
- Add offline-friendly workflows for low-connectivity areas
- Expand crop and disease coverage
- Add richer agricultural recommendations

---

## Ownership and Usage

AgroVision is not an open-source project and is not released under an open-source license. The source code, design, documentation, and project assets are provided for authorized review and demonstration purposes only. Reuse, redistribution, or commercial use requires written permission from the project owner.

---

<p align="center">
  Built for smarter agriculture in Bangladesh
</p>
