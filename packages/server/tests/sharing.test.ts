import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/index';

const prisma = new PrismaClient();

describe('Sharing API', () => {
  const owner = {
    name: 'Share Owner',
    email: `shareowner-${Date.now()}@example.com`,
    password: 'testpassword123',
  };
  const target = {
    name: 'Share Target',
    email: `sharetarget-${Date.now()}@example.com`,
    password: 'testpassword123',
  };
  const nonOwner = {
    name: 'Non Owner',
    email: `nonowner-${Date.now()}@example.com`,
    password: 'testpassword123',
  };

  let ownerToken: string;
  let targetToken: string;
  let nonOwnerToken: string;
  let documentId: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Create test users
    const res1 = await request(app).post('/api/auth/register').send(owner);
    ownerToken = res1.body.token;

    const res2 = await request(app).post('/api/auth/register').send(target);
    targetToken = res2.body.token;
    targetUserId = res2.body.user.id;

    const res3 = await request(app).post('/api/auth/register').send(nonOwner);
    nonOwnerToken = res3.body.token;

    // Create a document as owner
    const docRes = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${ownerToken}`);
    documentId = docRes.body.document.id;
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({
      where: {
        owner: { email: { in: [owner.email, target.email, nonOwner.email] } },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [owner.email, target.email, nonOwner.email] } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/documents/:id/shares grants access to another user by email', async () => {
    const res = await request(app)
      .post(`/api/documents/${documentId}/shares`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: target.email, permission: 'editor' })
      .expect(201);

    expect(res.body).toHaveProperty('share');
    expect(res.body.share.userEmail).toBe(target.email);
    expect(res.body.share.permission).toBe('editor');

    // Verify target can now access the document
    const docRes = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${targetToken}`)
      .expect(200);

    expect(docRes.body.document.id).toBe(documentId);
  });

  it('DELETE /api/documents/:id/shares/:userId revokes access', async () => {
    await request(app)
      .delete(`/api/documents/${documentId}/shares/${targetUserId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    // Verify target can no longer access the document
    await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${targetToken}`)
      .expect(403);
  });

  it('Returns 403 when non-owner tries to share', async () => {
    // Re-share with target first so non-owner has access context
    await request(app)
      .post(`/api/documents/${documentId}/shares`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: target.email, permission: 'viewer' });

    // Non-owner tries to share
    await request(app)
      .post(`/api/documents/${documentId}/shares`)
      .set('Authorization', `Bearer ${nonOwnerToken}`)
      .send({ email: 'someone@example.com', permission: 'viewer' })
      .expect(403);
  });
});
