import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const bannerText = `/*! *****************************************************************************
  ${pkg.name}
  Version ${pkg.version}

  ${pkg.description}
  Please submit bugs at ${pkg.bugs.url}

  (c) ${pkg.author}
  Licence: ${pkg.license}

  This file is auto-generated. Do not edit.
***************************************************************************** */

`;
export default [
  {
    input: './src/frontend/Frontend.ts',
    external: ['logger'],
    plugins: [typescript({ module: 'ESNext' }), nodeResolve(), commonjs(), terser()],
    output: {
      file: `./${pkg.main}`,
      format: 'iife',
      banner: bannerText,
      globals: {
        logger: 'Log',
      },
    },
  },
  {
    input: './src/backend/Backend.ts',
    external: ['node_helper', 'logger'],
    plugins: [typescript({ module: 'ESNext' }), nodeResolve(), terser()],
    output: {
      interop: 'auto',
      file: './node_helper.js',
      format: 'cjs',
      banner: bannerText,
    },
  },
];
