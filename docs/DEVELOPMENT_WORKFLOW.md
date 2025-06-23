# 🛠️ Development Workflow Guide

## 📋 **Overview**

This guide outlines the complete development workflow for the Alromaih Cars Dashboard, covering the integration between Odoo, Hasura, Next.js, and Clerk in a cohesive development process.

## 🏗️ **Development Environment Setup**

### **1. Prerequisites**

```bash
# Required Tools
- Node.js 18.0+
- Python 3.10+
- PostgreSQL 15+
- Docker & Docker Compose
- Git

# Development Tools
- VS Code with extensions:
  - GraphQL
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier
  - ESLint
```

### **2. Environment Configuration**

```bash
# .env.local (Next.js Dashboard)
NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:8080/v1/graphql
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ODOO_API_KEY=tHV8od3pntYTwhm8sxpH5U0neV7uBrwe

# .env (Hasura)
HASURA_GRAPHQL_DATABASE_URL=postgresql://hasura:password@localhost:5432/hasura
HASURA_GRAPHQL_ENABLE_CONSOLE=true
HASURA_GRAPHQL_DEV_MODE=true
HASURA_GRAPHQL_ADMIN_SECRET=admin-secret
HASURA_GRAPHQL_JWT_SECRET='{"type":"RS256","jwks_url":"https://api.clerk.com/v1/jwks"}'
ODOO_API_KEY=tHV8od3pntYTwhm8sxpH5U0neV7uBrwe

# Odoo Configuration
ODOO_DB_HOST=localhost
ODOO_DB_PORT=5432
ODOO_DB_NAME=odoo
ODOO_DB_USER=odoo
ODOO_DB_PASSWORD=odoo
```

### **3. Local Development Stack**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # PostgreSQL for Hasura
  postgres-hasura:
    image: postgres:15
    environment:
      POSTGRES_DB: hasura
      POSTGRES_USER: hasura
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - hasura_db:/var/lib/postgresql/data

  # PostgreSQL for Odoo
  postgres-odoo:
    image: postgres:15
    environment:
      POSTGRES_DB: odoo
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
    ports:
      - "5432:5432"
    volumes:
      - odoo_db:/var/lib/postgresql/data

  # Hasura GraphQL Engine
  hasura:
    image: hasura/graphql-engine:v2.33.0
    ports:
      - "8080:8080"
    depends_on:
      - postgres-hasura
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://hasura:password@postgres-hasura:5432/hasura
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ADMIN_SECRET: admin-secret
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"RS256","jwks_url":"https://api.clerk.com/v1/jwks"}'
      ODOO_API_KEY: tHV8od3pntYTwhm8sxpH5U0neV7uBrwe

volumes:
  hasura_db:
  odoo_db:
```

## 🔄 **Development Workflow**

### **Phase 1: Backend Development (Odoo)**

#### **1. Model Development**

```python
# models/new_model.py
from odoo import models, fields, api

class NewAutomotiveModel(models.Model):
    _name = 'automotive.new.model'
    _description = 'New Automotive Model'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Name', required=True, tracking=True)
    name_en = fields.Char(string='Name (English)')
    name_ar = fields.Char(string='Name (Arabic)')
    
    # Multilingual computed field
    @api.depends('name_en', 'name_ar')
    def _compute_display_name(self):
        for record in self:
            lang = self.env.context.get('lang', 'ar_001')
            if lang == 'en_US' and record.name_en:
                record.display_name = record.name_en
            else:
                record.display_name = record.name_ar or record.name_en
