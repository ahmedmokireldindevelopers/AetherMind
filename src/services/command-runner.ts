'use server';

/**
 * @fileOverview Service for executing predefined commands securely on the server.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define allowed commands to prevent arbitrary execution
// IMPORTANT: This list MUST be strictly controlled in a real application.
// Consider using a configuration file or database for more complex scenarios.
const ALLOWED_COMMANDS: Record<string, string> = {
    'npm install': 'npm install',
    'npm ci': 'npm ci', // Often preferred for CI/CD
    'npm run build': 'npm run build',
    'git status': 'git status',
    'git pull': 'git pull', // Example: allow pulling updates
    // Add other safe, necessary commands here
    // 'npm run lint': 'npm run lint',
    // 'npm run test': 'npm run test',
};

// Define disallowed patterns (example)
const DISALLOWED_PATTERNS = [
    'rm -rf',
    '&&', // Prevent command chaining in simple checks
    '|',  // Prevent piping in simple checks
    ';',  // Prevent sequence execution in simple checks
    '`',  // Prevent command substitution
    '$(', // Prevent command substitution
    '../', // Prevent directory traversal attacks (basic)
];


interface CommandResult {
  stdout: string;
  stderr: string;
}

/**
 * Executes a predefined command securely.
 *
 * @param command The command string requested by the user.
 * @returns A promise resolving to an object containing stdout and stderr.
 * @throws An error if the command is not allowed or execution fails.
 */
export async function runCommand(command: string): Promise<CommandResult> {
  console.log(`Received command request: ${command}`); // Log received command

  // 1. Strict Validation: Check against the allowlist
  if (!ALLOWED_COMMANDS[command]) {
      console.error(`Command not allowed: ${command}`);
      throw new Error(`Command not allowed: "${command}". Only predefined commands are permitted.`);
  }

   // 2. Basic Disallowed Pattern Check (extra safety, but allowlist is primary)
   if (DISALLOWED_PATTERNS.some(pattern => command.includes(pattern))) {
      console.error(`Command contains disallowed pattern: ${command}`);
      throw new Error(`Command contains disallowed characters or patterns.`);
   }

  const actualCommandToRun = ALLOWED_COMMANDS[command];
  console.log(`Executing allowed command: ${actualCommandToRun}`); // Log the command being executed

  try {
    // Execute the command in the project's root directory
    const { stdout, stderr } = await execAsync(actualCommandToRun, { cwd: process.cwd() });

    console.log(`Command stdout:\n${stdout}`);
    if (stderr) {
        console.error(`Command stderr:\n${stderr}`);
    }

    return { stdout, stderr };
  } catch (error: any) {
    // Log the detailed error on the server
    console.error(`Command execution failed for: "${actualCommandToRun}"`);
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Signal: ${error.signal}`);
    console.error(`Stderr: ${error.stderr}`);
    console.error(`Stdout: ${error.stdout}`); // Sometimes error details are in stdout
    console.error(`Full Error Object:`, error);

    // Return a user-friendly error message, potentially including stderr
    // Be cautious about leaking sensitive information in stderr.
    const errorMessage = error.stderr || error.message || 'Command execution failed.';
    throw new Error(`Command execution failed: ${errorMessage.split('\n')[0]}`); // Return first line of error
  }
}
