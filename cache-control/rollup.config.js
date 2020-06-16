import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
export default [
	{
		input: "lib/index.js",
		external: ["@firebase/app", "@firebase/storage", "fs", "path", "https"],
		plugins: [
			alias({entries:[
				{find: "filesystem", replacement: "./lib/dependencies/filesystem.node.js"},
				{find: "firebase", replacement: "./lib/dependencies/firebase.node.js"},
				{find: "fetch", replacement: "./lib/dependencies/fetch.node.js"},
				{find: "writeToFile", replacement: "./lib/dependencies/writeToFile.node.js"},
			]}),
			resolve({mainFields:["main", "module"]}),
			commonjs(),
			babel({ babelHelpers: 'bundled' })
		],
		output: {
			file: "dist/cache-control.js",
			exports: "named",
			name: "cache-control",
		}
	}
];