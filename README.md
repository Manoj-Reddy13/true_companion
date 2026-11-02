# 🌿 True Companion
### Anonymous Emotional Support & Peer Connection Platform
> *"Sometimes, all we need is someone who listens."*

**True Companion** is an anonymous peer-support sanctuary designed for people experiencing loneliness, stress, emotional difficulties, relationship heartbreak, academic pressure, or career confusion.

The platform allows individuals to express themselves safely without revealing their real identity, connecting with empathetic listeners in a calm, judgment-free environment.

---

## 🕊️ Core Philosophy

- **Everyone deserves someone who listens:** Meaningful human presence transforms pain into endurance.
- **No judgment, no pressure, no identity exposure:** You are identified exclusively by an anonymous handle.
- **No vanity metrics:** Strictly **no public like counts, no follower rankings, and no algorithmic popularity traps**. Connections happen 1-on-1 through mutual consent.
- **Peer support, not clinical therapy:** Clear boundaries and verified national crisis hotlines (India: `112` and Tele-MANAS `14416`; US: `988`; UK: `111`).

---

## 💻 Technology Stack

### Frontend
- **Framework:** React.js (v19) with Vite & TypeScript
- **Styling:** Tailwind CSS with custom calming palette
- **Icons:** Lucide React
- **Animations:** Gentle Framer Motion transitions
- **Routing:** React Router v7
- **Real-time Client:** Socket.IO Client

### Backend
- **Runtime:** Node.js (v24+) & Express.js with TypeScript
- **Real-time Engine:** Socket.IO for private messaging, typing indicators, presence, and read receipts
- **Database:** MongoDB with Mongoose + **Resilient Embedded Storage Fallback** (runs 100% out of the box with zero external configuration required!)
- **Authentication:** JWT tokens, bcrypt password hashing, persistent anonymous user IDs
- **Security:** Helmet, CORS, Express-Rate-Limit, strict file validation with Multer, Role-Based Access Control (RBAC)

---

## 🎨 UI/UX Design System

The application features a minimalist, tranquil visual identity:
- **Primary:** Soft Lavender (`#A78BFA` / `#8B5CF6`)
- **Secondary:** Muted Blue (`#93C5FD` / `#60A5FA`)
- **Background:** Warm Off-White (`#FAFAF9`)
- **Surface:** White (`#FFFFFF`)
- **Text:** Deep Charcoal (`#27272A`)
- **Success:** Soft Green (`#86EFAC`)
- **Warning:** Soft Amber (`#FCD34D`)
- **Danger:** Muted Red (`#FCA5A5`)
- **Dark Mode:** Deep Slate (`#121214` & `#1A1A1E`) with instant persistent toggle

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Manoj-Reddy13/true_companion.git
cd true_companion

# Install root, backend, and frontend dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` in `server`:
```bash
cd server
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/true_companion
JWT_SECRET=true_companion_secure_jwt_secret_token_change_in_production_2026
CLIENT_URL=http://localhost:5173
```
> **Note on Database:** If you have MongoDB installed locally or specify a MongoDB Atlas connection string in `MONGODB_URI`, the server connects natively. If no MongoDB server is detected, True Companion automatically starts in **High-Reliability Standalone / Fallback Storage mode** (storing data in `server/data/store.json`). It will never crash or block your workflow!

### 3. Run the Application
From the root directory:
```bash
npm run dev
```
Or run backend and frontend separately:
```bash
# Terminal 1 (Backend Server)
cd server
npm run dev

# Terminal 2 (Frontend Client)
cd client
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`** (API running on `http://localhost:5000`)

---

## 🔑 Pre-Seeded Accounts (1-Click Demo)

The system automatically populates realistic seed data on initial launch:

| Role | Anonymous Username | Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `QuietGuardian_01` | `admin@truecompanion.org` | `Companion@2026!` | Moderation dashboard, user suspension/ban, report actions |
| **Peer User** | `SilentSoul_482` | `silentsoul@example.com` | `Companion@2026!` | Author of stories across Academic & Career pressure |
| **Peer User** | `HopeSeeker_91` | `hopeseeker@example.com` | `Companion@2026!` | Empathetic listener dealing with corporate burnout |
| **Peer User** | `MoonWalker_238` | `moonwalker@example.com` | `Companion@2026!` | Artist sharing thoughts on relationship closure |
| **Peer User** | `QuietHeart_52` | `quietheart@example.com` | `Companion@2026!` | Anxiety & panic attack peer supporter |

*You can also create a new anonymous handle anytime via the instant random generator in the Sign Up modal!*

---

## 📂 Project Architecture

