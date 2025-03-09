# Portfolio Showcase

## Structure du projet

```
/Users/etiennepogoda/Workspace/DevPortfolioShowcase/
├── client/                   # Code frontend de l'application
│   ├── public/               # Fichiers statiques accessibles
│   │   ├── assets/           # Ressources statiques
│   │   │   ├── fonts/        # Polices utilisées
│   │   │   ├── models/       # Modèles 3D
│   │   │   │   ├── avatar_on-welcome.glb
│   │   │   │   ├── avatar_click-swap.glb
│   │   │   │   └── avatar_call-me.glb
│   │   │   └── textures/     # Textures pour les matériaux
│   │   │       ├── wood.jpg
│   │   │       └── concrete.jpg
│   │   └── index.html        # Point d'entrée HTML
│   ├── src/                  # Code source React
│   │   ├── components/       # Composants React
│   │   │   ├── Canvas/       # Composants liés à Three.js
│   │   │   │   ├── Avatar.ts # Classe pour gérer les avatars 3D
│   │   │   │   ├── Bird.ts   # Classe pour gérer les oiseaux
│   │   │   │   └── Scene.tsx # Scène Three.js principale
│   │   │   └── UI/           # Composants d'interface utilisateur
│   │   ├── lib/              # Bibliothèques et hooks
│   │   │   └── store.ts      # État global de l'application
│   │   ├── services/         # Services pour l'application
│   │   │   └── ModelLoader.ts # Service de chargement de modèles 3D
│   │   ├── utils/            # Fonctions utilitaires
│   │   │   └── assetLoader.ts # Utilitaire de gestion des assets
│   │   └── App.tsx           # Composant principal
│   └── package.json          # Dépendances et scripts
└── README.md                 # Documentation du projet
```

## Comment organiser les assets

1. Placez tous les modèles 3D (fichiers .glb, .gltf) dans `/client/public/assets/models/`
2. Placez les textures (fichiers .jpg, .png) dans `/client/public/assets/textures/`
3. Placez les polices dans `/client/public/assets/fonts/`

## Développement

Pour lancer le projet en développement :

```bash
cd client
npm install
npm run dev
```
