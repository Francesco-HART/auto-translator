import {
  detectTranslationsNeeds,
  FakeDetectHardCodedStringGateway,
  TextEntry,
} from "../app/detect-translations-needs";
import { Segment, SegmentBuilder } from "./segment.builder";

describe("Detect translation needs in a project", () => {
  let detectHardCodedStringGateway: FakeDetectHardCodedStringGateway;
  let detectTranslationNeedsHandle: ReturnType<typeof detectTranslationsNeeds>;

  beforeEach(() => {
    detectHardCodedStringGateway = new FakeDetectHardCodedStringGateway();
    detectTranslationNeedsHandle = detectTranslationsNeeds(
      detectHardCodedStringGateway
    );
  });
  describe("detect if need translation", () => {
    it("No text is found in the project", () => {
      const needTranslation = whenSearchingForTranslationNeeds([]);
      thenNoTranslationNeeded(needTranslation);
    });

    it("One text is found in the file", () => {
      const segmentFound = new SegmentBuilder()
        .withOriginalText("filePath")
        .build();
      givenTextFound({ filePath: "filePath", textFound: [segmentFound] });
      const filePath = ["filePath"];
      const needTranslation = whenSearchingForTranslationNeeds(filePath);
      thenTextIsFound({
        expectTextToTranslate: [
          { filePath: "filePath", segment: [segmentFound] },
        ],
        result: needTranslation,
      });
    });

    it("Two text are found in the file", () => {
      const segmentFound1 = new SegmentBuilder()
        .withOriginalText("filePath")
        .build();
      const segmentFound2 = new SegmentBuilder()
        .withOriginalText("filePath2")
        .build();

      givenTextFound({
        filePath: "filePath",
        textFound: [segmentFound1, segmentFound2],
      });
      const filePath = ["filePath"];
      const needTranslation = whenSearchingForTranslationNeeds(filePath);
      thenTextIsFound({
        expectTextToTranslate: [
          { filePath: "filePath", segment: [segmentFound1, segmentFound2] },
        ],
        result: needTranslation,
      });
    });

    it("Two text are found in two files", () => {
      const segmentFound1 = new SegmentBuilder()
        .withOriginalText("filePath")
        .build();
      const segmentFound2 = new SegmentBuilder()
        .withOriginalText("filePath2")
        .build();

      givenTextFound({
        filePath: "filePath2",
        textFound: [segmentFound2],
      });
      givenTextFound({
        filePath: "filePath",
        textFound: [segmentFound1],
      });
      const filePath = ["filePath", "filePath2"];
      const needTranslation = whenSearchingForTranslationNeeds(filePath);
      thenTextIsFound({
        expectTextToTranslate: [
          { filePath: "filePath", segment: [segmentFound1] },
          { filePath: "filePath2", segment: [segmentFound2] },
        ],
        result: needTranslation,
      });
    });

    it("Two text are found in files1  and one text is found in file 2", () => {
      const segmentFound1 = new SegmentBuilder()
        .withOriginalText("filePath")
        .build();
      const segmentFound1Bis = new SegmentBuilder()
        .withOriginalText("file1Bis")
        .build();

      const segmentFound2 = new SegmentBuilder()
        .withOriginalText("file2")
        .build();
      givenTextFound({
        filePath: "filePath1",
        textFound: [segmentFound1, segmentFound1Bis],
      });

      givenTextFound({
        filePath: "filePath2",
        textFound: [segmentFound2],
      });
      const filePath = ["filePath1", "filePath2"];
      const needTranslation = whenSearchingForTranslationNeeds(filePath);
      thenTextIsFound({
        expectTextToTranslate: [
          { filePath: "filePath1", segment: [segmentFound1, segmentFound1Bis] },
          { filePath: "filePath2", segment: [segmentFound2] },
        ],
        result: needTranslation,
      });
    });

    it("It should return line and index for text to translate in file1", () => {
      const segmentFound1 = new SegmentBuilder()
        .withOriginalText("filePath")
        .withLineNumber(2)
        .build();

      givenTextFound({
        filePath: "filePath1",
        textFound: [segmentFound1],
      });

      const filePath = ["filePath1", "filePath2"];
      const needTranslation = whenSearchingForTranslationNeeds(filePath);
      thenTextIsFound({
        expectTextToTranslate: [
          { filePath: "filePath1", segment: [segmentFound1] },
        ],
        result: needTranslation,
      });
    });
  });

  function givenTextFound({
    filePath,
    textFound,
  }: {
    filePath: string;
    textFound: Segment[];
  }) {
    detectHardCodedStringGateway.addTextByFilePath({
      filePath,
      text: textFound,
    });
  }

  function whenSearchingForTranslationNeeds(filePath: string[]): TextEntry[] {
    return detectTranslationNeedsHandle(filePath);
  }

  function thenNoTranslationNeeded(translationNeed: TextEntry[]) {
    expect(translationNeed).toEqual([]);
  }

  function thenTextIsFound({
    expectTextToTranslate,
    result,
  }: {
    expectTextToTranslate: TextEntry[];
    result: TextEntry[];
  }) {
    expect(expectTextToTranslate).toEqual(result);
  }
});
