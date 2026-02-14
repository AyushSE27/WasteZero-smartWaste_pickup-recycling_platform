# WasteZero - Complete Setup Guide

## 📁 Folder Structure

Create your project with this exact structure:

```
wastezero/                          # Main project folder (create this)
│
├── public/                         # Frontend files (create this folder)
│   ├── index.html                  # Landing page
│   ├── login.html                  # Login page
│   ├── register.html               # Registration page
│   ├── style.css                   # All styles
│   └── script.js                   # Frontend JavaScript
│
├── server.js                       # Backend server (root level)
├── package.json                    # Dependencies (root level)
├── .env                           # Environment variables (root level)
├── .gitignore                     # Git ignore file (root level)
└── README.md                      # Documentation (root level)
```

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create the Project Folder

```bash
# On Windows (Command Prompt or PowerShell)
mkdir wastezero
cd wastezero

# On Mac/Linux (Terminal)
mkdir wastezero
cd wastezero
```

### Step 2: Create the Public Folder

```bash
# Windows
mkdir public

# Mac/Linux
mkdir public
```

### Step 3: Copy Files to Correct Locations

**Copy to the `wastezero` folder (root level):**
- server.js
- package.json
- .env
- .gitignore
- README.md

**Copy to the `wastezero/public` folder:**
- index.html
- login.html
- register.html
- style.css
- script.js

### Step 4: Update server.js

Open `server.js` and add this line after the middleware section (around line 13):

```javascript
// Serve static files from 'public' directory
app.use(express.static('public'));
```

Your final folder should look like this:

```
wastezero/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   └── script.js
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

### Step 5: Install Node.js (if not installed)

1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Install it (accept all defaults)
4. Verify installation:

```bash
node --version
npm --version
```

### Step 6: Install Dependencies

Open terminal/command prompt in the `wastezero` folder and run:

```bash
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### Step 7: Start the Server

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 3000
📱 API available at http://localhost:3000
```

### Step 8: Open in Browser

Open your web browser and go to:
```
http://localhost:3000/index.html
```

Or simply:
```
http://localhost:3000
```

## 🎯 Visual Guide

```
Your Computer
└── Documents (or any location you choose)
    └── wastezero/                    ← Create this folder
        ├── public/                   ← Create this folder
        │   ├── index.html           ← Copy here
        │   ├── login.html           ← Copy here
        │   ├── register.html        ← Copy here
        │   ├── style.css            ← Copy here
        │   └── script.js            ← Copy here
        │
        ├── server.js                ← Copy here
        ├── package.json             ← Copy here
        ├── .env                     ← Copy here
        ├── .gitignore               ← Copy here
        └── README.md                ← Copy here
```

## 🔧 Troubleshooting

### Problem: "npm is not recognized"
**Solution:** Install Node.js from nodejs.org

### Problem: "Port 3000 is already in use"
**Solution:** 
1. Change port in `.env` file: `PORT=3001`
2. Or close the application using port 3000

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` in the project folder

### Problem: "MongoDB connection error"
**Solution:** 
1. Check your internet connection
2. Verify MongoDB Atlas credentials
3. Ensure your IP is whitelisted in MongoDB Atlas

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd wastezero

# Install dependencies (first time only)
npm install

# Start server
npm start

# For development (auto-restart on changes)
npm run dev
```

## 📝 Testing the Application

1. **Register a new account:**
   - Go to http://localhost:3000/register.html
   - Enter email and password
   - Click "Create Account"

2. **Login:**
   - Go to http://localhost:3000/login.html
   - Enter your credentials
   - Click "Log In"

3. **Check if it works:**
   - Open browser console (F12)
   - Look for success messages
   - Check terminal for server logs

## 🌐 Accessing from Other Devices

To access from phone/tablet on same network:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Look for IPv4 address (e.g., 192.168.1.100)

3. On your phone/tablet, open:
   ```
   http://192.168.1.100:3000
   ```

## 📱 Next Steps

After basic setup works:

1. **Customize the design** - Edit `style.css`
2. **Add more features** - Extend `server.js`
3. **Create dashboard** - Add new pages in `public/`
4. **Deploy online** - Use Heroku, Railway, or Render

## 🆘 Need Help?

If you encounter any issues:
1. Check the terminal for error messages
2. Check browser console (F12) for errors
3. Ensure all files are in correct folders
4. Verify MongoDB connection string in `.env`
5. Make sure Node.js is installed

---

**You're all set! Happy coding! 🎉**
