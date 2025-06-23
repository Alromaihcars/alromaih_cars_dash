# ⚡ Hasura GraphQL Engine Integration

## 📋 **Overview**

Hasura serves as the unified GraphQL API gateway, connecting our Odoo backend through Remote Schema while providing additional features like real-time subscriptions, caching, and permission management.

## 🔗 **Remote Schema Setup**

### **1. Odoo GraphQL Remote Schema Configuration**

```yaml
# Hasura Metadata - Remote Schema
version: 3
remote_schemas:
  - name: "odoo_automotive_api"
    definition:
      url: "https://portal.alromaihcars.com/graphql"
      timeout_seconds: 60
      headers:
        x-api-key:
          from_env: "ODOO_API_KEY"
        Content-Type: "application/json"
        Accept: "application/json"
    comment: "Alromaih Cars Odoo Backend GraphQL API"
    
  - name: "odoo_auth_api"  
    definition:
      url: "https://portal.alromaihcars.com/graphql"
      timeout_seconds: 30
      headers:
        x-api-key:
          from_env: "ODOO_API_KEY"
    comment: "Authentication and user management"
```

### **2. Environment Variables**

```bash
# Hasura Configuration
HASURA_GRAPHQL_DATABASE_URL=postgresql://username:password@localhost:5432/hasura
HASURA_GRAPHQL_ENABLE_CONSOLE=true
HASURA_GRAPHQL_DEV_MODE=true
HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup,http-log,webhook-log,websocket-log,query-log

# Odoo Integration
ODOO_API_KEY=tHV8od3pntYTwhm8sxpH5U0neV7uBrwe
ODOO_GRAPHQL_ENDPOINT=https://portal.alromaihcars.com/graphql

# Clerk Integration
HASURA_GRAPHQL_JWT_SECRET={"type":"RS256","key":"-----BEGIN PUBLIC KEY-----\n..."}
CLERK_WEBHOOK_SECRET=whsec_...
```

## 🔐 **Authentication Integration**

### **1. Clerk JWT Configuration**

```json
{
  "type": "RS256",
  "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
  "claims_map": {
    "x-hasura-allowed-roles": {
      "path": "$.metadata.roles"
    },
    "x-hasura-default-role": {
      "path": "$.metadata.default_role"
    },
    "x-hasura-user-id": {
      "path": "$.sub"
    },
    "x-hasura-org-id": {
      "path": "$.org_id"  
    }
  }
}
```

### **2. Hasura Permission Rules**

```sql
-- User Role Permissions
-- Table: car_brand (select)
{
  "_and": [
    {
      "active": {"_eq": true}
    },
    {
      "_or": [
        {"visibility": {"_eq": "public"}},
        {"created_by": {"_eq": "X-Hasura-User-Id"}}
      ]
    }
  ]
}

-- Admin Role Permissions  
-- Table: car_brand (all operations)
{}  -- No restrictions for admin role
```

## 📊 **Schema Stitching & Type Extensions**

### **1. Custom Hasura Types**

```graphql
# Custom scalar types
scalar Date
scalar DateTime
scalar JSON
scalar Upload

# Extended user type
type User {
  id: String!
  email: String!
  firstName: String
  lastName: String
  profileImage: String
  role: String!
  organizationId: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Relationship extensions
extend type CarBrand {
  # Add user relationship
  created_by_user: User
  # Add custom aggregations
  cars_aggregate: CarAggregate
}
```

### **2. Custom Resolvers**

```javascript
// Hasura Actions for custom business logic
const resolvers = {
  Mutation: {
    // Custom car creation with validation
    createCarWithValidation: async (parent, args, context) => {
      const { carData } = args;
      
      // Validate business rules
      await validateCarData(carData);
      
      // Create through Odoo API
      const result = await context.odooClient.mutation({
        createCar: {
          CarValues: carData
        }
      });
      
      return result.createCar;
    },
    
    // Bulk operations
    bulkUpdateCarPrices: async (parent, args, context) => {
      const { carIds, priceAdjustment } = args;
      
      // Process in batches
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < carIds.length; i += batchSize) {
        const batch = carIds.slice(i, i + batchSize);
        const batchResult = await processPriceBatch(batch, priceAdjustment);
        results.push(...batchResult);
      }
      
      return results;
    }
  },
  
  Query: {
    // Advanced search with full-text
    searchCars: async (parent, args, context) => {
      const { query, filters, sort, limit, offset } = args;
      
      return await context.searchService.search({
        index: 'cars',
        query,
        filters,
        sort,
        limit,
        offset
      });
    }
  }
};
```

## 🚀 **Real-time Subscriptions**

### **1. Subscription Setup**

```graphql
# Car inventory updates
subscription CarInventoryUpdates($brandIds: [Int!]) {
  car_brand(where: {id: {_in: $brandIds}}) {
    id
    name
    cars_aggregate {
      aggregate {
        count
      }
    }
    cars(where: {status: {_eq: "published"}}) {
      id
      name
      cash_price_with_vat
      status
      updated_at
    }
  }
}

# Real-time offer updates
subscription ActiveOffers {
  car_offer(
    where: {
      is_active: {_eq: true},
      end_date: {_gte: "now()"}
    }
    order_by: {created_at: desc}
  ) {
    id
    name
    discount_percentage
    final_price
    car {
      id
      name
      brand {
        name
      }
    }
  }
}
```

