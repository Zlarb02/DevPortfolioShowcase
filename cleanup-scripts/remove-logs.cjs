/**
 * Script simple pour identifier les console.log dans le code
 * Exécutez avec: node remove-logs.js <chemin_du_dossier>
 */

const fs = require("fs");
const path = require("path");

// Extensions à analyser
const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".vue"];
// Patterns de console logs à rechercher
const LOG_PATTERNS = [
  "console.log",
  "console.info",
  "console.debug",
  // Ajoutez d'autres patterns si nécessaire
];

// Fonction récursive pour parcourir les répertoires
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.includes("node_modules") &&
      !file.includes(".git")
    ) {
      scanDirectory(filePath);
    } else if (EXTENSIONS.includes(path.extname(filePath))) {
      findLogs(filePath);
    }
  });
}

// Fonction pour trouver les logs dans un fichier
function findLogs(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  let hasLogs = false;

  lines.forEach((line, index) => {
    if (LOG_PATTERNS.some((pattern) => line.includes(pattern))) {
      if (!hasLogs) {
        console.log(`\nFichier: ${filePath}`);
        hasLogs = true;
      }
      console.log(`  Ligne ${index + 1}: ${line.trim()}`);
    }
  });
}

// Point d'entrée
const targetDir = process.argv[2] || ".";
console.log(`Recherche des console.log dans: ${targetDir}`);
scanDirectory(targetDir);
