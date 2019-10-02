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


# editer info.plist avec les "Font" de react-native-vector-icons : 
#  https://github.com/oblador/react-native-vector-icons
# Initialiser Firebase 
#  https://rnfirebase.io/docs/v5.x.x/installation/ios
```

Ouvrez le projet dans XCode. Signez le code (cliquez sur l'onglet avec le nom de votre projet
puis dans l'onglet Signing, sélectionnez le compte Holusion. Faire de même dans la cible Test (à gauche de Général, sélectionnez project-nameTest)).

Ajoutez le fichier GoogleService-Info.plist (File> Add file to)

Pensez à changer les quelques paramètre permettant de forcer le build sur Ipad et de forcer le landscape.

Puis lancez le build.

## Fichiers remarquable

Ils faut copier ces fichiers au travers des différents projets :

- assets/
- src/
- App.js
- Config.js
- navigator.js
- string.json
- resources.js
- GoogleService-Info.plist
- index.js

Certains fichiers permettent de configurer plus en profondeur le projet :

### Config.js

Ce fichier stock différentes valeurs concernant le projet, par exemple les couleurs principales, secondaires et de texte sont inscrientt ici.
On peut aussi y indiquer le nom du projet (important pour que Firebase puisse retrouver les fichiers associés)

### strings.js

Ce fichier contient toutes les chaines de caractères statique du projet, Il est plus facile alors de changer une zone de texte grâce à ce fichier.

## navigator.js

Ce fichier contient la configuration des écrans, on y retrouver leur identifiant, leur composant associé et leurs options (voir la doc de react-navigation pour plus d'informations concernant les options).

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