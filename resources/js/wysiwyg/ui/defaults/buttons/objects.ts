import {EditorButtonDefinition} from "../../framework/buttons";
import linkIcon from "@icons/editor/link.svg";
import {EditorUiContext} from "../../framework/core";
import {
    $createNodeSelection,
    $createTextNode,
    $getRoot,
    $getSelection,
    $setSelection,
    BaseSelection,
    ElementNode
} from "lexical";
import {$isLinkNode, LinkNode} from "@lexical/link";
import unlinkIcon from "@icons/editor/unlink.svg";
import imageIcon from "@icons/editor/image.svg";
import {$isImageNode, ImageNode} from "../../../nodes/image";
import horizontalRuleIcon from "@icons/editor/horizontal-rule.svg";
import {$createHorizontalRuleNode, $isHorizontalRuleNode} from "../../../nodes/horizontal-rule";
import codeBlockIcon from "@icons/editor/code-block.svg";
import {$createCodeBlockNode, $isCodeBlockNode, $openCodeEditorForNode, CodeBlockNode} from "../../../nodes/code-block";
import editIcon from "@icons/edit.svg";
import diagramIcon from "@icons/editor/diagram.svg";
import {$createDiagramNode, $isDiagramNode, $openDrawingEditorForNode, DiagramNode} from "../../../nodes/diagram";
import detailsIcon from "@icons/editor/details.svg";
import mediaIcon from "@icons/editor/media.svg";
import {$createDetailsNode, $isDetailsNode} from "../../../nodes/details";
import {$isMediaNode, MediaNode} from "../../../nodes/media";
import {
    $getNodeFromSelection,
    $insertNewBlockNodeAtSelection,
    $selectionContainsNodeType
} from "../../../utils/selection";

