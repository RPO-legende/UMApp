import * as ts from 'typescript';
import { Tsoa } from '@tsoa/runtime';
export type InitializerValue = string | number | boolean | undefined | null | InitializerValue[];
export type DefinedInitializerValue = string | number | boolean | null | DefinedInitializerValue[];
export declare function isNonUndefinedInitializerValue(value: InitializerValue): value is DefinedInitializerValue;
export declare function getInitializerValue(initializer?: ts.Expression | ts.ImportSpecifier, typeChecker?: ts.TypeChecker, type?: Tsoa.Type): InitializerValue | DefinedInitializerValue;
