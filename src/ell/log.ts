// TODO: need to review how this logging works in the original ell lib
import * as fs from 'fs';
import { LogFnc } from './types';

export const createLog = (logStream: fs.WriteStream | undefined, trackingEnabled: boolean): LogFnc => (type: 'prompt' | 'response' | 'error', content: string) => {
  if (!logStream || !trackingEnabled) return;

  const timestamp = new Date().toISOString()
  const formattedContent = content.split('\n').map(line => `  ${line}`).join('\n')
  logStream.write(`${timestamp} - ${type.toUpperCase()}:\n${formattedContent}\n\n`)
}