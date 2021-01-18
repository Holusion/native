

export class FileError extends Error {
  constructor(sourceFile, messageOrError) {
    const message = typeof messageOrError === "string"? messageOrError: messageOrError.message;
    super(message);
    this.sourceFile = sourceFile;
    this.code = messageOrError.code;
    this.stack = messageOrError.stack;
  }
  toString(){
    return `Error from ${this.sourceFile} : ${this.message}`
  }
}

/**
 * A reasonable AbortError mock (which is normally constryucted from DOMException an thrown by `fetch`)
 */
export class AbortError extends Error {
  constructor(message="The operation was aborted."){
    super(message);
    this.name = "AbortError";
  }
  toString(){
    return `${this.name}: ${this.message}`;
  }
}