# Glo

## Project

**Project Manager:** Ally Kriss  
**Date:** June 26, 2023

## Justification

The _Glo - AI Chat Box_, developed by Mastermind.com, will serve as a valuable tool for our customers and students during their course engagement. This 24/7 feature on our website will provide an assisted AI chat experience.

## Scope Description

_Glo_ is a chat feature integrated into the Mastermind.com website, connecting our customers with ChatGPT. Users can ask pre-framed questions related to recently released content as well as their own organic questions.

## High-Level Requirements

- Users should be able to access _Glo_ by logging in or using their Mastermind.com email via an iFrame.
- _Glo_ should allow users to chat after an initial prompt.
- Conversations and questions should be saved and stored.
- Admin access should be provided for prompt changes.
- The chat interface should follow the mock-up's font, styling, and acceptable border width.

## Project Scope

**In Scope**

- _Glo_ should provide a prompt to ChatGPT that the user cannot see or change.
- Users should have the ability to include their question in the initial prompt.
- Calls to the database should be made for conversation storage.
- Chat history should be recalled when the user returns to the chat window.
- Users should be acknowledged about the collection and use of chat history.

**Out of Scope**

- Separate chat or specific log in/log out functionality.
- Database creation.
- Page creation on Mastermind.com/implementation.
- Prompt creation.
- Legal copy for acknowledgment.

===

**Startup**

- Install NodeJS LTS from [NodeJs Official Page](https://nodejs.org/en/) (NOTE: Product only works with LTS version)

Run in the terminal this command:

```bash
npm install
```

Then run this command to start your local server

```bash
npm run dev
```

### Your API Key is not working?

- Make sure you have an [OpenAI account](https://platform.openai.com/account) and a valid API key to use ChatGPT. We don't sell API keys.
- Make sure you have your billing info added in [OpenAI Billing page](https://platform.openai.com/account/billing/overview). Without billing info, your API key will not work.
- The app will connect to the OpenAI API server to check if your API Key is working properly.

## Authentication flow

The authentication flow is as follows:

### Authentication flow

The chart is self-explanatory, but to better understand the flow, we can see the following steps:

1. The user sends a request to the `/api/login` endpoint, submitting the E-Mail address and password of the user in the request body. The server then validates the user credentials and, if valid, generates a JWT access token and a JWT refresh token. The access token is used to access the protected resources, while the refresh token is used to obtain a new access token when the current access token expires. The access token is sent in the response body, while the refresh token is sent in the response cookies. After that, the server sends an E-Mail to the user with a token used as OTP (one-time password) for the two-factor authentication.

2. The user cannot access the protected resources until the two-factor authentication is completed.

3. The user sends a GET request to `/api/two-factor` passing the two-factor authentication code sent via E-Mail in the request query with name `token`. The server validates the token and, if valid, the user is authenticated and can access the protected resources using the access token generated in step 1. This is a sample two-factor authentication URL:

4. The user can now access the protected resources using the access token generated in step 1. The access token is stored inside a cookie named "token".

5. When the access token expires, the user can obtain a new access token by sending a POST request to the `/api/refresh` endpoint with a payload containing the refresh token.

```json
{
  "refreshToken": "my-secret-refresh-token"
}
```

The server then validates the refresh token and, if valid, generates a new access token and updates the user's access token cookie value using the Set-Cookie header. This process is done automatically inside the NextJS application by the `useAuth` hook.

### The useAuth hook

The `useAuth` hook is a React hook that can be used to easily manage the user session. It is used to authenticate users, to get the user session information, to refresh the access token, to logout users, and to check if the user is authenticated.

The `useAuth` hook is defined in the `providers/auth/AuthProvider.tsx` file and is used in the `pages/_app.tsx` file to wrap the entire application. This is the list of the features provided by the `useAuth` hook:

- `currentUser`: The current user session information, such as the user ID, E-Mail address, name, surname, and role
- `accessToken`: The JWT access token used to access the protected resources
- `refreshToken`: The JWT refresh token used to obtain a new access token when the current access token expires
- `isAuthenticated`: A boolean value that indicates if the user is authenticated
- `login(username: string, password: string)`: A function that can be used to authenticate users
- `logOut()`: A function that can be used to logout the user
- `refreshSession()`: A function that can be used to refresh the user session

### Route protection

To protect access to the protected resources, two different approaches have been used:

- Middleware (`/middleware.ts`) that checks if the user has set the access token in the cookies and, if not, redirects the user to the login page
- Server-side rendering (SSR) function that checks the user's access token validity and, if not valid, redirects the user to the login page

### JWT tokens

The JWT access token and the JWT refresh token have the following payload:

```json
{
"sub": <user id>,
"email": <user email>,
"name": <user first name>,
"surname": <user last name>,
"role": <user role: ADMIN or USER>,
"iat": <issued at timestamp>,
"exp": <expire at timestamp>,
"iss": "${APP_URL}", // ENVIRONMENT VARIABLE
}
```

The JWT access token expires after 15 minutes, while the JWT refresh token expires after 30 days. Both tokens are signed using different secret keys to increase security.

Both tokens share the same payload structure to permit the server to do extra checks on the token validity. If the user saved in the database is not the same user that is present in the token payload, the token is not valid. This has been done to prevent the user from using a token with old/invalid user information.

### POST DEPLOY ON HEROKU

Run:

The NPM post install hook should take care of this - but if not do

- heroku builds:cache:purge --app glo

THEN IF IT STILL DOESNT WORK

- npx prisma generate
- npx prisma migrate reset
- npx prisma migrate deploy

Sometimes the migrate deploy doesnt work so I have to run it locally changing my db target via .env

    heroku features:enable http-session-affinity -a glo

### THE APP NEEDS SEEDED DATA TO WORK

npx prisma db seed

### Arno's notes

in addition you'll also need to add a default prompt to the database's Prompts table via the seeder above ^
