import {
    $createNodeSelection,
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isTextNode,
    $setSelection,
    BaseSelection,
    ElementFormatType,
    ElementNode,
    LexicalNode,
    TextFormatType
} from "lexical";
import {$findMatchingParent, $getNearestBlockElementAncestorOrThrow} from "@lexical/utils";
import {LexicalElementNodeCreator, LexicalNodeMatcher} from "../nodes";
import {$setBlocksType} from "@lexical/selection";

import {$getParentOfType} from "./nodes";

export function $selectionContainsNodeType(selection: BaseSelection | null, matcher: LexicalNodeMatcher): boolean {
    return $getNodeFromSelection(selection, matcher) !== null;
}

export function $getNodeFromSelection(selection: BaseSelection | null, matcher: LexicalNodeMatcher): LexicalNode | null {
    if (!selection) {
        return null;
    }

    for (const node of selection.getNodes()) {
        if (matcher(node)) {
            return node;
        }

        const matchedParent = $getParentOfType(node, matcher);
        if (matchedParent) {
            return matchedParent;
        }
    }

    return null;
}

export function $selectionContainsTextFormat(selection: BaseSelection | null, format: TextFormatType): boolean {
    if (!selection) {
        return false;
    }

    for (const node of selection.getNodes()) {
        if ($isTextNode(node) && node.hasFormat(format)) {
            return true;
        }
    }

    return false;
}

export function $toggleSelectionBlockNodeType(matcher: LexicalNodeMatcher, creator: LexicalElementNodeCreator) {
    const selection = $getSelection();
    const blockElement = selection ? $getNearestBlockElementAncestorOrThrow(selection.getNodes()[0]) : null;
    if (selection && matcher(blockElement)) {
        $setBlocksType(selection, $createParagraphNode);
    } else {
        $setBlocksType(selection, creator);
    }
}

export function $insertNewBlockNodeAtSelection(node: LexicalNode, insertAfter: boolean = true) {
    $insertNewBlockNodesAtSelection([node], insertAfter);
}

export function $insertNewBlockNodesAtSelection(nodes: LexicalNode[], insertAfter: boolean = true) {
    const selection = $getSelection();
    const blockElement = selection ? $getNearestBlockElementAncestorOrThrow(selection.getNodes()[0]) : null;

    if (blockElement) {
        if (insertAfter) {
            for (let i = nodes.length - 1; i >= 0; i--) {
                blockElement.insertAfter(nodes[i]);
            }
        } else {
            for (const node of nodes) {
                blockElement.insertBefore(node);
            }
        }
    } else {
        $getRoot().append(...nodes);
    }
}

export function $selectSingleNode(node: LexicalNode) {
    const nodeSelection = $createNodeSelection();
    nodeSelection.add(node.getKey());
    $setSelection(nodeSelection);
}

export function $selectionContainsNode(selection: BaseSelection | null, node: LexicalNode): boolean {
    if (!selection) {
        return false;
    }

    const key = node.getKey();
    for (const node of selection.getNodes()) {
        if (node.getKey() === key) {
            return true;
        }
    }

    return false;
}

export function $selectionContainsElementFormat(selection: BaseSelection | null, format: ElementFormatType): boolean {
    const nodes = $getBlockElementNodesInSelection(selection);
    for (const node of nodes) {
        if (node.getFormatType() === format) {
            return true;
        }
    }

    return false;
}

export function $getBlockElementNodesInSelection(selection: BaseSelection | null): ElementNode[] {
    if (!selection) {
        return [];
    }

    const blockNodes: Map<string, ElementNode> = new Map();
    for (const node of selection.getNodes()) {
        const blockElement = $findMatchingParent(node, (node) => {
            return $isElementNode(node) && !node.isInline();
        }) as ElementNode | null;

        if (blockElement) {
            blockNodes.set(blockElement.getKey(), blockElement);
        }
    }

    return Array.from(blockNodes.values());
}