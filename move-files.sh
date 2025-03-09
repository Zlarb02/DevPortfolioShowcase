#!/bin/bash
# Script pour déplacer les fichiers de dist/public/ vers dist/

# Créer les répertoires nécessaires
mkdir -p ./dist/css
mkdir -p ./dist/js

# Déplacer les fichiers
mv ./dist/public/index.html ./dist/
mv ./dist/public/css/smooth-progress.css ./dist/css/
mv ./dist/public/js/smooth-progress.js ./dist/js/

# Déplacer d'autres ressources si nécessaires
if [ -d "./dist/public/assets" ]; then
  mv ./dist/public/assets ./dist/
fi

# Supprimer le dossier public s'il est vide
rm -rf ./dist/public
