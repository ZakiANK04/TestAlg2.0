# AgroVisor - AI-Powered Agricultural Advisory System

AgroVisor is an intelligent agricultural advisory platform that helps farmers make data-driven decisions about crop selection, pricing, yield prediction, and risk assessment. The system uses machine learning models to provide personalized recommendations based on farm location, soil type, weather conditions, and market data.

## 🌟 Features

### Core Functionality
- **Smart Crop Recommendations**: AI-powered crop recommendations based on farm conditions, soil type, and market analysis
- **Price Prediction**: ML model predicts crop prices to help farmers make informed decisions
- **Yield Forecasting**: Predicts expected yield per hectare for different crops
- **Oversupply Risk Assessment**: Analyzes market conditions to identify oversupply risks
- **Multi-Language Support**: Full support for English, French, and Arabic with RTL support
- **Interactive Dashboard**: Comprehensive dashboard with charts, analytics, and detailed analysis
- **Farm Management**: Create and manage multiple farms with detailed information
- **Data Export**: Save model predictions to CSV for future training and analysis

### Technical Features
- **XGBoost ML Models**: Trained models for risk classification, price regression, and yield prediction
- **Real-time Recommendations**: Dynamic recommendations based on current farm and market data
- **Responsive Design**: Mobile-first design that works on all devices
- **Secure Authentication**: JWT-based authentication system
- **Data Visualization**: Interactive pie charts and bar charts using Recharts
- **Duplicate Prevention**: Prevents saving duplicate model results

## 🏗️ Architecture

### Backend (Django REST Framework)
- **Framework**: Django 5.2.8 with Django REST Framework
- **Authentication**: Simple JWT (JSON Web Tokens)
- **Database**: SQLite3 (can be configured for PostgreSQL/MySQL)
- **ML Models**: XGBoost (XGBClassifier, XGBRegressor)
- **API**: RESTful API with CORS support
- **Additional**: OpenAI API integration for AI advice generation

### Frontend (React + Vite)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ZakiANK04/TestAlg2.0.git
cd TestAlg2.0
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
# Note: You may need to install Django and other packages manually
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers xgboost pandas scikit-learn joblib numpy openai requests

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load initial data from CSV files
python manage.py update_from_csv

# Train the ML model (if not already trained)
python train_model.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Backend Settings

The backend configuration is in `backend/core/settings.py`. Key settings:

- **Database**: Configured for SQLite by default
- **CORS**: Allowed origins can be configured in `CORS_ALLOWED_ORIGINS`
- **JWT**: Token expiration settings in `SIMPLE_JWT`
- **ML Model Path**: `models/agri_advisor_v5.pkl`

### Environment Variables (Optional)

Create a `.env` file in the backend directory for sensitive settings:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
OPENAI_API_KEY=your-openai-api-key
```

## 📊 Data Files

### Training Data
- `backend/data/agri_dataset.csv`: Main agricultural dataset with historical data
- `backend/data/region_soil_mapping.csv`: Mapping of Algerian regions to soil types

### Model Output
- `data/model_results.csv`: Saved model predictions from farmers' accepted recommendations

## 🎯 Usage

### Starting the Application

1. **Start Backend Server**:
```bash
cd backend
python manage.py runserver
```
Backend runs on `http://127.0.0.1:8000`

2. **Start Frontend Server**:
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### User Workflow

1. **Registration/Login**: Create an account or sign in
2. **Create Farm**: Add farm details (name, location, size, soil type)
3. **View Recommendations**: Get AI-powered crop recommendations
4. **Analyze Data**: View charts, detailed analysis, and predictions
5. **Save Results**: Save accepted recommendations to CSV for future training

## 📁 Project Structure

