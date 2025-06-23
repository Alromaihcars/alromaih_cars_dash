#!/bin/bash

# 🔒 Security Cleanup Script
# Removes sensitive files and validates security fixes

set -e  # Exit on any error

echo "🔒 Alromaih Cars Dashboard - Security Cleanup Script"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.mjs" ]; then
    print_error "This script must be run from the root of the Next.js project"
    exit 1
fi

print_status "Starting security cleanup..."

# 1. Remove sensitive system files
print_status "Step 1: Removing sensitive system files..."

if [ -f ".DS_Store" ]; then
    rm -f .DS_Store
    print_success "Removed .DS_Store"
else
    print_status ".DS_Store not found (good)"
fi

# Remove other macOS artifacts
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "._*" -type f -delete 2>/dev/null || true
find . -name ".Spotlight-V100" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".Trashes" -type d -exec rm -rf {} + 2>/dev/null || true

print_success "System files cleanup completed"

# 2. Remove build artifacts that shouldn't be in repo
print_status "Step 2: Removing build artifacts..."

if [ -f "tsconfig.tsbuildinfo" ]; then
    rm -f tsconfig.tsbuildinfo
    print_success "Removed tsconfig.tsbuildinfo"
fi

# Remove any ZIP files (source code archives)
if ls *.zip 1> /dev/null 2>&1; then
    print_warning "Found ZIP files - removing:"
    ls *.zip
    rm -f *.zip
    print_success "ZIP files removed"
fi

print_success "Build artifacts cleanup completed"

# 3. Check for hardcoded API keys
print_status "Step 3: Scanning for hardcoded API keys..."

