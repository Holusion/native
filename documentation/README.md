# Holomouseio

Holomouseio est à l'origine une application créer pour l'université de Lille dans le cadre d'un accord DRAC. L'objectif était de numériser des objets muséaux et de les faire apparaître en hologramme. L'application ajoute une dimension interactive, permettant de visualiser des collections en sélectionnant un objet particulier ou en mode visite.

## Hiérarchie

Il y a deux projet principaux :

- Holomouseio_Template: template permettant de créer une application type Holomouseio. Le template est directement testable via XCode
- react-native-holusion: API permettant de faire le pont entre l'application et les informations externe comme le dialogue réseau

### Hoomouseio_Template

L'application est composé de plusieurs dossier

- **ios**: contient tout les fichiers nécessaire pour l'éxécution sur XCode, le fichier Podfile donne des dépendances qu'il faut installer et qui ne peuvent pas être simplement linker. L'éxécution de `pod install` va mettre à jour le fichier <nom-projet>.xcworkspace, le fichier à ouvrir dans XCode. 
- **android**: contient tout les fichiers nécessaire pour l'éxécution sur android
- **assets**: contient les assets de l'application, seul le dossiers icons sera importer (les autre objets étant téléchargé via Firebase)
- **native-base-theme**: contient les informations de thèmes pour les objets provenant de native-base
- **src**: contient les sources du projet
  - **components**: contient les composants, les composants sont des morceaux que l'on ajoute aux écrans
    - **screenComponents**: contient des composants qui prennent tout l'écran, ce ne sont pas des écrans car il n'entre pas dans la navigation 
  - **screens**: contient les écrans
  - **utils**: contient de la logique utile tels qu'une extension de l'api réseau pa exemple

### react-native-holusion

- **src**: contient les sources de l'API

## Dépendances

### React-native

Holomouseio est une application basé sur ![React-native](https://facebook.github.io/react-native/). Cette solution a été préféré car nous sommes plus à l'aise avec les technos web. L'application a principalement été pensé pour fonctionner sur iOS, le fonctionnement sur Android n'est pas assuré.

### react-native-holusion

![react-native-holusion](https://www.npmjs.com/package/@holusion/react-native-holusion) est une API créer spécialement pour fonctionner avec react-native, elle donne des composant plus haut niveau et pas forcémment spécifique à Holomouseio. Elle donne une abstraction concernant le réseau qui donne les méthode de base pour interagir avec le produit ainsi que de la détection de produit à partir de zeroconf.

### Firebase

Nous utilisons Firebase pour stocker les fichiers nécessaire à l'application pour le rendu du texte et des images (à terme, l'idée est de rendre Holomouseio indépendant des autres outils et de permettre l'ajout des vidéos automatiquement). Nous utilisons Firebase Database pour stocker les informations et Firebase Store pour stocker les fichiers.

### react-navigation

Nous utilisons react-navigation pour naviguer entre les écrans. On peut alors passer des propriétés par navigation en utilisant la méthode push :

```javascript
this.props.navigation.push("MyScreen", {foo: "bar"})
```

On les récupère avec getParam(string) :

```javascript
this.bar = this.props.navigation.getParam("foo");
```

# Quelques informations sur React-native

## la différence entre prop et state

Chaques composant a des propriété et un état. La différence entre les deux est assez fine. Les prop sont immutable dans le composant, pour les modifier, il faut les modifier dans le composant qui l'utilise. Les state vont forcer le rendu du composant lorsque celui-ci change, on peut alors passer des valeur de state dans les prop d'un composant utilsé. Par exemple :

```javascript
state {
    foo: true;
}

render() {
    // si foo change, alors render sera appelé et MyComponent sera rendu à nouveau et la prop bar aura la valeur de foo
    <MyComponent bar={this.state.foo} />
}
```