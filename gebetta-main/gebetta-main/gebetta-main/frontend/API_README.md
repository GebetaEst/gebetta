# Ethiopian Recipe Share API

A RESTful API for the Ethiopian Recipe Share platform, built with FastAPI and MongoDB.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token
- `POST /api/v1/auth/password-recovery/{email}` - Request password recovery

### Users
- `GET /api/v1/users/` - List all users
- `GET /api/v1/users/{user_id}` - Get a specific user
- `POST /api/v1/users/` - Create a new user
- `PUT /api/v1/users/{user_id}` - Update a user
- `DELETE /api/v1/users/{user_id}` - Delete a user

### Recipes
- `GET /api/v1/recipes/` - List all recipes
- `GET /api/v1/recipes/{recipe_id}` - Get a specific recipe
- `GET /api/v1/recipes/user/{user_id}` - Get recipes by user
- `GET /api/v1/recipes/cuisine/{cuisine}` - Get recipes by cuisine
- `POST /api/v1/recipes/` - Create a new recipe
- `PUT /api/v1/recipes/{recipe_id}` - Update a recipe
- `DELETE /api/v1/recipes/{recipe_id}` - Delete a recipe

### Restaurants
- `GET /api/v1/restaurants/` - List all restaurants
- `GET /api/v1/restaurants/{restaurant_id}` - Get a specific restaurant
- `POST /api/v1/restaurants/` - Create a new restaurant
- `PUT /api/v1/restaurants/{restaurant_id}` - Update a restaurant
- `DELETE /api/v1/restaurants/{restaurant_id}` - Delete a restaurant

### Orders
- `GET /api/v1/orders/` - List all orders
- `GET /api/v1/orders/{order_id}` - Get a specific order
- `GET /api/v1/orders/user/{user_id}` - Get orders by user
- `GET /api/v1/orders/restaurant/{restaurant_id}` - Get orders by restaurant
- `POST /api/v1/orders/` - Create a new order
- `PUT /api/v1/orders/{order_id}` - Update an order
- `DELETE /api/v1/orders/{order_id}` - Cancel an order

## Authentication

Most endpoints require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer your_jwt_token_here
```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Backend Configuration
PROJECT_NAME=Ethiopian Recipe Share API
ENVIRONMENT=development
DEBUG=True

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ethiopian_recipe_share

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:19006"]

# Email (optional)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
EMAILS_FROM_EMAIL=noreply@example.com
EMAILS_FROM_NAME="Ethiopian Recipe Share"

# File Uploads
MAX_UPLOAD_SIZE=10485760  # 10MB

# Rate Limiting
RATE_LIMIT=100/minute
```

## Setup Instructions

1. Clone the repository
2. Install Python 3.7+ and MongoDB
3. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
5. Set up environment variables (see above)
6. Run database migrations (if any)

## Running the Application

1. Start the MongoDB service
2. Run the FastAPI server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
3. Access the API documentation at:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Testing

Run tests with pytest:
```bash
pytest
```

## License

MIT
