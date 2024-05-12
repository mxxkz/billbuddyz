export default function cn(...classes: (string | boolean)[]): string {
  return classes.filter((cls) => typeof cls === 'string').join(" ");
}
