// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.

//REMEMBER : alpha blending (normal blending) -> C_o = C_f * α_f + C_b * (1 - α_f)

//N.B : let indexFg = (j * fgImg.width + i) * 4;
//Per capire questa riga fai un disegno; il vettore 1S si crea mettendo una di fianco all'altra le righe di pixel e moltiplicando per 4 (RGBA).
//Ciò significa che se vogliamo il pixel (x;2), che sta alla seconda riga, dobbiamo prima spostarci di x, poi ci dobbiamo spostare di width.

function composite( bgImg, fgImg, fgOpac, fgPos )
{

    for (let i = 0; i < fgImg.width ; i++) {
        for (let j = 0; j < fgImg.height; j++) {

            //calcola indice vettore 1D di fg
            let indexFg = (j * fgImg.width + i) * 4;

            // Normalizza l'alpha (se è nell'intervallo 0-255, dividiamo per 255)
            let fgAlpha = fgImg.data[indexFg + 3] / 255; // fgImg.data[indexFg + 3] è il canale alpha

            // Normalizza l'alpha anche se il parametro fgOpac è 0-1 (per evitare sovrapposizioni indesiderate)
            fgAlpha *= fgOpac;  // Combina il valore alpha della foreground con l'opacità (fgOpac)

            //calcola posizione rispetto a bg
            let bgX = i + fgPos.x;
            let bgY = j + fgPos.y;

            //calcolo indice vettore 1D di bg
            let indexBg = (bgY * bgImg.width + bgX) * 4;

            if (bgX >= 0 && bgX < bgImg.width && bgY >= 0 && bgY < bgImg.height) {

                bgImg.data[indexBg + 0] = fgImg.data[indexFg + 0] * fgOpac + bgImg.data[indexBg + 0] * (1 - fgAlpha); // R value
                bgImg.data[indexBg + 1] = fgImg.data[indexFg + 1] * fgOpac + bgImg.data[indexBg + 1] * (1 - fgAlpha); // G value
                bgImg.data[indexBg + 2] = fgImg.data[indexFg + 2] * fgOpac + bgImg.data[indexBg + 2] * (1 - fgAlpha); // B value

                // Normalizza l'alpha (se è nell'intervallo 0-255, dividiamo per 255)
                let bgAlpha = bgImg.data[indexBg + 3]/255;

                //alpha blending
                bgImg.data[indexBg + 3] = (fgAlpha + (1 - fgAlpha) * bgAlpha)*255
            }
            
        }
    }
}