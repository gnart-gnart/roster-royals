# Frontend Documentation

This directory contains the React frontend for the Roster Royals application. It is responsible for the user interface and client-side logic.

## Structure

- **`src/`**: Contains the source code for the React application.
  - **`components/`**: Reusable UI components.
  - **`pages/`**: Page components corresponding to different routes.
  - **`services/`**: API service functions for interacting with the backend.
  - **`App.js`**: Main application component that sets up routing and theming.
  - **`index.js`**: Entry point for the React application.

- **`public/`**: Contains static files and the HTML template.
  - **`index.html`**: Main HTML file for the application.

- **`Dockerfile`**: Dockerfile for building the frontend container.

## Development

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.

### Running Locally

1. **Install Dependencies**

   Navigate to the `frontend` directory and install the dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server**

   Start the React development server:

   ```bash
   npm start
   ```

   This will start the application on [http://localhost:3000](http://localhost:3000).

### Building for Production

To build the application for production, run:

```bash
npm run build
```

This will create an optimized build in the `build` directory.

## Docker

The frontend can also be run in a Docker container. Use the following command to build and run the container:

```bash
docker build -t roster-royals-frontend .
docker run -p 3000:3000 roster-royals-frontend
```

## Environment Variables

The application uses environment variables defined in a `.env` file. Ensure the following variables are set:

- **`REACT_APP_API_URL`**: The base URL for the backend API.

## Testing

The frontend uses React's built-in testing library. To run tests, use:

```bash
npm test
```

## Contributing

When contributing to the frontend, please ensure:

- Code is linted and formatted.
- New components are placed in the `components` directory.
- New pages are placed in the `pages` directory.
- API interactions are handled in the `services` directory. 