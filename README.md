# AI-Powered CV Generator

An intelligent, full-stack web application that generates **tailored CVs** based on job descriptions using AI-powered analysis and optimization.

## 🌟 Key Features

- **📝 Profile Storage** - Save your complete professional profile once
- **🎯 Job Description Analysis** - AI analyzes job requirements, skills, and keywords
- **🤖 Smart CV Tailoring** - Automatically customizes your CV for each job
- **📊 Match Score** - See how well you match the job (0-100%)
- **📄 PDF Export** - Download professionally formatted PDFs
- **🎨 Modern UI** - Clean, responsive design with progress tracking

## 🔥 How It Works

1. **Enter Your Profile** - Fill in your complete information once (education, experience, skills, projects)
2. **Save Profile** - Your data is stored and can be reused for multiple applications
3. **Paste Job Description** - Copy and paste any job posting
4. **AI Analysis** - The system:
   - Extracts required skills and keywords
   - Detects experience level and industry
   - Analyzes key requirements
5. **Get Tailored CV** - Receive a customized CV that:
   - Prioritizes relevant experience
   - Highlights matching skills
   - Optimizes content for the specific role
   - Shows your match score (0-100%)
6. **Download PDF** - Export your tailored CV as a professional PDF

## Tech Stack

**Frontend:**
- React 18
- Vite
- CSS3

**Backend:**
- Node.js
- Express
- PDFKit (for PDF generation)
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation & Running

1. **Install Backend Dependencies**
   ```powershell
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```powershell
   cd frontend
   npm install
   ```

3. **Start Backend Server** (in backend folder)
   ```powershell
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

4. **Start Frontend Dev Server** (in frontend folder, separate terminal)
   ```powershell
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

5. **Open Application**
   - Navigate to `http://localhost:3000` in your browser
   - Fill in the CV form
   - Click "Generate CV Preview"
   - Download as PDF

## Project Structure

```
final/
├── backend/
│   ├── src/
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic (PDF generation)
│   │   └── index.js     # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (CVForm, CVPreview)
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/health` - Service status
- `POST /api/cv/generate-pdf` - Generate PDF from CV data
- `POST /api/cv/save` - Save CV data (future database integration)

## Usage

1. Fill in your personal information
2. Add education entries (add multiple if needed)
3. Add work experience entries
4. List your skills (technical, soft skills, languages)
5. Add projects with descriptions
6. Add certifications
7. Click "Generate CV Preview"
8. Review your CV in the preview
9. Click "Download PDF" to export

## Development

- Backend uses **nodemon** for hot-reload
- Frontend uses **Vite HMR** for instant updates
- Both servers run concurrently during development

## Future Enhancements

- [ ] Multiple CV templates
- [ ] Database integration for saving CVs
- [ ] User authentication
- [ ] CV templates customization
- [ ] Export to other formats (DOCX, HTML)
- [ ] AI-powered content suggestions

## License

MIT

## Author

Created as part of a CV Generator project.