export const link: EditorButtonDefinition = {
    label: 'Insert/edit link',
    icon: linkIcon,
    action(context: EditorUiContext) {
        const linkModal = context.manager.createModal('link');
        context.editor.getEditorState().read(() => {
            const selection = $getSelection();
            const selectedLink = $getNodeFromSelection(selection, $isLinkNode) as LinkNode | null;

            let formDefaults = {};
            if (selectedLink) {
                formDefaults = {
                    url: selectedLink.getURL(),
                    text: selectedLink.getTextContent(),
                    title: selectedLink.getTitle(),
                    target: selectedLink.getTarget(),
                }

                context.editor.update(() => {
                    const selection = $createNodeSelection();
                    selection.add(selectedLink.getKey());
                    $setSelection(selection);
                });
            }

            linkModal.show(formDefaults);
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isLinkNode);
    }
};

export const unlink: EditorButtonDefinition = {
    label: 'Remove link',
    icon: unlinkIcon,
    action(context: EditorUiContext) {
        context.editor.update(() => {
            const selection = context.lastSelection;
            const selectedLink = $getNodeFromSelection(selection, $isLinkNode) as LinkNode | null;
            const selectionPoints = selection?.getStartEndPoints();

            if (selectedLink) {
                const newNode = $createTextNode(selectedLink.getTextContent());
                selectedLink.replace(newNode);
                if (selectionPoints?.length === 2) {
                    newNode.select(selectionPoints[0].offset, selectionPoints[1].offset);
                } else {
                    newNode.select();
                }
            }
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return false;
    }
};


export const image: EditorButtonDefinition = {
    label: 'Insert/Edit Image',
    icon: imageIcon,
    action(context: EditorUiContext) {
        const imageModal = context.manager.createModal('image');
        const selection = context.lastSelection;
        const selectedImage = $getNodeFromSelection(selection, $isImageNode) as ImageNode | null;

        context.editor.getEditorState().read(() => {
            let formDefaults = {};
            if (selectedImage) {
                formDefaults = {
                    src: selectedImage.getSrc(),
                    alt: selectedImage.getAltText(),
                    height: selectedImage.getHeight(),
                    width: selectedImage.getWidth(),
                }

                context.editor.update(() => {
                    const selection = $createNodeSelection();
                    selection.add(selectedImage.getKey());
                    $setSelection(selection);
                });
            }

            imageModal.show(formDefaults);
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isImageNode);
    }
};

export const horizontalRule: EditorButtonDefinition = {
    label: 'Insert horizontal line',
    icon: horizontalRuleIcon,
    action(context: EditorUiContext) {
        context.editor.update(() => {
            $insertNewBlockNodeAtSelection($createHorizontalRuleNode(), false);
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isHorizontalRuleNode);
    }
};

export const codeBlock: EditorButtonDefinition = {
    label: 'Insert code block',
    icon: codeBlockIcon,
    action(context: EditorUiContext) {
        context.editor.getEditorState().read(() => {
            const selection = $getSelection();
            const codeBlock = $getNodeFromSelection(context.lastSelection, $isCodeBlockNode) as (CodeBlockNode | null);
            if (codeBlock === null) {
                context.editor.update(() => {
                    const codeBlock = $createCodeBlockNode();
                    codeBlock.setCode(selection?.getTextContent() || '');
                    $insertNewBlockNodeAtSelection(codeBlock, true);
                    $openCodeEditorForNode(context.editor, codeBlock);
                    codeBlock.selectStart();
                });
            } else {
                $openCodeEditorForNode(context.editor, codeBlock);
            }
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isCodeBlockNode);
    }
};

export const editCodeBlock: EditorButtonDefinition = Object.assign({}, codeBlock, {
    label: 'Edit code block',
    icon: editIcon,
});

export const diagram: EditorButtonDefinition = {
    label: 'Insert/edit drawing',
    icon: diagramIcon,
    action(context: EditorUiContext) {
        context.editor.getEditorState().read(() => {
            const selection = $getSelection();
            const diagramNode = $getNodeFromSelection(context.lastSelection, $isDiagramNode) as (DiagramNode | null);
            if (diagramNode === null) {
                context.editor.update(() => {
                    const diagram = $createDiagramNode();
                    $insertNewBlockNodeAtSelection(diagram, true);
                    $openDrawingEditorForNode(context, diagram);
                    diagram.selectStart();
                });
            } else {
                $openDrawingEditorForNode(context, diagramNode);
            }
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isDiagramNode);
    }
};

export const media: EditorButtonDefinition = {
    label: 'Insert/edit Media',
    icon: mediaIcon,
    action(context: EditorUiContext) {
        const mediaModal = context.manager.createModal('media');

        context.editor.getEditorState().read(() => {
            const selection = $getSelection();
            const selectedNode = $getNodeFromSelection(selection, $isMediaNode) as MediaNode | null;

            let formDefaults = {};
            if (selectedNode) {
                const nodeAttrs = selectedNode.getAttributes();
                formDefaults = {
                    src: nodeAttrs.src || nodeAttrs.data || '',
                    width: nodeAttrs.width,
                    height: nodeAttrs.height,
                    embed: '',
                }
            }

            mediaModal.show(formDefaults);
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isMediaNode);
    }
};

export const details: EditorButtonDefinition = {
    label: 'Insert collapsible block',
    icon: detailsIcon,
    action(context: EditorUiContext) {
        context.editor.update(() => {
            const selection = $getSelection();
            const detailsNode = $createDetailsNode();
            const selectionNodes = selection?.getNodes() || [];
            const topLevels = selectionNodes.map(n => n.getTopLevelElement())
                .filter(n => n !== null) as ElementNode[];
            const uniqueTopLevels = [...new Set(topLevels)];

            if (uniqueTopLevels.length > 0) {
                uniqueTopLevels[0].insertAfter(detailsNode);
            } else {
                $getRoot().append(detailsNode);
            }

            for (const node of uniqueTopLevels) {
                detailsNode.append(node);
            }
        });
    },
    isActive(selection: BaseSelection | null): boolean {
        return $selectionContainsNodeType(selection, $isDetailsNode);
    }
}