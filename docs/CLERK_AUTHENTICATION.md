# 🔐 Clerk Authentication Integration

## 📋 **Overview**

Clerk provides modern, secure authentication for the Alromaih Cars Dashboard, replacing traditional Odoo authentication with features like social logins, multi-factor authentication, and seamless JWT integration with Hasura.

## 🚀 **Why Clerk Instead of Odoo Auth**

### **Traditional Odoo Authentication Limitations**
- ❌ Limited UI customization for login flows
- ❌ No built-in social authentication
- ❌ Complex JWT token management
- ❌ Limited multi-factor authentication options
- ❌ Poor mobile app integration

### **Clerk Authentication Benefits** 
- ✅ **Modern UI Components**: Customizable, branded login flows
- ✅ **Social Logins**: Google, Apple, Facebook, GitHub, etc.
- ✅ **MFA Built-in**: SMS, TOTP, backup codes
- ✅ **Mobile-First**: React Native SDKs
- ✅ **JWT Integration**: Seamless Hasura integration
- ✅ **Developer Experience**: Comprehensive dashboards and analytics

## 🔧 **Setup & Configuration**

### **1. Clerk Dashboard Setup**

```bash
# Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Custom domains
NEXT_PUBLIC_CLERK_DOMAIN=auth.alromaihcars.com
```

### **2. Next.js Integration**

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { arabic } from '@clerk/localizations'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      localization={arabic}
      appearance={{
        baseTheme: 'dark', // or 'light'
        variables: {
          colorPrimary: '#7c3aed', // Alromaih brand color
          colorBackground: '#0f172a',
          colorText: '#f8fafc'
        },
        elements: {
          formButtonPrimary: 'bg-violet-600 hover:bg-violet-700',
          card: 'bg-slate-900 border-slate-800'
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
```

### **3. Authentication Components**

```typescript
// components/auth/SignInButton.tsx
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function AuthButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="bg-violet-600 hover:bg-violet-700">
            تسجيل الدخول
          </Button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-slate-900 border-slate-700"
            }
          }}
        />
      </SignedIn>
    </>
  )
}
```

## 🌐 **Hasura JWT Integration**

### **1. JWT Template Configuration**

```json
{
  "name": "hasura",
  "claims": {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user", "admin", "dealer"],
      "x-hasura-default-role": "user",
      "x-hasura-user-id": "{{user.id}}",
      "x-hasura-user-email": "{{user.primary_email_address.email_address}}",
      "x-hasura-org-id": "{{user.organization_memberships.0.organization.id}}",
      "x-hasura-org-role": "{{user.organization_memberships.0.role}}"
    }
  }
}
```

### **2. Hasura JWT Secret**

```bash
# Get Clerk JWKS URL
CLERK_JWKS_URL=https://api.clerk.com/v1/jwks

# Hasura JWT Secret (RS256)
HASURA_GRAPHQL_JWT_SECRET='{
  "type": "RS256",
  "jwks_url": "https://api.clerk.com/v1/jwks",
  "claims_map": {
    "x-hasura-allowed-roles": {"path": "$.metadata.roles", "default": ["user"]},
    "x-hasura-default-role": {"path": "$.metadata.default_role", "default": "user"},
    "x-hasura-user-id": {"path": "$.sub"}
  }
}'
```

### **3. Apollo Client Integration**

```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useAuth } from '@clerk/nextjs'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_ENDPOINT,
})

