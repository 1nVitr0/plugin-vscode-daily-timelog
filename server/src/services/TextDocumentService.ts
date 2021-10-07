import { Position, TextDocumentIdentifier, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Settings } from '../../../shared/out';
import YamlParser from '../parse/YamlParser';
import ConfigurationService from './ConfigurationService';

export default abstract class TextDocumentService {
  protected configurationService: ConfigurationService;
  protected currentConfiguration?: Settings;
  protected currentDocument?: TextDocument;
  protected documents: TextDocuments<TextDocument>;

  private _parser?: YamlParser;

  public constructor(documents: TextDocuments<TextDocument>, configurationService: ConfigurationService) {
    this.documents = documents;
    this.configurationService = configurationService;
  }

  protected get parser(): YamlParser | null {
    if (this._parser && this._parser.hasDocument(this.currentDocument)) return this._parser;
    else return this.currentDocument ? (this._parser = new YamlParser(this.currentDocument)) : null;
  }

  public async for(document: TextDocumentIdentifier): Promise<this> {
    this.currentDocument = this.getDocument(document.uri);
    this.currentConfiguration = await this.configurationService.getDocumentSettings(document.uri);
    return this;
  }

  protected getCharBeforePosition(position: Position): string | undefined {
    return this.currentDocument?.getText({
      start: { line: position.line, character: position.character - 1 },
      end: position,
    });
  }

  protected getIndent(position: Position, indentSpaces = 2): number {
    const line = this.currentDocument?.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    let indent = 0;
    while (line && indent < line.length && line[indent].match(/\s/)) indent++;

    return Math.floor(indent / indentSpaces);
  }

  protected offsetAt(position: Position): number {
    return this.currentDocument?.offsetAt(position) || 0;
  }

  protected positionAt(offset: number): Position {
    return this.currentDocument?.positionAt(offset) || { line: 0, character: 0 };
  }

  protected getLineCount(): number | undefined {
    return this.currentDocument?.lineCount;
  }

  private getDocument(uri: string): TextDocument | undefined {
    return this.documents.get(uri);
  }
}
