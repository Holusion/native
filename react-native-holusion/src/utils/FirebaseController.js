import firebase from 'react-native-firebase';
import RNFS from 'react-native-fs';
import FirebaseDownloadError from '../errors/FirebaseDownloadError';

export default class FirebaseController {

    constructor(projectName) {
        this.projectName = projectName;
        let firestore = firebase.firestore();
        this.collection = firestore.collection('applications').doc(projectName);
        this.unsubscribe = null;
    }
    
    async downloadFile(ref, name) {
        try {
            await ref.downloadFile(`${RNFS.DocumentDirectoryPath}/${name}`);
        } catch(err) {
            let errMessage = `Impossible de télécharger ${name}`;

            switch(err.code) {
                case "storage/object-not-found":
                case "storage/not-found":
                    return new FirebaseDownloadError(name, `${errMessage}: le fichier distant n'a pas été trouvé (${ref})`);
                case "storage/resource-exhausted":
                    return new FirebaseDownloadError(name, `${errMessage}: plus d'espace disponible sur la tablette`);
                case "storage/project-not-found":
                    return new FirebaseDownloadError(name, `${errMessage}: le projet distant n'existe pas`);
                default:
                    return new FirebaseDownloadError(name, err.message);
            }
        }
    }

    // return list of error file
    async getFiles(collections) {
        let storage = firebase.storage();
        let files = [];
        
        for(let collect of collections) {
            let value = await this.collection.collection(collect['name']).get({source: "server"});
            value.forEach(async (document) => {
                let documentData = document.data();
                let hide = documentData['hide'];
                if(!hide) {
                    for(let prop of collect['properties']) {
                        let uri = documentData[prop];
                        let uriRef = storage.refFromURL(uri);
                        let uriSplit = uri.split('/');
                        let name = uriSplit[uriSplit.length - 1];

                        let downloaded = this.downloadFile(uriRef, name);
                        files.push(downloaded);
                    }
                }
            });
        }

        let errors = await Promise.all(files);
        errors = errors.filter(elem => elem != null);

        return errors;
    }
}