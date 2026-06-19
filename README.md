# R-CHAt — Frontend

A real-time private chat application with a friends system, built with React and Socket.IO.

## Live Preview

**[chat.sutralian.dev](https://chat.sutralian.dev)**

## Screenshot

![R-CHAt UI](public/chat-site.png)

## Tech Stack

- **React 19** + React Router DOM v6
- **Tailwind CSS v4** for styling (via `@tailwindcss/vite`)
- **Socket.IO Client v4** for real-time messaging and notifications
- **Axios** for REST API calls
- **Heroicons** for icons
- **date-fns** for timestamp formatting
- **Vite** as the build tool and dev server

## Features

- Real-time private messaging over Socket.IO
- Friends system — search by email, send/accept/reject friend requests
- Conversation list with unread message badges
- Responsive layout — works on mobile and desktop
- Protected routes with JWT auth stored in localStorage
- Online/offline connection status indicator

## Getting Started

### With Docker

```bash
docker-compose up --build --no-recreate -d
docker exec -it vite_docker sh
yarn && yarn dev
```

### Without Docker

```bash
yarn
yarn dev
```

The app runs on **http://localhost:5173** by default.

> Make sure the backend API and Socket.IO server are running before starting.

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the REST API |
| `VITE_SOCKET_URL` | Socket.IO server URL |

## Project Structure

```
src/
├── components/
│   ├── Chat.jsx        # Main chat UI — conversations, messaging, friends panel
│   ├── Login.jsx       # Sign in / sign up page
│   ├── Alert.jsx       # Error/success alert component
│   ├── ChatInput.jsx   # Legacy message input component
│   └── Message.jsx     # Legacy message bubble components
├── provider/
│   ├── authProvider.jsx    # JWT auth context + localStorage
│   └── socketProvider.jsx  # Socket.IO connection context
├── config/
│   └── env.js          # VITE_ env variable exports
├── utils/
│   └── api.js          # Axios instance with auth header injection
├── routes/             # React Router route definitions
└── App.jsx             # Root component — providers + router
```
