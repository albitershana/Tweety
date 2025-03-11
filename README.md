**Tweety - Full-Stack Social Media App**
Built with React, Django, PostgreSQL, and JWT Authentication

**About the Project**
Tweety is a full-stack social media application that allows users to:
Sign up, log in, and manage profiles (bio, avatar, friend requests).
Create, edit, delete, like, and comment on posts.
Send private messages (DMs) to other users.
React to posts with multiple reactions (❤️ 😂 😮 😢 😡).
Use hashtags (#tags) and mentions (@username) to organize content.
View trending posts based on engagement in the last 24 hours.
Receive real-time notifications for likes, comments, and messages.
**Tech Stack**
Frontend (React)
React.js, Axios, Bootstrap, React Router
Backend (Django REST Framework)
Django REST Framework, JWT Authentication, PostgreSQL, Django Signals
Cloud & DevOps
AWS (EC2, S3), Docker, GitHub
**Project Structure**
tweety/
│── backend/               # Django backend
│   ├── api/               # API logic (views, serializers, models)
│   ├── settings.py        # Django settings
│   ├── urls.py            # API endpoints
│   ├── manage.py          # Django management commands
│   ├── requirements.txt   # Python dependencies
│
│── frontend/              # React frontend
│   ├── src/               # React components
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│
└── README.md              # Project documentation
🚀 Setup & Installation
**1.Clone the Repository**
git clone https://github.com/albitershana/tweety.git
cd tweety
Backend Setup (Django)
**Create a Virtual Environment**
cd backend
python -m venv venv
source venv/bin/activate  # (For macOS/Linux)
venv\Scripts\activate     # (For Windows)
**Install Dependencies**
pip install -r requirements.txt
**Configure the Database**
Ensure PostgreSQL is installed, then create a database:
psql -U postgres
CREATE DATABASE tweety_db;
Edit backend/settings.py to configure your database:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'tweety_db',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
**Apply Migrations & Create Superuser**
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Follow prompts to create admin user
**Run the Backend Server**
python manage.py runserver
API is now running at: http://127.0.0.1:8000/api/

**3. Frontend Setup (React)**
cd ../frontend
npm install  # Install dependencies
npm start    # Start React development server
Frontend is now running at: http://localhost:3000/

**Authentication & User Management**
Register at http://localhost:3000/register
Log in using credentials (JWT Authentication is used)
View or edit your profile at http://localhost:3000/profile/{username}
**Features**
User Authentication:
Register, login, and logout using JWT authentication.
Update profile (bio, avatar, password).
Posts & Interactions:
Create, edit, and delete posts with images.
Like/unlike posts and add comments.
React to posts with multiple emotions.
Messaging & Notifications:
Send direct messages (DMs) to friends.
Receive real-time notifications for likes, comments, and friend requests.
Social Features:
Send & accept friend requests.
View trending posts and filter content using hashtags (#tags).
Mention users in posts/comments (@username).
API Endpoints:
Authentication
Method	Endpoint	Description
POST	/api/register/	Register new user
POST	/api/token/	Get JWT token
POST	/api/token/refresh/	Refresh JWT token
Posts
Method	Endpoint	Description
GET	/api/posts/	Get all posts
POST	/api/posts/create/	Create a new post
PATCH	/api/posts/{id}/edit/	Edit a post
DELETE	/api/posts/{id}/delete/	Delete a post
POST	/api/posts/{id}/like/	Like a post
POST	/api/posts/{id}/react/	React to a post 
Messaging
POST	/api/messages/send/	Send a private message
GET	/api/messages/{user_id}/	Get chat messages with user
Profiles
GET	/api/profiles/	Get all user profiles
GET	/api/profiles/{username}/	Get specific user profile
PATCH	/api/profiles/update/	Update profile (bio, avatar)

Some profiles show "Error Fetching"	Run -> python manage.py shell // and create missing profiles
Database migration issues	Run python -> manage.py makemigrations && python manage.py migrate
Git push rejected	Run git branch -> -M main && git push -u origin main

Developed by Albi Tershana
GitHub: @albitershana
Email: albitershana3@gmail.com
