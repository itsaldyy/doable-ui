# To-Do List Application

A modern, responsive to-do list application built with React, TypeScript, and Tailwind CSS.

## Technology Stack

- **Node.js**: v20.19.5 (LTS)
- **React**: v18.3.1
- **TypeScript**: v5.9.3
- **Vite**: v7.1.10
- **Tailwind CSS**: v4.1.14
- **Jest**: v30.2.0
- **React Testing Library**: v16.3.0
- **Storybook**: v9.1.10
- **ESLint**: v9.36.0
- **Prettier**: v3.6.2

## Prerequisites

- Node.js v20.19.5 or higher
- npm v10.8.2 or higher
- [nvm](https://github.com/nvm-sh/nvm) (recommended for automatic version switching)

## Getting Started

### Automatic Node Version Switching (Recommended)

This project includes automatic Node.js version switching via `.nvmrc`.

**🚀 Quick Setup (Automated)**

```bash
# Run the automated setup script (detects your OS and configures everything)
bash scripts/setup-node-version-manager.sh
```

This script will:

- ✅ Detect your operating system (Ubuntu, macOS, Fedora, Arch, etc.)
- ✅ Install direnv if not present (with your permission)
- ✅ Configure your shell (.bashrc, .zshrc, etc.)
- ✅ Allow direnv for this project
- ✅ Verify nvm and Node.js installation
- ✅ Safe to run multiple times (idempotent)

**Manual Setup Options**

If you prefer manual setup, see [docs/NODE_VERSION_SETUP.md](docs/NODE_VERSION_SETUP.md) for detailed instructions including:

- Per-session manual loading
- direnv manual installation
- Standard nvm usage
- Troubleshooting guide

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## Code Quality

### Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

## Storybook

### Run Storybook

```bash
npm run storybook
```

### Build Storybook

```bash
npm run build-storybook
```

## Project Structure

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── stories/         # Storybook stories
├── App.tsx          # Root application component
├── main.tsx         # Application entry point
└── index.css        # Global styles with Tailwind
```

## Features

### Core Functionality

- ✅ **Create** todos with validation (no empty todos)
- ✅ **Read** todos with automatic loading from localStorage
- ✅ **Update** todos with inline editing (double-click to edit)
- ✅ **Delete** todos with immediate removal
- ✅ **Toggle** completion status with visual feedback
- ✅ **Persist** data automatically in localStorage

### User Experience

- 🎨 **Modern UI** with Tailwind CSS and smooth animations
- 📱 **Responsive Design** optimized for mobile and desktop
- ⌨️ **Keyboard Navigation** - full keyboard support (Enter, Escape, Tab)
- ♿ **Accessibility** - WCAG AA compliant with ARIA labels
- 🎭 **Smooth Animations** for adding, editing, and deleting todos
- 🌈 **Visual Feedback** for all user actions

### Error Handling

- 🛡️ **Graceful Degradation** - app works even when localStorage fails
- 💾 **Data Persistence** with automatic error recovery
- 📢 **Clear Error Messages** with dismissible notifications
- 🔄 **Automatic Recovery** from transient storage errors
- ⚠️ **Validation Feedback** with accessible error messages

### Technical Highlights

- 🧪 **131 Tests** with comprehensive coverage
- 📚 **Storybook** documentation for all components
- 🔒 **Type Safety** with TypeScript throughout
- 🚀 **Fast Performance** with optimized React rendering
- 📦 **Small Bundle** with tree-shaking and code splitting

## Contributing

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `type(scope): subject`

**Examples:**

```bash
feat(hooks): Add commit message validation
fix: Resolve Node version switching issue
docs(api): Update authentication guide
```

See [docs/COMMIT_MESSAGE_CONVENTION.md](docs/COMMIT_MESSAGE_CONVENTION.md) for detailed guidelines.

**Commit messages are automatically validated** by a commit-msg hook. Invalid messages will be rejected with helpful guidance.
