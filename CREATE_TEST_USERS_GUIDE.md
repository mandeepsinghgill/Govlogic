# Test Users Creation Guide

## Overview

You have **two methods** to create test users in your GovLogic system:

1. **API Method** - Creates users via HTTP API (works from anywhere)
2. **Docker Method** - Creates users directly in database (production server only)

---

## Method 1: API Method (Recommended)

### For Production Server

```bash
# On your production server
cd /path/to/govlogic

# Install requests if not already installed
pip3 install requests

# Create default test users
python3 create_test_users.py --backend https://govsureai.com

# Or if using API subdomain
python3 create_test_users.py --backend https://api.govsureai.com
```

### For Local Development

```bash
# Make sure backend is running first
cd /path/to/govlogic

# Create test users
python3 create_test_users.py

# Or explicitly specify localhost
python3 create_test_users.py --backend http://localhost:8000
```

### Create Custom User

```bash
# Create a specific user
python3 create_test_users.py \
  --backend https://govsureai.com \
  --email john@example.com \
  --password MyPass123! \
  --name "John Doe" \
  --org "John's Company"
```

### Default Test Accounts Created

| Email | Password | Purpose |
|-------|----------|---------|
| admin@govsureai.com | Admin123! | Admin account |
| test@govsureai.com | Test123! | General testing |
| demo@govsureai.com | Demo123! | Demo purposes |

---

## Method 2: Docker Method (Direct Database)

This method creates users directly in the PostgreSQL database via the Docker backend container.

### On Production Server

```bash
cd /path/to/govlogic

# Make sure containers are running
docker compose ps

# Create test users
./create_test_users_docker.sh
```

### Advantages
- ✅ No network required
- ✅ Faster (direct database access)
- ✅ Works even if API is not accessible
- ✅ Bypasses rate limiting

### Disadvantages
- ❌ Only works on the server where Docker is running
- ❌ Requires direct database access
- ❌ Can't be used remotely

---

## Troubleshooting

### Issue 1: "Could not connect to backend"

**For API Method:**
```bash
# Check if backend is accessible
curl https://govsureai.com/api/v1/health

# Or for subdomain
curl https://api.govsureai.com/api/v1/health

# Check if containers are running
docker compose ps
```

**Solution:**
- Make sure backend container is running: `docker compose up -d backend`
- Check firewall allows HTTP/HTTPS
- Use Docker method instead

### Issue 2: "Backend container is not running"

**For Docker Method:**
```bash
# Start the backend
docker compose up -d backend

# Check status
docker compose ps backend

# View logs
docker compose logs backend
```

### Issue 3: "Email already registered"

This is **not an error!** The user already exists. You can use the existing credentials:

```bash
# The script will show existing credentials
# You can login with the displayed email and password
```

### Issue 4: "Module 'requests' not found"

**For API Method:**
```bash
# Install requests library
pip3 install requests

# Or use system package manager
sudo apt install python3-requests  # Ubuntu/Debian
```

### Issue 5: "Permission denied"

```bash
# Make scripts executable
chmod +x create_test_users.py
chmod +x create_test_users_docker.sh

# Or run with python directly
python3 create_test_users.py
bash create_test_users_docker.sh
```

---

## Manual Database Method

If both scripts fail, you can create users directly via SQL:

### Step 1: Connect to Database

```bash
# Via Docker
docker compose exec postgres psql -U GovSure -d GovSure

# Or from host (if PostgreSQL client installed)
psql -h localhost -U GovSure -d GovSure
```

### Step 2: Create Organization

```sql
-- Create organization
INSERT INTO organizations (name, subscription_tier, max_users, is_active, created_at)
VALUES ('Test Organization', 'free', 10, true, NOW())
RETURNING id;

-- Note the organization ID (e.g., 1)
```

### Step 3: Create User

```sql
-- Create user (replace PASSWORD_HASH and ORG_ID)
-- Password hash for "Test123!" is shown below
INSERT INTO users (
    email, 
    hashed_password, 
    full_name, 
    organization_id, 
    role, 
    is_active, 
    is_verified,
    created_at
)
VALUES (
    'test@govsureai.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lJ3BohmDYe.G',  -- Test123!
    'Test User',
    1,  -- Replace with your organization ID
    'admin',
    true,
    true,
    NOW()
);
```

### Generate Password Hash

If you need a different password:

```python
# In Python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("YourPasswordHere"))
```

Or via Docker:

