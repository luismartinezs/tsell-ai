import * as fs from 'fs'
import * as path from 'path'
import { system, user, assistant } from './messages/index';
import { createLog } from './log';
import { createSimple } from './lmp/simple';
import { CreateEll } from './types';
import { defaultConfig } from './config';
import { createComplex } from './lmp/complex';
import { tool } from './lmp/tool';

export const createEll: CreateEll = (config = {}) => {
  const { store, trackingEnabled = true } = { ...defaultConfig, ...config };

  const logStream = store
    ? fs.createWriteStream(path.join(store, `ell_${Date.now()}.log`), { flags: 'a' })
    : undefined;
  const log = createLog(logStream, trackingEnabled);

  return {
    simple: createSimple({ log }),
    complex: createComplex({ log }),
    system,
    user,
    assistant,
    tool
  }
}
