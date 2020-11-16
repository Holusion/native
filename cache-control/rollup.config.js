import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
import requireJSON from "@rollup/plugin-json";
export default [
	{
		input: "lib/index.js",
		external: [
			"@firebase/app", "@firebase/storage", 
			"fs", "path", "https", "events"
		],
		plugins: [
			alias({entries:[
				{find: "deviceInfo", replacement: "./lib/dependencies/deviceInfo.node.js"},
				{find: "filesystem", replacement: "./lib/dependencies/filesystem.node.js"},
				{find: "firebase", replacement: "./lib/dependencies/firebase.node.js"},
				{find: "writeToFile", replacement: "./lib/dependencies/writeToFile.node.js"},
			]}),
			resolve({mainFields:["main", "module"]}),
			commonjs(),
			requireJSON(),
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
			"react-native-device-info",
      "@react-native-firebase/app", "@react-native-firebase/storage",
      "@react-native-firebase/functions", "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
			"react-native-fs", 
			"events" // react-native provides this module
		],
		plugins: [
			alias({entries:[
				{find: "deviceInfo", replacement: "./lib/dependencies/deviceInfo.native.js"},
				{find: "filesystem", replacement: "./lib/dependencies/filesystem.native.js"},
				{find: "firebase", replacement: "./lib/dependencies/firebase.native.js"},
				{find: "writeToFile", replacement: "./lib/dependencies/writeToFile.native.js"},
			]}),
			resolve({mainFields:["main", "module"]}),
			commonjs(),
			babel({
				babelrc: false,
				babelHelpers: 'bundled',
				presets: [['@babel/env', { modules: false, targets: {"ios": 9}}]],
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