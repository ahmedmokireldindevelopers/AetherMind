// src/app/api/download-project/route.ts
import { NextResponse } from 'next/server';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';

// Define the directories/files to include in the zip
// Exclude node_modules, .next, .env, and potentially large build artifacts or local data
const filesToInclude = [
  'public',
  'src',
  '.env.example', // Include example env, not the actual one
  '.gitignore',
  '.vscode',
  'components.json',
  'next.config.ts',
  'package.json',
  'package-lock.json', // Or yarn.lock if using Yarn
  'postcss.config.mjs', // Adjust if using a different extension
  'README.md',
  'tailwind.config.ts',
  'tsconfig.json',
];

const projectRoot = process.cwd();

// Helper function to stream a ReadableStream to a WritableStream
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return Buffer.concat(chunks);
}

export async function GET() {
  try {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Set compression level
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        // Log file not found warnings
        console.warn('Archiver warning (ENOENT):', err);
      } else {
        // Rethrow other warnings
        console.error('Archiver warning:', err);
        // Consider how to handle these, maybe skip the file
      }
    });

    archive.on('error', (err) => {
      console.error('Archiver error:', err);
      // Error handling during archiving is tricky with streams.
      // The response might have already started sending.
      // Log the error. The client will likely receive an incomplete/corrupted file.
    });

    // Add specified files and directories to the archive
    for (const item of filesToInclude) {
      const sourcePath = path.join(projectRoot, item);
      try {
        const stats = await fs.promises.stat(sourcePath);
        if (stats.isDirectory()) {
          // Add directory recursively, placing its contents directly in the zip root under the directory name
          archive.directory(sourcePath, item);
        } else if (stats.isFile()) {
          // Add file directly to the zip root
          archive.file(sourcePath, { name: item });
        }
      } catch (err: any) {
         if (err.code === 'ENOENT') {
             console.warn(`Skipping missing file/directory: ${item}`);
         } else {
             console.error(`Error processing ${item}:`, err);
             // Optionally, you could stop the process here or just skip the problematic item
         }
      }
    }

    // Finalize the archive (important!)
    archive.finalize();

    // Convert the archiver stream (Node.js stream) to a Web API ReadableStream
    const readableNodeStream = archive as unknown as NodeJS.ReadableStream;
    const readableWebStream = new ReadableStream({
        start(controller) {
            readableNodeStream.on('data', (chunk) => {
            controller.enqueue(new Uint8Array(chunk));
            });
            readableNodeStream.on('end', () => {
            controller.close();
            });
            readableNodeStream.on('error', (err) => {
            console.error("Error in stream conversion:", err);
            controller.error(err);
            });
        },
        cancel() {
            readableNodeStream.destroy();
        },
    });


    const projectName = path.basename(projectRoot) || 'aethermind-project';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${projectName}-${timestamp}.zip`;

    return new NextResponse(readableWebStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('Error creating project archive:', error);
    return NextResponse.json({ error: `Failed to create project archive: ${error.message}` }, { status: 500 });
  }
}
