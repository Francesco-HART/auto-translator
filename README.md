# auto-translator

**auto-translator** est une librairie TypeScript/Node conçue pour **analyser** le code d’un projet (React, TSX, etc.) et **détecter** automatiquement toutes les chaînes de texte « en dur » (hardcodées) qui ne sont **pas encore couvertes** par votre fonction de traduction (par exemple `t("…")`). Elle vous aide également à **générer** ou **mettre à jour** vos fichiers de traduction multi-langues.

> **Objectif** : Faciliter la mise en place et la maintenance d’un système d’internationalisation (i18n) dans vos projets JavaScript/TypeScript en détectant rapidement les chaînes non traduites et en automatisant la génération des fichiers de langue.

---

## Sommaire

1. [Installation](#installation)
2. [Fonctionnalités](#fonctionnalités)

---

## Installation

```bash
npm install auto-translator
 ou
yarn add auto-translator
ou
pnpm add auto-translator
```

## Fonctionnalités

Analyse AST : Scanne vos fichiers .ts, .tsx, .js, .jsx pour repérer les chaînes non traduites.
Filtrage intelligent :
Ignore les appels de traduction existants (t("…"), i18n.t("…"), etc.).
Écarte les attributs JSX (ex. className="…") ou les imports.
Rapport de détection : Production d’un rapport listant toutes les chaînes détectées, avec leur position dans le code.
Génération de fichiers de langue (JSON, YAML, etc.) à partir de ce rapport, facilitant la création ou la mise à jour de vos fichiers i18n.
Mode CLI + API TypeScript : Intégrez facilement dans vos scripts ou pipelines de build.
