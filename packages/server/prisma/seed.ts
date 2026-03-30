import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('demo1234', 12);

  await prisma.$transaction(async (tx) => {
    // Create Alice
    const alice = await tx.user.upsert({
      where: { email: 'alice@demo.com' },
      update: {},
      create: {
        email: 'alice@demo.com',
        name: 'Alice Demo',
        passwordHash,
      },
    });

    // Create Bob
    const bob = await tx.user.upsert({
      where: { email: 'bob@demo.com' },
      update: {},
      create: {
        email: 'bob@demo.com',
        name: 'Bob Demo',
        passwordHash,
      },
    });

    // Create Alice's documents
    const q3Doc = await tx.document.create({
      data: {
        title: 'Q3 Planning Notes',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Q3 Planning Notes' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This document outlines our key objectives and milestones for Q3.',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Key Objectives' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Launch v2.0 of the platform' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Expand to 3 new markets' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Achieve 95% customer satisfaction' }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
        ownerId: alice.id,
      },
    });

    await tx.document.create({
      data: {
        title: 'Product Roadmap Draft',
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Product Roadmap Draft' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Draft roadmap for the next two quarters. This document is still in progress.',
                },
              ],
            },
          ],
        }),
        ownerId: alice.id,
      },
    });

    // Share Q3 Planning Notes with Bob as editor
    await tx.documentShare.create({
      data: {
        documentId: q3Doc.id,
        userId: bob.id,
        permission: 'editor',
      },
    });

    console.log('✅ Created users:');
    console.log(`   Alice Demo (${alice.id}) - alice@demo.com`);
    console.log(`   Bob Demo (${bob.id}) - bob@demo.com`);
    console.log('✅ Created 2 documents for Alice');
    console.log('✅ Shared "Q3 Planning Notes" with Bob (editor)');
  });

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
