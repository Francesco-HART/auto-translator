import * as path from "path";
import * as fs from "fs";
import { DetectHardCodedStringGateway } from "../app/detect-translations-needs";
import { Segment, SegmentBuilder } from "./segment.builder";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { parse } from "@typescript-eslint/typescript-estree";

describe("Extract text to translate", () => {
  const filesTsxPaths1 = path.join(__dirname, "./tsx/file1.tsx");
  let copilotDetectHardCodedStringGateway: DetectHardCodedStringGateway;
  beforeAll(async () => {
    copilotDetectHardCodedStringGateway =
      new CopilotDetectHardCodedStringGateway();
  });

  describe("Extract in tsx file", () => {
    it("simple File tsx", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths1
        );
      thenSegmentShouldBe({
        expectSegment: [
          new SegmentBuilder()
            .withEndIndex(18)
            .withLineNumber(2)
            .withOriginalText("text")
            .withStartIndex(14)
            .build(),
        ],
        result,
      });
    });
  });

  function thenSegmentShouldBe({
    expectSegment,
    result,
  }: {
    expectSegment: Segment[];
    result: Segment[];
  }) {
    expect(expectSegment).toEqual(result);
  }
});

export class CopilotDetectHardCodedStringGateway
  implements DetectHardCodedStringGateway
{
  /**
   * Analyse un fichier (parsing AST) et retourne la liste des chaînes de caractères littérales.
   *
   * @param filePath Le chemin du fichier à analyser
   * @returns Un tableau de segments contenant les textes trouvés et leur position
   */
  extractTextEntriesFromFile(filePath: string): Segment[] {
    const seen = new Set<string>();
    // 1. Lecture du contenu du fichier
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // 2. Parse du code source en AST
    const ast = parse(fileContent, {
      loc: true, // Pour récupérer lignes/colonnes de départ/fin
      range: true, // Si besoin, pour la position dans la chaîne
      comment: true,
      tokens: true,
      ecmaVersion: "latest",
      // Si vous avez du JSX, activer:
      jsx: true,
      // Pour du code TS, préciser un "filePath" pour que le parseur
      // sache qu'il peut y avoir des annotations TS
      filePath,
    });

    const segments: Segment[] = [];

    function traverse(node: TSESTree.Node) {
      // 1. Chaînes de caractères (literal)
      if (
        node.type === "Literal" &&
        typeof node.value === "string" &&
        node.loc
      ) {
        const startLine = node.loc.start.line;
        const endIndex = node.loc.end.column;
        const startIndex = node.loc.start.column;
        const id = `${startLine}:${endIndex}-${startIndex}`;
        if (!seen.has(id)) {
          seen.add(id);

          segments.push({
            originalText: node.value,
            lineNumber: startLine,
            endIndex: endIndex,
            startIndex: startIndex,
          });
        }
      }

      // 2. Texte dans du JSX (node de type JSXText)
      if (node.type === "JSXText" && node.loc) {
        // On trim le texte pour éviter les retours à la ligne ou espaces
        const trimmedValue = node.value.trim();
        // On ne prend en compte que si ce n’est pas vide
        if (trimmedValue.length > 0) {
          const startLine = node.loc.start.line;
          const endIndex = node.loc.end.column;
          const startIndex = node.loc.start.column;
          const id = `${startLine}:${endIndex}-${startIndex}`;
          if (!seen.has(id)) {
            seen.add(id);
            segments.push({
              originalText: node.value,
              lineNumber: startLine,
              endIndex: endIndex,
              startIndex: startIndex,
            });
          }
        }
      }

      // Parcours récursif
      for (const key in node) {
        const value = (node as any)[key];
        if (Array.isArray(value)) {
          value.forEach((child) => {
            if (child && typeof child.type === "string") {
              traverse(child);
            }
          });
        } else if (value && typeof value.type === "string") {
          traverse(value);
        }
      }
    }

    // 4. Lancement du parcours de l’AST à partir de la racine
    traverse(ast);

    // 5. Retourne l'ensemble des segments "hardcodés" trouvés
    return segments;
  }
}
