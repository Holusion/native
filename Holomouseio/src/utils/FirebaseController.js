import firebase from 'react-native-firebase';
import RNFS from 'react-native-fs';

export default class FirebaseController {

    constructor(projectName) {
        this.projectName = projectName;
        let firestore = firebase.firestore();
        this.collection = firestore.collection('applications').doc(projectName);
        this.unsubscribe = null;
    }
    
    downloadFile(ref, name) {
        return new Promise((resolve, reject) => {
            ref.downloadFile(`${RNFS.DocumentDirectoryPath}/${name}`).then(() => {
                resolve(`${name}`);
            }).catch(err => {
                reject(err);
            })
        })
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
                        
                        try {
                            files.push(this.downloadFile(uriRef, name));
                        } catch(err) {
                            let errMessage = `Impossible de télécharger ${name}`;

                            switch(err.code) {
                                case "storage/not-found":
                                    files.push({error: new Error(`${errMessage}: le fichier distant n'a pas été trouvé`)});
                                    break;
                                case "storage/resource-exhausted":
                                    files.push({error: new Error(`${errMessage}: plus d'espace disponible sur la tablette`)});
                                    break;
                                case "storage/project-not-found":
                                    files.push({error: new Error(`${errMessage}: le projet distant n'existe pas`)});
                                    break;
                                default:
                                    throw err;
                            }
                        }
                    }
                }
            });
        }

        return Promise.all(files).then(allFiles => allFiles.filter(elem => elem.error != null));
    }
}