// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	// [TO-DO] Modify the code below to form the transformation matrix.
	var cx = Math.cos(rotationX);
	var cy = Math.cos(rotationY);

	var sx = Math.sin(rotationX);
	var sy = Math.sin(rotationY);

	var trans = [
		cy, 0, sy, 0,
		sx * sy, cx, -sx * cy, 0,
		-cx * sy, sx, cx * cy, 0,
		translationX, translationY, translationZ, 1
	];
	var mvp = MatrixMult(projectionMatrix, trans);
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {

		// [TO-DO] initializations
		// From Project4.js -> gl = canvas.getContext("webgl", {antialias: false, depth: true}); // Initialize the GL context

		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.vertex = gl.getAttribLocation(this.prog, 'vertex');
		this.text_coord = gl.getAttribLocation(this.prog, 'text_coord');
		this.Axis_Swap = gl.getUniformLocation(this.prog, 'Axis_Swap');
		this.sampler = gl.getUniformLocation(this.prog, 'tex');
		this.show_tex = gl.getUniformLocation(this.prog, 'show_tex');

		this.vertex_buffer = gl.createBuffer();
		this.text_coord_buffer = gl.createBuffer();
	}

	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords) {
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numVertices = vertPos.length / 3;
		// Bind of Buffer Object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// Bind of Texture Coordinate Buffer Object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.text_coord_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	}


	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.Axis_Swap, swap);
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.mvp, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
		gl.vertexAttribPointer(this.vertex, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertex);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.text_coord_buffer);
		gl.vertexAttribPointer(this.text_coord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.text_coord);
		gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {

		// [TO-DO] Bind the texture

		gl.useProgram(this.prog);
		const mytex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, mytex);
		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, mytex);
		gl.uniform1i(this.sampler, 0);

		gl.uniform1i(this.show_tex, 1);
	}

	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.show_tex, show);
	}

}

var meshVS = `
	uniform mat4 mvp;
	uniform int Axis_Swap;

	attribute vec2 text_coord;
	attribute vec3 vertex;
	
	varying vec2 texCoord;
		
	void main()
	{
	vec4 new_vert =vec4(vertex,1.0);
	if (Axis_Swap == 1) {
	float temp=new_vert.y;
	new_vert.y=new_vert.z;
	new_vert.z=temp;
	}
	gl_Position = mvp * new_vert;
	texCoord=text_coord;
	}
`;

var meshFS = `
	precision mediump float;

	uniform sampler2D tex;
	uniform int show_tex;

	varying vec2 texCoord;
	
	void main()
	{
	if (show_tex == 1){
	gl_FragColor=texture2D(tex,texCoord);
	}
	else{
	gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
	}
	}
`;


