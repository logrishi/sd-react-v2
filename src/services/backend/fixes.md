# API Implementation Issues in api.ts

This document focuses on specific issues in api.ts when compared to the working implementation in api-old.ts.

## 1. Type Definition Issues

### Current State

```typescript
// api.ts - Incorrect
interface RequestOptions {
  page?: number | string;
  sort?: string;
  joins?: string;
  filter?: string;
  // ...other fields
}

// api-old.ts - Working Implementation
type RequestOptions = {
  page?: Record<string, string | number>;
  sort?: Record<string, string | number>;
  joins?: Record<string, string | number>;
  filter?: Record<string, string | number>;
  // ...other fields
};
```

### Issue

- api.ts has simplified the types too much, losing the Record structure that api-old.ts correctly uses
- This could cause issues when passing complex objects as parameters

### Fix

```typescript
// Update api.ts to match api-old.ts types
interface RequestOptions {
  page?: Record<string, string | number>;
  sort?: Record<string, string | number>;
  joins?: Record<string, string | number>;
  filter?: Record<string, string | number>;
  // ...other fields maintaining Record structure
}
```

## 2. Header Handling Issues

### Current State

```typescript
// api.ts - Incorrect
if (hidden) headers.hidden = JSON.stringify(hidden);
if (filter) headers.filter = JSON.stringify(filter);
if (fields) headers.fields = JSON.stringify(fields);
// ...other headers

// api-old.ts - Working Implementation
if (hidden) headers.hidden = hidden;
if (filter) headers.filter = filter;
if (fields) headers.fields = fields;
// ...other headers
```

### Issue

- api.ts unnecessarily stringifies header values
- This breaks compatibility with the backend which expects raw values as shown in api-old.ts

### Fix

```typescript
// Update api.ts to match api-old.ts header handling
if (hidden) headers.hidden = hidden;
if (filter) headers.filter = filter;
if (fields) headers.fields = fields;
if (session) headers.session = session;
if (joins) headers.collections = joins;
if (validation) headers.validation = validation;
if (permissions) headers.permissions = permissions;
if (nearby) headers.nearby = nearby;
```

## 3. SQL Operation Issues

### Current State

```typescript
// api.ts - Incorrect
type RequestOptions = {
  body?: any; // Lost SQL type definition
};

// api-old.ts - Working Implementation
type RequestOptions = {
  body?: {
    sql: "string";
    params: [{ [key: string]: string | number }];
  };
};
```

### Issue

- api.ts has lost the specific SQL body type definition that exists in api-old.ts
- This could lead to runtime errors when making SQL requests

### Fix

```typescript
// Update api.ts to include proper SQL types
interface SQLBody {
  sql: string;
  params: Array<{ [key: string]: string | number }>;
}

interface RequestOptions {
  body?: any | SQLBody; // Maintain backwards compatibility while adding SQL type
}
```

## 4. Parameter Transformation Issues

### Current State

```typescript
// api.ts - Incorrect
if (page) params.page = typeof page === "object" ? JSON.stringify(page) : page;
if (sort) params.sort = typeof sort === "object" ? JSON.stringify(sort) : sort;

// api-old.ts - Working Implementation
const params: any = {
  page: page,
  sort: sort,
  search: search,
};
```

### Issue

- api.ts unnecessarily transforms and stringifies parameters
- This breaks compatibility with how api-old.ts handles parameters

### Fix

```typescript
// Update api.ts to match api-old.ts parameter handling
const params: Record<string, any> = {
  page: page,
  sort: sort,
  search: search,
};
```

## Immediate Action Items

1. **Type Definitions**

   - Restore Record types for all parameters to match api-old.ts
   - Add proper SQL body type definition

2. **Header Handling**

   - Remove all JSON.stringify calls from header assignments
   - Ensure headers are passed as raw values

3. **Parameter Handling**

   - Remove parameter transformation logic
   - Pass parameters directly as in api-old.ts

4. **SQL Operations**
   - Add proper SQL body type definition
   - Ensure SQL operations maintain the same structure as api-old.ts

These changes will bring api.ts in line with the working implementation in api-old.ts while maintaining the enhanced features added in api.ts.

3. Add performance tests for:
   - Request metrics
   - Request queuing
   - Batch operations
