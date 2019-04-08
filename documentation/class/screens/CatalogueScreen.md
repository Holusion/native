# CataogueScreen

Cette classe représente la vue lorsque l'on navigue en mode catalogue et qu'on a choisit une collection

**navigationOptions**: donne des informations concernant la navigation dans l'application, par exemple le header, ici elle est utilisée pour modifier le header et ajouter le logo de connexion

## state

légende : nom(valeur par défault): <description>

## prop

- navigation.getParam("url"): l'url du produit
- navigation.getParam("objList"): la liste objets appartenant au thème sélectionné
- navigation.getParam("type"): le type de la carte sélectionnée dans HomeScreen

## method

### constructor(props, context)

- props: les propriétés hérité du parent
- context: le contexte de l'application

Met à jour le logo de connexion et bind les événements

### componentDidMount()

Active toutes les vidéos correspondantes aux fichiers YAML si une url est trouvée.

### render()

Récupère la liste des titres des objets et affiche la playlist sous forme de carte

### _onPlayslistItem(id)

Evénement qui fait naviguer vers ObjectScreen en fonction de l'id (la carte cliqué)