export function countryFlagSrc(countryCode: string) {
  return `/flags/${countryCode.toLowerCase()}.webp`;
}
