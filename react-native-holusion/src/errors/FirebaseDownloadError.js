export default class FirebaseDownloadError extends Error {
    constructor(fileName, message) {
        super(message);
        this.fileName = fileName;
    }
}