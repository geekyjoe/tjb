# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.


my-store/
├── backend/                     # Backend code (Node.js + Express)
│   ├── controllers/              # Logic for handling requests
│   ├── models/                   # Mongoose models (if using MongoDB, or other DB models)
│   ├── routes/                   # API route handlers
│   ├── server.js                 # Entry point for the backend (Express server)
│   ├── .env                      # Environment variables for backend (e.g., DB credentials)
│   └── package.json              # Backend dependencies and scripts
├── node_modules/                 # Frontend and backend dependencies (combined)
├── public/                       # Static files (frontend)
│   └── index.html                # Main HTML file
├── src/                          # Frontend code (React + Vite)
│   ├── api/                      # dummyjson api for testing
│   ├── assets/                   # Static assets like images
│   ├── components/               # React components
│   ├── pages/                    # Routes to pages (contains products, carts, user login and admin login page)
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point for React app
│   └── ...
├── .gitignore                    # Git ignore file (backend + frontend)
├── index.html                    # Frontend entry HTML file (can be in public/)
├── package.json                  # Frontend dependencies and scripts (React + Vite)
├── README.md                     # Project documentation
├── vite.config.js                # Vite configuration file (for React app)
└── package-lock.json             # Frontend lock file for consistent dependencies


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
