import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import type { ShareEntry, SharePermission } from './sharing.types';

const prisma = new PrismaClient();

/**
 * Verifies the requesting user is the document owner.
 * @throws AppError 404 if document not found, 403 if not owner
 */
async function verifyOwnership(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: { ownerId: true },
  });

  if (!document) {
    throw new AppError(404, 'Document not found', 'NOT_FOUND');
  }

  if (document.ownerId !== userId) {
    throw new AppError(403, 'Only the document owner can manage shares', 'FORBIDDEN');
  }
}

/**
 * Lists all shares for a document.
 * @param documentId - The document ID
 * @param requestingUserId - The requesting user's ID (must be owner)
 * @returns Array of share entries with user details
 */
export async function getShares(
  documentId: string,
  requestingUserId: string
): Promise<ShareEntry[]> {
  await verifyOwnership(documentId, requestingUserId);

  const shares = await prisma.documentShare.findMany({
    where: { documentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return shares.map((share) => ({
    id: share.id,
    userId: share.user.id,
    userName: share.user.name,
    userEmail: share.user.email,
    permission: share.permission as SharePermission,
    createdAt: share.createdAt,
  }));
}

/**
 * Creates a new share for a document.
 * @param documentId - The document ID
 * @param ownerUserId - The document owner's user ID
 * @param email - The email of the user to share with
 * @param permission - The permission level (viewer or editor)
 * @returns The created share entry
 * @throws AppError 404 if target user not found, 409 if already shared, 403 if not owner
 */
export async function createShare(
  documentId: string,
  ownerUserId: string,
  email: string,
  permission: SharePermission
): Promise<ShareEntry> {
  await verifyOwnership(documentId, ownerUserId);

  // Look up target user by email
  const targetUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    throw new AppError(404, 'No user found with that email address', 'USER_NOT_FOUND');
  }

  // Prevent sharing with self
  if (targetUser.id === ownerUserId) {
    throw new AppError(400, 'You cannot share a document with yourself', 'SELF_SHARE');
  }

  // Check for existing share
  const existingShare = await prisma.documentShare.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUser.id,
      },
    },
  });

  if (existingShare) {
    throw new AppError(409, 'This document is already shared with that user', 'ALREADY_SHARED');
  }

  const share = await prisma.documentShare.create({
    data: {
      documentId,
      userId: targetUser.id,
      permission,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    id: share.id,
    userId: share.user.id,
    userName: share.user.name,
    userEmail: share.user.email,
    permission: share.permission as SharePermission,
    createdAt: share.createdAt,
  };
}

/**
 * Revokes a share for a document.
 * @param documentId - The document ID
 * @param ownerUserId - The document owner's user ID
 * @param targetUserId - The user ID to revoke access from
 * @throws AppError 403 if not owner, 404 if share not found
 */
export async function revokeShare(
  documentId: string,
  ownerUserId: string,
  targetUserId: string
): Promise<void> {
  await verifyOwnership(documentId, ownerUserId);

  const share = await prisma.documentShare.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUserId,
      },
    },
  });

  if (!share) {
    throw new AppError(404, 'Share not found', 'NOT_FOUND');
  }

  await prisma.documentShare.delete({
    where: { id: share.id },
  });
}
