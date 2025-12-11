# Firestore Security Rules Setup

## Basic Security Rules for Development

For development, you can use these basic rules. **Important:** These rules allow authenticated users to read/write their own data only.

Go to Firebase Console → Firestore Database → Rules tab, and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more collections as needed
    match /{document=**} {
      allow read, write: if false; // Deny all other access by default
    }
  }
}
```

## What These Rules Do

- **Authenticated users** can read and write their own user document (`/users/{userId}`)
- **All other access is denied** by default
- This ensures users can only access their own data

## Testing the Rules

1. After saving the rules, test them in the Firebase Console
2. Try creating a user document from your app
3. Verify that users can only access their own data

## Production Rules

For production, you'll want more granular rules based on your data structure. For example:
- Questions collection: Read-only for all authenticated users
- Responses collection: Users can only write their own responses
- Results collection: Read-only aggregated data

