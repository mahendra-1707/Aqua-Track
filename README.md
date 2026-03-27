# AquaGuard IoT: Smart Water Quality Monitoring System

A scalable, low-cost IoT solution for real-time water quality monitoring, designed with real-world impact in mind (e.g., rural water safety, industrial monitoring). The project features a complete end-to-end pipeline: ESP32 edge processing, a Node.js Express API with MongoDB storage, and a modern, real-time web dashboard.

## System Architecture

1.  **Hardware (Edge Layer)**: ESP32 Microcontroller connected to pH, TDS, Turbidity, and Temperature sensors. Collects data and pushes via REST over Wi-Fi.
2.  **Backend (API & Database)**: Node.js/Express server providing RESTful endpoints. Uses MongoDB Atlas for reliable cloud storage.
3.  **Frontend (Application Layer)**: Vanilla JS/HTML/CSS dashboard. Fetches data periodically, visualizes trends via Chart.js, and classifies water potability instantly. Designed with a premium "glassmorphism" UI for an impressive pitch.

## Deployment Instructions

### 1. Backend API (Render / Railway)
-   Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
-   Get your MongoDB Connection string.
-   Push the `backend` folder to a GitHub repository.
-   Deploy the repo on [Render](https://render.com/) or Railway as a Node Web Service.
-   Add Environment Variables in your deployment service:
    -   `MONGODB_URI` = `your_atlas_connection_string`
    -   `PORT` = `3000`

### 2. Frontend Dashboard (Vercel / Netlify)
-   In `frontend/script.js`, change `API_BASE_URL` to your live deployed backend URL (e.g., `https://my-aquaguard-api.onrender.com/api/data`).
-   Push the `frontend` folder to GitHub.
-   Deploy as a static site via [Vercel](https://vercel.com) or Netlify.

### 3. ESP32 Hardware
-   Install the ESP32 Board Manager in Arduino IDE.
-   Update the `ssid`, `password`, and `serverName` variables in `ESP32/esp32_water_monitoring.ino`.
-   Upload to your ESP32 board.
-   *(Note: For testing the dashboard before hardware or backend is ready, the frontend includes a robust simulated data fallback mode that mimics real-world sensor fluctuations.)*

## Future Scope
-   **AI Prediction Engine**: Integrating TensorFlow Lite on the ESP32 or a Python microservice on the backend to predict water contamination events.
-   **Off-grid Deployment**: Solar-powered modules with LoRaWAN for extremely remote rural deployments where Wi-Fi is unavailable.
