// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.

// **array[0]	array[3]	array[6]**

// **array[1]	array[4]	array[7]**

// **array[2]	array[5]	array[8]**

function GetTransform( positionX, positionY, rotation, scale )
{
	//devi prima convertire da gradi a radianti

	const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad)
    const sin = Math.sin(rad);

	return Array( scale*cos, scale*sin, 0,
			     -sin*scale, scale*cos, 0,
				  positionX, positionY, 1 );
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{

	const res = [];

    // Moltiplicazione delle matrici
    for (let i = 0; i < 3; i++) {  // Itera sulle righe della matrice risultante
        for (let j = 0; j < 3; j++) {  // Itera sulle colonne della matrice risultante
            let sum = 0;
            for (let k = 0; k < 3; k++) {  // Somma prodotto delle righe di trans1 e colonne di trans2
                sum += trans1[i + k * 3] * trans2[k + j * 3]; // Indice in colonna-maggiore
            }
            res[i + j * 3] = sum;  // Assegna il valore nella posizione corretta (colonna-maggiore)
        }
    }

    return res;
}
