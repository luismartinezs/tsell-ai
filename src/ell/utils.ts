import { Prompt } from "./types";
import { Message } from "./messages/types";
import { v4 as uuidv4 } from 'uuid';
import * as ts from 'typescript';
import { logInvocation, logPromptVersion, PromptInvocation, PromptVersion } from "./lib/versioning";
import { system, user } from "./messages";

export function logMessages(messages) {
  return messages.map(msg => `${msg.role}: ${typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content}`).join('\n')
}

export function getLexicalClosure(sourceCode: string): string[] {
	const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);
	const dependencies: string[] = [];

	function visit(node: ts.Node) {
		if (ts.isIdentifier(node)) {
			dependencies.push(node.text);
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return dependencies;
}

// TODO implement proper types compatible with ell.simple fnc
export async function versionedPrompt<PromptFn extends (...args: any[]) => any>(name: string, promptFn: PromptFn) {
	const sourceCode = promptFn.toString();
	const dependencies = getLexicalClosure(sourceCode);

	const promptVersion: PromptVersion = {
		id: uuidv4(),
		name,
		source: sourceCode,
		dependencies,
		createdAt: new Date(),
		versionNumber: 1,
		invocations: 0
	};

	await logPromptVersion(promptVersion);

	return async function (...args: Parameters<PromptFn>): Promise<ReturnType<PromptFn>> {
		const invocationId = uuidv4();
		const result = promptFn(...args);

		const invocation: PromptInvocation = {
			id: invocationId,
			promptId: promptVersion.id,
			inputs: args,
			output: result,
			invokedAt: new Date()
		};

		await logInvocation(invocation);
		promptVersion.invocations++;
		await logPromptVersion(promptVersion);

		return result;
	};
}

export const parsePrompt = (systemMessage: string, prompt: Prompt): Array<Message> => {
  if (typeof prompt === 'string') {
    return [
      system(systemMessage),
      user(prompt)
    ]
  }
  return prompt
}