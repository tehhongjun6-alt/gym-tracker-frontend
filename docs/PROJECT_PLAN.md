# WESET Product Plan

## 1. Product Overview

### Business idea

WESET is a full-stack fitness platform that combines workout tracking, fitness education, nutrition discovery, and social connection in one product.

The product addresses a practical problem: people often use separate apps to record workouts, learn exercises, check food nutrition, and share progress with friends. This makes a fitness routine harder to manage and less motivating. WESET brings those activities into one clear user flow.

### Product purpose

WESET helps users:

- record and review their workouts;
- learn how exercises are performed;
- search food calories and healthy meal ideas;
- share fitness posts and photos;
- build a private training circle through mutual friendships.

### Target users

The primary users are students, young adults, gym beginners, and regular fitness users who want a simple way to track progress and stay motivated with friends.

### Brand identity

- **Business name:** WESET
- **Tagline:** Train. Share. Together.
- **Brand idea:** personal progress becomes easier when people train and grow together.
- **Visual identity:** a dark interface with lime, teal, and purple accents.
- **Logo concept:** two rounded paths join to form a `W`, representing two people connecting through fitness.
- **Tone:** energetic, modern, social, and supportive.

## 2. Product Scope

### MVP goals

1. Deliver a secure full-stack product with authentication and protected user data.
2. Provide complete workout CRUD: create, read, update, and delete.
3. Let users create image posts and view posts that their permissions allow.
4. Support mutual friend requests rather than a one-way follow system.
5. Use external APIs to help users discover exercises, nutrition data, and meals.
6. Handle loading, empty, validation, authentication, and API error states.
7. Deploy the frontend and backend as separate applications.

### Non-goals for the current version

- direct messaging;
- post likes and comments;
- video posts;
- live workout coaching;
- calorie diary or daily calorie targets;
- administrator or trainer roles.

These ideas may be valuable later, but they are outside the capstone scope and would increase development and security complexity.

## 3. Core Features

| Feature | User value | Main data or service |
| --- | --- | --- |
| Authentication | Create an account, sign in, use Google login, and access protected pages | Supabase Auth |
| Workout tracking | Create, view, edit, and delete personal workout records | `workouts` table |
| Social feed | Publish a caption and optional photo and view permitted posts | `posts` table and Supabase Storage |
| Friend system | Find users, send requests, accept requests, and view friends | `users` and `friendships` tables |
| Exercise library | Search exercises and view movement information and available images | API Ninjas and free-exercise-db |
| Food and meals | Search nutrition values and discover meals with ingredients and instructions | USDA FoodData Central and TheMealDB |
| Profile | Review personal posts, workouts, and friends in one place | Data from the WESET API |

## 4. Main User Stories

- As a new user, I can create an account so that my fitness data belongs to me.
- As a returning user, I can sign in with email or Google and continue using the app.
- As a gym user, I can record the date, body part, exercise, sets, reps, and weight of a workout.
- As a gym user, I can correct or remove only my own workout records.
- As a learner, I can search for exercises and view instructions and available movement images.
- As a nutrition-conscious user, I can search food calories and macronutrients.
- As a user looking for meal ideas, I can view ingredients and preparation instructions.
- As a social user, I can share a fitness update with an optional photo.
- As a privacy-conscious user, I can choose a public or friends-only post.
- As a social user, I can send and accept friend requests before another user becomes my friend.
- As a profile owner, I can see my posts, workouts, and friends in one place.

## 5. Information Architecture

```text
Public
|-- /login
`-- /signup

Authenticated application
|-- /feed
|   `-- Create Post modal
|-- /workouts
|   `-- Log/Edit Workout drawer
|-- /exercises
|   `-- Exercise details modal
|-- /food
|   |-- Nutrition search
|   `-- Healthy meal search and meal details
|-- /friends
|   |-- Find Users
|   |-- Friend Requests
|   `-- Your Friends
`-- /profile
    |-- Posts
    |-- Workouts
    `-- Friends
```

## 6. End-to-End User Flow

