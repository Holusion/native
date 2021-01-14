

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