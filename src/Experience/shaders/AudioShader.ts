import BaseShader from "./BaseShader";
import fragmentShader from "./sound2D/sound2D.frag.glsl";

export default class AudioShader extends BaseShader {

	static shaderName = 'AudioShader';

	getFragShader(): string {

		return fragmentShader;

	}

}
