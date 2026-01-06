// This file vendored from:
// https://github.com/raflymln/zod-key-parser
// MIT License
// Copyright (c) 2023 Rafly Maulana
//
// Updated to work with zod v4
// All Prisma-related stuff deleted.

import type { TypeOf, ZodTypeAny } from "zod";
import {
  ZodArray,
  ZodDefault,
  ZodIntersection,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodPipe,
  ZodPromise,
  ZodReadonly,
  ZodTransform,
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

const isZodObject = (model: ZodTypeAny): model is ZodObject => {
  return model instanceof ZodObject;
};

const isZodUnion = (
  model: ZodTypeAny,
): model is ZodUnion<readonly [ZodTypeAny, ...ZodTypeAny[]]> => {
  return model instanceof ZodUnion;
};

const isZodIntersection = (model: ZodTypeAny): model is ZodIntersection<ZodTypeAny, ZodTypeAny> => {
  return model instanceof ZodIntersection;
};

const isZodArray = (model: ZodTypeAny): model is ZodArray<ZodTypeAny> => {
  return model instanceof ZodArray;
};

const isZodOptional = (model: ZodTypeAny): model is ZodOptional<ZodTypeAny> => {
  return model instanceof ZodOptional;
};

const isZodDefault = (model: ZodTypeAny): model is ZodDefault<ZodTypeAny> => {
  return model instanceof ZodDefault;
};

const isZodNullable = (model: ZodTypeAny): model is ZodNullable<ZodTypeAny> => {
  return model instanceof ZodNullable;
};

const isZodPromise = (model: ZodTypeAny): model is ZodPromise<ZodTypeAny> => {
  return model instanceof ZodPromise;
};

const isZodReadonly = (model: ZodTypeAny): model is ZodReadonly<ZodTypeAny> => {
  return model instanceof ZodReadonly;
};

const isZodTransformOrPipe = (
  model: ZodTypeAny,
): model is ZodTransform<unknown, unknown> | ZodPipe<ZodTypeAny, ZodTypeAny> => {
  return model instanceof ZodTransform || model instanceof ZodPipe;
};

const isZodPrimitives = (model: ZodTypeAny): boolean => {
  // In Zod v4, we check if it's a primitive type by excluding compound types
  // A schema is primitive if it's not an object, array, union, intersection, or wrapper type
  return !(
    isZodObject(model) ||
    isZodArray(model) ||
    isZodUnion(model) ||
    isZodIntersection(model) ||
    isZodOptional(model) ||
    isZodNullable(model) ||
    isZodDefault(model) ||
    isZodPromise(model) ||
    isZodReadonly(model) ||
    isZodTransformOrPipe(model)
  );
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
    const left = getKeysFromZodSchema(model.def.left, parentKey);
    const right = getKeysFromZodSchema(model.def.right, parentKey);

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
    return getKeysFromZodSchema(model.def.innerType, parentKey);
  } else if (isZodTransformOrPipe(model)) {
    // TODO figure out a way to do this
    // for now just can't use this function with zfd.formData or similar
    // For ZodTransform and ZodPipe, we can't reliably extract the schema structure
    // so we treat them as primitives
    if (parentKey !== undefined) {
      return parentKey;
    }
    throw new Error("zod-keys.ts cannot handle transforms or pipes at the root");
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
