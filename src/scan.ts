import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

export interface TextEntry {
  text: string;
  filePath: string;
  line: number;
  column: number;
}

export function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = []
): string[] {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    // Éviter node_modules, .git, etc. selon vos besoins
    if (file === "node_modules" || file.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      // On ne prend que .ts, .tsx, .js, .jsx par exemple
      if (/\.(ts|tsx|js|jsx)$/.test(path.extname(fullPath))) {
        arrayOfFiles.push(fullPath);
      }
    }
  }

  return arrayOfFiles;
}

export function extractTextEntriesFromFile(filePath: string): TextEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const textEntries: TextEntry[] = [];

  function visit(node: ts.Node) {
    let text: string | null = null;

    if (ts.isStringLiteral(node)) {
      text = node.text;
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      text = node.text;
    }

    if (text !== null) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );
      textEntries.push({
        text,
        filePath,
        line: line + 1,
        column: character + 1,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return textEntries;
}
