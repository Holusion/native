# Usage

## Créer un nouveau projet

Lancez la commande suivante :

```
bash setup.sh <project-name>
```

Attendez que la fin de l'exécution et l'ouverture du projet dans XCode. Signez le code (cliquez sur l'onglet avec le nom de votre projet
puis dans l'onglet Signing, sélectionnez le compte Holusion. Faire de même dans la cible Test (à gauche de Général, sélectionnez project-nameTest)).

Pensez à changer les quelques paramètre permettant de forcer le build sur Ipad et de forcer le landscape.

Lancez le build. Une autre erreur devrait apparaître. Cliquez sur l'erreur, un fichier va alors s'ouvrir, il suffit de remplacer la ligne provoquant l'erreur par : 

```
return NULL
```

source: https://github.com/facebook/react-native/issues/16106

Ajoutez le fichier GoogleService-Info.plist (File> Add file to) et dans AppDelegate.m, remplacez "Holomouseio" par le nom de votre projet. Puis lancez le build.

## Configurer le projet

Rendez vous dans `/src/utils/Config.js`, il y a plusieurs variables que vous pouvez modifier. Modifier ces variables aura un effet sur toute l'application.

- primaryColor: couleur primaire, couleur des cartes par exemple
- secondaryColor: couleur secondaire, écriture, logo, etc...
- projectName: nom du projet, utile pour firebase et les headers de l'application