   # Upload System & File Validation Logic

   The ingestion gateway of Plumb Health AI is constructed securely within `backend/routes/uploadRoute.js`. Our platform supports handling sensitive clinical PDFs and scanned image archives while maintaining strict server-side integrity.

   ## Mechanics

   1. **Multer Memory Engine:** 
      Our system buffers files directly in server RAM, negating the requirement for temporary filesystem bloat during rapid user file streams.
   2. **Native Validation Checks:** 
      Only configurations adhering explicitly to `application/pdf`, `image/jpeg`, and `image/png` bypass our server gatechecks.
   3. **Report Generation Pipeline:** 
      Upon a successful upload via React Axios POST to `/api/reports/upload`:
      - It intercepts the Multer context buffer.
      - It streams the buffer to `llmAnalyzer.analyzeBuffer`.
      - On completion, it converts the structured AI response payload directly into the MongoDB document format associated deeply to the user's secure reference ID.

   *Note: In the event of a successful upload but failed LLM API execution, our platform natively falls back by saving purely the metadata of the document, notifying the user intelligently over the UI.*
