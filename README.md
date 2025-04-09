# TrendLink - Full Stack Social Media Application


## ✨ Features

### 🔐 Authentication & User Management
- Secure authentication with Clerk
- Customizable user profiles
- Real-time online status indicators

### 📱 Social Interaction
- Create and share posts with text and images
- Like and comment on posts
- Follow/unfollow other users
- Real-time feed updates

### 💬 Messaging System
- Real-time private messaging
- Smart message input (auto-expanding)
- Message status indicators
- Typing indicators

### 🎨 UI/UX
- Responsive design (mobile-first)
- Dark/Light mode
- Modern and clean interface
- Smooth animations and transitions

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - React Hook Form

- **Backend**:
  - Prisma (ORM)
  - PostgreSQL
  - Clerk (Authentication)
  - Uploadthing (File uploads)

## 📸 Screenshots

<div align="center">
  <img src="https://fr4kwg57ja.ufs.sh/f/RpTaVLJY6d4z2uUQFm8JtZuvC0imODzRMoA613j2YXBTFHpl" alt="Home Feed" width="400"/>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Uploadthing account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/justin4689/Full-Stack-Social-App.git
cd Full-Stack-Social-App
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in your environment variables in `.env`

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="your-postgresql-url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Clerk](https://clerk.dev)
- [Prisma](https://prisma.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
