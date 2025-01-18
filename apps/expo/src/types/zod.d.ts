declare module "zod" {
  export const z: {
    string: () => StringSchema;
    number: () => NumberSchema;
    boolean: () => BooleanSchema;
    date: () => DateSchema;
    object: <T extends Record<string, any>>(shape: T) => ObjectSchema<T>;
  };

  interface BaseSchema<T> {
    parse: (data: unknown) => T;
    safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: ZodError };
    optional: () => this;
  }

  export interface StringSchema extends BaseSchema<string> {
    email: (message?: string) => StringSchema;
    min: (length: number, message?: string) => StringSchema;
    regex: (pattern: RegExp, message?: string) => StringSchema;
    default: (value: string) => StringSchema;
  }

  export interface NumberSchema extends BaseSchema<number> {
    min: (value: number, message?: string) => NumberSchema;
    max: (value: number, message?: string) => NumberSchema;
  }

  export interface BooleanSchema extends BaseSchema<boolean> {}

  export interface DateSchema extends BaseSchema<Date> {}

  export interface ObjectSchema<T> extends BaseSchema<T> {}

  export interface ZodError extends Error {
    errors: Array<{
      code: string;
      message: string;
      path: Array<string | number>;
    }>;
  }

  export type ZodSchema = StringSchema | NumberSchema | BooleanSchema | DateSchema | ObjectSchema<any>;

  export type infer<T> = T extends ZodSchema ? ReturnType<T['parse']> : never;
}
