# HomeScreen

Cette class donne les informations de la vue d'accueil, elle contient donc :

- La vue par défaut (page de bienvenue)
- La vue de téléchargement et de recherche du produit

**navigationOptions**: donne des informations concernant la navigation dans l'application, par exemple le header, ici elle est utilisée pour modifier le header et ajouter le logo de connexion

## state

légende : nom(valeur par défault): <description>

- url(null): l'url du produit trouvé
- screenState: l'état dan lequels ce trouve l'écran
- - INIT: état initial
- - DOWNLOAD_FIREBASE: l'application essaie de récupérer les fichiers présents sur firebase
- - SEARCH_PRODUCT: l'application cherche un produit sur le réseau
- - READY: l'application est prête

## prop

## method

### constructor(props, context)

- props: les propriétés hérité du parent
- context: le contexte de l'application

Bind les événements et les états

### connectToProduct()

Lance un timer de 5 secondes, à la fin du timer, si l'application n'a pas trouvé de produit, on passe en mode offline. Sinon on coupe le timer et on met à jour l'état du composant. On finit par créer un composant qui lance une notification sur l'application perd la connexion avec le produit 

### componentDidUpdate()

Est lancé lorsque l'état de l'écran est mis à jour. Ici on détecte lorsque l'écran est dans l'état **SEARCH_PRODUCT** pour lancer le scan des produits.

### componentDidMount()

Se charge de télécharger les fichier yaml et jpg sur firebase en utilisant les fonction de FirebaseController. Puis fait appel à AssetManager pour parser et mettre en cache les fichiers.

### render()

Rend DefaultComponent si on a fini de charger es fichier et qu'on ait trouvé une url ou qu'on soit en mode offline. Sinon rend SearchProductComponent.
Active toutes les vidéos correspondantes aux fichiers YAML si une url est trouvée.

### _onVisite()

Evénement lancé lorsqu'on clique sur la carte "Visite", navigue vers ThemeSelectorScreen avec les données:
{type="visite", url state.url}

### _onCatalogue()

Evénement lancé lorsqu'on clique sur la carte "Catalogue", navigue vers ThemeSelectorScreen avec les données:
{type="cataogue", url state.url}

### _onRemerciement()

Evénement lancé lorsqu'on clique sur le bouton "Remerciement", navigue vers RemerciementScreen