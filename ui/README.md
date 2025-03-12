# Solid.js Web Application UI

This is the UI for the Solid.js Flask web application template - a modern, responsive web interface built with Solid.js, TypeScript, and TailwindCSS.

## Features

- 🔐 Authentication (login, register, 2FA, email verification)
- 🌐 Internationalization (i18n) with English and Dutch support
- 🎨 Light/dark theme switching
- 📱 Responsive design with DaisyUI components
- 🔄 Form handling with validation
- 🚧 Modal dialogs and notifications
- 📊 Data tables with pagination
- 🔒 Protected routes with role-based access

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── api.tsx               # API client and endpoints
├── components/           # Reusable UI components
├── context/              # Global state providers
├── locales/              # Translation files
├── models/               # Data models
├── pages/                # Application pages
├── App.tsx               # Main app component
├── routes.tsx            # Routing configuration
└── index.tsx             # Application entry point
```

## Component Usage Examples

### Button Component

```tsx
import { Button } from "../components/Button";

// Standard button
<Button onClick={handleClick}>Click Me</Button>

// Loading state button
<Button loading={isLoading} onClick={handleSubmit}>Submit</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="ghost">Ghost</Button>
```

### Modal Dialog

```tsx
import { Modal } from "../components/Modal";
import { createSignal } from "solid-js";

const [isOpen, setIsOpen] = createSignal(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Example Modal"
>
  <p>Modal content goes here</p>
  <div class="modal-action">
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </div>
</Modal>
```

### Form Inputs

```tsx
import { TextInput } from "../components/TextInput";
import { BooleanInput } from "../components/BooleanInput";

<TextInput
  name="username"
  label="Username"
  value={username()}
  onChange={(value) => setUsername(value)}
  required
/>

<BooleanInput
  name="remember"
  label="Remember me"
  checked={remember()}
  onChange={(checked) => setRemember(checked)}
/>
```

### Internationalization

```tsx
import { useLocale } from "../context/LocaleProvider";

const { t, locale, setLocale } = useLocale();

// Translate text
<p>{t("common.welcome")}</p>

// Change language
<button onClick={() => setLocale("nl")}>Switch to Dutch</button>
```

### Authentication

```tsx
import { useUser } from "../context/UserProvider";

const { user, login, logout, isLoggedIn } = useUser();

// Check if user is logged in
<Show when={isLoggedIn()} fallback={<LoginButton />}>
  <p>Welcome, {user().name}</p>
  <Button onClick={logout}>Logout</Button>
</Show>
```

## Routing

The application uses `@solidjs/router` for navigation:

```tsx
import { useNavigate } from "@solidjs/router";

const navigate = useNavigate();

// Navigate programmatically
<Button onClick={() => navigate("/home")}>Go Home</Button>

// Protected routes are defined in routes.tsx
```

## Theming

The UI uses DaisyUI with Tailwind for styling with light/dark mode support:

```tsx
import { ThemeSwitcher } from "../components/ThemeSwitcher";

// Add theme switcher to your layout
<ThemeSwitcher />
```

## Development Tools

- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and better developer experience
- **ESLint/Prettier**: Code quality and formatting
- **TailwindCSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run serve`: Serve production build
- `npm run lint`: Check code style
- `npm run format`: Format code with Prettier