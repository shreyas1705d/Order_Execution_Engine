# Order Execution Engine - Frontend

## Running the Frontend

Since the backend doesn't have CORS enabled, you need to serve the frontend from a local web server instead of opening the HTML file directly.

### Option 1: Using Python (Recommended)

If you have Python installed:

```bash
# Navigate to the frontend directory
cd frontend

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open your browser to: `http://localhost:8080`

### Option 2: Using Node.js http-server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to frontend directory
cd frontend

# Start server
http-server -p 8080
```

Then open your browser to: `http://localhost:8080`

### Option 3: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Backend Requirements

Make sure the backend server is running:

```bash
# From the root directory
pnpm dev
```

The backend should be running on `http://localhost:3000`

## Features

- **Order Submission**: Submit token swap orders with customizable slippage
- **Real-time Tracking**: Watch your order progress through WebSocket updates
- **Order History**: View past orders stored in browser localStorage
- **Beautiful UI**: Modern dark theme with glassmorphism effects and smooth animations

## API Endpoints Used

- `POST http://localhost:3000/orders/execute` - Submit new order
- `WebSocket ws://localhost:3000/ws/orders/{orderId}` - Real-time order updates