```
Hachkathon/
├── backend/
│   ├── api/
│   │   ├── models.py              # Django models
│   │   ├── views.py               # API views
│   │   ├── serializers.py         # DRF serializers
│   │   ├── urls.py                # URL routing
│   │   └── services/
│   │       ├── model_predictor.py    # ML model loading & prediction
│   │       ├── recommendation.py     # Recommendation engine
│   │       └── ai_advice_generator.py # OpenAI integration
│   ├── core/
│   │   ├── settings.py            # Django settings
│   │   └── urls.py                # Main URL config
│   ├── data/
│   │   ├── agri_dataset.csv       # Training data
│   │   └── region_soil_mapping.csv # Region mappings
│   ├── models/
│   │   └── agri_advisor_v5.pkl    # Trained ML model
│   ├── train_model.py             # Model training script
│   ├── manage.py                  # Django management
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Landing page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Registration page
│   │   │   └── Dashboard.jsx       # Main dashboard
│   │   ├── components/
│   │   │   └── FarmForm.jsx       # Farm creation form
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx    # Authentication context
│   │   │   └── LanguageContext.jsx # i18n context
│   │   └── App.jsx                 # Main app component
│   ├── public/
│   │   └── logo.png                # Application logo
│   └── package.json                # Node dependencies
└── README.md                       # This file
```

## 🤖 Machine Learning Model

### Model Architecture

The system uses XGBoost models trained on historical agricultural data:

1. **Risk Classifier** (XGBClassifier): Predicts oversupply risk
2. **Price Regressor** (XGBRegressor): Predicts crop prices (DA/ton)
3. **Yield Regressor** (XGBRegressor): Predicts yield per hectare (tons/ha)

### Training the Model

```bash
cd backend
python train_model.py
```

The model is saved to `backend/models/agri_advisor_v5.pkl`

### Model Features

- Region, soil type, crop type
- Farm size, temperature, rainfall
- Month and year for seasonal predictions
- Historical market data patterns

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile

### Farms
- `GET /api/farms/` - List user's farms
- `POST /api/farms/` - Create new farm
- `GET /api/farms/{id}/` - Get farm details
- `PUT /api/farms/{id}/` - Update farm

### Recommendations
- `GET /api/recommendations/{farm_id}/` - Get crop recommendations

### Data
- `GET /api/regions/` - List all regions
- `GET /api/crops/` - List all crops
- `POST /api/save-model-result/{farm_id}/` - Save model prediction results

## 🎨 UI Features

### Dashboard Components
- **Top Recommendation Card**: Shows best recommended crop with key metrics
- **Price Predictor**: Expected price per kg
- **Yield Forecast**: Expected yield in tons/ha
- **Expected Revenue**: Calculated revenue in K DA
- **Crop Analysis**: Detailed analysis of intended crop
- **Charts & Analytics**: 
  - Pie chart showing top 3 crops by score + rest
  - Bar chart showing price comparison
- **Detailed Analysis Table**: Complete breakdown of all recommendations

### Language Support
- **English**: Full translation
- **French**: Complete French translation
- **Arabic**: Full Arabic translation with RTL support

## 🔒 Security Features

- JWT token-based authentication
- Password hashing (Django's default)
- CORS protection
- Input validation and sanitization
- Protected API endpoints

## 📝 Database Management

### Update from CSV

To update regions and crops from CSV files:

```bash
python manage.py update_from_csv
```

This command:
- Clears existing regions and repopulates from `region_soil_mapping.csv`
- Updates crops from `agri_dataset.csv`

### Database Models

- **User**: Django's built-in user model
- **Region**: Algerian regions (Wilayas) with soil types
- **Farm**: User farms with location and soil data
- **Crop**: Crop information with ideal conditions
- **SoilData**: Soil test results
- **WeatherData**: Weather information
- **MarketData**: Market prices and trends

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

1. **Model not found**: Run `python train_model.py` to generate the model
2. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in settings.py
3. **Database errors**: Run `python manage.py migrate`
4. **Port already in use**: Change ports in `manage.py runserver` and `vite.config.js`

## 📈 Future Enhancements

- [ ] Historical data tracking
- [ ] Weather API integration
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF
- [ ] Notification system
- [ ] Multi-farm comparison
- [ ] Seasonal planning tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




**AgroVisor** - Empowering farmers with AI-driven agricultural insights 🌱

