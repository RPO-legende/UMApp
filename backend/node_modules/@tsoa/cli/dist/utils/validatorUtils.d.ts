import { Tsoa } from '@tsoa/runtime';
import * as ts from 'typescript';
export declare function getParameterValidators(parameter: ts.ParameterDeclaration, parameterName: string): Tsoa.Validators;
export declare function getPropertyValidators(property: ts.Node): Tsoa.Validators | undefined;
export declare function shouldIncludeValidatorInSchema(key: string): key is Tsoa.SchemaValidatorKey;
