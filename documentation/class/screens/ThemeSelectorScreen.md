# ThemeSelectorScreen

Cette classe représente l'écran de sélection de thème ou de collection

**navigationOptions**: donne des informations concernant la navigation dans l'application, par exemple le header, ici elle est utilisée pour modifier le header et ajouter le logo de connexion

## state

légende : nom(valeur par défault): <description>

## prop

- navigation.getParam("url"): url du produit
- navigation.getParam("type"): type de la carte choisie dans HomeScreen ("viste" ou "catalogue")
- 

## method

### constructor(props, context)

- props: les propriétés hérité du parent
- context: le contexte de l'application

Met à jour le logo de connexion et bind les événements

### componentDidMount()

Active toutes les vidéos correspondantes aux fichiers YAML si une url est trouvée.

### render()

Affiche une liste avec pour couleur d'arrière plan une alternance de couleur primaire et de fond transparent. Le texte affiché dépend de la propriété de navigation concernant le type (catalogue ou visite)

### _onSelection(name)

Evénement qui fait naviguer vers ObjectScreen si le composant courant est de type "visite" ou vers CatalogueScreen si le composant est de type "catalogue"