# Flask API Backend

This is the API backend for the Solid-Flask web application template - a robust Flask REST API with authentication, database integration, and security features.

## Features

- 🔐 Comprehensive authentication system (login, register, 2FA, email verification)
- 📧 Password reset flow with email notifications
- 🛡️ Two-factor authentication (TOTP)
- 👤 User management with role-based access
- 🗃️ SQLAlchemy ORM with migration support
- 🔒 Secure password handling and data encryption
- 🧪 Testing infrastructure with pytest
- 🐳 Docker containerization support

## Installation

### Local Development

```bash
# Install dependencies
make deps

# Set up database
make database
make db_upgrade
make fixtures

# Run development server
make server
```

### Using Docker

```bash
# Build and run with docker-compose
docker-compose -f docker-compose.dev.yml up -d
```

## Project Structure

```
api/
├── app/                  # Application package
│   ├── __init__.py       # Package initialization
│   ├── app.py            # Application factory
│   ├── config.py         # Configuration settings
│   ├── errors.py         # Error handling
│   ├── extensions.py     # Flask extensions
│   ├── fernet.py         # Encryption utilities
│   ├── mail_utils.py     # Email sending functions
│   ├── db/               # Database models
│   │   ├── __init__.py
│   │   └── user.py       # User model
│   └── resources/        # API endpoints
│       ├── __init__.py
│       ├── authentication.py
│       ├── decorators.py
│       ├── two_factor.py
│       ├── user.py
│       └── utils.py
├── migrations/           # Database migrations
├── scripts/              # Utility scripts
│   ├── add_fixtures.py
│   └── empty_database.py
├── tests/                # Test suite
├── server.py             # Application entry point
└── Dockerfile            # Docker configuration
```

## API Endpoints

### Authentication

```
POST /api/register
    Register a new user
    Body: { "email": "user@example.com", "password": "password123" }

POST /api/login
    Login a user
    Body: { "email": "user@example.com", "password": "password123" }

POST /api/login_2fa
    Complete two-factor authentication
    Body: { "token": "123456" }

POST /api/logout
    Logout current user

GET /api/whoami
    Get current user information

POST /api/change_password
    Change user password
    Body: { "old_password": "old123", "new_password": "new123" }

POST /api/forgot_password
    Request password reset
    Body: { "email": "user@example.com" }

POST /api/reset_password
    Reset password with token
    Body: { "token": "reset_token", "password": "new_password" }

GET /api/verify_email/<token>
    Verify email with token

POST /api/resend_email_verification
    Resend verification email
```

### User Management

```
GET /api/users
    List all users (admin only)

POST /api/users
    Create new user (admin only)
    Body: { "email": "user@example.com", "password": "password123", "is_admin": false }

DELETE /api/user/<id>
    Delete user by ID (admin only)

POST /api/delete_account
    Delete current user account
    Body: { "password": "password123" }
```

### Two-Factor Authentication

```
GET /api/generate_2fa_secret
    Generate new 2FA secret and QR code

POST /api/enable_2fa
    Enable 2FA for current user
    Body: { "token": "123456" }

POST /api/disable_2fa
    Disable 2FA for current user
    Body: { "password": "password123" }
```

## Configuration

The API can be configured using environment variables:

### Database Settings
- `DB_NAME`: Database name (default: "solid_flask_web_app_template")
- `DB_USER`: Database user (default: "postgres")
- `DB_PASSWORD`: Database password (default: "postgres")
- `DB_HOST`: Database host (default: "localhost")
- `DB_PORT`: Database port (default: 5432)

### Mail Settings
- `MAIL_SERVER`: SMTP server (default: "localhost")
- `MAIL_PORT`: SMTP port (default: 25)
- `MAIL_USERNAME`: SMTP username
- `MAIL_PASSWORD`: SMTP password
- `MAIL_USE_TLS`: Use TLS (default: False)
- `MAIL_USE_SSL`: Use SSL (default: False)
- `MAIL_DEFAULT_SENDER`: Default email sender

### Security Settings
- `SECRET_KEY`: Flask secret key
- `FERNET_KEY`: Key for encrypting sensitive data
- `FRONTEND_URL`: URL for the frontend application
- `PASSWORD_RESET_EXPIRATION`: Password reset token expiration in seconds (default: 3600)

## Database Management

```bash
# Create tables
make database

# Run migrations
make db_upgrade

# Add test fixtures
make fixtures

# Empty database
make empty_db
```

## Testing

```bash
# Run tests
make test

# Run tests with coverage
make test_cov
```

## Development Workflow

1. Install dependencies with `make deps`
2. Set up your database with `make database` and `make db_upgrade`
3. Add test data with `make fixtures`
4. Run the development server with `make server`
5. Make changes to the code
6. Run tests with `make test` to ensure everything works

## Deployment

The API includes Docker support for easy deployment:

```bash
# Build Docker image
make docker_latest

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## Extending the API

### Adding a New Model

1. Create a new file in `app/db/` for your model
2. Define your SQLAlchemy model class
3. Import and register the model in `app/db/__init__.py`
4. Create a migration with `flask db migrate -m "Add new model"`
5. Apply the migration with `flask db upgrade`

### Adding a New Endpoint

1. Create or modify a file in `app/resources/`
2. Define your Flask route function
3. Register the blueprint in `app/__init__.py` if needed

Example resource:
```python
from flask import Blueprint, jsonify, request
from flask_login import login_required

example_bp = Blueprint('example', __name__)

@example_bp.route('/api/example', methods=['GET'])
@login_required
def get_example():
    return jsonify({"message": "Example endpoint"})
```