```
true_companion/
├── package.json                 # Root script runner (concurrently)
├── README.md                    # Documentation & setup guide
├── server/                      # Express + TypeScript + Socket.IO backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── uploads/                 # Local directory for attachments
│   ├── data/                    # Fallback JSON store (when MongoDB offline)
│   └── src/
│       ├── index.ts             # Server entry point + Socket.IO setup
│       ├── seed.ts              # Empathetic seed posts & demo accounts
│       ├── config/
│       │   └── db.ts            # Mongoose + Fallback database connector
│       ├── types/
│       │   └── index.ts         # TypeScript data interfaces
│       ├── models/              # Mongoose database models
│       │   ├── User.ts
│       │   ├── Post.ts
│       │   ├── ChatRequest.ts
│       │   ├── Conversation.ts
│       │   ├── Message.ts
│       │   ├── Report.ts
│       │   ├── Notification.ts
│       │   └── BlockedUser.ts
│       ├── services/
│       │   └── dataService.ts   # Unified storage engine (Mongoose + JSON fallback)
│       ├── sockets/
│       │   ├── socketHandler.ts # Real-time Socket.IO auth, rooms, typing, presence
│       │   └── socketManager.ts # Socket broadcast emitter helper
│       ├── middleware/
│       │   ├── auth.ts          # JWT authentication middleware
│       │   ├── admin.ts         # Role-based authorization middleware
│       │   └── upload.ts        # Multer attachment handler
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── postController.ts
│       │   ├── chatRequestController.ts
│       │   ├── conversationController.ts
│       │   ├── messageController.ts
│       │   ├── reportController.ts
│       │   ├── userController.ts
│       │   ├── adminController.ts
│       │   └── notificationController.ts
│       └── routes/
│           ├── authRoutes.ts
│           ├── postRoutes.ts
│           ├── chatRequestRoutes.ts
│           ├── conversationRoutes.ts
│           ├── messageRoutes.ts
│           ├── reportRoutes.ts
│           ├── userRoutes.ts
│           ├── adminRoutes.ts
│           └── notificationRoutes.ts
│
└── client/                      # React + Vite + TypeScript frontend
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── types/
        │   └── index.ts
        ├── services/
        │   ├── api.ts           # Axios client with interceptors
        │   └── socket.ts        # Socket.IO client instance
        ├── context/
        │   ├── AuthContext.tsx  # Anonymous auth session & modal state
        │   ├── ThemeContext.tsx # Dark/Light mode state
        │   └── SocketContext.tsx# Real-time notifications & presence
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx   # Top bar with crisis badge & notifications
        │   │   ├── Sidebar.tsx  # Desktop navigation menu
        │   │   ├── MobileNav.tsx# Bottom mobile tab bar
        │   │   └── Footer.tsx   # Calming footer with emergency directory
        │   ├── common/
        │   │   ├── Avatar.tsx   # Calming mood avatars & preset picker
        │   │   ├── Modal.tsx    # Accessible modal dialog
        │   │   ├── ToastContainer.tsx # Gentle feedback toasts
        │   │   ├── ReportModal.tsx    # Universal content & user report modal
        │   │   └── RequestChatModal.tsx # Intro note chat request modal
        │   ├── auth/
        │   │   └── AuthModal.tsx# Anonymous sign in & handle generator
        │   └── posts/
        │       └── PostCard.tsx # Post card without likes or vanity metrics
        └── pages/
            ├── LandingPage.tsx  # Hero, How It Works, Safe Space, FAQs
            ├── DashboardPage.tsx# Main feed, search, category filters
            ├── PostDetailPage.tsx# Full story view & author card
            ├── CreatePostPage.tsx# Post authoring with draft auto-save
            ├── ChatRequestsPage.tsx # Received & Sent requests workflow
            ├── ChatPage.tsx     # 1-on-1 private messaging room
            ├── ProfilePage.tsx  # Anonymous profile, bookmarks, blocked users
            ├── MyPostsPage.tsx  # Author's shared stories management
            ├── SafetyCenterPage.tsx # Helplines, anti-harassment policy, quick exit
            ├── AdminPage.tsx    # Moderation console & user directory
            └── NotFoundPage.tsx # Calming 404 page
```

---

## 🛡️ Trust, Safety & Moderation System

1. **Anonymous Identity Protection:**
   - Real names and phone numbers are never stored or displayed.
   - Email is strictly optional (for recovery only) and excluded from all public API endpoints (`select: false`).
2. **Mutual Consent Chat Workflow:**
   - No unsolicited direct messages. Users must send a Chat Request with an introductory note.
   - The post author has full discretion to Accept or Decline.
