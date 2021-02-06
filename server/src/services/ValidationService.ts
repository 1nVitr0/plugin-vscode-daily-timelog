import { Diagnostic, DiagnosticSeverity, DiagnosticTag, Range } from 'vscode-languageserver';
import YamlParser from '../parse/YamlParser';
import { YamlNode } from '../types';
import TextDocumentService from './TextDocumentService';

export default class ValidationService extends TextDocumentService {
  public doValidation(): Diagnostic[] {
    this.parser?.invalidate();
    return [...this.validateTaskList(), ...this.validateTimeLog()];
  }

  private getDeprecateDiagnosticsFromNode(node: YamlNode, message = 'Deprecated'): Diagnostic[] {
    const range = this.getRangeFromNode(node);
    if (!range) return [];

    return [
      {
        message,
        severity: DiagnosticSeverity.Hint,
        tags: [DiagnosticTag.Unnecessary],
        range,
      },
    ];
  }

  private getRangeFromNode(node: YamlNode): Range | null {
    const start = node.cstNode?.range?.origStart || node.cstNode?.range?.start || node.range?.[0];
    const end = node.cstNode?.range?.origEnd || node.cstNode?.range?.end || node.range?.[0];

    if (start == undefined || end == undefined || !this.currentDocument) return null;
    return {
      start: this.currentDocument?.positionAt(start),
      end: this.currentDocument?.positionAt(end),
    };
  }

  private getTimeLogFirstEntryDiagnostics(node: YamlNode, _range?: Range): Diagnostic[] {
    if (!YamlParser.containsNodeWithTag(node, '!begin')) {
      const range = _range || this.getRangeFromNode(node);
      if (range)
        return [
          {
            message:
              'The first entry of timeLog must always be marked with the !begin tag to infer work start. It will not be included in the summary.',
            range,
            severity: DiagnosticSeverity.Warning,
          },
        ];
    }

    return [];
  }

  private validateTaskList(): Diagnostic[] {
    const taskNodes = this.parser?.getNodeIn(['plannedTasks']) || [];
    if (!('items' in taskNodes)) return [];

    const diagnostics: Diagnostic[] = [];
    for (const node of taskNodes.items) {
      if (YamlParser.containsNodeWithTag(node, '!break')) {
        diagnostics.push(...this.getDeprecateDiagnosticsFromNode(node, 'Break'));
      }
    }

    return diagnostics;
  }

  private validateTimeLog(): Diagnostic[] {
    const timeLogNodes = this.parser?.getNodeIn(['timeLog']);
    if (!timeLogNodes || !('items' in timeLogNodes)) return [];

    let firstItem = true;
    const diagnostics: Diagnostic[] = [];
    for (const node of timeLogNodes.items) {
      if (firstItem) diagnostics.push(...this.getTimeLogFirstEntryDiagnostics(node));
      if (YamlParser.containsNodeWithTag(node, ['!break', '!begin'])) {
        diagnostics.push(...this.getDeprecateDiagnosticsFromNode(node, 'Break or Beginning of day'));
      }

      firstItem = false;
    }

    return diagnostics;
  }
}
