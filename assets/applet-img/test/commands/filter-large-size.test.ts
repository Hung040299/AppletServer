import {expect, test} from '@oclif/test'

describe('filter-large-size', () => {
  test
  .stdout()
  .command(['filter-large-size'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['filter-large-size', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
