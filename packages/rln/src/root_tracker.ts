class RootPerBlock {
  public constructor(
    public root: Uint8Array,
    public blockNumber: number
  ) {}
}

const maxBufferSize = 20;

export class MerkleRootTracker {
  private validMerkleRoots: Array<RootPerBlock> = new Array<RootPerBlock>();
  private merkleRootBuffer: Array<RootPerBlock> = new Array<RootPerBlock>();

  public constructor(
    private acceptableRootWindowSize: number,
    initialRoot: Uint8Array
  ) {
    this.pushRoot(0, initialRoot);
  }

  public backFill(fromBlockNumber: number): void {
    if (this.validMerkleRoots.length == 0) return;

    let numBlocks = 0;
    for (let i = this.validMerkleRoots.length - 1; i >= 0; i--) {
      if (this.validMerkleRoots[i].blockNumber >= fromBlockNumber) {
        numBlocks++;
      }
    }

    if (numBlocks == 0) return;

    const olderBlock = fromBlockNumber < this.validMerkleRoots[0].blockNumber;

    // Remove last roots
    let rootsToPop = numBlocks;
    if (this.validMerkleRoots.length < rootsToPop) {
      rootsToPop = this.validMerkleRoots.length;
    }

    this.validMerkleRoots = this.validMerkleRoots.slice(
      0,
      this.validMerkleRoots.length - rootsToPop
    );

    if (this.merkleRootBuffer.length == 0) return;

    if (olderBlock) {
      const idx = this.merkleRootBuffer.findIndex(
        (x) => x.blockNumber == fromBlockNumber
      );
      if (idx > -1) {
        this.merkleRootBuffer = this.merkleRootBuffer.slice(0, idx);
      }
    }

    // Backfill the tree's acceptable roots
    let rootsToRestore =
      this.acceptableRootWindowSize - this.validMerkleRoots.length;
    if (this.merkleRootBuffer.length < rootsToRestore) {
      rootsToRestore = this.merkleRootBuffer.length;
    }

    for (let i = 0; i < rootsToRestore; i++) {
      const x = this.merkleRootBuffer.pop();
      if (x) this.validMerkleRoots.unshift(x);
    }
  }

  public pushRoot(blockNumber: number, root: Uint8Array): void {
    this.validMerkleRoots.push(new RootPerBlock(root, blockNumber));

    // Maintain valid merkle root window
    if (this.validMerkleRoots.length > this.acceptableRootWindowSize) {
      const x = this.validMerkleRoots.shift();
      if (x) this.merkleRootBuffer.push(x);
    }

    // Maintain merkle root buffer
    if (this.merkleRootBuffer.length > maxBufferSize) {
      this.merkleRootBuffer.shift();
    }
  }

  public roots(): Array<Uint8Array> {
    return this.validMerkleRoots.map((x) => x.root);
  }

  public buffer(): Array<Uint8Array> {
    return this.merkleRootBuffer.map((x) => x.root);
  }
}