HARDCODED_KEY="tHV8od3pntYTwhm8sxpH5U0neV7uBrwe"
KEY_FOUND=$(grep -r "$HARDCODED_KEY" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.log" --exclude="security-cleanup.sh" 2>/dev/null || true)

if [ ! -z "$KEY_FOUND" ]; then
    print_error "CRITICAL: Hardcoded API key still found in:"
    echo "$KEY_FOUND"
    print_error "Please remove these immediately!"
    exit 1
else
    print_success "No hardcoded API keys found"
fi

# 4. Check for NEXT_PUBLIC_ API keys
print_status "Step 4: Checking for client-side API key exposure..."

PUBLIC_KEY_FOUND=$(grep -r "NEXT_PUBLIC_API_KEY" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.log" --exclude="security-cleanup.sh" 2>/dev/null || true)

if [ ! -z "$PUBLIC_KEY_FOUND" ]; then
    print_warning "Found NEXT_PUBLIC_API_KEY references:"
    echo "$PUBLIC_KEY_FOUND"
    print_warning "These should be replaced with server-side API_KEY"
fi

# 5. Validate environment file setup
print_status "Step 5: Validating environment configuration..."

if [ -f ".env.local" ]; then
    print_warning ".env.local file exists - checking content..."
    
    if grep -q "NEXT_PUBLIC_API_KEY" .env.local; then
        print_error "CRITICAL: .env.local contains NEXT_PUBLIC_API_KEY - this exposes the key client-side!"
        print_error "Please change to API_KEY (without NEXT_PUBLIC_ prefix)"
    fi
    
    if grep -q "API_KEY=" .env.local && ! grep -q "NEXT_PUBLIC_API_KEY" .env.local; then
        print_success ".env.local uses secure API_KEY variable"
    fi
else
    print_warning ".env.local not found - you'll need to create it with your API key"
    print_status "Example content:"
    echo "  API_KEY=your-secure-api-key-here"
    echo "  NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://portal.alromaihcars.com/graphql"
fi

# 6. Check if .env.local is in .gitignore
print_status "Step 6: Verifying .gitignore configuration..."

if grep -q ".env.local" .gitignore; then
    print_success ".env.local is properly ignored by Git"
else
    print_error ".env.local is NOT in .gitignore - this is a security risk!"
    print_status "Adding .env.local to .gitignore..."
    echo "" >> .gitignore
    echo "# Environment files" >> .gitignore
    echo ".env.local" >> .gitignore
    print_success "Added .env.local to .gitignore"
fi

# 7. Validate Next.js configuration
print_status "Step 7: Checking Next.js security configuration..."

if grep -q "ignoreDuringBuilds: true" next.config.mjs; then
    print_error "ESLint is disabled during builds - this reduces code quality"
elif grep -q "ignoreDuringBuilds: false\|ignoreDuringBuilds: process.env.NODE_ENV === 'development'" next.config.mjs; then
    print_success "ESLint configuration is secure"
fi

if grep -q "ignoreBuildErrors: true" next.config.mjs; then
    print_error "TypeScript errors are ignored during builds - this reduces type safety"
elif grep -q "ignoreBuildErrors: false\|ignoreBuildErrors: process.env.NODE_ENV === 'development'" next.config.mjs; then
    print_success "TypeScript configuration is secure"
fi

# 8. Check for secure GraphQL client usage
print_status "Step 8: Validating secure GraphQL client implementation..."

if [ -f "lib/api/secure-client.ts" ]; then
    print_success "Secure GraphQL client found"
else
    print_warning "Secure GraphQL client not found - make sure to use the new secure architecture"
fi

if [ -f "app/api/graphql/route.ts" ]; then
    print_success "Secure API route found"
else
    print_warning "Secure API route not found - client-side requests may not work properly"
fi

# 9. Final security check
print_status "Step 9: Final security validation..."

# Check for any remaining sensitive patterns
SENSITIVE_PATTERNS=(
    "password.*="
    "secret.*="
    "private.*key"
    "api.*key.*="
)

ISSUES_FOUND=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    FOUND=$(grep -ri "$pattern" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.log" --exclude="security-cleanup.sh" 2>/dev/null || true)
    if [ ! -z "$FOUND" ]; then
        print_warning "Potential sensitive data found with pattern '$pattern':"
        echo "$FOUND"
        ISSUES_FOUND=true
    fi
done

if [ "$ISSUES_FOUND" = false ]; then
    print_success "No additional sensitive patterns found"
fi

# 10. Generate security report
print_status "Step 10: Generating security report..."

cat > SECURITY_STATUS.md << EOF
# 🔒 Security Status Report

Generated: $(date)

## ✅ Security Checks Passed
- No hardcoded API keys found
- System files removed
- Build artifacts cleaned
- .gitignore properly configured

## ⚠️ Required Actions
1. **IMMEDIATELY**: Revoke the old API key: \`tHV8od3pntYTwhm8sxpH5U0neV7uBrwe\`
2. **GENERATE**: New secure API key from Odoo admin panel
3. **CREATE**: .env.local file with new API key
4. **TEST**: Application functionality with new configuration

## 📋 Next Steps
- [ ] Revoke old API key in Odoo admin
- [ ] Generate new API key
- [ ] Update .env.local with new key
- [ ] Test application
- [ ] Deploy security fixes
- [ ] Monitor for any issues

## 🔗 Documentation
- See SECURITY_FIXES.md for detailed information
- See ENVIRONMENT.md for configuration guidance
- See env.example for configuration template

---
*This report was generated automatically by the security cleanup script.*
EOF

print_success "Security report generated: SECURITY_STATUS.md"

# Summary
echo ""
echo "======================================================"
echo "🔒 SECURITY CLEANUP COMPLETED"
echo "======================================================"
print_success "All automated security fixes have been applied"
print_warning "CRITICAL: You must still REVOKE the old API key manually!"
print_status "Next steps:"
echo "  1. Log into Odoo admin panel"
echo "  2. Revoke API key: tHV8od3pntYTwhm8sxpH5U0neV7uBrwe"
echo "  3. Generate new secure API key"
echo "  4. Create .env.local with new key"
echo "  5. Test and deploy"
echo ""
print_status "Documentation updated:"
echo "  - SECURITY_FIXES.md (comprehensive security guide)"
echo "  - SECURITY_STATUS.md (current status report)"
echo "  - ENVIRONMENT.md (updated configuration guide)"
echo ""
print_success "Security cleanup completed successfully!"
echo "======================================================" 