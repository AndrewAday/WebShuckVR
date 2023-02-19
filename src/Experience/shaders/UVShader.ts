import BaseShader from "./BaseShader";
import fragmentShader from "./default/frag.glsl";

export default class UVShader extends BaseShader {

	static shaderName = 'UVShader';

	getFragShader(): string {

		return fragmentShader;

	}

}
