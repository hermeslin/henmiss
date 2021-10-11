import { mutez2Tez } from '../../src/utils/tezos.js';

describe('tezos useful utility', () => {
  it('converts mutez to tez', async () => {
    const tez = mutez2Tez(300000);
    expect(0.3).toStrictEqual(tez);
  });
});
