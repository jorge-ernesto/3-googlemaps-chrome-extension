chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: functionToInject
    });
});

function functionToInject() {

    /****************** AGREGAR BOTONES ******************/

    function agregarEstilos() {

        // Estilos CSS para el boton
        const style = document.createElement('style');
        style.textContent = `
            .custom-button {
                background-color: white;
                border-radius: 18px;
                border: 1px solid #dcdcdc;
                color: #1a73e8;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                margin-right: 8px;
                padding: 3px 12px;
                text-align: center;
                text-decoration: none;
            }
            .custom-button:hover {
                background-color: #f1f3f4;
            }
            .custom-button:focus {
                box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.3);
                outline: none;
            }
        `;
        document.head.appendChild(style);
    }

    function crearBoton(text, id) {

        const button = document.createElement('button');
        button.textContent = text;
        button.id = id;
        button.className = 'custom-button';
        return button;
    }

    function agregarBotones() {

        const divElement = document.querySelector('div.m6QErb.vRIAEd.XiKgde.tLjsW');
        if (divElement) {
            const buttonObtenerData = crearBoton('Obtener data', 'obtener-data');
            const buttonCopiarData = crearBoton('Copiar data', 'copiar-data');
            const divButton = document.createElement('div');
            divButton.append(buttonObtenerData, buttonCopiarData);
            divElement.append(divButton);

        } else {
            console.error('No se encontró la etiqueta nav con aria-label="Principal".');
        }
    }

    // Validar que los botones ya fueron creados
    if (!document.getElementById('obtener-data')) {
        agregarEstilos();
        agregarBotones();
    }

    /****************** OBTENER DATA ******************/

    let dataUbicaciones = [];
    let iteraccionUbicaciones = 0;

    function obtenerUbicaciones() {

        console.log('obtenerUbicaciones');

        // Obtener ubicaciones
        let ubicaciones = document.querySelectorAll('button.SMP2wb.fHEb6e');

        // Convertir NodeList en Array, para recorrerlo con forEach. Mencionar que forEach si puede recorrer un NodeList.
        let ubicaciones_ = [...ubicaciones].map((boton) => {
            return {
                boton: boton
            };
        });

        // Obtener data de ubicaciones -- no se puede usar await dentro de forEach
        async function clickConEspera() {
            for (const [key, value] of ubicaciones_.entries()) {

                if (key >= iteraccionUbicaciones) {

                    // Dar click a boton
                    value.boton.click();
                    console.log(`Clic en el botón ${key}`);

                    // Esperar a que aparezca el modal
                    await new Promise(resolve => {
                        const interval = setInterval(() => {
                            if (modalVisible()) {
                                clearInterval(interval);
                                resolve();
                            }
                        }, 1000); // Verificar cada segundo si el modal está visible
                    });

                    // Eliminar elemento header o h1 del modal que sirve para identificar que el modal aparecio
                    const modalHeader = document.querySelector('h1.DUwDvf.lfPIob');
                    if (modalHeader) {
                        modalHeader.remove();
                    }

                    // Obtener data
                    let id = key;
                    let nombre = value.boton.querySelector('.fontHeadlineSmall.rZF81c')?.textContent;
                    let direccion = document.querySelector('.Io6YTe.fontBodyMedium.kR99db')?.textContent || document.querySelector('.DkEaL')?.textContent;
                    let departamento = direccion.split(',').pop().trim();
                    let url = window.location.href;
                    let latitud = '';
                    let longitud = '';
                    let regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
                    let match = url.match(regex);

                    if (match) {
                        latitud = match[1];
                        longitud = match[2];
                    }

                    // Obtener data
                    dataUbicaciones.push({
                        id: id,
                        nombre: nombre,
                        direccion: direccion,
                        departamento: departamento,
                        url: url,
                        latitud: latitud,
                        longitud: longitud
                    });

                    // Debug
                    console.log(dataUbicaciones);

                    // Aumentar iteraccion
                    iteraccionUbicaciones++;

                    // Modificar nombre de boton
                    document.getElementById('obtener-data').innerText = `Obtener data: ${iteraccionUbicaciones} de ${ubicaciones_.length}`
                }
            }
        }

        clickConEspera();
    }

    function modalVisible() {
        const modalHeader = document.querySelector('h1.DUwDvf.lfPIob');
        return modalHeader !== null;
    }

    document.getElementById('obtener-data').addEventListener('click', function obtenerData() {
        obtenerUbicaciones();
        document.getElementById('obtener-data').removeEventListener('click', obtenerData);
    });

    document.getElementById('copiar-data').addEventListener('click', function obtenerData() {
        const jsonIteraccionUbicaciones = JSON.stringify(dataUbicaciones);
        navigator.clipboard.writeText(jsonIteraccionUbicaciones)
            .then(() => {
                console.log('Iteraciones de ubicaciones copiadas al portapapeles.');
            })
            .catch(err => {
                console.error('Error al copiar las iteraciones de ubicaciones al portapapeles:', err);
            });
    });
}
