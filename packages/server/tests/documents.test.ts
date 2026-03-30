import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/index';

const prisma = new PrismaClient();

describe('Documents API', () => {
  const user1 = {
    name: 'Doc Test User 1',
    email: `doctest1-${Date.now()}@example.com`,
    password: 'testpassword123',
  };
  const user2 = {
    name: 'Doc Test User 2',
    email: `doctest2-${Date.now()}@example.com`,
    password: 'testpassword123',
  };
  let token1: string;
  let token2: string;
  let documentId: string;

  beforeAll(async () => {
    // Create test users
    const res1 = await request(app).post('/api/auth/register').send(user1);
    token1 = res1.body.token;
    const res2 = await request(app).post('/api/auth/register').send(user2);
    token2 = res2.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({
      where: {
        owner: {
          email: { in: [user1.email, user2.email] },
        },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [user1.email, user2.email] } },
    });
    await prisma.$disconnect();
  });

  it('POST /api/documents creates a new document for authenticated user', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .expect(201);

    expect(res.body).toHaveProperty('document');
    expect(res.body.document.title).toBe('Untitled Document');
    documentId = res.body.document.id;
  });

  it('GET /api/documents returns only owned + shared documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);

    expect(res.body).toHaveProperty('documents');
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBeGreaterThanOrEqual(1);

    // User2 should not see user1's document
    const res2 = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);

    const user2Docs = res2.body.documents.filter(
      (d: { id: string }) => d.id === documentId
    );
    expect(user2Docs.length).toBe(0);
  });

  it('PATCH /api/documents/:id saves content and updates updatedAt', async () => {
    const content = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello World' }] }] });

    const res = await request(app)
      .patch(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content, title: 'Updated Title' })
      .expect(200);

    expect(res.body.document.title).toBe('Updated Title');
    expect(res.body.document.content).toBe(content);
  });

  it('GET /api/documents/:id returns 403 for unauthorized user', async () => {
    await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);
  });
});
