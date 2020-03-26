import {
    CancellationToken,
    CompletionContext,
    CompletionList,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Position,
    TextLine,
    TextDocument
} from "vscode";
import { TypeResolver } from "./typeResolver";
import { typeHintCharacter, Type } from "./syntax";

/**
 * Provides one or more type hint {@link CompletionItem}.
 */
export class HintCompletionProvider implements CompletionItemProvider {

    public provideCompletionItems(
        doc: TextDocument, 
        pos: Position,
        token: CancellationToken,
        context: CompletionContext
    ): Thenable<CompletionList> | null {
        if (context.triggerCharacter !== typeHintCharacter) {
            return null;
        }
        const items: CompletionItem[] = [];
        const line = doc.lineAt(pos);
        const param = this.findParam(line, pos);

        if (param && param.length > 0) {         
            let hint = new TypeResolver().EstimateType(doc, param);

            if (hint) {
                items.push(new CompletionItem(" " + hint, CompletionItemKind.TypeParameter));
            } else {
                for (const type of Object.values(Type)) {
                    items.push(new CompletionItem(" " + type, CompletionItemKind.TypeParameter));
                }
            }
        }
        return Promise.resolve(new CompletionList(items, false));
    }

    /**
     * Finds the parameter which is about to be type hinted.
     * 
     * @param line The active line.
     * @param pos The active position.
     */
    private findParam(line: TextLine, pos: Position): string | null {
        let param = null;
        let split = line.text.substr(0, pos.character).split(new RegExp("[,(]"));
        if (split.length > 1) {
            param = split[split.length - 1].trim();
            param = param.substr(0, param.length - 1);
        }
        return param;
    }
}