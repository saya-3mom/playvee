# Local authentication

This configuration is for local HTTP development only, not public deployment.
Open http://localhost:4200 and use the Angular `/api` proxy. Do not mix
`localhost` and IP-address URLs: session and CSRF cookies belong to a host.

## Create the first account

1. In an interactive terminal with Java 17 and Maven available, run from `backend`:

   ```powershell
   .\mvnw.cmd dependency:copy-dependencies '-DincludeScope=runtime' '-DoutputDirectory=target/hash-tool-lib'
   java --class-path "target/hash-tool-lib/*" tools/HashPassword.java
   ```

   If the Maven wrapper cannot locate your Maven installation, use the same
   command with `mvn` instead of `.\mvnw.cmd`.
   Enter a strong unique password twice at the hidden prompts. The tool prints
   only a DelegatingPasswordEncoder hash beginning with `{bcrypt}`.
   Never pass the password as an argument, environment variable, SQL, or file.
   The password is limited to 72 UTF-8 bytes by bcrypt.

2. Add the following to the existing root `.env` (already Git-ignored), replacing
   the placeholder with that complete hash. Single quotes preserve `$` in Compose:

   ```dotenv
   PLAYVEE_BOOTSTRAP_LOGIN_ID=owner
   PLAYVEE_BOOTSTRAP_PASSWORD_HASH='{bcrypt}$2a$10$REPLACE_WITH_GENERATED_HASH'
   ```

   Do not commit `.env`, publish the hash, or print resolved Compose environment
   settings in logs. No actual password belongs in Git, application logs or DB.

3. From the repository root run `docker compose up -d --build`.
   Hibernate adds `app_users`. Only when that table is entirely empty does the
   bootstrap runner create the account; it never overwrites or restores a user.
   Both bootstrap settings may be absent, in which case no account is created.
   Invalid supplied bootstrap values fail startup when the table is empty.

4. Log in at http://localhost:4200/login. After confirming login, remove the two
   bootstrap variables from `.env` and recreate the backend:
   `docker compose up -d --force-recreate backend`.
   The account remains in PostgreSQL; the restart requires a new login.

For a backend started outside Docker, supply the same two bootstrap environment
variables to that process (the root `.env` is not loaded by Spring automatically).

## Behavior

- Sessions expire after 12 hours of inactivity and are not persisted on restart.
- JSESSIONID is HttpOnly, SameSite=Lax, and deliberately not Secure on local HTTP.
- Angular restores state using GET `/api/auth/me`; no credentials or login flag
  are kept in localStorage. All park APIs and photo image URLs require login.
- GET `/api/auth/csrf` issues the XSRF-TOKEN cookie. Angular sends it as
  X-XSRF-TOKEN on relative mutating requests. Login/logout are CSRF-protected;
  tokens are refreshed after them. Do not disable CSRF to test these endpoints.
- POST `/api/auth/login` accepts form-urlencoded `loginId` and `password`:
  success 200, invalid credentials 401. GET `/api/auth/me` returns id/loginId.
  POST `/api/auth/logout` invalidates the session and returns 204.
- An unauthenticated API request returns 401; an authenticated write with a bad
  or missing CSRF token returns 403. Failed writes are never automatically retried.

## Verification

1. In a private browser window, open `/parks/new` or `/parks/1`: expect `/login`.
   Direct requests to `/api/parks` and an existing photo URL must return 401.
2. Try a wrong password, then the correct one. Expect an error, then the park list.
3. Refresh a detail page; the session should remain valid. Confirm park creation,
   facility updates, photo upload/display, and the existing map still work.
4. In browser Network tools, confirm mutating API requests carry X-XSRF-TOKEN,
   the login request has no credentials in its URL, and `/me` has no password hash.
5. Log out and revisit a protected URL; expect login. Restart the backend and
   retry an API operation from an old tab; expect 401 and login, with no write retry.
6. Check a logically deleted test user cannot log in. Do this only with disposable
   test data; bootstrap deliberately does not restore deleted accounts.
7. Automated tests: from `backend`, `mvn test`; from `frontend`,
   `npm test -- --watch=false` and `npm run build`.
   Security integration tests use isolated H2, not the development PostgreSQL DB.

HTTPS, reverse proxy configuration, public port exposure, login rate limiting,
production cookie settings and production schema migration remain separate tasks.
