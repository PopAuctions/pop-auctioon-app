# Push Notifications - Sentry Error Reference

Complete list of Sentry error identifiers for the push notification system in `notification-context.tsx`.

## Error Format

All errors follow this pattern:

```
[NotificationContext.L{line}] {method/scenario} - {description}
```

Where:

- **L{line}**: Approximate line number in notification-context.tsx
- **{method/scenario}**: Function or context where error occurred
- **{description}**: Brief description of what failed

---

## Error Catalog

### 1. App Initialization Errors

#### `[NotificationContext.L104] getLastNotificationResponse - App opened from closed state`

**When**: App was completely closed and user tapped a notification to open it

**Cause**: Error checking if app was opened from notification (getLastNotificationResponse failed)

**Common scenarios**:

- Notification data corrupted
- Expo notifications API error
- Invalid notification format

**Fix**: Check notification payload structure, ensure data field exists

---

### 2. Token Registration Errors

#### `[NotificationContext.L127] registerPushToken - Initial token registration API error`

**When**: First token registration attempt during app initialization

**Cause**: Backend `/api/mobile/protected/notifications/register` returned error

**Common scenarios**:

- Backend endpoint down
- Invalid API key
- Database connection error
- Validation error (invalid token format)

**Fix**: Check backend logs, verify API key, test endpoint manually

---

#### `[NotificationContext.L133] registerPushToken - Initial token registration catch`

**When**: Exception thrown during initial token registration (before API call completes)

**Cause**: Network error, timeout, or unexpected exception

**Common scenarios**:

- No internet connection
- Request timeout (>10 seconds)
- JavaScript error in request building

**Fix**: Check network connectivity, verify request data structure

---

### 3. Reinstallation Detection Errors

#### `[NotificationContext.L161] AsyncStorage - Unregister old token after reinstall detection`

**When**: App detects token change (reinstallation) and tries to disable old token

**Cause**: Backend `/api/mobile/protected/notifications/unregister` returned error

**Common scenarios**:

- Old token not found in database
- Backend endpoint error
- Token already disabled

**Fix**: Check backend unregister endpoint, verify token exists in DB

---

#### `[NotificationContext.L171] AsyncStorage - Token change detection or save failed`

**When**: Reading lastToken from AsyncStorage OR saving new token to AsyncStorage

**Cause**: AsyncStorage read/write error

**Common scenarios**:

- AsyncStorage quota exceeded (very rare)
- Permission denied (Android)
- Storage corruption

**Fix**: Clear app data and reinstall, check device storage space

---

### 4. Expo Token Retrieval Errors

#### `[NotificationContext.L183] registerForPushNotificationsAsync - Failed to get Expo push token`

**When**: Calling `registerForPushNotificationsAsync()` utility

**Cause**: Cannot obtain Expo push token

**Common scenarios**:

- Permissions denied
- Invalid projectId in app.json
- Expo push service unavailable
- Device not physical (emulator - should be caught before)

**Fix**: Check permissions, verify projectId in app.json, test on physical device

---

### 5. Notification Listener Errors

#### `[NotificationContext.L197] addNotificationReceivedListener - Foreground notification handling failed`

**When**: Notification arrives while app is in foreground

**Cause**: Error processing notification in foreground listener

**Common scenarios**:

- Invalid notification data structure
- React state update error
- Navigation error

**Fix**: Check notification payload, verify setNotification() works

---

#### `[NotificationContext.L219] addNotificationResponseReceivedListener - User tap navigation failed`

**When**: User taps notification (foreground or background)

**Cause**: Error extracting route or navigating

**Common scenarios**:

- Invalid route in notification data
- Route doesn't exist in app
- Navigation error (Expo Router)
- getParentTab() regex failed

**Fix**: Verify notification includes valid `data.route`, test route exists

---

### 6. User Authentication Errors

#### `[NotificationContext.L262] useEffect[auth] - Associate user_id after login API error`

**When**: User logs in after token was already registered (unauthenticated)

**Cause**: Backend `/api/mobile/protected/notifications/register` returned error when updating user_id

**Common scenarios**:

- Backend endpoint error
- Token not found in database
- user_id validation error

**Fix**: Check backend logs, verify token exists, test UPSERT logic

---

#### `[NotificationContext.L268] useEffect[auth] - Associate user_id after login catch`

**When**: Exception thrown while associating user_id after login

**Cause**: Network error or unexpected exception

**Common scenarios**:

- Network timeout
- Invalid user_id format
- React effect error

**Fix**: Check network, verify auth.session.user.id exists

---

### 7. Logout Errors

#### `[NotificationContext.L347] useEffect[logout] - Disable token on logout API error`

**When**: User logs out and app tries to disable token

**Cause**: Backend `/api/mobile/protected/notifications/unregister` returned error

**Common scenarios**:

- Token not found
- Already disabled
- Backend endpoint error

**Fix**: Check backend logs, verify token exists in DB

---

#### `[NotificationContext.L353] useEffect[logout] - Disable token on logout catch`

**When**: Exception thrown while disabling token on logout

**Cause**: Network error or unexpected exception

**Common scenarios**:

- Network timeout
- React effect error

**Fix**: Check network connectivity

---

## Error Frequency Analysis

### High Priority (Fix Immediately)

These errors indicate critical failures:

1. **L183** - Cannot get Expo token (blocks entire notification system)
2. **L127/L133** - Initial registration failed (no notifications will work)
3. **L262/L268** - Cannot associate user after login (notifications sent to wrong user)

### Medium Priority (Investigate)

These errors indicate degraded functionality:

1. **L161** - Old token not cleaned up (orphaned tokens accumulate)
2. **L347/L353** - Token not disabled on logout (notifications sent to logged out user)
3. **L219** - Navigation failed (user can't reach destination)

### Low Priority (Acceptable Failures)

These errors are annoying but don't break core functionality:

1. **L104** - getLastNotificationResponse failed (one-time navigation miss)
2. **L171** - AsyncStorage failed (reinstall detection won't work)
3. **L197** - Foreground listener failed (notification not shown, but user in app anyway)

---

## Debugging Guide

### How to Debug Each Error

1. **Search in Sentry**: Use error identifier (e.g., `[NotificationContext.L127]`)
2. **Check context**: Look at error message and stack trace
3. **Reproduce**: Follow scenario in this document
4. **Test fix**: Use testing guide in `PUSH_NOTIFICATIONS_TESTING.md`

### Common Debug Steps

```bash
# 1. Check backend endpoint manually
curl -X POST http://localhost:3000/api/mobile/protected/notifications/register \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"ExponentPushToken[ABC123]"}'

# 2. Check database
SELECT * FROM push_tokens WHERE expo_push_token = 'ExponentPushToken[ABC123]';

# 3. Check device logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# 4. Test with Expo Push Tool
https://expo.dev/notifications

# 5. Check Sentry dashboard
https://sentry.io/organizations/pop-auctioon/issues/
```

---

## Related Documentation

- **PUSH_NOTIFICATIONS_README.md** - Complete system overview
- **PUSH_TOKENS_BACKEND.md** - Backend implementation guide
- **PUSH_NOTIFICATIONS_TESTING.md** - Testing scenarios
- **PUSH_TOKENS_ASYNCSTORAGE.md** - Token change detection

---

**Last Updated**: January 4, 2026  
**Version**: 1.0.0  
**File**: `src/context/notification-context.tsx`