const authLink = setContext(async (_, { headers }) => {
  const { getToken } = useAuth()
  const token = await getToken({ template: 'hasura' })

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
```

## 👥 **User Management & Roles**

### **1. Organization-Based Access**

```typescript
// components/auth/ProtectedRoute.tsx
import { useOrganization, useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'dealer' | 'user'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoaded } = useUser()
  const { organization } = useOrganization()

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  if (!user) {
    redirect('/sign-in')
  }

  // Check organization membership
  if (requiredRole === 'admin' || requiredRole === 'dealer') {
    const membership = organization?.memberships.find(
      m => m.publicUserData.userId === user.id
    )
    
    if (!membership || membership.role !== requiredRole) {
      redirect('/unauthorized')
    }
  }

  return <>{children}</>
}
```

### **2. Role-Based UI Components**

```typescript
// components/auth/RoleGuard.tsx
import { useUser } from '@clerk/nextjs'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useUser()
  
  const userRole = user?.organizationMemberships?.[0]?.role || 'user'
  
  if (!allowedRoles.includes(userRole)) {
    return fallback || null
  }

  return <>{children}</>
}

// Usage
<RoleGuard allowedRoles={['admin', 'dealer']}>
  <AdminDashboard />
</RoleGuard>

<RoleGuard allowedRoles={['admin']} fallback={<AccessDenied />}>
  <UserManagement />
</RoleGuard>
```

## 🔄 **User Synchronization with Odoo**

### **1. Webhook Setup**

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    await syncUserToOdoo(evt.data)
  }

  if (eventType === 'user.updated') {
    await updateUserInOdoo(evt.data)
  }

  if (eventType === 'organizationMembership.created') {
    await handleOrganizationMembership(evt.data)
  }

  return new Response('', { status: 200 })
}

async function syncUserToOdoo(userData: any) {
  // Sync user to Odoo via GraphQL
  const mutation = `
    mutation CreateUser($input: UserInput!) {
      createUser(input: $input) {
        id
        email
        name
      }
    }
  `

  const variables = {
    input: {
      clerk_user_id: userData.id,
      email: userData.email_addresses[0].email_address,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone_numbers[0]?.phone_number,
      image_url: userData.image_url
    }
  }

  // Make GraphQL request to Odoo through Hasura
  await fetch(process.env.HASURA_ADMIN_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!
    },
    body: JSON.stringify({ query: mutation, variables })
  })
}
```

### **2. User Profile Management**

```typescript
// components/auth/UserProfile.tsx
import { useUser } from '@clerk/nextjs'
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs'

export function UserProfile() {
  return (
    <ClerkUserProfile 
      appearance={{
        elements: {
          card: "bg-slate-900 border-slate-700",
          navbar: "bg-slate-800",
          navbarButton: "text-slate-300 hover:text-white",
          headerTitle: "text-white",
          headerSubtitle: "text-slate-400"
        }
      }}
      routing="hash"
    />
  )
}

// Custom user info component
export function UserInfo() {
  const { user } = useUser()

  if (!user) return null

  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <img 
        src={user.imageUrl} 
        alt={user.fullName || ''} 
        className="w-8 h-8 rounded-full"
      />
      <div>
        <p className="text-sm font-medium text-white">
          {user.fullName}
        </p>
        <p className="text-xs text-slate-400">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  )
}
```

## 📱 **Mobile App Integration**

### **1. React Native Setup**

```typescript
// App.tsx (React Native)
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <MainApp />
      </ClerkLoaded>
    </ClerkProvider>
  )
}
```

### **2. Mobile Authentication Flow**

```typescript
// screens/AuthScreen.tsx
import { useSignIn, useSignUp } from '@clerk/clerk-expo'
import { useState } from 'react'

export function AuthScreen() {
  const { signIn, setActive } = useSignIn()
  const { signUp } = useSignUp()
  const [isSignIn, setIsSignIn] = useState(true)

  const handlePhoneAuth = async (phoneNumber: string) => {
    try {
      if (isSignIn) {
        const signInAttempt = await signIn?.create({
          strategy: 'phone_code',
          identifier: phoneNumber,
        })

        await signInAttempt?.prepareFirstFactor({
          strategy: 'phone_code',
        })
      } else {
        await signUp?.create({
          phoneNumber: phoneNumber,
        })

        await signUp?.preparePhoneNumberVerification()
      }
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-slate-900">
      <Text className="text-2xl font-bold text-white text-center mb-8">
        أهلاً بك في الرميح للسيارات
      </Text>
      
      <PhoneInput 
        onSubmit={handlePhoneAuth}
        placeholder="رقم الهاتف"
      />
      
      <TouchableOpacity 
        onPress={() => setIsSignIn(!isSignIn)}
        className="mt-4"
      >
        <Text className="text-violet-400 text-center">
          {isSignIn ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

## 🌍 **Internationalization**

### **1. Arabic Localization**

```typescript
// lib/clerk-arabic.ts
import { arabic } from '@clerk/localizations'

