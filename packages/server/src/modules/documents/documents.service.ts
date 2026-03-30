import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { DocumentListItem, PatchDocumentBody } from './documents.types';

const prisma = new PrismaClient();

/**
 * Lists all documents accessible to a user (owned + shared).
 * @param userId - The requesting user's ID
 * @returns Array of document list items with ownership flags
 */
export async function listDocuments(userId: string): Promise<DocumentListItem[]> {
  // Get owned documents
  const ownedDocs = await prisma.document.findMany({
    where: { ownerId: userId },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  // Get shared documents
  const sharedDocs = await prisma.document.findMany({
    where: {
      shares: { some: { userId } },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        where: { userId },
        select: { permission: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const ownedItems: DocumentListItem[] = ownedDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    ownerId: doc.ownerId,
    ownerName: doc.owner.name,
    isOwner: true,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  const sharedItems: DocumentListItem[] = sharedDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    ownerId: doc.ownerId,
    ownerName: doc.owner.name,
    isOwner: false,
    permission: doc.shares[0]?.permission,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return [...ownedItems, ...sharedItems];
}

/**
 * Creates a new blank document.
 * @param userId - The owner's user ID
 * @returns The created document
 */
export async function createDocument(userId: string) {
  return prisma.document.create({
    data: {
      ownerId: userId,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Retrieves a single document if the user has access.
 * @param documentId - The document ID
 * @param userId - The requesting user's ID
 * @returns The document with owner and permission info
 * @throws AppError 404 if not found, 403 if no access
 */
export async function getDocument(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        where: { userId },
        select: { permission: true },
      },
    },
  });

  if (!document) {
    throw new AppError(404, 'Document not found', 'NOT_FOUND');
  }

  const isOwner = document.ownerId === userId;
  const share = document.shares[0];

  if (!isOwner && !share) {
    throw new AppError(403, 'You do not have access to this document', 'FORBIDDEN');
  }

  return {
    ...document,
    isOwner,
    permission: isOwner ? 'owner' : share?.permission || 'viewer',
  };
}

/**
 * Updates a document's title and/or content.
 * Only owner or editor-permission shares may update.
 * @param documentId - The document ID
 * @param userId - The requesting user's ID
 * @param data - Fields to update
 * @returns The updated document
 * @throws AppError 403 for viewer-permission or unauthorized users
 */
export async function updateDocument(
  documentId: string,
  userId: string,
  data: PatchDocumentBody
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: {
        where: { userId },
        select: { permission: true },
      },
    },
  });

  if (!document) {
    throw new AppError(404, 'Document not found', 'NOT_FOUND');
  }

  const isOwner = document.ownerId === userId;
  const share = document.shares[0];

  if (!isOwner && !share) {
    throw new AppError(403, 'You do not have access to this document', 'FORBIDDEN');
  }

  if (!isOwner && share?.permission === 'viewer') {
    throw new AppError(403, 'Viewers cannot edit this document', 'FORBIDDEN');
  }

  return prisma.document.update({
    where: { id: documentId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Deletes a document. Owner only.
 * @param documentId - The document ID
 * @param userId - The requesting user's ID
 * @throws AppError 403 if user is not the owner
 */
export async function deleteDocument(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new AppError(404, 'Document not found', 'NOT_FOUND');
  }

  if (document.ownerId !== userId) {
    throw new AppError(403, 'Only the owner can delete this document', 'FORBIDDEN');
  }

  return prisma.document.delete({
    where: { id: documentId },
  });
}