```text
Open WESET
    |
    v
Login or Signup ----> Google OAuth
    |
    v
Authenticated Feed
    |
    +--> Create a post --> Upload image --> Save post --> Feed updates
    |
    +--> Workouts --> Log/Edit/Delete own workout --> History updates
    |
    +--> Exercises --> Search/filter --> Open movement details
    |
    +--> Food --> Choose Nutrition or Meals --> Search --> Open details
    |
    +--> Friends --> Find user --> Send request --> Other user accepts
    |
    `--> Profile --> Switch between Posts, Workouts, and Friends
```

If authentication is missing, protected routes return the user to the login page. If an external service fails, the page shows an error instead of silently returning empty content.

## 7. Page Wireframes and Page Flows

These wireframes describe structure and behavior, not final pixel-level styling.

### Login page

```text
+-------------------------------------------------------------+
| WESET brand panel             | Login                       |
| Logo                          | Email                       |
| Train. Share. Together.       | Password                    |
|                               | [ Sign In ]                 |
|                               | [ Continue with Google ]    |
|                               | Link to Sign Up             |
+-------------------------------------------------------------+
| Scroll-based product story and final Join WESET call-to-action |
+-------------------------------------------------------------+
```

Flow: enter credentials or choose Google login -> authenticate with Supabase -> save the access token -> open `/feed`. Validation or authentication failures remain visible on the page.

### Signup page

```text
+-------------------------------------------------------------+
| WESET brand panel             | Create Account              |
| Logo and product message      | Username                    |
|                               | Email                       |
|                               | Password                    |
|                               | [ Sign Up ]                 |
|                               | Link to Login               |
+-------------------------------------------------------------+
```

Flow: enter account details -> validate input -> create the Supabase account and WESET user record -> sign in or show email-confirmation guidance.

### Feed page

```text
+----------+---------------------------+
| Sidebar  | WESET                     |
|          | Avatar  Username  Friend  |
| Feed     | [ Post image ]            |
| Workout  | Caption                   |
| Exercise |                           |
| Food     | Next post                 |
| Friends  | ...                       |
| Create   |                           |
| Profile  |                           |
+----------+---------------------------+
```

Flow: load public posts, the user's posts, and friends-only posts from accepted friendships -> display signed image URLs -> allow the user to open Create Post.

### Create Post modal

```text
+--------------------------------------+
| Create Post                       X  |
| Caption                              |
| [ Select image ]                     |
| Visibility: Public / Friends only    |
|                         [ Publish ]  |
+--------------------------------------+
```

Flow: enter content -> optionally upload an image to the private `post-images` bucket -> send the post data to the WESET API -> close the modal and refresh the feed. Upload failures do not create an incomplete post.

### Workouts page

```text
+-------------------------------------------------------------+
| WORKOUTS                                                    |
| Recent Workouts                         [ + Log Workout ]    |
+-------------------------------------------------------------+
| 27 OCT 2026 | Chest, Arm | 2 exercises | expand             |
|   Expanded: exercise, body image, sets, reps, weight        |
+-------------------------------------------------------------+
| 26 OCT 2026 | Leg        | 1 exercise  | expand             |
+-------------------------------------------------------------+
```

Flow: load the signed-in user's workouts -> group them by workout date -> expand a date to view its records -> edit or delete only records owned by the signed-in user.

### Log or Edit Workout drawer

```text
+--------------------------------------+
| Log Workout                       X  |
| Workout date [ calendar ]            |
| Body part [ six selectable cards ]   |
| Exercise                             |
| Sets       Reps       Weight         |
|                         [ Save ]     |
+--------------------------------------+
```

Flow: choose a date and body part -> enter exercise values -> server validates every field -> create or update the workout -> refresh the workout history. Invalid values remain in the drawer with an error message.

### Exercise Library page

```text
+-------------------------------------------------------------+
| EXERCISE LIBRARY                                            |
| Name | Muscle | Type | Difficulty | Search | Clear          |
+-------------------------------------------------------------+
| Exercise card | Exercise card | Exercise card               |
| image or      | image or      | image or                    |
| text layout   | text layout   | text layout                 |
+-------------------------------------------------------------+
```

Flow: show an initial exercise selection -> search by name or filters -> request exercise details and available images -> match records by normalized exercise name -> open the selected card for instructions. Missing images use a text-focused card rather than a broken image area.

### Food page

```text
+-------------------------------------------------------------+
| FOOD & NUTRITION                   [ Nutrition / Meals ]     |
+-------------------------------------------------------------+
| Search field                                      [ Search ] |
| Optional meal categories                                   |
+-------------------------------------------------------------+
| Food or meal card | Food or meal card | Food or meal card   |
+-------------------------------------------------------------+
```

Nutrition flow: search a food -> receive USDA calories and macronutrients -> open a result for details.

Meals flow: choose a category or search text -> receive TheMealDB meals -> open a meal to view its image, ingredients, instructions, and available video link.

### Friends page

```text
+-------------------------------------------------------------+
| FRIENDS — Stronger Together                                |
+-------------------------------------------------------------+
| Find Users       | Friend Requests       | Your Friends     |
+-------------------------------------------------------------+
| Search username                                   [ Search ] |
| Avatar  Username                              [ Add Friend ] |
| Avatar  Username                                 [ Friends ] |
+-------------------------------------------------------------+
```

Flow: search or browse users -> send a pending request -> receiver opens Friend Requests -> receiver accepts -> both users appear in each other's friends list.

### Profile page

```text
+-------------------------------------------------------------+
| Avatar   Username                                           |
|          Email                                              |
|          Posts count | Workouts count | Friends count       |
+-------------------------------------------------------------+
| Posts             | Workouts             | Friends          |
+-------------------------------------------------------------+
| Selected account activity                                  |
+-------------------------------------------------------------+
```

Flow: load the authenticated user's profile summary -> switch tabs without leaving the page -> view the user's posts, workout records, or accepted friends.

## 8. Database Schema

### `users`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | UUID, primary key | Matches the Supabase Auth user ID |
| `username` | Text | Public WESET username |
| `created_at` | Timestamp | Account record creation time |

### `workouts`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | Integer, primary key | Workout record ID |
| `user_id` | UUID, foreign key -> `users.id` | Workout owner |
| `workout_date` | Date | Date selected by the user |
| `body_part` | Text | Chest, shoulder, arm, leg, core, or back |
| `exercise_name` | Text | Exercise performed |
| `sets` | Integer | Number of sets |
| `reps` | Integer | Repetitions per set |
| `weight` | Numeric | Weight used in kilograms |
| `created_at` | Timestamp | Record creation time |

### `posts`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | Integer, primary key | Post ID |
| `author_id` | UUID, foreign key -> `users.id` | Post owner |
| `content` | Text | Post caption |
| `visibility` | Text | `public` or `friends-only` |
| `image_url` | Text, nullable | Optional external image reference |
| `image_path` | Text, nullable | Optional private Storage object path |
| `created_at` | Timestamp | Post creation time |

### `friendships`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | Integer, primary key | Friendship request ID |
| `requester_id` | UUID, foreign key -> `users.id` | User who sends the request |
| `receiver_id` | UUID, foreign key -> `users.id` | User who receives the request |
| `status` | Text | `pending` or `accepted` |
| `created_at` | Timestamp | Request creation time |

### Relationships

```text
users 1 ---- many workouts
users 1 ---- many posts
users many ---- many users through friendships
posts 0..1 ---- 1 image object in Supabase Storage
```

Ownership is enforced in backend queries. For example, workout update and delete operations check both the workout `id` and the authenticated `user_id`.

## 9. Architecture Proposal

### Frontend

- React 19 with Vite
- React Router for public and protected routes
- Custom CSS for the responsive visual system
- GSAP and ScrollTrigger for landing-page motion
- Supabase browser client for authentication and image uploads
- Hosted on Vercel

### Backend

- Node.js and Express
- REST endpoints for authentication support, workouts, posts, users, friendships, exercises, food, and meals
- Server-side validation and consistent HTTP error responses
- Supabase access-token verification before protected operations
- Hosted on Railway

### Database and file storage

- PostgreSQL hosted by Supabase
- Four application tables: `users`, `workouts`, `posts`, and `friendships`
- Supabase Storage bucket `post-images` for uploaded post photos
- Signed image URLs generated by the backend for private stored images

### External integrations

| Service | Use in WESET |
| --- | --- |
| API Ninjas Exercises | Exercise names, types, muscles, difficulty, and instructions |
| free-exercise-db | Available movement images and additional exercise data |
| USDA FoodData Central | Food calorie and macronutrient search |
| TheMealDB | Meal images, categories, ingredients, instructions, and video links |

### Deployment flow

```text
Browser
  |
  v
