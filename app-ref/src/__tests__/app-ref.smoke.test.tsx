describe('app-ref', () => {
  it('registers expected routes', async () => {
    const { router } = await import('../router');
    expect(router.routesById['/']).toBeDefined();
    expect(router.routesById['/app-codex']).toBeDefined();
  });
});
