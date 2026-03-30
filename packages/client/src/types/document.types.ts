/** Document list item from API */
export interface DocumentListItem {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  isOwner: boolean;
  permission?: string;
  createdAt: string;
  updatedAt: string;
}

/** Full document from API */
export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  isOwner: boolean;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

/** Share entry from API */
export interface ShareEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  permission: 'viewer' | 'editor';
  createdAt: string;
}
