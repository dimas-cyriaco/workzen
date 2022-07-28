import './style.css';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <p>Updated!</p>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
