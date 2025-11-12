# Surf Risk Analyzer

A full-stack application for analyzing and predicting surfing hazards and risk levels at various surf spots. The project includes a React Native mobile app, Node.js backend API, and Python ML model for risk prediction.

## Project Structure

```
surf-risk-analyzer/
├── backend/                    # Node.js Express API server
│   ├── config/                # Database and file upload configs
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth, error handling
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── uploads/              # User-uploaded files
│   ├── package.json
│   └── server.js
│
├── mobile-app/                # React Native Expo app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # App screens (Home, Login, etc)
│   │   ├── services/         # API, auth, and storage services
│   │   ├── utils/            # Helpers and constants
│   │   └── navigation/       # Navigation setup
│   ├── assets/               # Icons, images, splash screens
│   ├── App.js
│   ├── babel.config.js       # Babel configuration with nativewind
│   ├── metro.config.js       # Metro bundler configuration
│   ├── package.json
│   └── tailwind.config.js    # Tailwind CSS setup
│
├── ml-model/                  # Python ML model service
│   ├── data/                 # Training datasets
│   ├── models/               # Saved model files
│   ├── app.py                # Flask API for predictions
│   ├── train_model.py        # Model training script
│   ├── predict_risk.py       # Risk prediction script
│   ├── analyze_hazard.py     # Hazard analysis utilities
│   ├── requirements.txt
│   └── venv/                 # Python virtual environment
│
└── README.md                 # This file
```

## Tech Stack

### Backend
- **Runtime**: Node.js v24
- **Framework**: Express.js
- **Database**: MongoDB
- **Auth**: JWT with middleware
- **File Upload**: Multer

### Mobile App
- **Framework**: React Native (v0.81) with Expo
- **Navigation**: React Navigation
- **Styling**: Tailwind CSS (NativeWind)
- **State**: Async Storage
- **Maps**: React Native Maps
- **HTTP**: Axios

### ML Model
- **Framework**: Flask
- **ML Libraries**: scikit-learn, pandas, numpy
- **Database**: MongoDB (incident data)
- **Models**:
  - Random Forest Classifier (risk level classification)
  - Gradient Boosting Regressor (risk score regression)

## Prerequisites

- Node.js >= 16
- Python >= 3.9
- MongoDB (local or cloud instance)
- npm or yarn
- Expo CLI (for mobile development)

## Setup & Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```
MONGODB_URI=mongodb://localhost:27017/surf-risk-analyzer
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 2. ML Model Setup

```bash
cd ml-model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Train the model:
```bash
python train_model.py
```

Start the Flask API server:
```bash
# Using Waitress (production) on Windows:
python -m waitress --port=5001 app:app

# Or using Flask development server:
python app.py
```

The ML service will run on `http://localhost:5001`

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
```

Create a `.env` or update `src/utils/constants.js` with your backend API URL:
```javascript
export const API_BASE_URL = 'http://your-backend-url:5000/api';
```

Start the Expo development server:
```bash
npm run android      # For Android emulator
npm run ios          # For iOS simulator
npm start            # For Expo Go (scan QR code)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Surf Spots
- `GET /api/surf-spots` - Get all surf spots with risk scores
- `GET /api/surf-spots/:id` - Get specific surf spot details
- `PUT /api/surf-spots/:id/risk-score` - Update risk score

### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Report an incident

### Hazard Reports
- `GET /api/hazard-reports` - Get all hazard reports
- `POST /api/hazard-reports` - Submit a hazard report

## Running the Full Stack

1. **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - ML Model**:
   ```bash
   cd ml-model
   # Activate venv first
   python -m waitress --port=5001 app:app
   ```

3. **Terminal 3 - Mobile App**:
   ```bash
   cd mobile-app
   npm run android
   # or npm start for Expo Go
   ```

## Database Setup

The application uses MongoDB. You can either:

1. **Local MongoDB**:
   ```bash
   # Install MongoDB and run locally
   mongod
   ```

2. **MongoDB Atlas** (Cloud):
   - Create an account at https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string
   - Add the connection string to `.env` as `MONGODB_URI`

## Features

### Mobile App
- User authentication (register/login)
- Browse surf spots with risk levels (Low/Medium/High)
- View real-time risk scores and indicators
- Report hazards at specific locations
- Upload incident photos
- Map-based visualization of surf spots
- Risk analyzer with ML-powered predictions

### Backend API
- User management with JWT authentication
- Incident tracking and reporting
- Hazard report management
- Risk score calculation and storage
- File upload handling

### ML Model
- Historical incident analysis
- Risk classification (3 levels: Low, Medium, High)
- Risk score regression (0-10 scale)
- Feature engineering from incident data
- Seasonal pattern analysis
- Recent hazard boost adjustment

## Development

### Running Tests
```bash
cd backend
npm test

cd ml-model
python -m pytest
```

### Code Style
- Backend: ESLint configured
- Mobile: Prettier + ESLint
- ML: Black formatter (if configured)

## Deployment

### Backend (Heroku/Railway/AWS)
1. Push to GitHub
2. Connect repository to deployment service
3. Set environment variables (`MONGODB_URI`, `JWT_SECRET`)
4. Deploy

### Mobile App (Expo EAS)
```bash
cd mobile-app
npm install -g eas-cli
eas build --platform android
eas submit --platform android
```

### ML Model (AWS Lambda/Heroku)
Similar to backend deployment with Python runtime

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Metro Bundler Cache Issues
```bash
cd mobile-app
npm run android -- --clear
```

### MongoDB Connection Error
- Ensure MongoDB is running locally or check Atlas connection string
- Verify `MONGODB_URI` in `.env`

### Python Virtual Environment Issues
```bash
# Deactivate and reactivate
deactivate
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

## Contributing

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit changes (`git commit -am 'Add feature'`)
3. Push to branch (`git push origin feature/your-feature`)
4. Open a Pull Request

## License

MIT

## Contact

For questions or issues, please open an issue on GitHub.
