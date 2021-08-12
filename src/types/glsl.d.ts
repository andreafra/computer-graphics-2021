// Required for ts-shader-loader, otherwise the Typescript compiler will complain about it.
declare module "*.glsl" {
	const value: string;
	export default value;
}
