# AI-Powered RFP Management System

A comprehensive web application for managing the entire RFP (Request for Proposal) lifecycle, from creation through vendor selection, powered by AI for intelligent parsing and recommendations.

## 🎯 App Video 
https://drive.google.com/file/d/1e0e8HcSokyrLZi8To5G3ifFrzw7JbBhl/view?usp=sharing

## 🎯 Features

- **AI-Powered RFP Creation**: Convert natural language descriptions into structured RFPs
- **Vendor Management**: Maintain a database of vendors with contact information
- **Email Integration**: Send RFPs via email and automatically receive/parse vendor responses
- **AI Proposal Analysis**: Automatic parsing and scoring of vendor proposals
- **Intelligent Comparison**: AI-powered comparison and recommendations
- **Modern UI**: Beautiful, responsive interface with glassmorphism and smooth animations

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Google Gemini API** - AI capabilities (Gemini 1.5 Pro)
- **Nodemailer** - Email sending (SMTP)
- **IMAP** - Email receiving
- **Mailparser** - Email parsing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Email Account** - Gmail, Outlook, or custom SMTP/IMAP server

### Email Setup (Gmail Example)

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in your `.env` file

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/fristineinfotech/Desktop/p2
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rfp-management

# Gemini API Configuration
GEMINI_API_KEY=your-actual-gemini-key-here

# Email Configuration (SMTP for sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your-app-password-here

# Email Configuration (IMAP for receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your.email@gmail.com
IMAP_PASS=your-app-password-here
IMAP_TLS=true

# Email Polling (optional - set to true to auto-check)
AUTO_CHECK_EMAILS=false
EMAIL_POLL_INTERVAL=60000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
```

### 4. Seed Database (Optional)

Populate the database with sample vendors:

```bash
cd backend
npm run seed
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### 1. Create an RFP

1. Navigate to "Create RFP" from the dashboard
2. Describe your procurement needs in natural language
3. Example: "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
4. Click "Create RFP" - AI will structure your requirements

### 2. Manage Vendors

1. Go to "Vendors" page
2. Click "Add Vendor" to create new vendors
3. Fill in contact information and categories
4. Edit or delete vendors as needed

### 3. Send RFP to Vendors

1. Click on an RFP from the dashboard
2. Select vendors from the list
3. Click "Send RFP" - emails will be sent automatically

### 4. Receive Vendor Responses

**Option 1: Manual Check**
- Click "Check for Responses" on the dashboard
- System will poll IMAP for new emails

**Option 2: Auto-polling**
- Set `AUTO_CHECK_EMAILS=true` in backend `.env`
- System will automatically check every 60 seconds (configurable)

### 5. Compare Proposals

1. Once proposals are received, click "Compare Proposals" on the RFP details page
2. View AI-powered analysis including:
   - Completeness and competitiveness scores
   - Pros and cons for each proposal
   - AI recommendation with reasoning
   - Detailed pricing breakdown

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### RFP Endpoints

#### Create RFP
```http
POST /api/rfps/create
Content-Type: application/json

{
  "description": "Natural language description of procurement needs"
}

Response: 201 Created
{
  "success": true,
  "rfp": { /* RFP object */ }
}
```

#### Get All RFPs
```http
GET /api/rfps

Response: 200 OK
{
  "success": true,
  "rfps": [ /* Array of RFP objects */ ]
}
```

#### Get RFP by ID
```http
GET /api/rfps/:id

Response: 200 OK
{
  "success": true,
  "rfp": { /* RFP object with populated vendors and proposals */ }
}
```

#### Send RFP to Vendors
```http
POST /api/rfps/:id/send
Content-Type: application/json

{
  "vendorIds": ["vendorId1", "vendorId2"]
}

Response: 200 OK
{
  "success": true,
  "message": "RFP sent to 2 vendor(s)",
  "emailResults": [ /* Email send results */ ]
}
```

### Vendor Endpoints

#### Create Vendor
```http
POST /api/vendors
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+1-555-0101",
  "company": "Tech Supplies Inc",
  "category": ["Electronics", "IT Equipment"],
  "notes": "Reliable vendor"
}

Response: 201 Created
{
  "success": true,
  "vendor": { /* Vendor object */ }
}
```

#### Get All Vendors
```http
GET /api/vendors

Response: 200 OK
{
  "success": true,
  "vendors": [ /* Array of vendor objects */ ]
}
```

#### Update Vendor
```http
PUT /api/vendors/:id
Content-Type: application/json

{ /* Updated vendor fields */ }

Response: 200 OK
{
  "success": true,
  "vendor": { /* Updated vendor object */ }
}
```

#### Delete Vendor
```http
DELETE /api/vendors/:id

Response: 200 OK
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

### Proposal Endpoints

#### Get Proposals for RFP
```http
GET /api/proposals/rfp/:rfpId

Response: 200 OK
{
  "success": true,
  "proposals": [ /* Array of proposal objects */ ]
}
```

#### Check for New Emails
```http
POST /api/proposals/check-emails

Response: 200 OK
{
  "success": true,
  "message": "Processed 2 proposals",
  "processed": 2,
  "proposals": [ /* Newly processed proposals */ ]
}
```

#### Compare Proposals
```http
GET /api/proposals/compare/:rfpId

