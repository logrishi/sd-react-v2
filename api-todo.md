# FrontQL API with TanStack Query Documentation

## Table of Contents
1. [Setup](#setup)
2. [Basic Queries](#basic-queries)
3. [Advanced Queries](#advanced-queries)
4. [Mutations](#mutations)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)
7. [TypeScript Support](#typescript-support)

## Setup

Our FrontQL API is wrapped with TanStack Query v5 for efficient data fetching, caching, and state management.

```typescript
// The API is already configured and exported as 'api'
import { api } from '@/services/backend/react-query-wrapper';
```

## Basic Queries

### Fetching Data
```typescript
function UserList() {
  const { data, isLoading } = api.get('/users', {
    sort: 'name:asc',
    filter: 'active=true',
    fields: 'id,name,email'
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data.map(user => <UserCard key={user.id} user={user} />)}</div>;
}
```

### Fetching by ID
```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = api.getById('/users', userId, {
    fields: 'id,name,email,role'
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

## Advanced Queries

### Infinite Queries (Pagination)
```typescript
function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = api.getInfinite('/posts', {
    pageSize: 20,
    sort: 'createdAt:desc',
    fields: 'id,title,excerpt'
  });

  return (
    <div>
      {data?.pages.map(page => 
        page.data.map(post => <PostCard key={post.id} post={post} />)
      )}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Prefetching Data
```typescript
function UserLink({ userId }: { userId: string }) {
  return (
    <Link
      onMouseEnter={() => {
        // Start loading data before user clicks
        api.get(`/users/${userId}`, { prefetch: true });
      }}
      href={`/users/${userId}`}
    >
      View Profile
    </Link>
  );
}
```

1. **Enhanced Type Safety**
   - Added TypeScript generics support for all API methods
   - Proper error handling with AxiosError type
   - Type-safe query keys factory

2. **Query Key Management**
   - Implemented queryKeys factory for consistent key management
   - Structured keys for list, detail, and infinite queries
   - Better cache management and invalidation

3. **Advanced Features**
   - Added infinite query support with pagination
   - Implemented optimistic updates for mutations
   - Added proper error handling and recovery
   - Configurable stale time and cache time

4. **Default Configurations**
   - Sensible defaults for query and mutation options
   - Global error handling
   - Configurable retry logic

## Mutations

### Creating Data
```typescript
function CreateUserForm() {
  const { mutate: createUser, isLoading } = api.create('/users', {
    // Enable optimistic updates
    optimistic: true,
    // Automatically invalidate queries after success
    invalidateQueries: true
  });

  const onSubmit = (data: UserData) => {
    createUser(data, {
      onSuccess: (newUser) => {
        console.log('User created:', newUser);
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
      }
    });
  };
}
```

### Updating Data
```typescript
function UpdateUserForm({ userId }: { userId: string }) {
  const { mutate: updateUser } = api.update('/users', userId, {
    optimistic: true
  });

  const onSubmit = (data: Partial<UserData>) => {
    updateUser(data, {
      onSuccess: (updatedUser) => {
        console.log('User updated:', updatedUser);
      }
    });
  };
}
```

### Deleting Data
```typescript
function DeleteUserButton({ userId }: { userId: string }) {
  const { mutate: deleteUser } = api.remove('/users', userId);

  return (
    <button
      onClick={() => {
        deleteUser(undefined, {
          onSuccess: () => {
            console.log('User deleted');
          }
        });
      }}
    >
      Delete User
    </button>
  );
}
```

## Error Handling

### Using Error Boundaries
```typescript
import { QueryErrorBoundary } from '@/components/common/QueryErrorBoundary';

function UserApp() {
  return (
    <QueryErrorBoundary
      fallback={
        <div>
          Something went wrong!
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      }
    >
      <UserList />
    </QueryErrorBoundary>
  );
}
```

### Loading States with Suspense
```typescript
import { QuerySuspense } from '@/components/common/QuerySuspense';

function App() {
  return (
    <QuerySuspense
      fallback={<div>Loading...</div>}
      errorFallback={<div>Error occurred!</div>}
    >
      <UserList />
    </QuerySuspense>
  );
}
```

### Basic Queries with FrontQL Options

```typescript
// Fetch a list of items with sorting and filtering
const { data, isLoading } = api.get<Item[]>('items', {
  sort: 'createdAt:desc',  // Sort by creation date descending
  filter: 'status=active', // Only active items
  fields: 'id,name,status' // Only fetch specific fields
});

// Fetch a single item with specific fields
const { data } = api.getById<Item>('items', id, {
  fields: 'id,name,description,metadata',
  hidden: true // Include hidden fields
});

// Fetch with joins and search
const { data } = api.get<Item[]>('items', {
  joins: 'category,tags',     // Include related data
  search: 'keyword',          // Search by keyword
  sort: 'name:asc',          // Sort by name
  filter: 'category.id=123'  // Filter by category
});

// Fetch with query config and FrontQL options
const { data } = api.get<Item[]>('items', {
  // Query config
  staleTime: 1000 * 60,      // 1 minute
  refetchOnWindowFocus: false,
  
  // FrontQL options
  sort: 'priority:desc',
  filter: 'status=active',
  fields: 'id,name,priority'
});
```

### Infinite Queries with FrontQL Options

```typescript
interface PaginatedResponse<T> {
  data: T[];
  nextPage?: number;  // Will be undefined when no more pages
  total: number;
}

// Implement infinite scrolling with sorting and filtering
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = api.getInfinite<PaginatedResponse<Item>>('items', {
  // Pagination config
  pageSize: 20,
  initialPageParam: 1,  // Starting page number
  
  // FrontQL options
  sort: 'createdAt:desc',
  filter: 'status=active',
  joins: 'category,author',
  fields: 'id,title,category.name,author.name'
});

// Access paginated data
const items = data?.pages.flatMap(page => page.data) ?? [];
const totalItems = data?.pages[0]?.total ?? 0;

// Infinite query with search and nearby location
const { data, fetchNextPage } = api.getInfinite<PaginatedResponse<Location>>('locations', {
  pageSize: 10,
  initialPageParam: 1,
  search: 'cafe',
  nearby: '40.7128,-74.0060,5km',  // Format: 'lat,lng,radius'
  sort: 'distance:asc',
  fields: 'id,name,distance,coordinates'
});
```

### Mutations

```typescript
// Create an item
const createMutation = api.create<Item>('items', {
  onSuccess: (data) => {
    console.log('Item created:', data);
  }
});

// Update an item with optimistic updates
const updateMutation = api.update<Item>('items', id, {
  onSuccess: (data) => {
    console.log('Item updated:', data);
  }
});

// Delete an item
const deleteMutation = api.remove<Item>('items', id, {
  onSuccess: () => {
    console.log('Item deleted');
  }
});
```

## Performance Optimization

### Query Configuration
```typescript
// These are configured globally in query.config.ts
const queryConfig = {
  staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  gcTime: 10 * 60 * 1000,   // Keep unused data for 10 minutes
  retry: 3,                  // Retry failed requests 3 times
  refetchOnWindowFocus: true // Refetch when window regains focus
};

// Override per query if needed
const { data } = api.get('/users', {
  staleTime: 0,  // Always fetch fresh data
  retry: false   // Don't retry on failure
});
```

## TypeScript Support

### Type-Safe Queries
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Type-safe query
const { data } = api.get<User[]>('/users');
// data is typed as User[] | undefined

// Type-safe mutation
const { mutate } = api.create<User, Partial<User>>('/users');
// mutate accepts Partial<User> as input
```

### Error Types
```typescript
import type { QueryError } from '@/services/backend/types';

try {
  const { data } = await api.get('/users');
} catch (error) {
  if (error.type === 'api') {
    // Handle API error
    console.error(error.message);
  } else if (error.type === 'validation') {
    // Handle validation error
    console.error(error.fields);
  } else if (error.type === 'network') {
    // Handle network error
    console.error('Network error:', error.message);
  }
}
```

## Best Practices

1. **Use Error Boundaries**: Always wrap your query components with `QueryErrorBoundary` for proper error handling.

2. **Enable Suspense**: Use `QuerySuspense` for better loading states and error handling.

3. **Optimize Performance**:
   - Use `prefetch: true` for predictable user interactions
   - Configure appropriate `staleTime` and `gcTime`
   - Use optimistic updates for better UX

4. **Type Safety**:
   - Always provide proper types for your queries and mutations
   - Handle all error types appropriately

5. **Query Keys**:
   - Query keys are automatically managed based on endpoint and options
   - Use the same options consistently for the same data to ensure proper caching

1. **Query Keys**
   - Use the queryKeys factory for consistent key management
   - Include relevant parameters in query keys
   - Keep keys hierarchical for better cache management

2. **Error Handling**
   - Always handle errors in mutations
   - Use the global error handler for common error cases
   - Implement proper error recovery with optimistic updates

3. **Performance**
   - Configure appropriate stale times based on data freshness requirements
   - Use infinite queries for large lists
   - Implement optimistic updates for better UX

4. **Type Safety**
   - Always provide proper types when using the API methods
   - Use TypeScript generics for better type inference
   - Handle errors with proper error types

## Configuration Options

### Query Options
```typescript
type QueryConfig = {
  staleTime?: number;      // How long data remains fresh
  cacheTime?: number;      // How long to keep inactive data
  retry?: number | boolean; // Retry failed requests
  retryDelay?: number;     // Delay between retries
  enabled?: boolean;       // Enable/disable the query
  refetchOnWindowFocus?: boolean; // Refetch when window focuses
  refetchOnMount?: boolean;      // Refetch when component mounts
};
```

### Mutation Options
```typescript
type MutationConfig = {
  onSuccess?: (data: any) => void;  // Success callback
  onError?: (error: Error) => void;  // Error callback
  onSettled?: () => void;           // Called on success or error
};
```

## Checklist

- [x] Implemented type-safe query keys factory
- [x] Added infinite query support
- [x] Implemented optimistic updates
- [x] Added proper error handling
- [x] Configured default options
- [x] Added TypeScript support
- [x] Updated documentation with examples
- [x] Updated documentation with proper typing for infinite queries
