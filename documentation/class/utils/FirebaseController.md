# FirebaseController

Cette classe représente les actions que l'on peut faire avec Firebase dans le cadre d'Holomouseio

## properties

projectName: le nom du projet sur Firebase
collection: le nom de la collection où se trouve les informations du projet

## method

### constructor(projectName)

- projectName: le nom du projet

Initialise les propriétés de la classe

### downloadFile(ref, name)

- ref: référence créé à partir d'une URL (fonctionnement de Firebase)
- name: Le nom que le fichier stocké sur la tablette aura

Télécharge un fichier donnée par la paramètre **ref**, stocke le fichier dans la racine des documents de la tablette sous le nom **name**

### getFiles(collections)

- collections: tableau d'objet du type : {name:string, properties:[string]}

Crée des références à partir du tableau **collections** puis appelle **downloadFile(ref, name)** en passant les références créées en paramètre.