# Usage

## Créer un nouveau projet

Lancez la commande suivante :

```
react-native init <project-name>

cd <project-name>
npm i "@holusion/react-native-holusion" "@react-native-community/netinfo" "native-base" \
      "react-native-firebase" "react-native-fs" "react-native-gesture-handler" "react-native-vector-icons" \
    "react-native-zeroconf" \
    "react-navigation" "react-navigation-stack"  \
    "react-redux"
(cd ios && pod install)
```

Ouvrez le projet dans XCode. Signez le code (cliquez sur l'onglet avec le nom de votre projet
puis dans l'onglet Signing, sélectionnez le compte Holusion. Faire de même dans la cible Test (à gauche de Général, sélectionnez project-nameTest)).

Ajoutez le fichier GoogleService-Info.plist (File> Add file to)

Ajoutez les `font` de [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) dans `Info.plist`. Copier les lignes : 
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
Pensez à changer les quelques paramètre permettant de forcer le build sur Ipad et de forcer le landscape.


Initialiser [Firebase](https://rnfirebase.io/docs/v5.x.x/installation/ios)

Puis lancez le build.

## Fichiers importants

Ils faut copier ces fichiers au travers des différents projets :

- App.js
- index.js
- theme.js

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