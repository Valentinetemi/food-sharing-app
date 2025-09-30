# Comment Functionality Troubleshooting Guide

## Issue: Comments Not Working

If comments are not appearing or being saved, here are the steps to troubleshoot:

### 1. Check Firebase Configuration

Ensure your Firebase project has Firestore enabled:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Firestore Database" in the left sidebar
4. Make sure Firestore is enabled and set up

### 2. Check Firestore Security Rules

Your Firestore security rules should allow reading and writing comments:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Comments collection
    match /comments/{commentId} {
      allow read: if true; // Allow anyone to read comments
      allow create: if request.auth != null; // Only authenticated users can create
      allow update: if request.auth != null && request.auth.uid == resource.data.author.uid;
      allow delete: if request.auth != null && request.auth.uid == resource.data.author.uid;
    }
    
    // Likes collection
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Check Browser Console

Open your browser's developer tools (F12) and check the console for:

1. **Firebase connection errors**
2. **Authentication errors**
3. **Firestore permission errors**
4. **Network errors**

Look for messages like:
- "Comments snapshot received: X comments"
- "Comment data: {...}"
- "Comment added successfully with ID: ..."

### 4. Verify User Authentication

Make sure the user is properly authenticated:

1. Check if `user` object exists in the component
2. Verify Firebase Auth is working
3. Ensure user has a valid UID

### 5. Check Firestore Collections

In Firebase Console, check if:

1. **comments** collection exists
2. **likes** collection exists
3. Documents are being created with correct structure

### 6. Test with Debug Logs

The code now includes debug logging. Check the browser console for:

```javascript
// When adding a comment:
"Adding comment: {postId: '1', userId: 'abc123', commentText: 'Hello'}"

// When comment is added:
"Comment added successfully with ID: def456"

// When loading comments:
"Comments snapshot received: 2 comments"
```

### 7. Common Issues and Solutions

#### Issue: "Permission denied"
**Solution**: Update Firestore security rules (see step 2)

#### Issue: "Firebase not initialized"
**Solution**: Check your Firebase config and ensure it's properly imported

#### Issue: Comments not showing up
**Solution**: Check if the postId matches between the post and comment

#### Issue: "User not authenticated"
**Solution**: Ensure user is logged in and Firebase Auth is working

### 8. Manual Testing

You can test the Firestore connection manually:

1. Open browser console
2. Try adding a comment
3. Check Firebase Console for new documents
4. Verify the document structure matches the expected format

### 9. Expected Comment Document Structure

```json
{
  "postId": "1",
  "author": {
    "uid": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "text": "This is a comment",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 10. Still Not Working?

If comments still don't work:

1. Check Firebase project settings
2. Verify API keys are correct
3. Ensure Firestore is in the correct region
4. Check for any network/firewall issues
5. Try creating a comment directly in Firebase Console

## Quick Fix Commands

If you need to reset Firestore rules to permissive mode (for testing only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning**: Only use permissive rules for testing. Never use in production!
