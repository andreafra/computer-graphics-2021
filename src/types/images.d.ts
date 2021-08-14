// Required for loading images otherwise the Typescript compiler will complain about it.
declare module "*.png" {
	const value: string;
	export default value;
}