```

#### **2. GraphQL Schema Extension**

```python
# In the appropriate EasyGraphQL model
def get_graphql_schema(self):
    return """
        type NewAutomotiveModel {
            id: Int!
            name: String @multiLang
            display_name: String
            created_at: DateTime
            updated_at: DateTime
        }
        
        input NewAutomotiveModelInput {
            name_en: String
            name_ar: String
        }
        
        extend type Mutation {
            createNewAutomotiveModel(input: NewAutomotiveModelInput!): NewAutomotiveModel
            updateNewAutomotiveModel(id: Int!, input: NewAutomotiveModelInput!): NewAutomotiveModel
            deleteNewAutomotiveModel(id: Int!): Boolean
        }
        
        extend type Query {
            newAutomotiveModels(limit: Int, offset: Int): [NewAutomotiveModel]
            newAutomotiveModel(id: Int!): NewAutomotiveModel
        }
    """
```

#### **3. Odoo Module Update & Test**

```bash
# Update Odoo module
./odoo-bin -u alromaih_cars_dash -d odoo_dev

# Test GraphQL endpoint
curl -X POST https://portal.alromaihcars.com/graphql \
  -H "Content-Type: application/json" \
  -H "x-api-key: tHV8od3pntYTwhm8sxpH5U0neV7uBrwe" \
  -d '{
    "query": "query { newAutomotiveModels { id name display_name } }"
  }'
```

### **Phase 2: API Gateway Setup (Hasura)**

#### **1. Update Remote Schema**

```bash
# Start Hasura console
hasura console --project hasura --admin-secret admin-secret

# Or update via CLI
hasura metadata apply --project hasura
```

#### **2. Add Permissions**

```sql
-- User permissions for new model
{
  "_and": [
    {"active": {"_eq": true}},
    {
      "_or": [
        {"public": {"_eq": true}},
        {"created_by": {"_eq": "X-Hasura-User-Id"}}
      ]
    }
  ]
}
```

#### **3. Test Integration**

```graphql
# Test in Hasura Console
query TestNewModel {
  newAutomotiveModels {
    id
    name
    display_name
  }
}
```

### **Phase 3: Frontend Development (Next.js)**

#### **1. Generate TypeScript Types**

```bash
# Install GraphQL codegen
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo

# Generate types
npm run codegen
```

#### **2. Create API Layer**

```typescript
// lib/api/queries/new-model.ts
import { gql } from '@apollo/client';

export const GET_NEW_MODELS = gql`
  query GetNewModels($limit: Int, $offset: Int) {
    newAutomotiveModels(limit: $limit, offset: $offset) {
      id
      name
      display_name
      created_at
      updated_at
    }
  }
`;

export const CREATE_NEW_MODEL = gql`
  mutation CreateNewModel($input: NewAutomotiveModelInput!) {
    createNewAutomotiveModel(input: $input) {
      id
      name
      display_name
    }
  }
`;

export const UPDATE_NEW_MODEL = gql`
  mutation UpdateNewModel($id: Int!, $input: NewAutomotiveModelInput!) {
    updateNewAutomotiveModel(id: $id, input: $input) {
      id
      name
      display_name
    }
  }
`;

export const DELETE_NEW_MODEL = gql`
  mutation DeleteNewModel($id: Int!) {
    deleteNewAutomotiveModel(id: $id)
  }
`;
```

#### **3. Create React Components**

```typescript
// components/new-model/NewModelForm.tsx
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CREATE_NEW_MODEL, GET_NEW_MODELS } from '@/lib/api/queries/new-model';

interface NewModelFormData {
  name_en: string;
  name_ar: string;
}

