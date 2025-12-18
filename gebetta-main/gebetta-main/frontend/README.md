# Restaurant Management System

This project is a full-stack restaurant management system with a React Native frontend and a FastAPI Python backend.

## Features

- User authentication (customers, restaurant owners, managers)
- Restaurant management
- Menu management
- Order processing
- Recipe management
- Analytics and reporting
- Customer management

## Tech Stack

### Frontend
- React Native with Expo
- Zustand for state management
- React Navigation for routing
- Axios for API requests

### Backend
- FastAPI (Python)
- JSON file-based data storage (for demo purposes)
- Analytics capabilities

## Getting Started

### Prerequisites
- Node.js
- Python 3.7+
- Expo CLI

### Installation

Installs the necessary dependencies for the frontend and backend.

### Installation

1. Clone the repository
2. Install frontend dependencies:
```
npm install
```

3. Install backend dependencies:
```
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```
cd backend
uvicorn main:app --reload
```

2. Start the frontend:
```
npx expo start
```

## Backend API

The backend provides the following API endpoints:

- `/api/users/register` - Register a new user
- `/api/auth/verify-otp` - Verify OTP for user registration
- `/api/auth/resend-otp` - Resend OTP
- `/api/auth/login` - User login
- `/api/restaurants` - CRUD operations for restaurants
- `/api/restaurants/{restaurant_id}/menu` - CRUD operations for menu items
- `/api/orders` - CRUD operations for orders
- `/api/recipes` - CRUD operations for recipes
- `/api/analytics/restaurant/{restaurant_id}` - Get restaurant analytics

## Data Storage

The system uses JSON files for data storage:

- `data/users.json` - User data
- `data/restaurants.json` - Restaurant data
- `data/recipes.json` - Recipe data
- `data/orders.json` - Order data

In a production environment, this would be replaced with a proper database.

## Analytics

The system includes analytics capabilities for restaurant owners:

- Sales trends
- Popular menu items
- Customer demographics
- Order patterns

This can be extended with more advanced data science concepts like:

- Predictive analytics for demand forecasting
- Menu optimization based on popularity and profitability
- Customer segmentation and personalized marketing
- Inventory management optimization

## License

This project is licensed under the MIT License.
