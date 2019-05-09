import HomeScreen from "./src/screens/HomeScreen";
import RemerciementScreen from "./src/screens/RemerciementScreen";
import ThemeSelectorScreen from "./src/screens/ThemeSelectorScreen";
import CatalogueScreen from "./src/screens/CatalogueScreen";
import ObjectScreen from "./src/screens/ObjectScreen";
import ObjectRemerciementsScreen from "./src/screens/ObjectRemerciementsScreen";
import SetupScreen from "./src/screens/SetupScreen";

export const navigator = {
    setup: {
        id: "Setup",
        screen: SetupScreen,
        options: {"isHeader": true, "title": "Setup"}
    },
    home: {
        id: "Home",
        screen: HomeScreen,
        options: {"isHeader": true, "title": "Accueil"}
    },
    remerciements: {
        id: "Remerciements",
        screen: RemerciementScreen,
        options: {"title": "Remerciements"}
    },
    selection: {
        id: "Selection",
        screen: ThemeSelectorScreen,
        options: {"title": "Sélection"}
    },
    catalogue: {
        id: "Catalogue",
        screen: CatalogueScreen,
        options: {"title": "Catalogue"}
    },
    object: {
        id: "Object",
        screen: ObjectScreen,
        options: {"title": "Contenus"}
    },
    objectRemerciements: {
        id: "ObjectRemerciements",
        screen: ObjectRemerciementsScreen,
        options: {"title": "Remerciements"}
    }
}