# Usage

## Créer un nouveau projet

Lancez la commande suivante :

```
bash setup.sh <project-name>
```

Attendez que la fin de l'exécution et l'ouverture du projet dans XCode. Signez le code (cliquez sur l'onglet avec le nom de votre projet
puis dans l'onglet Signing, sélectionnez le compte Holusion. Faire de même dans la cible Test (à gauche de Général, sélectionnez project-nameTest)).

Cliquez sur Run, le build devrait retourner une erreur. Lancer le script :

```
bash postInstall.sh
```

Celà va générer les fichiers nécessaire pour la compilation, relancez le build. Une autre erreur devrait apparaître. Cliquez sur l'erreur, un fichier va alors s'ouvrir, il suffit de remplacer la ligne par : 

```
return NULL
```

Ajoutez le fichier GoogleService-Info.plist (File> Add file to) et lancez le build.

Si la tablette donne une erreur : 