```bash
docker compose exec backend python3 -c "
from app.core.security import get_password_hash
print(get_password_hash('YourPasswordHere'))
"
```

---

## Verification

### Check Users Were Created

```bash
# Via Docker
docker compose exec postgres psql -U GovSure -d GovSure -c "SELECT id, email, full_name, role, is_active FROM users;"
```

Expected output:
```
 id |         email         |   full_name   | role  | is_active 
----+-----------------------+---------------+-------+-----------
  1 | admin@govsureai.com   | Admin User    | admin | t
  2 | test@govsureai.com    | Test User     | admin | t
  3 | demo@govsureai.com    | Demo User     | admin | t
```

### Test Login

1. Visit https://govsureai.com/login
2. Use credentials:
   - **Email:** test@govsureai.com
   - **Password:** Test123!
3. Click "Sign In"
4. Should redirect to dashboard

### Via API

```bash
# Test login via API
curl -X POST https://govsureai.com/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@govsureai.com&password=Test123!"
```

Should return:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": {...},
  "organization": {...}
}
```

---

## Security Notes

### Production Security

⚠️ **Important:** These are TEST accounts with well-known passwords!

**For Production:**
1. Delete or change passwords after testing
2. Create real accounts with secure passwords
3. Don't share test account credentials publicly
4. Use strong passwords (12+ characters, mixed case, numbers, symbols)

### Deleting Test Accounts

```sql
-- Connect to database
docker compose exec postgres psql -U GovSure -d GovSure

-- Delete specific user
DELETE FROM users WHERE email = 'test@govsureai.com';

-- Or delete all test accounts
DELETE FROM users WHERE email LIKE '%@govsureai.com';
```

Or via API (if you implement a delete endpoint):

```bash
# You would need to implement this endpoint
curl -X DELETE https://govsureai.com/api/v1/users/{user_id} \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Quick Reference

### Create Test Users (API)
```bash
# Production
python3 create_test_users.py --backend https://govsureai.com

# Local
python3 create_test_users.py
```

### Create Test Users (Docker)
```bash
# Production server only
./create_test_users_docker.sh
```

### Check If Users Exist
```bash
docker compose exec postgres psql -U GovSure -d GovSure -c "SELECT email FROM users;"
```

### Test Login
```bash
curl -X POST https://govsureai.com/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@govsureai.com&password=Test123!"
```

### View User Details
```bash
docker compose exec postgres psql -U GovSure -d GovSure -c "
SELECT u.id, u.email, u.full_name, u.role, o.name as organization 
FROM users u 
JOIN organizations o ON u.organization_id = o.id;
"
```

---

## Common Use Cases

### 1. Fresh Installation
```bash
# After deploying, create test accounts
./create_test_users_docker.sh

# Login and verify system works
# Visit: https://govsureai.com/login
# Use: test@govsureai.com / Test123!
```

### 2. Demo for Client
```bash
# Create demo account with custom details
python3 create_test_users.py \
  --backend https://govsureai.com \
  --email client@example.com \
  --password Demo2024! \
  --name "Client Demo" \
  --org "Client Company"

# Give credentials to client
# Email: client@example.com
# Password: Demo2024!
```

### 3. Testing After Updates
```bash
# Create fresh test account
python3 create_test_users.py \
  --backend https://govsureai.com \
  --email testing_$(date +%s)@test.com \
  --password Test123! \
  --name "Test User"

# Use for testing new features
```

### 4. Load Testing
```bash
# Create multiple test users
for i in {1..10}; do
  python3 create_test_users.py \
    --backend https://govsureai.com \
    --email "user${i}@test.com" \
    --password "Test123!" \
    --name "Test User $i"
done
```

---

## Files Reference

- **`create_test_users.py`** - API-based user creation (works remotely)
- **`create_test_users_docker.sh`** - Docker-based user creation (server only)
- **`create_test_account.py`** - Original simple test account creator

---

## Summary

**Quick Start:**
```bash
# On production server
cd /path/to/govlogic
./create_test_users_docker.sh

# Login at: https://govsureai.com/login
# Email: test@govsureai.com
# Password: Test123!
```

**That's it!** You now have test accounts ready to use! 🎉

---

**Need Help?**
- Check container status: `docker compose ps`
- View backend logs: `docker compose logs backend`
- Check database: `docker compose exec postgres psql -U GovSure -d GovSure`
- Test API: `curl https://govsureai.com/api/v1/health`

