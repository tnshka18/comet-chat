# CometChat — Real-time Chat App

A Slack-like real-time chat app built with React + TypeScript, powered by CometChat SDK.

## Features

- 💬 Direct messaging (1-on-1)
- 👥 Group channels (public & private)
- ⚡ Real-time message delivery
- ✍️ Typing indicators
- 🟢 Online/offline presence
- 📖 Message history
- ✅ Read receipts
- 🌑 Dark neon UI

## Tech Stack

- React 19 + TypeScript
- CometChat JavaScript SDK v4
- CSS Modules

## Setup

1. Clone the repo
2. Install dependencies:
```bash
   npm install
```
3. Add your CometChat credentials to `.env`:
```env
   REACT_APP_COMETCHAT_APP_ID=your_app_id
   REACT_APP_COMETCHAT_AUTH_KEY=your_auth_key
   REACT_APP_COMETCHAT_REGION=us
```
4. Run the app:
```bash
   npm start
```

## Project Structure
src/
├── services/cometchat.ts      # All CometChat SDK calls
├── context/                   # Auth + Chat state
├── hooks/                     # Real-time messages, contacts
├── components/                # Login, Sidebar, ChatWindow
├── styles/globals.css         # Dark neon design system
└── types/index.ts             # TypeScript interfaces

## Usage

Log in with any UID from your CometChat dashboard. Open incognito and log in as a second user to test real-time messaging.

##Live Demo: https://comet-chat-u7sf.vercel.app/
