import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from "@rollup/plugin-commonjs";
import babel from '@rollup/plugin-babel';
import requireJSON from "@rollup/plugin-json";

function replacements (type){
	return [
		"deviceInfo", "filesystem", "filepaths", "firebase", "writeToFile", "upload",
	].map(n=> ({find: n, replacement: `./lib/dependencies/${n}.${type}.js`}));
}

export default [
	{
		input: "lib/index.js",
		external: [
			"firebase/compat/app", "firebase/compat/storage", "firebase/compat/auth", "firebase/compat/firestore", "firebase/compat/functions",
			"fs", "fs/promises", "path", "https", "events"
		],
		plugins: [
			alias({entries: replacements("node")}),
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
      "react-native-background-upload",
			"events" // react-native provides this module
		],
		plugins: [
			alias({entries: replacements("native")}),
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