// Inicializar Supabase usando las variables o el archivo global '../js/supabase.js'
// Asegúrate de que _supabase esté disponible globalmente.

const app = document.getElementById('app');

// Comprobar la sesión actual del administrador al cargar la página
async function initAdmin() {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        renderLoginForm();
    } else {
        renderDashboard();
    }
}

// 1. Renderizar Pantalla de Login si no hay sesión
function renderLoginForm() {
    app.innerHTML = `
        <div style="max-width: 400px; margin: 100px auto; padding: 30px; background: #111; color: #fff; border-radius: 8px; font-family: sans-serif;">
            <h2 style="text-align: center; margin-bottom: 20px;">KUROZA ADMIN</h2>
            <form id="login-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">CORREO</label>
                    <input type="email" id="email" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">CONTRASEÑA</label>
                    <input type="password" id="password" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                </div>
                <button type="submit" style="width: 100%; padding: 12px; background: #fff; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">Entrar al Panel</button>
            </form>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert('Acceso denegado: ' + error.message);
        } else {
            renderDashboard();
        }
    });
}

// 2. Renderizar el Panel de Control y Subida de Beats
function renderDashboard() {
    app.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto; padding: 30px; background: #111; color: #fff; border-radius: 8px; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>SUBIR NUEVO BEAT</h2>
                <button id="logout-btn" style="padding: 5px 10px; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cerrar Sesión</button>
            </div>
            
            <form id="upload-beat-form">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Título del Beat</label>
                    <input type="text" id="beat-title" placeholder="Ej: Fuego" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Género / Estilo</label>
                    <input type="text" id="beat-genre" placeholder="Ej: Dancehall / Urban" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">BPM</label>
                        <input type="number" id="beat-bpm" placeholder="140" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Tonalidad (Key)</label>
                        <input type="text" id="beat-key" placeholder="F# Minor" required style="width: 100%; padding: 10px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px;">
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Archivo de Audio (Preview MP3)</label>
                    <input type="file" id="beat-audio" accept="audio/mp3,audio/mpeg" required style="width: 100%; color: #aaa;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Imagen de Portada (Cover Art)</label>
                    <input type="file" id="beat-cover" accept="image/*" required style="width: 100%; color: #aaa;">
                </div>

                <button type="submit" id="submit-btn" style="width: 100%; padding: 12px; background: #fff; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">Publicar Beat en la Tienda</button>
            </form>
        </div>
    `;

    // Botón de Cerrar Sesión
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await _supabase.auth.signOut();
        renderLoginForm();
    });

    // Evento al enviar el formulario de subida
    document.getElementById('upload-beat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        btn.innerText = 'Subiendo archivos...';
        btn.disabled = true;

        const title = document.getElementById('beat-title').value;
        const genre = document.getElementById('beat-genre').value;
        const bpm = parseInt(document.getElementById('beat-bpm').value);
        const musical_key = document.getElementById('beat-key').value;
        
        const audioFile = document.getElementById('beat-audio').files[0];
        const coverFile = document.getElementById('beat-cover').files[0];

        try {
            // 1. Subir Audio al Storage usando el bucket 'kuroza-files'
            const audioPath = `audio/${Date.now()}_${audioFile.name}`;
            const { error: audioError } = await _supabase.storage.from('kuroza-files').upload(audioPath, audioFile);
            if (audioError) throw audioError;
            const audio_url = _supabase.storage.from('kuroza-files').getPublicUrl(audioPath).data.publicUrl;

            // 2. Subir Portada al Storage usando el bucket 'kuroza-files'
            const coverPath = `covers/${Date.now()}_${coverFile.name}`;
            const { error: coverError } = await _supabase.storage.from('kuroza-files').upload(coverPath, coverFile);
            if (coverError) throw coverError;
            const cover_url = _supabase.storage.from('kuroza-files').getPublicUrl(coverPath).data.publicUrl;

            // 3. Insertar datos en la tabla 'beats' de la base de datos
            const { error: dbError } = await _supabase.from('beats').insert([{
                title,
                genre,
                bpm,
                musical_key,
                cover_url,
                audio_url
            }]);

            if (dbError) throw dbError;

            alert('¡Beat publicado con éxito!');
            document.getElementById('upload-beat-form').reset();
        } catch (error) {
            alert('Error al publicar: ' + error.message);
            console.error(error);
        } finally {
            btn.innerText = 'Publicar Beat en la Tienda';
            btn.disabled = false;
        }
    });
}

// Inicializar la app del admin
initAdmin();