export function NewModelForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewModelFormData>();
  
  const [createModel, { loading }] = useMutation(CREATE_NEW_MODEL, {
    refetchQueries: [{ query: GET_NEW_MODELS }],
    onCompleted: () => {
      reset();
      onSuccess?.();
    }
  });

  const onSubmit = async (data: NewModelFormData) => {
    try {
      await createModel({
        variables: {
          input: data
        }
      });
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name (English)
          </label>
          <input
            {...register('name_en', { required: 'English name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
          {errors.name_en && (
            <p className="mt-1 text-sm text-red-600">{errors.name_en.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            الاسم (عربي)
          </label>
          <input
            {...register('name_ar', { required: 'Arabic name is required' })}
            dir="rtl"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
          {errors.name_ar && (
            <p className="mt-1 text-sm text-red-600">{errors.name_ar.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Model'}
      </button>
    </form>
  );
}
```

#### **4. Create Page Components**

```typescript
// app/dashboard/new-models/page.tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_NEW_MODELS } from '@/lib/api/queries/new-model';
import { NewModelForm } from '@/components/new-model/NewModelForm';
import { DataTable } from '@/components/ui/data-table';

export default function NewModelsPage() {
  const { data, loading, error } = useQuery(GET_NEW_MODELS);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">New Models</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your automotive models
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Add New Model
            </h2>
            <NewModelForm />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <DataTable
              data={data?.newAutomotiveModels || []}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'display_name', label: 'Name' },
                { key: 'created_at', label: 'Created', type: 'date' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Phase 4: Authentication Integration**

#### **1. Protected Routes**

```typescript
// app/dashboard/new-models/layout.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function NewModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}
```

#### **2. User Context in Queries**

```typescript
// Updated API queries with user context
export const GET_NEW_MODELS_WITH_USER = gql`
  query GetNewModelsWithUser($limit: Int, $offset: Int) {
    newAutomotiveModels(limit: $limit, offset: $offset) {
      id
      name
      display_name
      created_by_user {
        id
        email
        firstName
        lastName
      }
      created_at
      updated_at
    }
  }
`;
```

## 🧪 **Testing Strategy**

### **1. Backend Testing (Odoo)**

```python
# tests/test_new_model.py
from odoo.tests.common import TransactionCase

class TestNewAutomotiveModel(TransactionCase):
    
    def setUp(self):
        super().setUp()
        self.Model = self.env['automotive.new.model']
    
    def test_create_model(self):
        model = self.Model.create({
            'name_en': 'Test Model',
            'name_ar': 'نموذج اختبار'
        })
        self.assertEqual(model.name_en, 'Test Model')
        self.assertEqual(model.name_ar, 'نموذج اختبار')
    
    def test_display_name_computation(self):
        model = self.Model.create({
            'name_en': 'Test Model',
            'name_ar': 'نموذج اختبار'
        })
        
        # Test Arabic context
        model_ar = model.with_context(lang='ar_001')
        self.assertEqual(model_ar.display_name, 'نموذج اختبار')
        
        # Test English context
        model_en = model.with_context(lang='en_US')
        self.assertEqual(model_en.display_name, 'Test Model')
```

### **2. GraphQL Testing**

```typescript
// __tests__/api/new-model.test.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GET_NEW_MODELS, CREATE_NEW_MODEL } from '@/lib/api/queries/new-model';

describe('New Model API', () => {
  let client: ApolloClient<any>;

  beforeEach(() => {
    client = new ApolloClient({
      uri: 'http://localhost:8080/v1/graphql',
      cache: new InMemoryCache(),
      headers: {
        'x-hasura-admin-secret': 'admin-secret'
      }
    });
  });

  it('should fetch new models', async () => {
    const { data } = await client.query({
      query: GET_NEW_MODELS,
      variables: { limit: 10 }
    });

    expect(data.newAutomotiveModels).toBeDefined();
    expect(Array.isArray(data.newAutomotiveModels)).toBe(true);
  });

  it('should create new model', async () => {
    const { data } = await client.mutate({
      mutation: CREATE_NEW_MODEL,
      variables: {
        input: {
          name_en: 'Test Model',
          name_ar: 'نموذج اختبار'
        }
      }
    });

    expect(data.createNewAutomotiveModel).toBeDefined();
    expect(data.createNewAutomotiveModel.name).toBe('Test Model');
  });
});
```

### **3. Frontend Testing**

```typescript
// __tests__/components/NewModelForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { NewModelForm } from '@/components/new-model/NewModelForm';
import { CREATE_NEW_MODEL } from '@/lib/api/queries/new-model';

const mocks = [
  {
    request: {
      query: CREATE_NEW_MODEL,
      variables: {
        input: {
          name_en: 'Test Model',
          name_ar: 'نموذج اختبار'
        }
      }
    },
    result: {
      data: {
        createNewAutomotiveModel: {
          id: 1,
          name: 'Test Model',
          display_name: 'Test Model'
        }
      }
    }
  }
];

describe('NewModelForm', () => {
  it('should create new model on form submission', async () => {
    const onSuccess = jest.fn();
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <NewModelForm onSuccess={onSuccess} />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/Name \(English\)/), {
      target: { value: 'Test Model' }
    });

    fireEvent.change(screen.getByLabelText(/الاسم \(عربي\)/), {
      target: { value: 'نموذج اختبار' }
    });

    fireEvent.click(screen.getByText('Create Model'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

## 🚀 **Deployment Process**

### **1. Staging Deployment**

```bash
# Build and deploy to staging
npm run build
npm run test
npm run deploy:staging

# Run integration tests
npm run test:integration:staging
```

### **2. Production Deployment**

```bash
# Production deployment checklist
- [ ] All tests passing
- [ ] GraphQL schema validated
- [ ] Hasura permissions updated
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] CDN cache cleared

# Deploy
npm run deploy:production
```

## 📊 **Monitoring & Debugging**

### **1. Development Debugging**

```typescript
// Debug helpers
export const debugGraphQL = (query: string, variables?: any) => {
  console.log('🔍 GraphQL Query:', query);
  console.log('📝 Variables:', variables);
};

export const debugHasura = async (endpoint: string) => {
  const response = await fetch(`${endpoint}/healthz`);
  console.log('🏥 Hasura Health:', response.status);
};

// Usage in components
debugGraphQL(GET_NEW_MODELS.loc?.source.body!, { limit: 10 });
```

### **2. Performance Monitoring**

```typescript
// lib/performance.ts
export const measureGraphQLPerformance = (operationName: string) => {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`⚡ ${operationName} took ${duration.toFixed(2)}ms`);
    }
  };
};

// Usage
const perf = measureGraphQLPerformance('GetNewModels');
const { data } = await client.query({ query: GET_NEW_MODELS });
perf.end();
```

## 🔄 **Best Practices**

### **1. Code Organization**

```
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utility libraries
│   ├── api/              # GraphQL queries/mutations
│   ├── auth/             # Authentication utilities
│   ├── utils/            # General utilities
│   └── hooks/            # Custom React hooks
├── types/                 # TypeScript type definitions
└── __tests__/            # Test files
```

### **2. Naming Conventions**

```typescript
// GraphQL Operations
const GET_CAR_BRANDS = gql`...`;          // Query
const CREATE_CAR_BRAND = gql`...`;        // Mutation
const SUBSCRIBE_TO_CARS = gql`...`;       // Subscription

// Components
CarBrandForm                              // PascalCase
CarBrandList                              // PascalCase
useCarBrands                              // Hooks with 'use' prefix

// Files
car-brand-form.tsx                        // kebab-case
car-brand.types.ts                        // kebab-case
CarBrandForm.test.tsx                     // PascalCase for tests
```

### **3. Error Handling**

```typescript
// Standardized error handling
export const handleGraphQLError = (error: ApolloError) => {
  if (error.networkError) {
    console.error('🌐 Network Error:', error.networkError);
    toast.error('Network connection error');
  }
  
  if (error.graphQLErrors.length > 0) {
    console.error('📊 GraphQL Errors:', error.graphQLErrors);
    error.graphQLErrors.forEach(err => {
      toast.error(err.message);
    });
  }
};
```

---

This comprehensive workflow ensures smooth development across all layers of the Alromaih Cars Dashboard architecture, from Odoo backend to Next.js frontend, with proper testing, monitoring, and deployment practices. 