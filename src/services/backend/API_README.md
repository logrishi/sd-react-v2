# Enhanced API Client

This is a flexible, powerful API client that provides multiple ways to interact with backend services.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Resource-based API](#resource-based-api)
- [Query Builder Pattern](#query-builder-pattern)
- [Advanced Features](#advanced-features)
- [TypeScript Support](#typescript-support)

## Basic Usage

The most straightforward way to use the API client is through direct HTTP method calls:

```typescript
import Api from "@/services/backend/api-new";

// GET request
const users = await Api.get("/users", {
  filter: "status:active",
  sort: "created_at:desc",
});

// POST request with body
const newUser = await Api.post("/users", {
  body: {
    name: "John Doe",
    email: "john@example.com",
  },
});

// PUT request to update a resource
await Api.put("/users/123", {
  body: {
    name: "John Smith",
  },
});

// DELETE request
await Api.delete("/users/123");

// SQL query
const results = await Api.sql("users", {
  body: {
    sql: "SELECT * FROM users WHERE status = ?",
    params: [{ status: "active" }],
  },
});
```

## Resource-based API

For cleaner, more organized code when working with REST resources:

```typescript
import Api from "@/services/backend/api-new";

// Create a resource reference (can be reused)
const usersApi = Api.resource("users");

// Get all users
const allUsers = await usersApi.getAll({
  filter: "status:active",
  sort: "created_at:desc",
});

// Get one user by ID
const user = await usersApi.getOne(123);

// Create a new user
const newUser = await usersApi.create({
  name: "John Doe",
  email: "john@example.com",
});

// Update a user
const updatedUser = await usersApi.update(123, {
  name: "John Smith",
});

// Partial update (PATCH)
const patchedUser = await usersApi.patch(123, {
  name: "Johnny",
});

// Delete a user
await usersApi.remove(123);
```

## Query Builder Pattern

For complex queries with a fluent interface:

```typescript
import Api from "@/services/backend/api-new";

// Basic query
const activeUsers = await Api.query("users").filter("status:active").sort("created_at:desc").getAll();

// Get a specific record
const user = await Api.query("users").withId(123).fields(["id", "name", "email", "profile"]).get();

// Combining multiple filters
const filteredUsers = await Api.query("users").filter("status:active").search("john").page(1).sort("name:asc").getAll();

// Creating with query builder
const newUser = await Api.query("users")
  .withBody({
    name: "John Doe",
    email: "john@example.com",
  })
  .create();

// Updating with query builder
const updatedUser = await Api.query("users").withId(123).withBody({ name: "John Smith" }).update();

// Deleting with query builder
await Api.query("users").withId(123).delete();

// Using execute() for custom methods
const result = await Api.query("users").withId(123).execute("patch");
```

## Advanced Features

### Caching

Cache GET requests to improve performance:

```typescript
// With direct method
const users = await Api.get("/users", {
  cacheOptions: {
    enabled: true,
    duration: 300000, // 5 minutes in milliseconds
  },
});

// With query builder
const users = await Api.query("users").cache(true, 300000).getAll();
```

### Request Cancellation

Cancel requests that are no longer needed:

```typescript
// Create a cancel token
const cancelToken = Api.cancelRequest();

// Use it in a request
try {
  const users = await Api.get("/users", {
    cancelToken,
  });
} catch (error) {
  if (axios.isCancel(error)) {
    console.log("Request was cancelled");
  }
}

// Cancel the request
cancelToken.cancel("Operation cancelled by the user");

// With query builder
const users = await Api.query("users").withCancelToken(Api.cancelRequest()).getAll();
```

### Retry Configuration

Configure retry behavior for failed requests:

```typescript
// Set max number of retries
const data = await Api.get("/users", {
  retries: 5,
});

// With query builder
const data = await Api.query("users").retries(5).getAll();
```

### Authentication

Authenticate with the API:

```typescript
const authApi = Api.auth("login");

const session = await authApi.check({
  username: "user@example.com",
  password: "securepassword",
});
```

## TypeScript Support

The API client is fully typed for better developer experience:

```typescript
// Define your model types
interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

// Use with generic type parameters
const usersApi = Api.resource<User>("users");
const users: User[] = await usersApi.getAll();

// With query builder
const activeUsers: User[] = await Api.query<User>("users").filter("status:active").getAll();

// With direct method
const user: User = await Api.get<User>("/users/123");
```

## Error Handling

Handle API errors properly:

```typescript
try {
  const users = await Api.get("/users");
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized error
  } else if (error.status === 404) {
    // Handle not found error
  } else {
    // Handle other errors
    console.error(error.message);
  }
}
```
