const RANDOM_SEGMENT_LENGTH = 8

function randomSegment() {
  return Math.random().toString(36).slice(2, 2 + RANDOM_SEGMENT_LENGTH)
}

export function createEntityId(prefix: string) {
  return `${prefix}_${randomSegment()}`
}
