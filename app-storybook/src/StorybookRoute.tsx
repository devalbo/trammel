const DEV_URL = 'http://localhost:6006';

export default function StorybookRoute() {
  const baseUrl = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const isProd = import.meta.env.PROD;
  const src = isProd ? `${baseUrl}/app-storybook/index.html` : DEV_URL;

  return (
    <iframe
      src={src}
      title="Storybook"
      style={{
        border: 'none',
        width: '100%',
        height: 'calc(100vh - 120px)',
        display: 'block',
      }}
    />
  );
}
