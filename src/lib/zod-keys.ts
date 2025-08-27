// This file vendored from:
// https://github.com/raflymln/zod-key-parser
// MIT License
// Copyright (c) 2023 Rafly Maulana
//
// All Prisma-related stuff deleted.

import type { AnyZodObject, TypeOf, ZodTypeAny } from "zod";
import {
  ZodArray,
  ZodDefault,
  ZodEffects,
  ZodFirstPartyTypeKind,
  ZodIntersection,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodReadonly,
  ZodUnion,
} from "zod";

type UnionToIntersection<U> = (U extends U ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
type NestedUnionToIntersection<T> = UnionToIntersection<{
  [K in keyof T]: T[K] extends object
    ? T[K] extends infer U
      ? UnionToIntersection<U>
      : never
    : T[K];
}>;
type CreateKeyWithPrevKey<PrevKey extends string, Key> = PrevKey extends ""
  ? Key
  : `${PrevKey}${Key extends string ? `.${Key}` : ""}`;
type IsObject<T> = T extends object ? (T extends Date | File ? false : true) : false;

const isZodObject = (model: ZodTypeAny): model is AnyZodObject => {
  return model instanceof ZodObject || model._def.typeName === ZodFirstPartyTypeKind.ZodObject;
};

const isZodUnion = (model: ZodTypeAny): model is ZodUnion<[AnyZodObject]> => {
  return model instanceof ZodUnion || model._def.typeName === ZodFirstPartyTypeKind.ZodUnion;
};

const isZodIntersection = (model: ZodTypeAny): model is ZodIntersection<ZodTypeAny, ZodTypeAny> => {
  return (
    model instanceof ZodIntersection ||
    model._def.typeName === ZodFirstPartyTypeKind.ZodIntersection
  );
};

const isZodArray = (model: ZodTypeAny): model is ZodArray<ZodTypeAny> => {
  return model instanceof ZodArray || model._def.typeName === ZodFirstPartyTypeKind.ZodArray;
};

const isZodOptional = (model: ZodTypeAny): model is ZodOptional<ZodTypeAny> => {
  return model instanceof ZodOptional || model._def.typeName === ZodFirstPartyTypeKind.ZodOptional;
};

const isZodDefault = (model: ZodTypeAny): model is ZodDefault<ZodTypeAny> => {
  return model instanceof ZodDefault || model._def.typeName === ZodFirstPartyTypeKind.ZodDefault;
};

const isZodNullable = (model: ZodTypeAny): model is ZodNullable<ZodTypeAny> => {
  return model instanceof ZodNullable || model._def.typeName === ZodFirstPartyTypeKind.ZodNullable;
};

const isZodPromise = (model: ZodTypeAny): model is ZodPromise<ZodTypeAny> => {
  return model instanceof ZodPromise || model._def.typeName === ZodFirstPartyTypeKind.ZodPromise;
};

const isZodReadonly = (model: ZodTypeAny): model is ZodReadonly<ZodTypeAny> => {
  return model instanceof ZodReadonly || model._def.typeName === ZodFirstPartyTypeKind.ZodReadonly;
};

const isZodEffects = (model: ZodTypeAny): model is ZodEffects<ZodTypeAny> => {
  return model instanceof ZodEffects || model._def.typeName === ZodFirstPartyTypeKind.ZodEffects;
};

const isZodPrimitives = (model: ZodTypeAny): boolean => {
  const type = model._def.typeName as ZodFirstPartyTypeKind;

  switch (type) {
    case ZodFirstPartyTypeKind.ZodString:
    case ZodFirstPartyTypeKind.ZodNumber:
    case ZodFirstPartyTypeKind.ZodBigInt:
    case ZodFirstPartyTypeKind.ZodBoolean:
    case ZodFirstPartyTypeKind.ZodDate:
    case ZodFirstPartyTypeKind.ZodSymbol:
    case ZodFirstPartyTypeKind.ZodUndefined:
    case ZodFirstPartyTypeKind.ZodNull:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodAny:
    case ZodFirstPartyTypeKind.ZodUnknown:
    case ZodFirstPartyTypeKind.ZodNever:
    case ZodFirstPartyTypeKind.ZodNaN:
      return true;

    default:
      return false;
  }
};

type ParsedFormKeys<Type, PrevKey extends string = ""> = Required<{
  // #region
  [K in keyof Type]: IsObject<Type[K]> extends true // If key was an object, or an array
    ? Type[K] extends object[] // If key was an array, set as a function
      ? {
          <Index extends number>(
            index: Index,
          ): ParsedFormKeys<Type[K], K extends string ? `${K}.${Index}` : "">[0];
          key: K;
        }
      : ParsedFormKeys<
          Type[K],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          CreateKeyWithPrevKey<PrevKey, K>
        >
    : CreateKeyWithPrevKey<PrevKey, K>; // If key was a primitive (string, number, boolean)
  // #endregion
}>;

type ZodSchemaKeys =
  | string
  | true
  | {
      [key: string]: ZodSchemaKeys;
    }
  | {
      (index: number): ZodSchemaKeys;
      key: string;
    };

const getKeysFromZodSchema = (model: ZodTypeAny, parentKey?: string): ZodSchemaKeys => {
  if (isZodObject(model)) {
    const objKeys: ZodSchemaKeys = {};

    Object.entries(model.shape).map(([key, schema]) => {
      objKeys[key] = getKeysFromZodSchema(
        schema as ZodTypeAny,
        parentKey ? `${parentKey}.${key}` : key,
      );
    });

    return objKeys;
  } else if (isZodUnion(model)) {
    const result = model.options.reduce((prev: ZodSchemaKeys, curr: ZodTypeAny) => {
      const result = getKeysFromZodSchema(curr, parentKey);

      return {
        ...(typeof prev === "object" ? prev : {}),
        ...(typeof result === "object" ? result : {}), //
      };
    }, {});

    if (Object.keys(result).length > 0) {
      return result;
    }
  } else if (isZodIntersection(model)) {
    const left = getKeysFromZodSchema(model._def.left, parentKey);
    const right = getKeysFromZodSchema(model._def.right, parentKey);

    return {
      ...(typeof left === "object" ? left : {}),
      ...(typeof right === "object" ? right : {}),
    };
  } else if (isZodArray(model)) {
    const arrayElement = model.element;

    if (!isZodPrimitives(arrayElement)) {
      const arrayKey = (index: number) =>
        getKeysFromZodSchema(arrayElement, `${parentKey}.${index}`);
      arrayKey.key = parentKey!;

      return arrayKey;
    }

    return getKeysFromZodSchema(arrayElement, parentKey);
  } else if (isZodOptional(model) || isZodNullable(model) || isZodPromise(model)) {
    return getKeysFromZodSchema(model.unwrap(), parentKey);
  } else if (isZodDefault(model) || isZodReadonly(model)) {
    return getKeysFromZodSchema(model._def.innerType, parentKey);
  } else if (isZodEffects(model)) {
    return getKeysFromZodSchema(model._def.schema, parentKey);
  }

  if (parentKey) {
    return parentKey;
  }

  return {};
};

type ParsedZodSchema<Model extends ZodTypeAny> = ParsedFormKeys<
  Required<NestedUnionToIntersection<TypeOf<Model>>>
>;

export const zodToNames = <Model extends ZodTypeAny>(model: Model): ParsedZodSchema<Model> => {
  type TypeOfModel = Required<NestedUnionToIntersection<TypeOf<Model>>>;

  return getKeysFromZodSchema(model) as ParsedFormKeys<TypeOfModel>;
};
