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
            await ref.downloadFile(`${RNFS.DocumentDirectoryPath}/${this.projectName}/${name}`);
        } catch(err) {
            let errMessage = `Impossible de télécharger ${name}`;

            switch(err.code) {
                case "storage/object-not-found":
                case "storage/not-found":
                    throw new FirebaseDownloadError(name, `${errMessage}: le fichier distant n'a pas été trouvé (${ref})`);
                case "storage/resource-exhausted":
                    throw new FirebaseDownloadError(name, `${errMessage}: plus d'espace disponible sur la tablette`);
                case "storage/project-not-found":
                    throw new FirebaseDownloadError(name, `${errMessage}: le projet distant n'existe pas`);
                default:
                    throw new FirebaseDownloadError(name, err.message);
            }
        }
    }

    // return list of error file
    async getFiles(collections) {
        let storage = firebase.storage();
        
        let res = collections.map(async collect => {
            return (await this.collection.collection(collect['name']).get({source: "server"})).docs
                .map(document => document.data())
                .filter(data => !data.hide)
                .reduce((acc, data) => {
                    for(let prop of collect['properties']) {
                        acc.push(data[prop])
                    }
                    return acc;
                }, [])
                .map(async elem => {
                    if(elem) {
                        const regex = /^gs:\/\/|^http:\/\/|^https:\/\//
                        if(!regex.test(elem)) return new FirebaseDownloadError(elem, `${elem} ne peux pas être téléchargé car l'url spécifié ne commence pas par gs://, http:// ou https://`)

                        let split = elem.split('/');
                        let name = split[split.length - 1];
                        try {
                            return await this.downloadFile(storage.refFromURL(elem), name);
                        } catch(err) {
                            return err
                        }
                    }
                })
        })
        

        let ops = (await Promise.all(res)).reduce((a, b) => a.concat(b));
        return (await Promise.all(ops)).filter(elem => elem instanceof Error);
    }
}