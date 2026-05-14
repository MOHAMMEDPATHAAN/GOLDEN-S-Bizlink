# 🟢🟢 SUPABASE CONFIGURATION GUIDE 🟢🟢

## Quick Setup (5 Minutes)

### Step 1: Get Your Credentials

Go to [supabase.com](https://supabase.com):
1. Create a new project (or use existing)
2. Go to **Settings → API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbG...`)

### Step 2: Update Configuration

Open `/vercel/share/v0-project/lib/supabase.ts`:

```typescript
// Replace these lines:
const SUPABASE_URL = '🟢🟢 YOUR_SUPABASE_URL 🟢🟢'
const SUPABASE_ANON_KEY = '🟢🟢 YOUR_SUPABASE_ANON_KEY 🟢🟢'

// With your actual values:
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Step 3: Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  profile_complete INT DEFAULT 0
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ceo_name TEXT NOT NULL,
  profile TEXT,
  logo_url TEXT,
  ceo_image_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  production_types TEXT[] DEFAULT '{}',
  employee_count INT,
  year_established INT,
  industry TEXT,
  currency TEXT DEFAULT 'USD',
  tax_id TEXT,
  tax_verified BOOLEAN DEFAULT FALSE,
  legal_entity TEXT,
  social_links JSONB DEFAULT '{}',
  operating_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT DEFAULT 'starter'
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  price DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  unit TEXT,
  min_order INT DEFAULT 1,
  max_order INT,
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reels table
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  products_tagged TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feed posts table
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  likes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Network connections table
CREATE TABLE network_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, target_id)
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions table (for security audit)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  logout_at TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- A/B tests table
CREATE TABLE a_b_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  split_percentage INT DEFAULT 50,
  results JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start DATE,
  current_period_end DATE,
  renewal_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_reels_company_id ON reels(company_id);
CREATE INDEX idx_feed_posts_company_id ON feed_posts(company_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_network_requester ON network_connections(requester_id);
CREATE INDEX idx_network_target ON network_connections(target_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### Step 4: Enable Row Level Security (RLS)

Go to **Authentication → Policies** and enable RLS on all tables.

Add policies for users to only access their own data:

```sql
-- Example for products table
CREATE POLICY "Users can view active products"
ON products FOR SELECT
USING (is_active = true);

CREATE POLICY "Company members can edit their products"
ON products FOR UPDATE
USING (company_id IN (
  SELECT id FROM companies WHERE owner_id = auth.uid()
));
```

### Step 5: Enable Authentication Methods

Go to **Authentication → Providers**:
- Enable **Email/Password**
- Enable **Google OAuth** (add your Google app credentials)

### Step 6: Test Connection

The app will automatically detect your Supabase configuration and start using it:

```typescript
// In lib/supabase.ts - this function checks your config
export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('🟢🟢') && !SUPABASE_ANON_KEY.includes('🟢🟢')
}
```

If configured correctly:
- ✅ Data will sync to Supabase
- ✅ Authentication will work
- ✅ Real-time updates will be enabled

If not configured:
- ✅ App still works with localStorage
- ✅ Data persists locally
- ⚠️ No real-time features
- ⚠️ Data not synchronized across devices

---

## 📂 File References

Each of these files has `🟢🟢` placeholders for your Supabase credentials:

- `/vercel/share/v0-project/lib/supabase.ts` - Main configuration
- All page files can read from the configured Supabase instance

---

## 🔑 Environment Variables (Optional)

For deployment, you can also set environment variables:

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Then update `supabase.ts`:
```typescript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '🟢🟢 ...'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '🟢🟢 ...'
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Project URL & Anon Key copied
- [ ] Updated `lib/supabase.ts` with your credentials
- [ ] Database tables created via SQL
- [ ] RLS policies enabled
- [ ] Email & Google auth providers enabled
- [ ] Tested app login (should now use Supabase)
- [ ] Verified data appears in Supabase dashboard

---

## 🆘 Troubleshooting

**"Auth failed" error:**
- Check your Supabase URL & Anon Key are correct
- Verify email authentication is enabled

**"Data not saving" error:**
- Verify RLS policies allow writes
- Check user has company/product ownership

**"Realtime not working" error:**
- Enable Realtime in Supabase project settings
- Verify channels are properly subscribed

**"Still using localStorage":**
- Check `isSupabaseConfigured()` returns true
- Verify no 🟢🟢 placeholders remain in supabase.ts

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**Last Updated:** May 14, 2026
