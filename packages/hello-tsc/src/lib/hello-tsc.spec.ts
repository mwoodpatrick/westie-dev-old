import { helloTsc } from './hello-tsc';

describe('helloTsc', () => {
  it('should work', () => {
    expect(helloTsc()).toEqual('hello-tsc');
  });
});
