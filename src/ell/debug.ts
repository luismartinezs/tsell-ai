const DEBUG = false

export const logger = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args)
  }
}
