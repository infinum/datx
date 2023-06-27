export const oneOfType = 'oneOf' as const;

export interface IOneOfGenerator<T> {
  type: 'oneOf';
  call: () => T;
}

export const oneOf = <T>(...options: Array<T>) => ({
  type: oneOfType,
  call: () => {
    const randomIndex = Math.floor(Math.random() * options.length);

    return options[randomIndex];
  },
});

export const bool = () => oneOf(true, false);
