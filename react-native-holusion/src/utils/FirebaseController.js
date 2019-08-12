import firebase from 'react-native-firebase';
import RNFS from 'react-native-fs';
import FirebaseDownloadError from '../errors/FirebaseDownloadError';

export default class FirebaseController {

    constructor(projectName) {
        this.projectName = projectName;
        let firestore = firebase.firestore();
        this.collection = firestore.collection('applications').doc(projectName);
        this.unsubscribe = null;
        this.cache = {}
        RNFS.exists(`${RNFS.DocumentDirectoryPath}/${projectName}/cache.json`).then(res => {
            if(res) {
                RNFS.readFile(`${RNFS.DocumentDirectoryPath}/${projectName}/cache.json`).then(json => this.cache = JSON.parse(json));
            }
        })
    }
    
    async downloadFile(ref, name) {
        const filePath = `${RNFS.DocumentDirectoryPath}/${this.projectName}/${name}`;

        try {
            const metadata = await ref.getMetadata();
            let lastUpdated = metadata.updated;
            if(!(name in this.cache) || lastUpdated !== this.cache[name].updated || !(await RNFS.exists(filePath))) {
                if(await RNFS.exists(filePath)) {
                    await RNFS.unlink(filePath)
                }
                this.cache[name] = metadata;
                await ref.downloadFile(filePath);
            }
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
            const collected = await this.collection.collection(collect['name']);
            const docs = (await collected.get({source: "server"})).docs;
            const datas = docs.map(document => document.data());
            const notHide = datas.filter(data => !data.hide);
            const allFilesToDownload = notHide.map(elem => Object.values(elem)).flat();
            let allFilesToRemove = [];

            for(let c in this.cache) {
                const ref = `gs://${this.cache[c].bucket}/${this.cache[c].name}`;
                if(!allFilesToDownload.find(elem => elem === ref)){
                    allFilesToRemove.push(c);
                    delete this.cache[c];
                }
            }

            for(let f of allFilesToRemove) {
                await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${this.projectName}/${f}`)
            }

            return allFilesToDownload
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
        const errors = (await Promise.all(ops)).filter(elem => elem instanceof Error);
        await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${this.projectName}/cache.json`, JSON.stringify(this.cache), 'utf8');
        return errors;
    }
}