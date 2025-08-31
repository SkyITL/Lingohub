# LingoHub Architecture Documentation

## System Overview

LingoHub is a linguistics olympiad problem bank platform inspired by Luogu's competitive programming model and easy-paper's accessibility. The system prioritizes speed, accessibility, and community-driven learning.

### Core Requirements
- Sub-1 second page loads
- Perfect rendering of IPA and linguistic symbols
- Advanced filtering and search capabilities
- Community solution sharing and peer review
- Competition and rating system adapted for linguistics

## Technology Stack

### Frontend
- **Next.js 14** with App Router - SSR for SEO and fast initial loads
- **TypeScript** - Type safety for complex data structures
- **Tailwind CSS** - Utility-first styling with custom linguistic symbol support
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management and caching

### Backend
- **Node.js** with Express.js - RESTful API server
- **TypeScript** - Shared types between frontend and backend
- **PostgreSQL** - Relational database with full-text search
- **Redis** - Caching and session management
- **JWT** - Stateless authentication

### Infrastructure
- **Vercel** - Frontend deployment with edge functions
- **Railway/PlanetScale** - Database hosting
- **Cloudinary** - Image and PDF storage
- **GitHub Actions** - CI/CD pipeline

## Database Schema

### Core Tables

```sql
-- Users table
users (
  id: uuid PRIMARY KEY,
  username: varchar(50) UNIQUE,
  email: varchar(255) UNIQUE,
  password_hash: text,
  rating: integer DEFAULT 1200,
  created_at: timestamp,
  updated_at: timestamp
)

-- Problems table
problems (
  id: uuid PRIMARY KEY,
  number: varchar(20) UNIQUE, -- LH-001 format
  title: varchar(255),
  source: varchar(100), -- IOL, APLO, NACLO, etc.
  year: integer,
  difficulty: integer, -- 1-5 stars
  rating: integer, -- 1000-2400 complexity rating
  content: text, -- Problem statement in markdown
  official_solution: text,
  created_at: timestamp,
  updated_at: timestamp
)

-- Problem tags for linguistic categories
problem_tags (
  problem_id: uuid REFERENCES problems(id),
  tag_id: uuid REFERENCES tags(id),
  PRIMARY KEY (problem_id, tag_id)
)

tags (
  id: uuid PRIMARY KEY,
  name: varchar(100) UNIQUE, -- phonology, morphology, etc.
  category: varchar(50) -- subfield, difficulty, etc.
)

-- User solutions
solutions (
  id: uuid PRIMARY KEY,
  problem_id: uuid REFERENCES problems(id),
  user_id: uuid REFERENCES users(id),
  content: text,
  vote_score: integer DEFAULT 0,
  status: varchar(20), -- draft, submitted, approved
  created_at: timestamp,
  updated_at: timestamp
)

-- Discussion threads
discussions (
  id: uuid PRIMARY KEY,
  problem_id: uuid REFERENCES problems(id),
  user_id: uuid REFERENCES users(id),
  title: varchar(255),
  content: text,
  reply_count: integer DEFAULT 0,
  created_at: timestamp,
  updated_at: timestamp
)

-- User progress tracking
user_progress (
  user_id: uuid REFERENCES users(id),
  problem_id: uuid REFERENCES problems(id),
  status: varchar(20), -- unsolved, solved, bookmarked
  last_attempt: timestamp,
  PRIMARY KEY (user_id, problem_id)
)
```

### Indexing Strategy

```sql
-- Fast problem filtering
CREATE INDEX idx_problems_source_year ON problems(source, year);
CREATE INDEX idx_problems_difficulty_rating ON problems(difficulty, rating);
CREATE INDEX idx_problem_tags_tag_id ON problem_tags(tag_id);

-- User activity
CREATE INDEX idx_solutions_user_problem ON solutions(user_id, problem_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);

-- Full-text search
CREATE INDEX idx_problems_search ON problems USING gin(to_tsvector('english', title || ' ' || content));
```

