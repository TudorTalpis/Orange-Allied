import { sleep } from "@/lib/utils";

/**
 * Mock services deliberately take a little time so that every loading state in
 * the UI is exercised during development.
 */
export function mockLatency(min = 220, max = 620): Promise<void> {
  return sleep(min + Math.random() * (max - min));
}
