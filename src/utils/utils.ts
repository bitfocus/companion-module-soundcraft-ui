export function intToBool(value: number): boolean {
  return value === 1;
}

export function stringToInt(value: string): number {
  return parseInt(value, 10);
}

export function binaryStringToBool(value: string): boolean {
  return intToBool(stringToInt(value));
}
