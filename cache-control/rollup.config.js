import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
export default [
	{
		input: "lib/index.js",
		external: [
			"@firebase/app", "@firebase/storage", 
			"fs", "path", "https", "events"
		],
		plugins: [
			alias({entries:[
				{find: "filesystem", replacement: "./lib/dependencies/filesystem.node.js"},
				{find: "firebase", replacement: "./lib/dependencies/firebase.node.js"},
				{find: "writeToFile", replacement: "./lib/dependencies/writeToFile.node.js"},
			]}),
			resolve({mainFields:["main", "module"]}),
			commonjs(),
			babel({
				babelrc: true, // use the same babel transform as in tests
				babelHelpers: 'bundled',
			})
		],
		output: {
			file: "dist/cache-control.js",
			exports: "named",
			name: "cache-control",
		}
	},{
		input: "lib/index.js",
		external: [
			"@react-native-firebase/app", "@react-native-firebase/storage",
			"react-native-fs", 
			"EventEmitter" // react-native provides this module
		],
		plugins: [
			alias({entries:[
				{find: "filesystem", replacement: "./lib/dependencies/filesystem.native.js"},
				{find: "firebase", replacement: "./lib/dependencies/firebase.native.js"},
				{find: "writeToFile", replacement: "./lib/dependencies/writeToFile.native.js"},
				{find: "events", replacement: "./lib/dependencies/events.native.js"}
			]}),
			resolve({mainFields:["main", "module"]}),
			commonjs(),
			babel({
				babelrc: false,
				babelHelpers: 'bundled',
				presets: [['@babel/env', { loose: true, modules: false }]],
			})
		],
		output: {
			file: "dist/cache-control-native.js",
			exports: "named",
			format: "cjs",
			name: "cache-control",
		}
	}
];