# PyForecast Backend

Express.js + MongoDB backend server for PyForecast, a full-stack weather application. Features user authentication (JWT), city management, and advanced weather data processing with server-side visualizations.

## Features

- **User Authentication**: JWT-based login/register with bcrypt password hashing
- **Saved Cities**: User-scoped city management (CRUD operations)
- **Weather Data**: OpenWeather API integration (current weather, 5-day forecast, hourly data)
- **Advanced Visualization**: Server-side plotting with Pandas, NumPy, and MetPy for atmospheric analysis
- **Weather Charts**: Hourly temperature and precipitation patterns
- **RESTful API**: Protected routes with middleware authentication

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Data Processing**: Python (Pandas, NumPy, MetPy, Matplotlib)
- **API**: OpenWeather API (One Call, Forecast, Current Weather)

## Project Structure

```
backend/
├── server.js                 # Express app entry point
├── package.json              # Node.js dependencies
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variables template
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema with bcrypt
│   ├── City.js              # Saved city schema
│   └── Weather.js           # Weather cache schema
├── routes/
│   ├── auth.js              # Register, login, profile endpoints
│   ├── cities.js            # City CRUD (user-scoped)
│   └── plots.js             # Server-side plotting route
├── scripts/
│   └── process_weather.py   # Python script for data processing & visualization
└── public/
    └── plots/               # Generated PNG plots (served statically)
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+ (for data processing features)
- MongoDB cluster (Atlas or local)
- OpenWeather API key (get one at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rencitaguig/PyForecast.git
   cd PyForecast/backend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Install Python dependencies** (for server-side plotting):
   ```bash
   python -m pip install -r requirements.txt
   ```
   
   > **Note**: MetPy may require SciPy wheels. On Windows, ensure a C++ compiler is available (e.g., Visual Studio Build Tools) or use a pre-built wheel.

4. **Create `.env` file** from the template:
   ```bash
   cp .env.example .env
   ```

5. **Update `.env` with your credentials**:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=PyForecast
   PORT=5000
   NODE_ENV=development
   OPENWEATHER_API_KEY=your_api_key_here
   JWT_SECRET=your_secret_key_here
   BCRYPT_ROUNDS=10
   ```

### Running the Server

```bash
# Development (watch mode)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`).

## API Endpoints

### Authentication

- **POST** `/api/auth/register` — Register a new user
  ```json
  { "username": "user", "email": "user@example.com", "password": "pass", "passwordConfirm": "pass" }
  ```

- **POST** `/api/auth/login` — Log in and receive JWT token
  ```json
  { "email": "user@example.com", "password": "pass" }
  ```

- **GET** `/api/auth/me` — Get current user profile (requires `Authorization: Bearer <token>`)

### Cities (User-Scoped)

- **GET** `/api/cities` — List all saved cities for logged-in user
- **POST** `/api/cities` — Save a new city
  ```json
  { "name": "London", "country": "GB", "lat": 51.5074, "lon": -0.1278, "timezone": "Europe/London" }
  ```

- **GET** `/api/cities/:id` — Get a specific saved city
- **PUT** `/api/cities/:id` — Update a saved city
- **DELETE** `/api/cities/:id` — Delete a saved city

### Plotting

- **GET** `/api/plots/city?city=London` — Generate and retrieve server-side weather plot (PNG)

### Static Files

- Plots and generated images served at `/public/plots/`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `OPENWEATHER_API_KEY` | OpenWeather API key | `abc123...` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `BCRYPT_ROUNDS` | Password hash rounds | `10` |

## Security Notes

- **Never commit `.env`** — it contains sensitive credentials. Use `.env.example` as a template.
- JWT tokens are short-lived; implement refresh tokens for production.
- Use HTTPS in production and set `NODE_ENV=production`.
- Keep MongoDB credentials secure; use IP whitelisting in MongoDB Atlas.
- Sanitize user input and validate API payloads.

## Data Processing & Visualization

The backend includes a Python script (`backend/scripts/process_weather.py`) that:

1. Fetches hourly weather data from OpenWeather API
2. Computes dewpoint using MetPy
3. Generates a PNG visualization with Matplotlib
4. Saves the plot to `backend/public/plots/`

**Requirements**: `pandas`, `numpy`, `matplotlib`, `metpy`, `requests`

To test manually:
```bash
python backend/scripts/process_weather.py
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process (Windows)
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure MongoDB is running

### MetPy Installation Issues (Windows)
```bash
# Install pre-built wheels
pip install metpy --only-binary :all:
```

## Deployment

### Heroku

1. Add Node buildpack: `heroku buildpacks:add heroku/nodejs`
2. Set environment variables: `heroku config:set KEY=VALUE`
3. Deploy: `git push heroku main`

### Railway / Render / Fly.io

See platform-specific docs; ensure `npm start` works locally first.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open a pull request

## License

MIT License — see LICENSE file for details.

## Contact

For issues or questions, open an issue on GitHub or contact the maintainer.