React frontend on Vercel
  |
  | HTTPS + Bearer access token
  v
Express API on Railway
  |             |
  v             v
Supabase        External APIs
Postgres/Auth/  API Ninjas, free-exercise-db,
Storage         USDA, and TheMealDB
```

## 10. Authentication, Authorization, and Sensitive Data

1. Supabase Auth creates the user session and access token.
2. The frontend sends the access token in the `Authorization: Bearer <token>` header.
3. Express verifies the token before protected routes continue.
4. Database queries use the verified user ID rather than trusting a user ID sent by the browser.
5. Workout updates and deletes include both the record ID and owner ID.
6. The feed checks friendship records in both directions before returning friends-only posts.
7. Private API keys and database credentials remain in Railway environment variables.
8. The frontend contains only browser-safe configuration: the Railway API URL, Supabase project URL, and Supabase publishable key.

## 11. Technical Trade-offs

### Separate React and Express repositories

This matches the course architecture and makes frontend and backend responsibilities clear. The trade-off is that deployment configuration, environment variables, and cross-origin requests must be managed in two services.

### Supabase for database, auth, and storage

Supabase reduces the amount of infrastructure required for a capstone and provides one platform for PostgreSQL, authentication, and file storage. The trade-off is vendor dependency and the need to understand Supabase policies, tokens, and Storage behavior.

### Access token stored in `localStorage`

This is simple to understand and works with the current course-level architecture. The trade-off is that the application must handle expired tokens and protect against cross-site scripting. A future version should restore and refresh the Supabase session and centralize `401` handling.

### Multiple exercise data sources

API Ninjas provides detailed exercise information, while free-exercise-db provides images. Combining them gives a better product but exercise names do not always match exactly. WESET normalizes names and allows a text-only fallback when no image can be matched.

### External food services

USDA offers broad nutrition coverage, while TheMealDB provides visual meal content. The trade-off is that availability, rate limits, and incomplete results are outside WESET's control, so the UI must show useful failure and empty states.

### Current scale

The current architecture is appropriate for a capstone and a small user base. At larger scale, the first improvements would be feed pagination, database indexes, API caching, optimized images, centralized token refresh, and rate limiting.

## 12. Delivery Plan

1. Define the product, users, brand, features, database, wireframes, and architecture.
2. Build and test the Express API and PostgreSQL schema.
3. Build the React pages and connect them to the WESET API.
4. Add authentication, authorization, image storage, and external integrations.
5. Add loading, empty, validation, and failure states.
6. Verify desktop and mobile flows.
7. Deploy the backend to Railway and the frontend to Vercel.
8. Configure the WESET domain and production environment variables.
9. Record a Loom walkthrough explaining the product and architecture end to end.

## 13. Product Acceptance Criteria

- A new user can sign up and a returning user can sign in.
- Google authentication returns the user to the deployed frontend.
- Protected pages cannot be used without authentication.
- A user can create, read, update, and delete only their own workouts.
- A user can publish a text post with an optional image.
- Friends-only posts are visible only to the author and accepted friends.
- A user can send and accept a friend request.
- Exercise, nutrition, and meal searches return usable results or a clear error/empty state.
- The application works on desktop and mobile layouts.
- Refreshing a deployed React route does not return a Vercel 404.
- Backend secrets are not exposed in the frontend repository or browser bundle.

