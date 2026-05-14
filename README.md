# Plumb Health AI Intelligence Platform

Welcome to **Plumb Health AI**, an enterprise-grade medical lab report analysis and diagnostic summary platform. Plumb Health AI allows patients to securely upload their clinical lab reports (PDF, JPG, PNG) and leverages a sophisticated Node.js-based unified LLM prompt-chaining architecture to decode, structure, and visualize critical biomarkers.

## Features

- **Document Ingestion Layer**: Robust PDF text extraction and multimodal visual fallback capabilities without needing local clunky OCR tools like Tesseract.
- **Unified Diagnostic AI Engine**: Powered by Groq `meta-llama/llama-4-scout-17b-16e-instruct` and Gemini multimodal capabilities.
- **Biomarker Visualization**: Beautiful interactive charts built with Recharts, categorizing patient tests by normal ranges and flagged indicators.
- **PRO Membership System**: Scalable JWT-based authentication system featuring simulated Stripe upgrades and Nodemailer-powered real-time transaction receipts.
- **Premium UI/UX**: Designed using Tailwind CSS, Framer Motion, and the Plus Jakarta Sans typography suite for a stunning, professional feel.

## Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **Charting:** Recharts
- **PDF Generation:** `html2pdf.js`

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB / Mongoose
- **Authentication:** JWT + bcrypt
- **File Handling:** Multer, `pdf-parse`, `pdf-img-convert`
- **AI Integration:** Groq SDK, Google Generative AI SDK
- **Mailing:** Nodemailer

## Quick Links
- [Quick Start Guide](./QUICK_START.md)  
- [Code Reference & Architecture](./CODE_REFERENCE.md)  
- [Upload System Mechanics](./UPLOAD_SYSTEM_GUIDE.md)  
- [AI Lab Analysis Guide](./LAB_ANALYSIS_GUIDE.md)  
- [Authentication Workflow](./AUTHENTICATION_SETUP.md)  

## System Architecture

Our platform operates entirely as a modern MERN stack. We have deprecated inter-process python communication. The Express backend handles all complex business logic, calling directly out to high-capacity foundational models over optimized APIs to extract health metrics. The React dashboard instantly receives structured JSON responses containing categorized Lab Results, overall risk scoring, and physician-grade recommendations.
