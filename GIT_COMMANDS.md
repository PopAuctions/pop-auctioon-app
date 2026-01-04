# Git Commands for PR Submission

## 1. Stage Changes
```bash
pnpm git add .
# or
git add .
```

## 2. Commit
```bash
git commit -m "fix: comprehensive test suite fixes and 77 new notification tests

- Fixed ESM module transformation for i18n-js, make-plural, @sentry, @stripe
- Created global jest-setup.ts with AsyncStorage, expo-notifications, and native module mocks
- Added Supabase client mocks to 5 test files resolving 'supabaseUrl is required' errors
- Created 77 comprehensive notification tests (33 register, 24 route, 20 delete)
- Fixed register-auctioneer, info page, and component tests
- Updated snapshots (2 updated, 114 passing)
- Improved test pass rate from 833 to 942 tests (97.1% success rate)

BREAKING: None
TESTING: All notification utilities now have comprehensive coverage
DOCS: See PR_DESCRIPTION.md for detailed breakdown

Test Results: 942/970 passing (97.1%)
Coverage: 72.44%"
```

## 3. Push to Branch
```bash
git push origin feature/expo-notification-esta-vez-si
```

## 4. Create PR (via GitHub CLI)
```bash
gh pr create \
  --title "Test Suite Consolidation: Fix Critical Test Failures & Add 77 Notification Tests (942/970 Passing - 97.1%)" \
  --body-file PR_DESCRIPTION.md \
  --base develop \
  --head feature/expo-notification-esta-vez-si \
  --draft
```

## 5. Alternative: Manual PR Creation
1. Go to: `https://github.com/PopAuctions/pop-auctioon-app/compare/develop...feature/expo-notification-esta-vez-si`
2. Click "Create pull request"
3. Copy title and description from `PR_DESCRIPTION.md`
4. Submit

---

## Verification Commands

```bash
# Check test status
pnpm test 2>&1 | grep -E 'Test Suites:|Tests:|Snapshots:'

# Run specific test suite
pnpm test notifications

# Update snapshots if needed
pnpm test:update-snapshots

# Check coverage
pnpm coverage:open

# Lint and format
pnpm lint:fix
pnpm prettier:fix
```

---

## Pre-PR Checklist

```bash
# 1. Ensure clean working directory
git status

# 2. Run all tests
pnpm test

# 3. Type check
pnpm type-check

# 4. Format code
pnpm lint:fix
pnpm prettier:fix

# 5. Run quality checks
pnpm check-all

# 6. Final test run
pnpm test 2>&1 | tail -20
```

---

## Expected Output

```
Test Suites: 1 failed, 80 passed, 81 total
Tests:       10 failed, 18 skipped, 942 passed, 970 total
Snapshots:   114 passed, 1 updated
Coverage:    72.44%
```
