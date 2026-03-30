/** Document as stored in the database */
export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Document with owner info for API responses */
export interface DocumentWithOwner extends DocumentRecord {
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

/** Document list item with ownership flag */
export interface DocumentListItem {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  isOwner: boolean;
  permission?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Body for PATCH /documents/:id */
export interface PatchDocumentBody {
  title?: string;
  content?: string;
}
