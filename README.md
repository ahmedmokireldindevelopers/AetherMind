# AetherMind

Unified Data and AI Model Management Platform.

This is a Next.js application bootstrapped with Firebase Studio and enhanced with various features for managing data connectors, AI models, and monitoring.

To get started, take a look at `src/app/page.tsx`.

## Running the Application

### Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Set up environment variables:**
    Create a `.env` file in the root directory and add necessary variables (e.g., `GOOGLE_GENAI_API_KEY`). Refer to `.env.example` if available.
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

### Running with Docker

1.  **Build the Docker image:**
    ```bash
    docker build -t aethermind-app .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 9002:9002 --env-file .env aethermind-app
    ```
    *   Make sure your `.env` file exists and contains the necessary environment variables.
    *   The application will be accessible at `http://localhost:9002`.

## Core Features

*   **Dashboard:** Overview of connected databases, managed models, sync status, and system health.
*   **Data Connectors:** Manage connections to Vector, JSON, MongoDB, SQLite, and Supabase databases.
*   **Model Management:** Manage PyTorch, TensorFlow, and JAX models, including recommendations via AI.
*   **Model Comparison:** Compare performance metrics of selected AI models.
*   **Model Sync:** Synchronize AI model files across storage devices with logging and inventory.
*   **Data Cleaning:** Upload and clean data files/folders.
*   **Integrations:** Connect with external AI platforms and tools (e.g., n8n, Hugging Face, OpenAI).
*   **Dependencies:** View project dependencies with installation commands.
*   **API Docs:** View Ollama API documentation and health checks.
*   **Monitoring:** Basic dashboard for CPU, memory, and API request monitoring.
*   **Export Project:** Download the entire project codebase as a zip file.
*   **AI Chat:** Integrated AI assistant for help and queries.
*   **Settings & Profile:** Manage application settings and user profile.

## Technologies Used

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui (Components)
*   Lucide React (Icons)
*   Genkit (AI Flows)
*   Zod (Validation)
*   React Hook Form
*   Recharts (Charts)
*   Docker