### **2. Frontend Subscription Usage**

```typescript
// React subscription hook
import { useSubscription } from '@apollo/client';

const INVENTORY_SUBSCRIPTION = gql`
  subscription InventoryUpdates {
    car_brand {
      id
      name
      cars_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

function InventoryDashboard() {
  const { data, loading, error } = useSubscription(INVENTORY_SUBSCRIPTION);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data?.car_brand.map(brand => (
        <InventoryCard 
          key={brand.id}
          brand={brand}
          count={brand.cars_aggregate.aggregate.count}
        />
      ))}
    </div>
  );
}
```

## 📈 **Performance Optimization**

### **1. Query Analysis & Optimization**

```sql
-- Enable query caching
hasura_graphql_query_cache_size: 100MB
hasura_graphql_query_cache_max_age: 300

-- Connection pooling
HASURA_GRAPHQL_CONNECTION_LIFETIME: 600
HASURA_GRAPHQL_POOL_TIMEOUT: 30
HASURA_GRAPHQL_MAX_CONNECTIONS: 50
```

### **2. Caching Strategy**

```javascript
// Apollo Client cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    CarBrand: {
      keyFields: ["id"],
      fields: {
        cars: {
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          }
        }
      }
    },
    Car: {
      keyFields: ["id"],
      fields: {
        media_ids: {
          merge(existing = [], incoming) {
            return incoming; // Replace with latest
          }
        }
      }
    }
  }
});
```

## 🔧 **Development Workflow**

### **1. Hasura Console Development**

```bash
# Start Hasura Console
hasura console --project hasura --admin-secret your-admin-secret

# Apply migrations
hasura migrate apply --project hasura

# Apply metadata
hasura metadata apply --project hasura

# Export metadata
hasura metadata export --project hasura
```

### **2. Schema Introspection**

```typescript
// Generate TypeScript types from Hasura schema
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'http://localhost:8080/v1/graphql': {
        headers: {
          'x-hasura-admin-secret': 'admin-secret'
        }
      }
    }
  ],
  documents: 'src/**/*.{tsx,ts}',
  generates: {
    'src/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo'
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false
      }
    }
  }
};

export default config;
```

## 🛡️ **Security Best Practices**

### **1. Row Level Security**

```sql
-- Example RLS policy for car access
CREATE POLICY car_access_policy ON car
  FOR ALL TO hasura_user
  USING (
    CASE 
      WHEN current_setting('hasura.user.role') = 'admin' THEN true
      WHEN current_setting('hasura.user.role') = 'dealer' THEN 
        dealer_id = current_setting('hasura.user.dealer_id')::int
      WHEN current_setting('hasura.user.role') = 'user' THEN 
        status = 'published' AND active = true
      ELSE false
    END
  );
```

### **2. Rate Limiting**

```yaml
# Hasura rate limiting configuration
api_limits:
  rate_limit:
    global:
      unique_params: IP
      max_reqs_per_min: 120
    per_role:
      user:
        unique_params: ["user_id", "IP"]  
        max_reqs_per_min: 60
      admin:
        unique_params: "user_id"
        max_reqs_per_min: 300
```

## 📊 **Monitoring & Analytics**

### **1. Hasura Metrics**

```yaml
# Enable metrics
HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup,http-log,webhook-log,websocket-log,query-log
HASURA_GRAPHQL_LOG_LEVEL: info

# Custom metrics
metrics:
  - query_execution_time
  - database_connection_count  
  - cache_hit_rate
  - subscription_count
  - error_rate
```

### **2. Query Analytics**

```sql
-- Query performance analysis
SELECT 
  operation_name,
  AVG(execution_time) as avg_time,
  COUNT(*) as query_count,
  MAX(execution_time) as max_time
FROM hasura_query_log 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY operation_name
ORDER BY avg_time DESC;
```

## 🚀 **Deployment Configuration**

### **1. Docker Compose Setup**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: hasura
      POSTGRES_USER: hasura
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  hasura:
    image: hasura/graphql-engine:v2.33.0
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://hasura:${POSTGRES_PASSWORD}@postgres:5432/hasura
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup,http-log,webhook-log,websocket-log,query-log
      HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_ADMIN_SECRET}
      HASURA_GRAPHQL_JWT_SECRET: ${HASURA_JWT_SECRET}
      ODOO_API_KEY: ${ODOO_API_KEY}

volumes:
  postgres_data:
```

### **2. Production Deployment**

```bash
# Kubernetes deployment
kubectl apply -f hasura-deployment.yaml

# Health checks
kubectl get pods -l app=hasura
kubectl logs -l app=hasura -f

# Scaling
kubectl scale deployment hasura --replicas=3
```

---

This Hasura integration provides a powerful, scalable GraphQL gateway that seamlessly connects your Odoo backend with modern frontend applications while adding enterprise-grade features like real-time subscriptions, caching, and security. 