# HomeScreen

Cette class donne les informations de la vue d'accueil, elle contient donc :

- La vue par défaut (page de bienvenue)
- La vue de téléchargement et de recherche du produit

**navigationOptions**: donne des informations concernant la navigation dans l'application, par exemple le header, ici elle est utilisée pour modifier le header et ajouter le logo de connexion

## state

légende : nom(valeur par défault): <description>

- url(null): l'url du produit trouvé
- offlineMode(false): si le produit n'est pas trouvé, cette valeur devient **true**
- loading(true): au début, l'application se charge de trouver le produit, etc... quand elle a fini, loading devient **false**

## prop

## method

### constructor(props, context)

- props: les propriétés hérité du parent
- context: le contexte de l'application

Bind les événements. Lance un timer de 5 secondes, à la fin du timer, si l'application n'a pas trouvé de produit, on passe en offline. Sinon on coupe le timer et on met à jour l'état du composant. On finit par créer un composant qui lance une notification sur l'application perd la connexion avec le produit 

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

----------------------------------------------------------

# class:DefaultComponent

## state

## prop

- url: l'url du produit trouvé 
- visite: la fonction d'événement lorsqu'on clique sur visite
- catalogue: la fonction d'événement lorsqu'on clique sur catalogue
- remerciement: la fonction d'événement lorsqu'on clique sur remerciement

## method

### componentDidMount()

On initialise l'animation du texte lorsque le composant est monté

### render()

Rendu du composant, c'est ici que sont ajoutés les cartes et le texte.

### spring()

Définition de l'animation de spring (une sorte de bump à ressort)

----------------------------------------------------------

# class:SearchProductComponent

## state

## prop

- loading: boolean définissant si l'application est dans l'état où elle essaie de télécharger les fichiers stockés sur firebase

## method

### render()

Rend la page de chargement en fonction de l'état de la propriété loading, si loading vaut **vrai** alors le texte correspond au texte de téléchargement, sinon le texte de recherche du produit