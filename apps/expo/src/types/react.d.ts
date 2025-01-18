declare module 'react' {
  export type ReactNode = 
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactElement
    | ReactFragment
    | ReactPortal
    | Iterable<ReactNode>

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T
    props: P
    key: Key | null
  }

  export type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>)

  export type Key = string | number

  export type ReactFragment = {} | Iterable<ReactNode>
  export type ReactPortal = ReactElement & { key: Key | null }

  export interface Component<P = {}, S = {}> {
    render(): ReactNode
    props: Readonly<P>
    state: Readonly<S>
    setState(state: S | ((prevState: S) => S)): void
  }

  export interface ComponentType<P = {}> {
    new (props: P): Component<P>
    (props: P): ReactElement<P> | null
  }

  export interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
    defaultProps?: Partial<P>
    propTypes?: WeakValidationMap<P>
  }

  export interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
    displayName?: string
  }

  export interface ExoticComponent<P = {}> {
    (props: P): ReactElement | null
    readonly $$typeof: symbol
  }

  export type WeakValidationMap<T> = {
    [K in keyof T]?: null extends T[K]
      ? Validator<T[K] | null | undefined>
      : undefined extends T[K]
      ? Validator<T[K] | null | undefined>
      : Validator<T[K]>
  }

  export type Validator<T> = { (props: { [key: string]: any }, propName: string, componentName: string, ...rest: any[]): Error | null }

  export function createElement(
    type: string | ComponentType,
    props?: any,
    ...children: ReactNode[]
  ): ReactElement

  export const Fragment: ComponentType

  // Hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T
  export function useRef<T>(initialValue: T): { current: T }
  export function useContext<T>(context: React.Context<T>): T
  export function useReducer<R extends React.Reducer<any, any>>(
    reducer: R,
    initialState: React.ReducerState<R>,
    initializer?: (arg: React.ReducerState<R>) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>]

  // Forward Ref
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => ReactElement | null
  ): ForwardRefExoticComponent<P & { ref?: React.Ref<T> }>

  // Context
  export interface Context<T> {
    Provider: ComponentType<{ value: T }>
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>
  }
  export function createContext<T>(defaultValue: T): Context<T>

  // Refs
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void)
  export type RefObject<T> = { current: T | null }
  export type RefCallback<T> = (instance: T | null) => void
}