export const arabicLocalization = {
  ...arabic,
  signIn: {
    ...arabic.signIn,
    start: {
      title: 'تسجيل الدخول إلى {{applicationName}}',
      subtitle: 'أهلاً بك مرة أخرى! يرجى تسجيل الدخول للمتابعة',
      actionText: 'ليس لديك حساب؟',
      actionLink: 'إنشاء حساب'
    }
  },
  signUp: {
    ...arabic.signUp,
    start: {
      title: 'إنشاء حساب في {{applicationName}}',
      subtitle: 'أنشئ حسابك للبدء',
      actionText: 'لديك حساب بالفعل؟',
      actionLink: 'تسجيل الدخول'
    }
  }
}
```

### **2. Custom Arabic UI**

```typescript
// components/auth/ArabicSignIn.tsx
import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ArabicSignIn() {
  const { signIn, isLoaded } = useSignIn()

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 rounded-lg p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-white text-center mb-6">
        تسجيل الدخول
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="البريد الإلكتروني"
          className="text-right"
          required
        />
        
        <Input
          type="password"
          placeholder="كلمة المرور"
          className="text-right"
          required
        />
        
        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
          تسجيل الدخول
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Button variant="ghost" className="text-violet-400">
          هل نسيت كلمة المرور؟
        </Button>
      </div>
    </div>
  )
}
```

## 📊 **Analytics & Monitoring**

### **1. Authentication Analytics**

```typescript
// lib/analytics.ts
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useAuthAnalytics() {
  const { userId, sessionId, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Track successful login
      analytics.track('User Signed In', {
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        platform: 'web'
      })
    }
  }, [isLoaded, isSignedIn, userId, sessionId])

  const trackAuthEvent = (event: string, properties?: Record<string, any>) => {
    analytics.track(event, {
      userId,
      sessionId,
      ...properties
    })
  }

  return { trackAuthEvent }
}
```

### **2. Security Monitoring**

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/'],
  
  beforeAuth: (req) => {
    // Security logging
    console.log(`Auth attempt: ${req.nextUrl.pathname}`)
  },
  
  afterAuth: (auth, req) => {
    // Failed auth handling
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Admin route protection
    if (req.nextUrl.pathname.startsWith('/admin') && auth.sessionClaims?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

## 🚀 **Production Best Practices**

### **1. Environment Configuration**

```bash
# Production Environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_DOMAIN=auth.alromaihcars.com

# Webhook Configuration
CLERK_WEBHOOK_SECRET=whsec_...

# Hasura Integration
HASURA_GRAPHQL_JWT_SECRET='{"type":"RS256","jwks_url":"https://api.clerk.com/v1/jwks"}'
```

### **2. Security Considerations**

- ✅ **HTTPS Only**: Always use HTTPS in production
- ✅ **Domain Restrictions**: Configure allowed domains in Clerk dashboard
- ✅ **Webhook Verification**: Always verify webhook signatures
- ✅ **Rate Limiting**: Implement rate limiting for auth endpoints
- ✅ **Session Management**: Configure appropriate session timeouts

---

This Clerk integration provides enterprise-grade authentication with modern UX, seamless mobile support, and Arabic-first internationalization while maintaining security and scalability for the Alromaih Cars platform. 