import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import type { UploadResponse } from './upload.types';

const prisma = new PrismaClient();

/**
 * Converts plain text to Tiptap-compatible HTML.
 * Splits by newlines and wraps each line in <p> tags.
 */
function textToHtml(text: string): string {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('');
}

/**
 * Extracts a title from file content or falls back to filename.
 * Uses the first non-empty line as the title.
 */
function extractTitle(content: string, filename: string): string {
  const firstLine = content.split(/\r?\n/).find((line) => line.trim().length > 0);
  if (firstLine && firstLine.trim().length > 0) {
    // Strip markdown heading markers and HTML tags
    const cleaned = firstLine
      .replace(/^#+\s*/, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    if (cleaned.length > 0) {
      return cleaned.substring(0, 100);
    }
  }
  // Fallback: filename without extension
  return path.basename(filename, path.extname(filename));
}

/**
 * Processes an uploaded file and creates a document.
 * @param file - The Multer file object
 * @param userId - The uploading user's ID
 * @returns The created document ID and title
 */
export async function processUpload(
  file: Express.Multer.File,
  userId: string
): Promise<UploadResponse> {
  const ext = path.extname(file.originalname).toLowerCase();
  let htmlContent: string;
  let rawText: string;

  try {
    if (ext === '.txt' || ext === '.md') {
      rawText = await fs.readFile(file.path, 'utf-8');
      htmlContent = textToHtml(rawText);
    } else if (ext === '.docx') {
      const result = await mammoth.convertToHtml({ path: file.path });
      htmlContent = result.value;
      // Extract raw text for title extraction
      rawText = (await mammoth.extractRawText({ path: file.path })).value;
    } else {
      throw new Error('Unsupported file type');
    }

    const title = extractTitle(rawText!, file.originalname);

    const document = await prisma.document.create({
      data: {
        title,
        content: htmlContent,
        ownerId: userId,
      },
    });

    return {
      documentId: document.id,
      title: document.title,
    };
  } finally {
    // Clean up uploaded file from disk
    try {
      await fs.unlink(file.path);
    } catch {
      // Ignore cleanup errors
    }
  }
}
