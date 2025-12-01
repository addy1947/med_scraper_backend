# Med Scrapper - Backend

The backend service for Med Scrapper, responsible for scraping medicine data, checking serviceability, and performing OCR on prescriptions.

## Features

-   **Multi-Pharmacy Scraping**: Fetches medicine data from 1mg, Apollo, PharmEasy, TrueMeds, and NetMeds.
-   **Pincode Serviceability**: Checks delivery availability for a given pincode across multiple platforms.
-   **OCR Integration**: Uses Google Gemini AI to extract medicine names from prescription images.
-   **API Endpoints**: RESTful API for frontend communication.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **HTTP Client**: Axios
-   **AI/ML**: Google Generative AI (Gemini)
-   **Utilities**: Multer (File Uploads), Cors, Dotenv

## Prerequisites

-   Node.js (v16 or higher)
-   npm (Node Package Manager)
-   Google Gemini API Key

## Setup & Installation

1.  **Navigate to Backend Directory**
    ```bash
    cd backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=3000
    FRONTEND_URL=http://localhost:5173
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run Server**
    -   Development (with hot reload):
        ```bash
        npm run dev
        ```
    -   Production:
        ```bash
        npm start
        ```

## API Documentation

### 1. Search Medicines
**Endpoint**: `POST /api/message`

Searches for medicines across all supported pharmacies.

**Request Body**:
```json
{
  "message": "paracetamol",
  "maxProduct": 3
}
```

**Response**:
Returns aggregated data from 1mg, Apollo, PharmEasy, TrueMeds, and NetMeds.

### 2. Check Pincode Serviceability
**Endpoint**: `POST /api/pincode`

Checks if delivery is available for a specific pincode or location.

**Request Body**:
```json
{
  "pincode": "110001",
  "lat": 28.6139,
  "lon": 77.2090
}
```

### 3. Extract Medicines (OCR)
**Endpoint**: `POST /api/extract-medicines`

Extracts medicine names from an uploaded prescription image.

**Request**: `multipart/form-data`
-   `image`: The image file.

**Response**:
```json
{
  "success": true,
  "data": ["Medicine A", "Medicine B"]
}
```

## Folder Structure

-   `server.js`: Main entry point.
-   `tool/`: Scraping logic for each pharmacy.
-   `pincode/`: Serviceability check logic.
-   `ocr/`: Gemini AI integration for OCR.
-   `data/`: Temporary storage for scraped data (gitignored).
