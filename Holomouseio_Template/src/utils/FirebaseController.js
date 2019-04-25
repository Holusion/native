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
                        if(prop != "hide") {
                            let uri = documentData[prop];
                            let uriRef = storage.refFromURL(uri);
                            let uriSplit = uri.split('/');
                            let name = uriSplit[uriSplit.length - 1];

                            try {
                                // essaie de fetch l'url pour vérifier la disponibilité
                                await uriRef.getDownloadURL();   
                                files.push(this.downloadFile(uriRef, name));
                            } catch(err) {
                                throw {error: err, name: name, uri: uri};
                            }
                        }
                    }
                }
            });
        }
        return Promise.all(files);
    }
}