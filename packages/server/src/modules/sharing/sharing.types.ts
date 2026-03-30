/** Permission levels for document sharing */
export type SharePermission = 'viewer' | 'editor';

/** Share entry for API responses */
export interface ShareEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  permission: SharePermission;
  createdAt: Date;
}

/** Request body for creating a share */
export interface CreateShareBody {
  email: string;
  permission: SharePermission;
}