3. **Emergency Crisis Resources:**
   - Prominently surfaces verified crisis support hotlines:
     - **India:** Tele-MANAS `14416` (24/7 National Mental Health Helpline), Emergency `112`, Vandrevala Foundation `9999 666 555`.
     - **US/Canada:** `988`
     - **UK:** `111` / Samaritans `116 123`
4. **Quick Exit Feature:**
   - Dedicated "Quick Exit" button immediately navigates the browser away to Google for user privacy and physical safety.
5. **Comprehensive Moderation (Admin Role):**
   - 1-click reporting across all posts, users, and messages.
   - Admin moderation actions: Warning issuance, post removal, 7-day account suspension, permanent banning.
   - Audit log and moderation tracking.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | Public |
| `GET` | `/api/auth/generate-username` | Generate unique anonymous handle | Public |
| `POST` | `/api/auth/register` | Create anonymous account | Public |
| `POST` | `/api/auth/login` | Authenticate and issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated session | User |
| `GET` | `/api/posts` | List posts (filtered by category/search) | Public / Optional User |
| `POST` | `/api/posts` | Share an anonymous story | User |
| `GET` | `/api/posts/:id` | Get story details | Public / Optional User |
| `PUT` | `/api/posts/:id` | Update author's story | Author / Admin |
| `DELETE`| `/api/posts/:id` | Delete story | Author / Admin |
| `POST` | `/api/posts/:id/bookmark` | Toggle private bookmark | User |
| `POST` | `/api/chat-requests` | Send chat request | User |
| `GET` | `/api/chat-requests/received`| List received requests | User |
| `GET` | `/api/chat-requests/sent` | List sent requests | User |
| `PATCH`| `/api/chat-requests/:id/accept` | Accept request & create conversation | Recipient |
| `PATCH`| `/api/chat-requests/:id/decline`| Decline request | Recipient |
| `DELETE`| `/api/chat-requests/:id` | Cancel/withdraw pending request | Sender |
| `GET` | `/api/conversations` | Get active user conversations | User |
| `GET` | `/api/conversations/:id/messages` | Get messages in conversation | Participant |
| `POST` | `/api/conversations/:id/end` | End conversation peacefully | Participant |
| `POST` | `/api/messages` | Send message with text/attachments | Participant |
| `DELETE`| `/api/messages/:id` | Delete own message | Sender / Admin |
| `POST` | `/api/messages/upload` | Upload file attachment | User |
| `POST` | `/api/reports` | Submit moderation report | User |
| `GET` | `/api/admin/stats` | Platform statistics | Admin |
| `GET` | `/api/admin/reports` | List reports by status | Admin |
| `PATCH`| `/api/admin/reports/:id` | Execute moderation action | Admin |
| `GET` | `/api/admin/users` | List all users | Admin |
| `PATCH`| `/api/admin/users/:id/status` | Update user status (active/suspended/banned) | Admin |
| `POST` | `/api/users/block/:id` | Block user | User |
| `POST` | `/api/users/unblock/:id` | Unblock user | User |
| `DELETE`| `/api/users/account` | Permanently delete account & data | User |

---

## 🌐 Real-Time Socket.IO Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `presence:update` | Server → Client | `{ userId, status }` | Live online/offline status |
| `typing:start` | Client → Server | `{ conversationId }` | User started typing |
| `typing:stop` | Client → Server | `{ conversationId }` | User stopped typing |
| `typing:status` | Server → Client | `{ conversationId, isTyping, username }` | Broadcast typing indicator |
| `message:new` | Server → Client | `Message` | Real-time chat message delivery |
| `message:deleted` | Server → Client | `{ messageId, conversationId }` | Real-time message deletion sync |
| `conversation:ended` | Server → Client | `{ conversationId, systemMessage }` | Peer conversation closure notification |
| `notification:new` | Server → Client | `NotificationItem` | Live in-app toast & badge update |

---

## 🚢 Deployment Guide

### Deploying Frontend on Vercel
1. Set the root directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://true-companion-api.onrender.com`).

### Deploying Backend on Render
1. Create a **Web Service** pointing to the `server` folder.
2. Runtime: **Node**.
3. Build Command: `npm install && npm run build`.
4. Start Command: `npm start`.
5. Configure Environment Variables in Render Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (`mongodb+srv://...`).
   - `JWT_SECRET`: A long secure secret key.
   - `CLIENT_URL`: Your deployed frontend URL on Vercel (`https://true-companion.vercel.app`).

---

## 📄 License
This project is open-source under the MIT License. Built with empathy and care.
