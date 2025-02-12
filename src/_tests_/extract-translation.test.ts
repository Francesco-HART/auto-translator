import * as path from "path";
import * as fs from "fs";
import { Segment, SegmentBuilder } from "./segment.builder";
import { EslintDetectHardCodedStringProvider } from "../infra/eslint-detect-hard-code-translation.provider";

describe("Extract text to translate", () => {
  const filesTsxPaths1 = path.join(__dirname, "./tsx/file1.tsx");
  const filesTsxPaths2 = path.join(__dirname, "./tsx/file2.tsx");
  const filesTsxPaths3 = path.join(__dirname, "./tsx/file3.tsx");
  const filesTsxPaths4 = path.join(__dirname, "./tsx/file4.tsx");
  const filesTsxPaths5 = path.join(__dirname, "./tsx/file5.tsx");
  const filesTsxPaths6 = path.join(__dirname, "./tsx/file6.tsx");

  let copilotDetectHardCodedStringGateway: EslintDetectHardCodedStringProvider;
  beforeAll(async () => {
    copilotDetectHardCodedStringGateway =
      new EslintDetectHardCodedStringProvider();
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

    it("Complex File tsx", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths2
        );
      thenSegmentShouldBe({
        expectSegment: [
          new SegmentBuilder()
            .withEndIndex(65)
            .withLineNumber(24)
            .withOriginalText("It's not a fake")
            .withStartIndex(50)
            .build(),
        ],
        result,
      });
    });

    it("Complex TSX with no text to translate", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths3
        );
      thenSegmentShouldBe({
        expectSegment: [],
        result,
      });
    });

    it("Translation file 4", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths4
        );
      thenSegmentShouldBe({
        expectSegment: [
          new SegmentBuilder()
            .withEndIndex(6)
            .withLineNumber(11)
            .withOriginalText("Hello world again")
            .withStartIndex(54)
            .build(),
        ],
        result,
      });
    });

    it("Translation file 5", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths5
        );
      thenSegmentShouldBe({
        expectSegment: [
          new SegmentBuilder()
            .withEndIndex(29)
            .withLineNumber(8)
            .withOriginalText("Hard-coded Title")
            .withStartIndex(13)
            .build(),

          new SegmentBuilder()
            .withEndIndex(29)
            .withLineNumber(13)
            .withOriginalText("- I am hard-coded")
            .withStartIndex(9)
            .build(),

          new SegmentBuilder()
            .withEndIndex(40)
            .withLineNumber(17)
            .withOriginalText("X")
            .withStartIndex(39)
            .build(),
        ],
        result,
      });
    });

    it("Translation file 6", async () => {
      const result =
        copilotDetectHardCodedStringGateway.extractTextEntriesFromFile(
          filesTsxPaths6
        );
      thenSegmentShouldBe({
        expectSegment: [
          new SegmentBuilder()
            .withEndIndex(8)
            .withLineNumber(189)
            .withOriginalText("Ce code doit etre translate")
            .withStartIndex(16)
            .build(),

          new SegmentBuilder()
            .withEndIndex(43)
            .withLineNumber(231)
            .withOriginalText("Il est beau bouton non ?")
            .withStartIndex(18)
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
