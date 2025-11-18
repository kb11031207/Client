# Fantasy Football Client

A React TypeScript client application for the SLIAC Fantasy Football platform, built with Redux Toolkit, Material UI, and React Router.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see API Connection section)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API connection**
   - The API base URL is configured in `src/services/api-client.ts`
   - Default: `https://localhost:7010`
   - Update the `baseUrl` if your backend runs on a different port/domain

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📡 API Connection

### Base URL
- **HTTPS**: `https://localhost:7010`
- **HTTP**: `http://localhost:5237`

The application uses the HTTPS endpoint by default. Update `src/services/api-client.ts` if needed.

### Authentication
- The app uses JWT (JSON Web Tokens) for authentication
- Tokens are stored in localStorage (access token and refresh token)
- Token refresh is handled automatically when tokens expire

### API Endpoints
See `docs/FRONTEND_INTEGRATION_GUIDE.md` for complete API documentation.

Key endpoints:
- `/api/Users/login` - User login
- `/api/Users/register` - User registration
- `/api/Users/refresh-token` - Token refresh
- `/api/Players` - Player data
- `/api/Squads` - Squad management
- `/api/Leagues` - League management
- `/api/Gameweeks` - Gameweek data

## 🏗️ Project Structure

```
src/
├── components/      # Reusable React components
├── pages/          # Page components (routes)
├── store/          # Redux store and slices
│   ├── slices/    # Redux Toolkit slices
│   └── hooks.ts   # Typed Redux hooks
├── services/       # API service layer
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── theme/          # Material UI theme configuration
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Material UI** - UI components
- **Vite** - Build tool

### Code Quality

- TypeScript strict mode enabled
- ESLint and Prettier configured (see `.eslintrc.json` and `.prettierrc`)
- Follows React and Redux best practices

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- `docs/README.md` - Documentation index
- `docs/MIGRATION_ROADMAP.md` - Migration guide from vanilla TS to React
- `docs/FRONTEND_INTEGRATION_GUIDE.md` - API integration guide
- `docs/CODEBASE_OVERVIEW.md` - Codebase structure overview

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

### Environment Variables

If you need to configure different API URLs for different environments, create a `.env` file:

```env
VITE_API_BASE_URL=https://localhost:7010
```

Then update `api-client.ts` to use `import.meta.env.VITE_API_BASE_URL`.

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend returns access token and refresh token
3. Tokens stored in localStorage
4. Access token included in API requests via Authorization header
5. On 401 errors, refresh token is used to get new access token
6. If refresh fails, user is redirected to login

## 🎨 Material UI Theme

The app uses a custom Material UI theme defined in `src/theme/theme.ts`. You can customize colors, typography, and spacing there.

## 📝 Key Features

- ✅ JWT Authentication with automatic token refresh
- ✅ Protected routes using React Router
- ✅ Redux Toolkit for state management
- ✅ Material UI components with responsive design
- ✅ Error handling with Snackbar notifications
- ✅ TypeScript for type safety

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript types for all props and state
3. Use Redux Toolkit slices for state management
4. Follow Material UI design patterns
5. Write clean, readable code

## 📄 License

[Add your license here]

---

**Built with ❤️ for SLIAC Fantasy Football**
