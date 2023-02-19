import BaseShader from './BaseShader';
import UVShader from './UVShader';
import AudioShader from './AudioShader';
import Test3DShader from './Test3DShader';
import UVTextureShader from './UVTextureShader';
import ChatGPTTerrainShader from './ChatGPTTerrainShader';

export default class ShaderFactory {

	static ShaderTypes = [ UVShader, AudioShader, Test3DShader, UVTextureShader, ChatGPTTerrainShader ];

	static GetShader( shaderName: string ): BaseShader | undefined {

		for ( const ShaderType of ShaderFactory.ShaderTypes ) {

			if ( ShaderType.shaderName === shaderName )
				return new ShaderType( );

		}

	}

}
