// Type declarations for translation resources
declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}