Response: 200 OK
{
  "success": true,
  "proposals": [ /* Array of proposals with AI analysis */ ],
  "comparison": {
    "recommendedVendorId": "vendorId",
    "reasoning": "AI explanation",
    "comparison": "Key differences",
    "riskFactors": "Risks to consider"
  }
}
```

## 🎨 Design Decisions

### AI Integration Strategy

1. **RFP Parsing**: Uses GPT-4 with structured JSON output to extract:
   - Items with quantities and specifications
   - Budget, deadlines, payment terms
   - Warranty and additional requirements

2. **Proposal Parsing**: Analyzes vendor email responses to extract:
   - Pricing (total and per-item)
   - Delivery timelines
   - Terms and conditions

3. **Proposal Analysis**: Scores proposals on:
   - Completeness (0-100): How well it addresses requirements
   - Competitiveness (0-100): Price and value assessment
   - Generates pros, cons, and summary

4. **Comparison & Recommendation**: Compares all proposals and provides:
   - Recommended vendor with detailed reasoning
   - Key differences between vendors
   - Risk factors to consider

### Email Integration

- **Sending**: Uses Nodemailer with SMTP for reliable email delivery
- **Receiving**: IMAP polling to check for new responses
- **Matching**: Matches emails to RFPs by subject line pattern
- **Parsing**: Uses mailparser to extract email content and attachments

### Data Models

- **RFP**: Stores both original description and AI-structured data
- **Vendor**: Flexible category system for vendor classification
- **Proposal**: Links RFP, vendor, email data, parsed data, and AI analysis

### UI/UX Design

- **Glassmorphism**: Modern frosted glass effect for cards
- **Gradient Accents**: Purple-pink gradient for primary actions
- **Micro-animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with grid layouts
- **Loading States**: Clear feedback during AI processing
- **Toast Notifications**: Non-intrusive success/error messages

## 🔧 Assumptions & Limitations

### Assumptions

1. **Single User**: No authentication or multi-tenancy required
2. **Email Format**: Vendors reply to RFP emails (not a separate portal)
3. **Subject Matching**: RFP title in email subject for matching
4. **English Language**: AI prompts optimized for English
5. **Trust in AI**: Assumes Google Gemini API is available and reliable

### Step 2: Get API Keys

1. **Google Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy your API key

2. **Gmail App Password** (for email)

### Limitations

1. **Email Polling**: Not real-time; requires manual trigger or periodic polling
2. **Attachment Parsing**: Currently extracts filenames but doesn't parse PDF/Excel content
3. **No Edit History**: RFPs can't be versioned or have approval workflows
4. **Simple Matching**: Email-to-RFP matching is basic (subject line only)
5. **No Analytics**: No historical reporting or trend analysis

### Future Enhancements

- Real-time email webhooks (SendGrid/Mailgun)
- PDF/Excel attachment parsing with AI
- Multi-user support with authentication
- Advanced analytics and reporting
- RFP templates and versioning
- Vendor performance tracking
- Integration with procurement systems

## 🤖 AI Tools Usage

### Tools Used During Development

1. **GitHub Copilot** - Code completion and suggestions
2. **ChatGPT/Claude** - Architecture decisions and debugging
3. **Cursor** - AI-assisted code editing

### What They Helped With

- **Boilerplate Code**: Express routes, React components, Mongoose schemas
- **Email Integration**: IMAP/SMTP configuration and error handling
- **OpenAI Prompts**: Crafting effective system prompts for structured output
- **UI Components**: TailwindCSS classes and responsive layouts
- **Error Handling**: Edge cases and validation logic
- **Documentation**: README structure and API documentation

### Notable Prompts/Approaches

1. **Structured Output**: Using `response_format: { type: "json_object" }` for reliable JSON from GPT-4
2. **System Prompts**: Clear, specific instructions for each AI task (parsing, analysis, comparison)
3. **Temperature Settings**: Lower (0.3) for parsing, higher (0.5) for recommendations
4. **Context Provision**: Including RFP requirements in proposal analysis prompts

### What I Learned

- AI code assistants excel at boilerplate but need human oversight for architecture
- Structured output mode significantly improves AI reliability
- Email integration has many edge cases that AI tools help identify
- UI polish benefits greatly from AI-generated TailwindCSS combinations
- Documentation is faster with AI but requires manual review for accuracy

## 📝 Project Structure

```
p2/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── RFP.js               # RFP schema
│   │   ├── Vendor.js            # Vendor schema
│   │   └── Proposal.js          # Proposal schema
│   ├── routes/
│   │   ├── rfpRoutes.js         # RFP endpoints
│   │   ├── vendorRoutes.js      # Vendor endpoints
│   │   └── proposalRoutes.js    # Proposal endpoints
│   ├── services/
│   │   ├── aiService.js         # OpenAI integration
│   │   └── emailService.js      # Email send/receive
│   ├── scripts/
│   │   └── seedData.js          # Database seeding
│   ├── .env.example             # Environment template
│   ├── package.json
│   └── server.js                # Express app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation
│   │   │   └── RFPCard.jsx      # RFP card component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── CreateRFP.jsx    # RFP creation
│   │   │   ├── VendorManagement.jsx  # Vendor CRUD
│   │   │   ├── RFPDetails.jsx   # RFP details & sending
│   │   │   └── ProposalComparison.jsx  # AI comparison
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Ensure MongoDB is running
mongod --version

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rfp-management
```

### Email Not Sending
- Verify SMTP credentials
- For Gmail, ensure App Password is used (not regular password)
- Check firewall settings for SMTP port (587)

### Email Not Receiving
- Verify IMAP credentials
- Ensure IMAP is enabled in email account settings
- Check that emails have "RFP" in subject line

### Gemini API error?
- Verify your API key is correct
- Get your key from: https://makersuite.google.com/app/apikey
- Ensure API is enabled in your Google Cloud project

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check that backend is running on port 5000

## 📄 License

ISC

## 👤 Author

Built as part of SDE Assignment - AI-Powered RFP Management System

---

**Note**: This is a demonstration project. For production use, add authentication, input validation, rate limiting, and proper error handling.
