export class Segment {
  /** Numéro de ligne dans le fichier */
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  originalText: string;
  proposedTranslation?: string;
}

export class SegmentBuilder {
  startIndex: number;
  endIndex: number;
  originalText: string;
  lineNumber: number;

  constructor() {
    this.startIndex = 0;
    this.endIndex = 0;
    this.originalText = "";
  }

  withStartIndex(index: number) {
    this.startIndex = index;
    return this;
  }

  withEndIndex(index: number) {
    this.endIndex = index;
    return this;
  }
  withOriginalText(index: string) {
    this.originalText = index;
    return this;
  }
  withLineNumber(lineNb: number) {
    this.lineNumber = lineNb;
    return this;
  }

  build(): Segment {
    return {
      originalText: this.originalText,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      lineNumber: this.lineNumber,
    };
  }
}

export class TextEntry {
  /** Numéro de ligne dans le fichier */
  lineNumber: number;

  /** Contenu complet de la ligne */
  originalLine: string;

  /**
   * Tableau des segments à traduire dans cette ligne
   * (pour le cas où il y a plusieurs occurrences dans la même ligne)
   */
  segments: Segment[];
}

export class TextEntryBuilder {
  lineNumber: number;
  originalLine: string;
  segments: Segment[];

  private constructor() {
    this.lineNumber = 0;
    this.originalLine = "";
    this.segments = [];
  }

  withLineNumer(line: number) {
    this.lineNumber = line;
    return this;
  }

  withOriginalLine(originText: string) {
    this.originalLine = originText;
    return this;
  }

  withSegment(segments: Segment[]) {
    this.segments = segments;
    return this;
  }

  build(): TextEntry {
    return {
      segments: this.segments,
      originalLine: this.originalLine,
      lineNumber: this.lineNumber,
    };
  }
}
