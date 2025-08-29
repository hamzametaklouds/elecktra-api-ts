# Notification Settings Module

This module manages user notification preferences with three boolean flags:

- `desktop_notifications`: Controls desktop notification settings
- `purchase_notifications`: Controls purchase-related notification settings
- `all_notifications`: Controls all notification settings

## API Endpoints

### Authentication Required

All endpoints require JWT authentication via Bearer token.

### 1. Create Notification Settings

- **POST** `/notification-settings`
- **Description**: Create notification settings for the authenticated user
- **Body**:
  ```json
  {
    "desktop_notifications": true,
    "purchase_notifications": true,
    "all_notifications": true
  }
  ```
- **Response**: Created notification settings object

### 2. Get My Notification Settings

- **GET** `/notification-settings/my-settings`
- **Description**: Get current user's notification settings (creates default if none exist)
- **Response**: User's notification settings object

### 3. Update My Notification Settings

- **PUT** `/notification-settings/my-settings`
- **Description**: Update current user's notification settings
- **Body**:
  ```json
  {
    "desktop_notifications": false,
    "purchase_notifications": true,
    "all_notifications": false
  }
  ```
- **Response**: Updated notification settings object

### 4. Delete My Notification Settings

- **DELETE** `/notification-settings/my-settings`
- **Description**: Delete current user's notification settings
- **Response**: Success message

### 5. Get All Notification Settings (Admin)

- **GET** `/notification-settings`
- **Description**: Get all notification settings (admin only)
- **Response**: Array of all notification settings

### 6. Get Notification Settings by ID

- **GET** `/notification-settings/:id`
- **Description**: Get notification settings by ID
- **Response**: Notification settings object

### 7. Update Notification Settings by ID

- **PUT** `/notification-settings/:id`
- **Description**: Update notification settings by ID
- **Body**: Same as update my settings
- **Response**: Updated notification settings object

### 8. Delete Notification Settings by ID

- **DELETE** `/notification-settings/:id`
- **Description**: Delete notification settings by ID
- **Response**: Success message

## Data Model

```typescript
interface INotificationSettings {
  _id?: ObjectId;
  user_id: ObjectId; // Reference to user
  desktop_notifications: boolean; // Desktop notification preference
  purchase_notifications: boolean; // Purchase notification preference
  all_notifications: boolean; // All notifications preference
  is_disabled?: boolean;
  is_deleted?: boolean;
  created_by?: ObjectId;
  updated_by?: ObjectId;
  created_at?: Date;
  updated_at?: Date;
}
```

## Default Values

When a user first accesses their notification settings, default values are automatically created:

- `desktop_notifications`: `true`
- `purchase_notifications`: `true`
- `all_notifications`: `true`

## Features

- **Automatic Default Creation**: If a user doesn't have notification settings, they are automatically created with default values
- **Soft Delete**: Records are soft deleted (marked as `is_deleted: true`) rather than hard deleted
- **User-Specific**: Each user can only access and modify their own notification settings
- **Audit Trail**: Tracks who created and updated the settings
- **Swagger Documentation**: Complete API documentation with examples
