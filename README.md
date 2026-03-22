# APIpulse ⚡

A modern, professional API testing tool built with React, Vite, and Tailwind CSS. Test your API endpoints in real-time with beautiful analytics and comprehensive request history.

## Features

- **API Tester** - Send GET, POST, PUT, PATCH, and DELETE requests with custom headers and request bodies
- **Real-time Response Viewer** - Pretty-print JSON responses with syntax highlighting using react-json-view
- **Performance Monitoring** - Track response times and get alerted when APIs are slow
- **Request History** - Full history of up to 100 requests persisted to localStorage
- **Request Comparison** - Compare two requests side-by-side to analyze differences
- **Analytics Dashboard** - Visualize API performance with charts and statistics:
  - Response time trends
  - Status code breakdown
  - Top 5 slowest endpoints
  - Success rate metrics
- **Dark Mode** - Beautiful dark theme with persistent preference storage
- **Keyboard Shortcuts** - Press Ctrl+Enter to quickly send requests
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Slow API Detection** - Configurable threshold with visual alerts for slow responses

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Testing APIs

1. Navigate to the **Test** tab
2. Enter your API URL
3. Select the HTTP method (GET, POST, PUT, PATCH, DELETE)
4. Add headers as JSON (optional)
5. Add request body for POST/PUT/PATCH (optional)
6. Click "Send" or press Ctrl+Enter

### Viewing History

- Go to the **History** tab to see all past requests
- Click the checkbox to select requests for comparison
- Delete individual requests or clear all history

### Analyzing Performance

- Visit the **Dashboard** tab for comprehensive analytics
- View response time trends over time
- See status code distribution
- Identify your slowest API endpoints

## Keyboard Shortcuts

- **Ctrl+Enter** - Send the current request

## Configuration

### Slow Response Threshold

- Default: 1000ms
- Adjust in the slow API alert banner or in the quick reference panel
- Setting is saved to localStorage

### Dark Mode

- Toggle in the navbar
- Preference is persisted across sessions

## Technology Stack

- **React** 18 - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing
- **react-json-view** - JSON viewer component
- **Lucide React** - Icon library

## Data Persistence

- Request history is automatically saved to browser localStorage (max 100 items)
- Dark mode preference is persisted
- Slow response threshold is remembered

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized bundle size (~62KB gzipped)
- Lazy-loaded routes with React Router
- Efficient state management with Zustand
- Responsive animations with Tailwind CSS

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for improvements.

---

Built with ❤️ for API developers
# apipulse
