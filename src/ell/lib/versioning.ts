// TODO this file should be changed to write to sqlite
import * as fs from 'fs/promises';
import * as path from 'path';

export interface PromptVersion {
	id: string;
	name: string;
	source: string;
	dependencies: string[];
	createdAt: Date;
	versionNumber: number;
	invocations: number;
}

export interface PromptInvocation {
	id: string;
	promptId: string;
	inputs: any;
	output: any;
	invokedAt: Date;
}

// NOTE: DB is a JSON file for now, but we should use a proper DB in the future
const DB_FILE = path.join(__dirname, 'prompt_log.json');

async function initDB() {
	try {
		await fs.access(DB_FILE);
	} catch {
		await fs.writeFile(DB_FILE, JSON.stringify({ prompts: [], invocations: [] }));
	}
}

async function readDB() {
	try {
		const data = await fs.readFile(DB_FILE, 'utf-8');
		if (!data.trim()) {
			console.warn('DB file is empty. Returning an empty object.');
			return {};
		}
		return JSON.parse(data);
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error('Invalid JSON in DB file:', error.message);
		} else {
			console.error('Error reading DB file:', error);
		}
		// Return a default value or throw the error based on your requirements
		return {};
		// or
		// throw error;
	}
}

async function writeDB(data: any) {
	await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

export async function logPromptVersion(prompt: PromptVersion) {
	await initDB();
	const db = await readDB();
	if (!db.prompts) {
		db.prompts = [];
	}
	db.prompts.push(prompt);
	await writeDB(db);
}

export async function logInvocation(invocation: PromptInvocation) {
	await initDB();
	const db = await readDB();
	if (!Array.isArray(db.invocations)) {
		db.invocations = [];
	}
	db.invocations.push(invocation);
	await writeDB(db);
}