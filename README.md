# Usage

## Créer un nouveau projet

Lancez la commande suivante :

```
npx react-native init <nom_du_projet>
cd <nom_du_projet>
```

Editer `package.json`. Dans le champ **name**, donner un nom en minuscules, pouvant comporter des tirets. Utiliser le nom de l'application dans `projectName`. Example : 

```
  {
    "name": "egger",
    "projectName":"Egger",
    [...]
  }
```

Ils faut copier ces fichiers au travers des différents projets :

- App.js
- index.js
- theme.js

Ils sont disponibles dans `_template/`


### Installer les dépendances npm

```
npm i "@holusion/react-native-holusion" "@react-native-community/netinfo" "native-base" \
      "react-native-firebase" "react-native-fs" "react-native-gesture-handler" "react-native-vector-icons" "react-native-user-inactivity"\
    "react-native-zeroconf" \
    "react-navigation" "react-navigation-stack"  \
    "react-redux"
```


### Initialiser Firebase

https://rnfirebase.io/docs/v5.x.x/installation/ios

Dans `ios/<nom_du_projet>/AppDelegate.m`, ajouter :

dans les en-têtes :

```
    #import <Firebase.h>
```

au début de la méthode `didFinishLaunchingWithOptions` :

```
    [FIRApp configure];
```


Juste en dessous de la première ligne `platform :ios, '9.0'`, on peut ajouter : 

```
    ENV['COCOAPODS_DISABLE_STATS'] = 'true'
```

### Installer les librairies nécessaires

avec cocoapods (`gem install cocoapods` si absent) :

```
  (cd ios && pod install)
```

### Configurer xcode

Ouvrez XCode. Ouvrir le fichier `<nom_du_projet>.xcworkspace`, **PAS** le fichier `.xcodeproj`!

Dans le volet de gauche, cliquer sur le nom du projet pour ouvrir ses propriétés.

Donner au projet un identifiant sous la forme :

```
com.holusion.native.<nom_du_projet>
```

#### signature du code

pour la cible `<nom_du_projet>` :

Dans la configuration du projet, onglet **signing & capabilities** :

sélectionner la *Team* Holusion. 


Pour la cible `<nom_du_projet>Test`, onglet **signing & capabilities** : Sélectionner la *Team* Holusion

### Ajout des fichiers supplémentaires

Ajoutez le fichier **GoogleService-Info.plist** (stocké à la racine du dépôt git). Dans le menu de xcode, cliquer sur :`File > Add files to <nom_du_projet>`

Cocher la case **copy items if needed**


Ajoutez les `font` de [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) dans `ios/Info.plist`. Copier les lignes : 
```
<key>UIAppFonts</key>
<array>
    <string>AntDesign.ttf</string>
    <string>Entypo.ttf</string>
    <string>EvilIcons.ttf</string>
    <string>Feather.ttf</string>
    <string>FontAwesome.ttf</string>
    <string>FontAwesome5_Brands.ttf</string>
    <string>FontAwesome5_Regular.ttf</string>
    <string>FontAwesome5_Solid.ttf</string>
    <string>Foundation.ttf</string>
    <string>Ionicons.ttf</string>
    <string>MaterialIcons.ttf</string>
    <string>MaterialCommunityIcons.ttf</string>
    <string>SimpleLineIcons.ttf</string>
    <string>Octicons.ttf</string>
    <string>Zocial.ttf</string>
</array>
```

### Paramètres généraux

Dans l'onglet général :

- Changer l'id de l'application pour `com.holusion.native.<nom_du_projet>``
- Dans **Deployment info**:
    - cocher `ipad` uniquement (selon usage)
    - Fournir les orientations nécessaires



## Troubleshooting

### RNZeroconf.lib emet un erreur  la compilation

La bibliothèque n'est pas à jour pour react-native v0.6 ou plus, avec de la chance la pull request : https://github.com/balthazar/react-native-zeroconf/pull/97. En attendant il
faut récupérer le commit de la pull request et ajouter le fichier podspec dans le dossier node-modules/react-native-zeroconf du projet

### L'appli renvoie une erreur concernant FIRApp

Il faut ajouter un morceau de code dans le AppDelegate.m du projet (sur XCode)

```c#
#import <Firebase.h>

[FIRApp configure]; // Au dessus de RCTBridge dans la méthode didFinishLaunchingWithOptions
```

source : https://rnfirebase.io/docs/v5.x.x/installation/ios

### react-native-markdown-renderer envoie des warning

La bibliothèque utiliser pour afficher du texte markdown n'est plus maintenu : https://github.com/mientjan/react-native-markdown-renderer/issues/115
Il faudra probablement penser à trouver une autre solution lors de la prchaine grosse mise à jour de React

### Synchroniser react-native-holusion

react-native ne fonctionne pas avec npm link. Pour éviter de devoir publier une version à chaque fois, on utilise rsync :

    rsync -a --exclude node_modules react-native-holusion/ StOmer/node_modules/\@holusion/react-native-holusion