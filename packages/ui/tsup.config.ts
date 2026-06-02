import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  target: 'esnext',
  minify: true,
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'framer-motion',
    'lucide-react',
    '@floating-ui/react',
    '@floating-ui/react-dom',
    'lenis',
  ],
  tsconfig: './tsconfig.json',
});