## API Design

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
DELETE /api/auth/logout
```

### Problem Endpoints
```
GET /api/problems              # List problems with filtering
GET /api/problems/:id          # Get specific problem
GET /api/problems/:id/solutions # Get user solutions
POST /api/problems/:id/solutions # Submit solution
GET /api/problems/:id/discussions # Get discussions
POST /api/problems/:id/discussions # Create discussion
```

### User Endpoints
```
GET /api/users/:id/profile     # User profile and stats
GET /api/users/:id/progress    # Progress tracking
PATCH /api/users/:id/progress  # Update problem status
```

### Search & Filter
```
GET /api/search?q=query&source=IOL&year=2020&tags=morphology
GET /api/tags                  # Available filter tags
```

## Frontend Architecture

### Component Hierarchy
```
App/
├── Layout/
│   ├── Header (Navigation, Search, User Menu)
│   ├── Sidebar (Filters, Quick Links)
│   └── Footer
├── Pages/
│   ├── HomePage (Search, Featured Problems, Stats)
│   ├── ProblemListPage (Table, Filters, Pagination)
│   ├── ProblemDetailPage (Tabs, Content, Actions)
│   ├── ProfilePage (Stats, Progress, Activity)
│   └── AuthPages (Login, Register)
├── Components/
│   ├── ProblemCard
│   ├── SolutionEditor
│   ├── DiscussionThread
│   ├── FilterPanel
│   └── StatisticsChart
└── Utils/
    ├── Typography (IPA rendering)
    ├── PDF Export
    └── Search Logic
```

### State Management
- **Server State**: React Query for API data caching
- **Client State**: React Context for user preferences
- **Form State**: React Hook Form for complex forms
- **URL State**: Next.js router for filters and pagination

## Special Requirements for Linguistics

### Typography and Symbol Rendering
```css
/* IPA Font Stack */
@font-face {
  font-family: 'CharisSIL';
  src: url('/fonts/CharisSIL-Regular.woff2') format('woff2');
  font-display: swap;
}

.linguistic-content {
  font-family: 'CharisSIL', 'Doulos SIL', serif;
  font-feature-settings: 'liga' 1, 'clig' 1;
}

