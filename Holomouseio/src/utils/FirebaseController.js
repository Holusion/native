import firebase from 'react-native-firebase';
import RNFS from 'react-native-fs';

export default class FirebaseController {

    constructor(projectName) {
        this.projectName = projectName;
        this.collection = firebase.firestore().collection('applications').doc(projectName);
        this.unsubscribe = null;
    }

    downloadFile(ref, name) {
        return new Promise((resolve, reject) => {
            ref.downloadFile(`${RNFS.DocumentDirectoryPath}/${name}`).then(() => {
                resolve();
            }).catch(err => {
                resolve();
            })
        })
    }

    async getFiles(collections) {
        let storage = firebase.storage();
        let files = [];

        for(let collect of collections) {
            try {
                let value = await this.collection.collection(collect['name']).get();

                value.forEach((document) => {
                    let documentData = document.data();
        
                    for(let prop of collect['properties']) {
                        let uri = documentData[prop];
                        let uriRef = storage.refFromURL(uri);
                        let uriSplit = uri.split('/');
                        let name = uriSplit[uriSplit.length - 1];
                        files.push(this.downloadFile(uriRef, name));
                    }
        
                });
            } catch(err) {

            }
        }

        return Promise.all(files);
    }
}