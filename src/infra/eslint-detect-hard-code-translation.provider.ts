import { TSESTree, parse } from "@typescript-eslint/typescript-estree";
import { Segment } from "../_tests_/segment.builder";
import { DetectHardCodedStringProvider } from "../app/detect-translations-needs";
import * as fs from "fs";

export class EslintDetectHardCodedStringProvider
  implements DetectHardCodedStringProvider
{
  private removeDuplicatedTexts(texts: Segment[]): Segment[] {
    return texts.filter((text, index, self) => {
      const firstIndex = self.findIndex(
        (t) =>
          t.originalText === text.originalText &&
          t.lineNumber === text.lineNumber &&
          t.startIndex === text.startIndex &&
          t.endIndex === text.endIndex
      );
      return firstIndex === index;
    });
  }

  public extractTextEntriesFromFile(filePath: string): Segment[] {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // -- 1. On parse l'AST en mode TS + JSX --
    const ast = parse(fileContent, {
      loc: true,
      comment: true,
      ecmaVersion: "latest",
      jsx: true,
      filePath,
    });

    const segments: Segment[] = [];

    // -- 2. Helpers pour filtrer --
    function isInImport(ancestors: TSESTree.Node[]): boolean {
      return ancestors.some(
        (a) =>
          a.type === "ImportDeclaration" ||
          a.type === "ImportSpecifier" ||
          a.type === "ImportDefaultSpecifier" ||
          a.type === "ImportNamespaceSpecifier"
      );
    }

    function isInTFunctionCall(ancestors: TSESTree.Node[]): boolean {
      return ancestors.some(
        (a) =>
          a.type === "CallExpression" &&
          a.callee.type === "Identifier" &&
          a.callee.name === "t"
      );
    }

    function isInJSXAttribute(ancestors: TSESTree.Node[]): boolean {
      return ancestors.some((a) => a.type === "JSXAttribute");
    }

    function traverse(node: TSESTree.Node, ancestors: TSESTree.Node[] = []) {
      // --- Cas 1: JSXText => texte brut entre balises
      if (node.type === "JSXText" && node.loc) {
        const text = node.value.trim();
        if (
          text.length > 0 &&
          !isInImport(ancestors) &&
          !isInTFunctionCall(ancestors) &&
          !isInJSXAttribute(ancestors)
        ) {
          segments.push({
            originalText: text,
            lineNumber: node.loc.start.line,
            startIndex: node.loc.start.column,
            endIndex: node.loc.end.column,
          });
        }
      }

      // --- Cas 2: Expression { "Hello" } => un Literal dans un JSXExpressionContainer
      if (
        node.type === "JSXExpressionContainer" &&
        node.expression.type === "Literal" &&
        typeof node.expression.value === "string" &&
        node.expression.loc
      ) {
        const text = node.expression.value.trim();
        if (
          text.length > 0 &&
          !isInImport(ancestors) &&
          !isInTFunctionCall(ancestors) &&
          !isInJSXAttribute(ancestors)
        ) {
          segments.push({
            originalText: text,
            lineNumber: node.expression.loc.start.line,
            startIndex: node.expression.loc.start.column,
            endIndex: node.expression.loc.end.column,
          });
        }
      }

      // --- Parcours récursif des enfants de ce nœud dans l’AST ---
      for (const key in node) {
        const value = (node as any)[key];
        if (Array.isArray(value)) {
          value.forEach((child) => {
            if (child && typeof child.type === "string") {
              traverse(child, ancestors.concat(node));
            }
          });
        } else if (value && typeof value.type === "string") {
          traverse(value, ancestors.concat(node));
        }
      }
    }

    // 4. Démarrer le parcours depuis la racine (ast)
    traverse(ast);

    // 5. Retourner les segments trouvés
    return this.removeDuplicatedTexts(segments);
  }
}
