import App from '../../src/App'

describe('sample', function () {
  
  let app: App
  beforeEach(function () {
    app = new App()
  })
  
  it('should exist', function () {
    expect(app).to.exist
  })
})
