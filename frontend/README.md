# Offerify Frontend

> Expo SDK 53 cross-platform app (iOS, Android, Web) with React Native.

---

## 🚀 Quick Start

### Using Makefile (Recommended)

From the **project root**:
```bash
make setup        # Install deps, start DBs, run migrations, seed
make dev-frontend # Run frontend in dev mode
```

### Manual Setup

```bash
npm install
cp .env.example .env
# Edit .env with your API URL
```

### Development

```bash
# Web
npm run web

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code)
npm run start
```

---

## 📁 Project Structure

```
├── app/              # Expo Router pages
│   ├── (tabs)/       # Tab navigation screens
│   ├── (auth)/       # Auth screens
│   ├── offers/       # Offer detail screens
│   └── vendor/       # Vendor screens
├── src/
│   ├── api/          # API endpoint hooks
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities (api client, storage)
│   ├── stores/       # Zustand state stores
│   └── types/        # TypeScript types
└── assets/           # Images, fonts
```

---

## 🧪 Testing

```bash
npm run test
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start Expo development server |
| `npm run web` | Start web development |
| `npm run ios` | Run on iOS Simulator |
| `npm run android` | Run on Android Emulator |
| `npm run test` | Run tests |

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000/api` |

---

## 🚢 Deployment (Vercel)

1. Connect GitHub repository
2. Set root directory to `frontend`
3. Configure build settings:
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `EXPO_PUBLIC_API_URL` = Your Railway backend URL

The `vercel.json` handles SPA routing automatically.

---

## 📱 Supported Platforms

| Platform | Status |
|----------|--------|
| Web | ✅ Production ready |
| iOS | ✅ Via Expo Go / EAS Build |
| Android | ✅ Via Expo Go / EAS Build |

---

## 🎨 Styling

Uses vanilla CSS with a design system approach. Key files:
- Global styles in root layout
- Component-specific styles colocated with components
