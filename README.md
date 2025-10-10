Coverence – Real-Time Social Media Messaging Platform

Coverence is a full-stack social media messaging application that allows users to connect, search for other users, view public profiles, and exchange real-time messages.
The application is built using React for the frontend and Django for the backend, with WebSockets and Redis enabling live communication.

🔗 Live Demo
Website: https://coverence-r586.vercel.app/

Frontend Hosted on: Vercel
Backend Hosted on: Render



Project Overview

Coverence is a real-time social messaging platform designed for seamless and secure communication.
Users can create an account, search for other users, view profiles, and chat instantly using WebSockets and Redis.
The app provides a responsive and modern interface built with React, while Django Channels and Daphne handle real-time connections, authentication, and data persistence.

This project demonstrates full-stack development skills, including:

    REST API design using Django REST Framework
  
    Real-time messaging with Django Channels and Redis
  
    Secure JWT-based authentication
  
    Frontend integration with React and Axios



Key Features

User Authentication:

  - Secure JWT-based login and registration using Django REST Framework.

  - Token-based session management for secure API communication.

Profile Management:

  - Users can view and edit their profile details, including profile picture and bio.

  - Quick navigation via sidebar (Home, Search, Profile, Messages, Settings).

User Search:

  - Search users by name and visit their public profiles.

Real-Time Messaging:

  - One-on-one chat implemented using WebSockets and Redis Channels.

  - Instant message delivery and live updates without page reloads.

Message Notifications:

  - Unseen messages displayed as red badges with counts both globally and per user.

  - Message list shows each user with their unseen message count for quick navigation.

Chat Experience:

  - Displays user’s online/offline status and last seen timestamp.

  - Smooth message rendering and automatic scroll-to-latest message.

Responsive Design:

  - Fully responsive layout built with React and styled-components for a consistent experience on all devices.



Tech Stack

Frontend
  
  - React
  
  - Styled-Components
  
  - Axios
  
  - WebSockets (native browser API)

Backend

  - Django REST Framework

  - Django Channels

  - Daphne (ASGI server for WebSockets)

  - Redis (message broker)

  - Simple JWT (authentication)


Hosting

- Frontend: Vercel
- Backend & WebSocket Server: Render
- Redis Server: Upstash / Render Redis instance
