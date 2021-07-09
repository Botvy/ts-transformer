import * as ts from "typescript";
import { ImportDeclaration, ImportSpecifier } from "typescript";

interface ImportStatement {
    name: string;
    alias?: string;
}

const transformerProgram = (program: ts.Program) => {
    const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (
        context
    ) => {
        return (sourceFile) => {
            const visitor = (node: ts.Node): ts.Node => {
                if (!sourceFile.fileName.includes("example2.ts")) {
                    return node;
                }

                if (ts.isSourceFile(node)) {
                    return ts.visitEachChild(node, visitor, context);
                }

                console.log({ node, type: ts.SyntaxKind[node.kind] });

                if (!is_import_declaration(node)) {
                    return ts.visitEachChild(node, visitor, context);
                }

                const importedModule = (
                    node.moduleSpecifier as ts.StringLiteral
                ).text;

                if (!ts.isSourceFile(node.parent)) {
                    return node;
                }

                if (importedModule.toLowerCase() !== "react") {
                    return node;
                }

                let namedDefaultImport = node.importClause?.name?.getText();
                const namedImports: ImportStatement[] = [];

                node.importClause?.namedBindings?.forEachChild((childNode) => {
                    const text = childNode.getText();

                    if (is_import_specifier(childNode)) {
                        namedImports.push({
                            name:
                                childNode.propertyName?.getText() === undefined
                                    ? childNode.name.getText()
                                    : childNode.propertyName?.getText(),
                            alias:
                                childNode.propertyName?.getText() !== undefined
                                    ? childNode.name.getText()
                                    : undefined,
                        });
                    } else {
                        if (node.getText().includes("* as")) {
                            namedDefaultImport = text;
                        } else {
                            namedImports.push({
                                name: text,
                            });
                        }
                    }
                });

                console.log({ namedDefaultImport, namedImports });

                if (
                    namedDefaultImport === undefined &&
                    namedImports.length > 0
                ) {
                    return ts.factory.createVariableDeclarationList([
                        ts.factory.createVariableDeclaration(
                            "LOL",
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("test")
                        ),
                    ]);
                } else if (
                    namedDefaultImport !== undefined &&
                    namedImports.length === 0
                ) {
                    return ts.factory.createIdentifier(
                        "Found default import only"
                    );
                } else if (
                    namedDefaultImport !== undefined &&
                    namedImports.length > 0
                ) {
                    return ts.factory.createIdentifier(
                        "Found default and named imports"
                    );
                }

                return ts.visitNode(sourceFile, visitor);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };

    return transformerFactory;
};

function is_import_declaration(node: ts.Node): node is ImportDeclaration {
    return ts.isImportDeclaration(node);
}

function is_import_specifier(node: ts.Node): node is ImportSpecifier {
    return ts.isImportSpecifier(node);
}

export default transformerProgram;
