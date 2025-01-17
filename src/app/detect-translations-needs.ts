import { Segment } from "../_tests_/segment.builder";

export type TextEntry = {
  segment: Segment[];
  filePath: string;
};

export const detectTranslationsNeeds = (
  detectHardCodedStringGateway: DetectHardCodedStringGateway
) => {
  return function handle(filesPath: string[]): TextEntry[] {
    return filesPath
      .map((filePath) => ({
        filePath,
        segment:
          detectHardCodedStringGateway.extractTextEntriesFromFile(filePath),
      }))
      .filter((texEntry) => texEntry.segment.length > 0);
  };
};

export interface DetectHardCodedStringGateway {
  extractTextEntriesFromFile(filesPath: string): Segment[];
}

export class FakeDetectHardCodedStringGateway
  implements DetectHardCodedStringGateway
{
  hardCodeText: Map<string, Segment[]> = new Map();
  extractTextEntriesFromFile(filePath: string): Segment[] {
    return this.hardCodeText.get(filePath) || [];
  }

  addTextByFilePath({ filePath, text }: { filePath: string; text: Segment[] }) {
    this.hardCodeText.set(filePath, text);
  }
}
