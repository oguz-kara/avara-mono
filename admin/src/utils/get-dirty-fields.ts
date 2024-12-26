export function getDirtyFields<T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, boolean | object>>,
  allValues: T
): Partial<T> {
  if (dirtyFields === true) {
    return allValues
  }

  return Object.keys(dirtyFields).reduce((acc, key) => {
    const currentDirtyField = dirtyFields[key as keyof T]
    if (currentDirtyField) {
      const typedKey = key as keyof T
      acc[typedKey] = (
        typeof currentDirtyField === 'object'
          ? getDirtyFields(
              currentDirtyField as any,
              allValues[typedKey] as Record<string, any>
            )
          : allValues[typedKey]
      ) as T[typeof typedKey]
    }
    return acc
  }, {} as Partial<T>)
}
