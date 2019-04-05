# Holomouseio

Holomouseio est à l'origine une application créer pour l'université de Lille dans le cadre d'un accord DRAC. L'objectif était de numériser des objets muséaux et de les faire apparaître en hologramme. L'application ajoute une dimension interactive, permettant de visualiser des collections en sélectionnant un objet particulier ou en mode visite.

## Dépendances

### React-native

Holomouseio est une application basé sur ![React-native](https://facebook.github.io/react-native/). Cette solution a été préféré car nous sommes plus à l'aise avec les technos web. L'application a principalement été pensé pour fonctionner sur iOS, le fonctionnement sur Android n'est pas assuré.

### react-native-holusion

![react-native-holusion](https://www.npmjs.com/package/@holusion/react-native-holusion) est une API créer spécialement pour fonctionner avec react-native, elle donne des composant plus haut niveau et pas forcémment spécifique à Holomouseio. Elle donne une abstraction concernant le réseau qui donne les méthode de base pour interagir avec le produit ainsi que de la détection de produit à partir de zeroconf.

### Firebase

Nous utilisons Firebase pour stocker les fichiers nécessaire à l'application pour le rendu du texte et des images (à terme, l'idée est de rendre Holomouseio indépendant des autres outils et de permettre l'ajout des vidéos automatiquement). Nous utilisons Firebase Database pour stocker les informations et Firebase Store pour stocker les fichiers.

### react-navigation

Nous utilisons react-navigation pour naviguer entre les écrans. On peut alors passer des propriétés par navigation en utilisant la méthode push :

```
this.props.navigation.push("MyScreen", {foo: "bar"})
```

On les récupère avec getParam(string) :

```
this.bar = this.props.navigation.getParam("foo");
```

# Quelques informations sur React-native

## la différence entre prop et state

Chaques composant a des propriété et un état. La différence entre les deux est assez fine. Les prop sont immutable dans le composant, pour les modifier, il faut les modifier dans le composant qui l'utilise. Les state vont forcer le rendu du composant lorsque celui-ci change, on peut alors passer des valeur de state dans les prop d'un composant utilsé. Par exemple :

```
state {
    foo: true;
}

render() {
    // si foo change, alors render sera appelé et MyComponent sera rendu à nouveau et la prop bar aura la valeur de foo
    <MyComponent bar={this.state.foo} />
}
```