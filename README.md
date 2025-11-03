# Cloud File Storage

A simple yet powerful cloud file storage application that lets you store, manage, and share files easily. No complex setup required - just follow the steps below to get started!

## 🚀 Quick Start Guide

### Prerequisites
- Download and install [Node.js](https://nodejs.org/) (LTS version recommended)
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Step 1: Get the Files
1. Download the project as a ZIP file and extract it, or clone it using Git:
   ```bash
   git clone https://github.com/yourusername/cloud-file-storage.git
   ```
2. Open the project folder in File Explorer

### Step 2: Install Dependencies
1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Navigate to the project folder:
   ```bash
   cd path/to/cloud-file-storage
   ```
3. Install the required packages:
   ```bash
   npm install
   ```

### Step 3: Configure the Application
1. In the project folder, find the file named `.env.example`
2. Right-click it and select "Rename"
3. Remove ".example" from the filename (it should be just `.env`)
4. Open the `.env` file with a text editor (like Notepad)
5. Change the `JWT_SECRET` to any random string (e.g., `my_super_secret_key_123`)

### Step 4: Start the Application
1. In the same Command Prompt/Terminal window, run:
   ```bash
   npm start
   ```
2. Wait until you see a message saying "Server is running on port 3000"

### Step 5: Access the Application
1. Open your web browser
2. Go to: http://localhost:3000
3. You should see the login screen

### Step 6: Create an Account
1. Click on "Create Account"
2. Enter your email and a strong password
3. Click "Sign Up"
4. You're in! Start uploading files by dragging them to the upload area

## 📱 Using the Application

### Uploading Files
- Drag and drop files into the upload area, or
- Click "Choose File" to browse your computer

### Managing Files
- Click the download (↓) button to download a file
- Click the share (🔗) button to get a shareable link
- Click the delete (×) button to remove a file

### Changing Themes
- Click the sun/moon icon in the top-right corner to toggle between light and dark mode

## 🔄 Restarting the Application
If you close the Command Prompt/Terminal, the app will stop. To start it again:
1. Open Command Prompt/Terminal
2. Navigate to the project folder
3. Run `npm start`
4. Open http://localhost:3000 in your browser

## ❓ Need Help?
If you run into any issues:
1. Make sure Node.js is installed (type `node -v` in Command Prompt to check)
2. Ensure no other program is using port 3000
3. Try deleting the `node_modules` folder and running `npm install` again
4. Contact [Your Name] at [Your Email] for assistance

## 📁 Where Are My Files Stored?
Your uploaded files are saved in the `uploads` folder in the project directory. The file information is stored in a SQLite database file named `database.sqlite`.

## 🔒 Security Note
- Never share your `.env` file with anyone
- Choose a strong password for your account
- The application is designed for personal/local use - for production use, additional security measures are recommended

## 🌟 Features

- **User Authentication**
  - Secure registration and login system
  - JWT-based authentication
  - Password hashing with bcrypt
  - Protected API endpoints

- **File Management**
  - Drag-and-drop file uploads
  - File preview and download
  - File sharing with unique, expiring links
  - File deletion with confirmation

- **User Experience**
  - Responsive design for all devices
  - Dark/Light theme toggle
  - Intuitive file browser
  - Real-time feedback with toast notifications
  - Loading states and progress indicators

- **Security**
  - Secure file storage with unique identifiers
  - Protected file access
  - Input validation and sanitization
  - CSRF protection

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/senyeksola/Cloud-File-Storage.git
   cd cloud-storage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your_secure_jwt_secret_here
   UPLOAD_DIR=uploads
   ```

4. **Start the development server**
4. **Run**:
   ```bash
   npm start
   ```
   App: http://localhost:3000

No MySQL or manual setup needed! Database and storage folders are created automatically.

## API
- POST `/api/auth/register` { email, password }
- POST `/api/auth/login` { email, password }
- POST `/api/files/upload` multipart `file`
- GET `/api/files/list`
- GET `/api/files/download/:id`
- DELETE `/api/files/:id`
- POST `/api/files/share/:id` { ttl }
- GET `/api/files/shared?token=...`

## Backup/Recovery
Utility functions in `src/utils/backup.js` for metadata JSON export/import. Storage objects should be backed up separately (copy `uploads/` or rely on S3 versioning/lifecycle).

## Notes
- This is a starter. Add rate limiting, validation, and admin features per your needs.
