import { formatDuration } from "./utils"

const cases = [
  { input: 0, expected: "0:00" },
  { input: 59.9, expected: "0:59" },
  { input: 60, expected: "1:00" },
  { input: 61.2, expected: "1:01" },
  { input: 3599.8, expected: "59:59" },
  { input: 3600, expected: "1:00:00" },
  { input: 3661.9, expected: "1:01:01" },
]

let passed = 0

for (const { input, expected } of cases) {
  const result = formatDuration(input)
  if (result !== expected) {
    console.error(`formatDuration(${input}) => ${result}, expected ${expected}`)
    process.exitCode = 1
    break
  }
  passed += 1
}

if (passed === cases.length) {
  console.log("formatDuration tests passed")
}
