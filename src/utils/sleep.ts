/**
 * Sleep for a given amount of time
 * @param ms time to sleep
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
