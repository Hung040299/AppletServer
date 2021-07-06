import {expect, test} from '@oclif/test'

describe('upload-s3', () => {
  test
  .stdout()
  .command(['upload-s3'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['upload-s3', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
