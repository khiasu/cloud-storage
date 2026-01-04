Cloud File Storage

A straightforward application for storing and managing files. You can upload files, organize them, and share download links with others.

Getting Started

What You’ll Need

· Node.js – Download and install it from nodejs.org (pick the LTS version).
· A web browser (Chrome, Firefox, Edge, or Safari).

Setup Steps

1. Get the project
   · Download the ZIP or run:
     ```bash
     git clone https://github.com/senyeksola/Cloud-File-Storage.git
     ```
   · Open the folder in your file manager.
2. Install packages
   · Open terminal/command prompt in the project folder.
   · Run:
     ```bash
     npm install
     ```
3. Set up the environment file
   · Find .env.example in the project folder.
   · Rename it to .env.
   · Open .env and set a JWT_SECRET (any random text, e.g., my_secret_key).
4. Start the app
   · In the terminal, run:
     ```bash
     npm start
     ```
   · Wait for “Server is running on port 3000”.
5. Open in browser
   · Go to http://localhost:3000.
   · Create an account using an email and password.
6. Upload files
   · Drag and drop files into the upload area or click “Choose File”.

Basic Usage

· Upload: Drag files or click to browse.
· Download: Click the download (↓) button next to a file.
· Share: Click the share (🔗) button to create a temporary link.
· Delete: Click the delete (×) button to remove a file.
· Theme: Use the sun/moon icon to switch between light and dark mode.

Restarting the App

If you close the terminal, the app stops. To restart:

1. Open terminal in the project folder.
2. Run npm start.
3. Go to http://localhost:3000 again.

Troubleshooting

· Check Node.js is installed: run node -v in terminal.
· If port 3000 is busy, close other programs using it.
· If the app behaves unexpectedly, delete the node_modules folder and run npm install again.
· Files are stored locally in the uploads folder. File info is kept in database.sqlite.

Notes on Security

· Keep your .env file private.
· Use a strong password for your account.
· This app is intended for local or personal use. Additional security should be added for public hosting.

API Endpoints

· POST /api/auth/register – Register a new user.
· POST /api/auth/login – Log in.
· POST /api/files/upload – Upload a file.
· GET /api/files/list – List uploaded files.
· GET /api/files/download/:id – Download a file.
· DELETE /api/files/:id – Delete a file.
· POST /api/files/share/:id – Create a shareable link.
· GET /api/files/shared?token=... – Access a shared file.

Backup

You can export file metadata using the backup utility in src/utils/backup.js. To back up files themselves, copy the uploads folder.

---