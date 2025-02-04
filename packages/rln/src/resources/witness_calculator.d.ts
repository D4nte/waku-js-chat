export async function builder(
  code: Uint8Array,
  sanityCheck: boolean
): Promise<WitnessCalculator>;

export class WitnessCalculator {
  public calculateWitness(
    input: unknown,
    sanityCheck: boolean
  ): Promise<Array<bigint>>;
}
