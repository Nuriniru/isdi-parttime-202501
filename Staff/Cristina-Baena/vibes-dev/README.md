# VIBES APP

## Description

Vibes App is a social media application that allows users to share posts, interact through comments and likes, and discover content through hashtags. Users can create personalized profiles with custom avatars, share their thoughts and experiences, and connect with others in a social community.

## Functional Description

### Core features
- User authentication
- Post creation and management
- Image integration with Pexels API
- Comment system
- Like/Unlike functionality
- Hashtag system
- User profiles with custom avatars
- Responsive design
- Real-time interactions

### Use cases
- Social networking
- Content sharing
- Community building
- Personal expression
- Photo sharing

## UX/UI Design

[My Figma](https://www.figma.com/design/vKSANSK3axIguPx2mfZwc7/Vibes?node-id=0-1&t=dsiirZPx4V57lDbF-1)
### Design Principles
- **Minimalist glassmorphism** - Clean and minimalistic design using glassmorphism with transparency, blur effects, and subtle borders.


## Technical Description

### Technologies and libraries

#### Frontend Stack
- **React 18**
- **Vite**
- **Tailwind CSS**
- **React Router 6**
- **Heroicons**
- **Axios**

#### Backend Stack
- **Node.js**
- **Express 5**
- **MongoDB**
- **Mongoose**

#### Security & Authentication
- **bcryptjs**
- **JWT (jsonwebtoken)**
- **Input Validation**
- **DOMPurify**

#### Testing & Quality
- **Mocha & Chai**
- **C8 Coverage**
- **Custom CURL Scripts**

#### External APIs
- **Pexels API**

## Data Models

### Routes

#### Authentication endpoints
- POST   /api/users/register     - User registration
- POST   /api/users/login        - User authentication
- POST   /api/users/logout       - Secure logout
- GET    /api/users/profile/:id  - Get user profile data
- GET    /api/users/current      - Get current user data

#### Post management
- GET    /api/posts              - Get all posts with pagination
- GET    /api/posts/:id          - Get specific post
- POST   /api/posts              - Create new post
- PUT    /api/posts/:id          - Update post
- DELETE /api/posts/:id          - Delete post
- GET    /api/posts/user/:userId - Get user's posts

#### Interaction endpoints
- POST   /api/posts/:id/like     - Like/unlike post
- POST   /api/posts/:id/comment  - Add comment to post
- DELETE /api/posts/:postId/comment/:commentId - Delete comment
- GET    /api/posts/user/:userId/commented - Get user's commented posts

#### User updates
- PUT    /api/users/profile      - Update user profile
- PUT    /api/users/avatar       - Update user avatar

#### Hashtag system
- GET    /api/hashtags            - Get trending hashtags
- GET    /api/hashtags/:tag/posts - Get posts by hashtag

#### Image services
- GET    /api/images/search      - Search images via Pexels API

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (required, unique, trim),
  email: String (required, unique, lowercase, validated),
  password: String (required, min 6 chars, hashed),
  profilePicture: String (default: 'default.jpg'),
  avatar: {
    url: String,
    thumbnail: String,
    source: Enum ['pexels', 'upload', 'default'],
    photographer: String,
    photographer_url: String,
    alt: String,
    originalName: String,
    mimeType: String,
    size: Number,
    pexelsId: String,
    data: String
  },
  bio: String (max 200 chars),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```
### Post Schema
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  content: String (required, max 2000 chars),
  hashtags: [String] (lowercase, alphanumeric + underscore),
  image: {
    url: String,
    thumbnail: String,
    alt: String,
    photographer: String,
    photographer_url: String,
    source: Enum ['pexels', 'upload'],
    pexels_id: String
  },
  author: ObjectId (ref: 'User', required),
  likes: [ObjectId] (ref: 'User'),
  comments: [{
    user: ObjectId (ref: 'User', required),
    content: String (required, max 500 chars),
    createdAt: Date (default: Date.now)
  }],
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```
### Hastag Schema
```javascript
{
  {
  _id: ObjectId,
  name: String (required, unique, lowercase),
  posts: [ObjectId] (ref: 'Post'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
}
```
### Test Coverage

(![Coverage])