/* Special character tooltips */
.ipa-symbol:hover::after {
  content: attr(data-description);
  position: absolute;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
```

### Complex Table Handling
- Responsive tables with horizontal scrolling
- Sortable columns for language data
- Export to CSV/PDF functionality
- Mobile-friendly collapsed views

### PDF Generation
- Puppeteer for server-side PDF rendering
- Custom CSS for print media
- Preserve linguistic symbols in PDF output

## Competition System Design

### Rating Algorithm
```javascript
// Adapted ELO system for linguistics problems
function calculateNewRating(userRating, problemRating, solved, attempts) {
  const K = 32; // Rating volatility
  const expected = 1 / (1 + Math.pow(10, (problemRating - userRating) / 400));
  const actual = solved ? 1 : 0;
  
  // Penalty for multiple attempts
  const attemptPenalty = Math.max(0, (attempts - 1) * 0.1);
  
  return userRating + K * (actual - expected - attemptPenalty);
}
```

### Solution Review System
- Peer voting on solution quality (1-5 stars)
- Automated plagiarism detection
- Moderator review queue for controversial solutions
- Community badges for high-quality contributors

### Contest Implementation
```javascript
// Contest schema
contests (
  id: uuid PRIMARY KEY,
  title: varchar(255),
  start_time: timestamp,
  end_time: timestamp,
  problems: uuid[], -- Array of problem IDs
  participants: integer DEFAULT 0,
  status: varchar(20) -- upcoming, active, finished
)

// Real-time leaderboard updates
contest_submissions (
  contest_id: uuid REFERENCES contests(id),
  user_id: uuid REFERENCES users(id),
  problem_id: uuid REFERENCES problems(id),
  submission_time: timestamp,
  score: integer,
  PRIMARY KEY (contest_id, user_id, problem_id)
)
```

## Performance Optimization

### Caching Strategy
```javascript
// Redis caching layers
const CACHE_KEYS = {
  PROBLEM_LIST: 'problems:list:{filters_hash}',
  PROBLEM_DETAIL: 'problem:{id}',
  USER_PROGRESS: 'user:{id}:progress',
  LEADERBOARD: 'leaderboard:global',
  HOT_DISCUSSIONS: 'discussions:hot'
};

// Cache TTL (Time To Live)
const CACHE_TTL = {
  PROBLEM_LIST: 300,    // 5 minutes
  PROBLEM_DETAIL: 3600, // 1 hour
  USER_PROGRESS: 60,    // 1 minute
  LEADERBOARD: 120,     // 2 minutes
};
```

### Database Query Optimization
```sql
-- Materialized view for problem statistics
CREATE MATERIALIZED VIEW problem_stats AS
SELECT 
  p.id,
  p.title,
  p.difficulty,
  COUNT(CASE WHEN up.status = 'solved' THEN 1 END) as solve_count,
  COUNT(up.user_id) as attempt_count,
  AVG(s.vote_score) as avg_solution_rating
FROM problems p
LEFT JOIN user_progress up ON p.id = up.problem_id
LEFT JOIN solutions s ON p.id = s.problem_id
GROUP BY p.id, p.title, p.difficulty;

-- Refresh every hour
CREATE OR REPLACE FUNCTION refresh_problem_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY problem_stats;
END;
$$ LANGUAGE plpgsql;
```

### Frontend Optimization
- **Code Splitting**: Dynamic imports for problem content
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **Prefetching**: Preload next problem in sequence
- **Virtual Scrolling**: For large problem lists (1000+ items)

## Security Considerations

### Authentication & Authorization
```javascript
// JWT token structure
{
  sub: user_id,
  username: string,
  role: 'user' | 'moderator' | 'admin',
  exp: timestamp,
  iat: timestamp
}

// Rate limiting by endpoint
const rateLimits = {
  '/api/auth/login': { points: 5, duration: 900 }, // 5 attempts per 15 min
  '/api/problems': { points: 100, duration: 60 },  // 100 requests per min
  '/api/solutions': { points: 10, duration: 60 }   // 10 submissions per min
};
```

### Content Security
- Input sanitization for all user content
- XSS prevention in solution submissions
- CSRF protection for state-changing operations
- SQL injection prevention with parameterized queries

### Privacy
- GDPR compliance for user data
- Optional anonymized problem-solving statistics
- User consent for data collection and cookies

## Deployment Architecture

### Production Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    image: lingohub-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://backend:4000
  
  backend:
    image: lingohub-backend:latest
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - JWT_SECRET=...
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=lingohub
      - POSTGRES_USER=...
      - POSTGRES_PASSWORD=...
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm ci
          npm run test
          npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring and Analytics

### Performance Metrics
- Page load times (target: <1s)
- API response times (target: <200ms)
- Database query performance
- User engagement metrics

### Error Tracking
- Frontend: Sentry for JavaScript errors
- Backend: Winston logger with error aggregation
- Database: Query performance monitoring

### Business Metrics
- Daily/Monthly Active Users
- Problem completion rates
- Solution quality ratings
- Community engagement (comments, votes)

## Future Enhancements

### Phase 2 Features
- Mobile app (React Native)
- Offline problem solving
- AI-powered problem recommendations
- Advanced analytics dashboard

### Phase 3 Features
- Multi-language support
- Problem creation tools for educators
- Integration with university courses
- Advanced competition formats (team events)

---

This architecture provides a solid foundation for building a fast, accessible, and engaging linguistics olympiad platform that scales with the community's needs.