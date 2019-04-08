# ObjectScreen

Cette classe représente l'écran lorsqu'un objet est sélectionné, il gère tout les bouton de cette page ainsi que les modal créer lors de l'appuie de certains boutons.

**navigationOptions**: donne des informations concernant la navigation dans l'application, par exemple le header, ici elle est utilisée pour modifier le header et ajouter le logo de connexion

## state

légende : nom(valeur par défault): <description>

modalVisible(-1): l'identifiant du modal actuellement visible, -1 si aucun moda visible
currentVideoIndex(this.props.navigation.getParam('objId')): l'objet sélectionné courrant

## prop

- navigation.getParam("url"): l'url du produit
- navigation.getParam("objList"): la liste objets appartenant au thème sélectionné
- navigation.getParam("objId"): id de l'objet à afficher lors de l'appariition de la fenêtre
- navigation.getParam("type"): le type de la carte sélectionnée dans HomeScreen

## method

### activeModal(number)

- number: id du modal à activer

active le modal identifier par **number**

### launchVideo(videoName)

- videoName: le nom de la vidéo à lancer sur le produit

Envoie plusieurs requête au serveur pour désactiver toutes les vidéos excepté celle passée en paramètre. Puis envoie la requête "play" au serveur pour lancer la vidéo passé en paramètre.

### renderModal(number)

- number: l'identifiant du modal à rendre

Fait le rendu d'un modal par rapport à son numéro. Si le numéro est 0, alors on rend le modal alors le texte sera ses références, sinon on récupère la propriété YAML Texte complémentaire <number> et on l'affiche.

### generateComplButton()

Fait le rendu des boutons pour les textes complémentaire et les références de l'objet. Lorsque ces boutons sont cliqués, on active le modal correspondant.

### generateFooter()

Fait le rendu du pied de page, c'est à dire l'onglet qui permet de lire les remerciements en fonction d'un objet.

### generateAllModal()

Fait le rendu de tout les modals. Les modals ne sont pas comme des écran, c'est ce qui s'apparente le plus à un fenêtre popup. Il faut donc les rendre d'une seule fois.
React-native s'occupe de les faire apparaitre et disparaitre de manière dynamique.

### renderLogo()

Rend les logo lié au fichier yaml de l'objet courrant 

### scrollToText()

Evénement qui se déclenche lorsqu'on appuie sur le bouton de scroll bas, fait scroller jusqu'au texte

### scrollToImage

Evénement qui se déclencle lorsqu'on appuie sur le bouton de scroll haut, fait scroller jusqu'au début de la page, soit l'image.

### render()

Fait le rendu de l'écran, On fait le rendu de tout les modals, puis on fait une grille de trois colonnes :

| Panel précédent | Panel principal | Panel suivant |

Le panel principal correspond aux informations récupérer par les fichier yaml, les deux autres panels permettent de changer d'objet. Le panel principal est scrollable, il contient l'image de l'objet, le bouton de scroll texte, le bouton de scroll image, le texte (ou info si en mode catalogue), les boutons de texte complémentaire, les logos

### _onNext()

Evénement déclenché lorsqu'on appuie sur le panel suivant. Change l'état de l'écran, qui permet de refaire le rendu avec l'objet suivant et lance la vidéo associée. Si il n'y a pas de suivant, on revient au début.

### _onPrevious()

Evénement déclenché lorsqu'on appuie sur le panel précédent. Change l'état de l'écran, qui permet de refaire le rendu avec l'objet précédent et lance la vidéo associée. Si il n'y a pas de précédent, on se positionne au dernier objet.

### constructor(props, context)

- props: les propriétés hérité du parent
- context: le contexte de l'application

Met à jour le logo de connexion et bind les événements