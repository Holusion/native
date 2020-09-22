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

**WARNING** : Installer les dépendances en `latest` avec NPM préente un risque d'incompatibilité. ça permet d'être à jour au moment de la création de l'app mais par sécurité, on peut aussi copier-coller les versions d'une dernière version fonctionelle connue.

```
npm i "@holusion/react-native-holusion" "@react-native-community/netinfo" "native-base" \
      "react-native-firebase" "react-native-fs" "react-native-gesture-handler" "react-native-vector-icons" "react-native-user-inactivity"\
    "react-native-zeroconf" \
    "react-navigation" "react-navigation-stack"  \
    "react-redux" \
    "@react-native-community/masked-view" "react-native-safe-area-context"
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


Ajoutez les `font` de [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) dans `ios/<Project_name>/Info.plist`. Copier les lignes : 
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
### Permissions

**iOS 14** : Ajouter la permission de scanner avec zeroconf ([react-native-zeroconf](https://github.com/balthazar/react-native-zeroconf#ios-14-permissions)).

```
<key>NSBonjourServices</key>
	<array>
		<string>_workstation._tcp.</string>
	</array>
<key>NSLocalNetworkUsageDescription</key>
<string>Rechercher automatiquement les équipements holusion sur le réseau</string>
```

### Paramètres généraux

Dans l'onglet général :

- Changer l'id de l'application pour `com.holusion.native.<nom_du_projet>``
- Dans **Deployment info**:
    - cocher `ipad` uniquement (selon usage)
    - Fournir les orientations nécessaires
    - cocher `this app requires fullscreen` (nécessaire pour la publication sur appStore Connect)



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

    rsync -a --exclude node_modules react-native-holusion/ <project_name>/node_modules/\@holusion/react-native-holusion
    
    # Ou pour le garder à jour : 
    fswatch -o react-native-holusion| while read f; do rsync -a --exclude node_modules react-native-holusion/ <project_name>/node_modules/@holusion/react-native-holusion; done


### Ajouter un nouvel iPad

Faire la configuration initiale pour `s.dumetz@holusion.com`.

Penser à renommer l'iPad une fois démarré dans `Réglages > Général > Nom`. et désactiver le vérouillage d'écran dans `Réglages > Luymiunosité et affichage > Verouillage automatique`.

Connecter l'iPad au macBook

Retirer les apps inutiles : Dans `Xcode > Window > Devices and simulator`, séléctionner l'iPad et supprimer toutes les applications.

Dans Xcode, ouvrir le projet et naviguer vers l'onglet `Signing and Capabilities`. Cliquer sur `Register`.

L'iPad est prêt à être utilisé.