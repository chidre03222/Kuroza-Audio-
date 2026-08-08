// Inicializar Supabase con tus credenciales
const SUPABASE_URL = 'https://vemkpldpcknquxzwqvow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hlnxd6R1AnFZ8XaVAOHKpQ_oYU29F_m';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cargar Beats desde Supabase (para la página principal index.html)
async function loadBeats() {
    const container = document.getElementById('beats-container');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color:#888;">Cargando beats desde Supabase...</p>';

    try {
        const { data: beats, error } = await supabase
            .from('beats')
            .select('*');

        if (error) {
            throw error;
        }

        container.innerHTML = '';
        if (!beats || beats.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#888;">No hay beats disponibles por ahora.</p>';
            return;
        }

        beats.forEach((beat) => {
            const beatElement = document.createElement('div');
            beatElement.className = 'beat-card';
            beatElement.style.cssText = "background:#111; padding:15px; margin-bottom:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;";
            
            beatElement.innerHTML = `
                <div>
                    <h3 style="color:#fff; margin:0 0 5px 0;">${beat.title || 'Sin título'}</h3>
                    <p style="color:#aaa; margin:0;">BPM: ${beat.bpm || 'N/A'} | Key: ${beat.key || 'N/A'}</p>
                </div>
                <div>
                    <span style="color:#0f0; font-weight:bold; margin-right:15px;">$${beat.price || 0}</span>
                    <button onclick="addToCart('${beat.title || 'Beat'}', ${beat.price || 0})" style="background:#25D366; color:#fff; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Comprar</button>
                </div>
            `;
            container.appendChild(beatElement);
        });

    } catch (error) {
        console.error("Error al cargar los beats: ", error.message);
        container.innerHTML = '<p style="text-align:center; color:red;">Error al cargar los beats desde Supabase.</p>';
    }
}

// Ejecutar automáticamente al cargar la página si el contenedor existe
document.addEventListener('DOMContentLoaded', () => {
    loadBeats();
});