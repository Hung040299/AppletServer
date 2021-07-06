import {expect, test} from '@oclif/test'

describe('gen-icon-list', () => {
  test
  .stdout()
  .command(['gen-icon-list'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gen-icon-list', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
