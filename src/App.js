import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, X, Search, AlertTriangle, Rocket, Maximize, Zap, Scale, 
    ListFilter, ShieldCheck, Orbit, HelpCircle, CheckSquare, Square,
    Ruler, ArrowRightLeft, FilterX, Tag, BookOpen, ArrowLeft // Nuevos iconos
} from 'lucide-react';

// --- Componente de Tarjeta de Asteroide ---
const AsteroidCard = ({ asteroid }) => (
  <motion.div
    className="card-bg rounded-lg p-6 shadow-xl hover:shadow-purple-600/60 transition-shadow duration-300 border border-purple-700/50 cursor-pointer h-full flex flex-col"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.4 }}
    whileHover={{ 
      scale: 1.04, 
      y: -6, 
      transition: { duration: 0.2, ease: "easeInOut" }
    }}
  >
    <h3 className="text-xl orbitron font-bold text-purple-300 mb-2">{asteroid.name}</h3>
    {asteroid.designation && asteroid.designation !== asteroid.name && (
      <p className="text-xs text-gray-500 mb-1">Designación: {asteroid.designation}</p>
    )}
    <div className="text-sm text-gray-400 space-y-1 flex-grow">
      <p>
        Diámetro: {asteroid.estimated_diameter_km?.min?.toFixed(2) ?? 'N/A'} - {asteroid.estimated_diameter_km?.max?.toFixed(2) ?? 'N/A'} km
      </p>
      {asteroid.close_approach_data && asteroid.close_approach_data[0] && (
        <>
          <p>
            Velocidad: {(asteroid.close_approach_data[0].relative_velocity_kph ?? 0).toLocaleString()} km/h
          </p>
          <p>
            Dist. Aprox.: {(asteroid.close_approach_data[0].miss_distance_km ?? 0).toLocaleString()} km
          </p>
          {asteroid.close_approach_data[0].orbiting_body && 
            <p>Aprox. a: {asteroid.close_approach_data[0].orbiting_body} el {asteroid.close_approach_data[0].close_approach_date_full || asteroid.close_approach_data[0].close_approach_date}</p>
          }
        </>
      )}
      <p>Mag. Absoluta: {asteroid.absolute_magnitude_h ?? 'N/A'}</p>
      {asteroid.orbital_period_days && <p>Período Orbital: {parseFloat(asteroid.orbital_period_days).toFixed(2)} días</p>}
      {asteroid.orbit_class_type && <p>Clase Orbital: {asteroid.orbit_class_type}</p>}
      {asteroid.orbit_uncertainty && <p>Incertidumbre Orbital: {asteroid.orbit_uncertainty}</p>}
    </div>
    
    <div className="mt-3 pt-2 border-t border-purple-700/30 space-y-2">
        {asteroid.is_potentially_hazardous_asteroid && (
        <div className="flex items-center text-red-400">
            <AlertTriangle size={18} className="mr-2 shrink-0" />
            <span className="font-semibold">Potencialmente Peligroso</span>
        </div>
        )}
        {asteroid.is_sentry_object && (
        <div className="flex items-center text-yellow-400">
            <ShieldCheck size={18} className="mr-2 shrink-0" />
            <span className="font-semibold">Objeto Sentry</span>
        </div>
        )}
    </div>
     {asteroid.nasa_jpl_url && asteroid.nasa_jpl_url !== '#' && (
        <a 
            href={asteroid.nasa_jpl_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 hover:underline mt-2 inline-block"
            onClick={(e) => e.stopPropagation()}
        >
            Ver en JPL Database &rarr;
        </a>
    )}
  </motion.div>
);

// --- Componente para mensajes de error ---
const ErrorDisplay = ({ error, apiUrl }) => (
    <div className="flex flex-col justify-center items-center h-64 text-center text-red-400 p-4 card-bg rounded-lg">
        <Orbit size={48} className="mb-4 animate-ping"/>
        <h2 className="text-2xl orbitron mb-2">Error de Conexión Cósmica</h2>
        <p className="text-md max-w-md">{error}</p>
        <p className="text-sm mt-4">Asegúrate de que el servidor backend (Python) esté funcionando correctamente en <code>{apiUrl.replace('/api/asteroids','')}</code>.</p>
    </div>
);

// --- Componente para mostrar filtros activos ---
const ActiveFiltersDisplay = ({ activeFilters, onClearFilter, onClearAllFilters }) => {
    if (activeFilters.length === 0) {
        return null;
    }
    return (
        <div className="mb-6 p-3 card-bg rounded-lg border border-purple-700/30">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-300 mr-2 flex items-center"><Tag size={16} className="mr-1"/>Filtros Activos:</span>
                {activeFilters.map(filter => (
                    <span key={filter.key} className="flex items-center bg-purple-600/50 text-purple-200 text-xs px-2 py-1 rounded-full">
                        {filter.label}
                        <button onClick={() => onClearFilter(filter.key)} className="ml-2 text-purple-200 hover:text-white">
                            <X size={14} />
                        </button>
                    </span>
                ))}
                {activeFilters.length > 0 && ( // Solo mostrar si hay filtros
                    <button 
                        onClick={onClearAllFilters} 
                        className="ml-auto text-xs text-red-400 hover:text-red-300 hover:underline flex items-center"
                    >
                        <FilterX size={14} className="mr-1"/> Limpiar Todos
                    </button>
                )}
            </div>
        </div>
    );
};

// --- NUEVO: Componente para la Página de Glosario ---
const GlossaryPage = ({ onBack }) => {
    const glossaryItems = [
        {
            term: "Objeto Sentry",
            icon: <ShieldCheck size={24} className="text-yellow-400 mr-3" />,
            definition: "Sentry es un sistema de monitoreo de colisiones altamente automatizado operado por el JPL de la NASA. Escanea continuamente el catálogo de asteroides más actual en busca de posibilidades de impacto futuro con la Tierra durante los próximos 100 años o más. Si un objeto es detectado como 'Sentry', significa que tiene una probabilidad (generalmente muy baja) de impacto que no puede ser descartada con las observaciones actuales y requiere seguimiento.",
        },
        {
            term: "Clase Orbital",
            icon: <Orbit size={24} className="text-blue-400 mr-3" />,
            definition: "Los asteroides se clasifican en diferentes 'clases orbitales' según las características de sus órbitas alrededor del Sol, especialmente en relación con las órbitas de los planetas. Algunas clases comunes de Objetos Cercanos a la Tierra (NEOs) son:",
            subItems: [
                { term: "Aten (ATE)", definition: "Asteroides con un semieje mayor (distancia promedio al Sol) menor que el de la Tierra (< 1 AU) y un afelio (punto más lejano al Sol) mayor que el perihelio de la Tierra (> 0.983 AU). Sus órbitas cruzan la de la Tierra." },
                { term: "Apollo (APO)", definition: "Asteroides con un semieje mayor más grande que el de la Tierra (> 1 AU) y un perihelio (punto más cercano al Sol) menor que el afelio de la Tierra (< 1.017 AU). Sus órbitas también cruzan la de la Tierra." },
                { term: "Amor (AMO)", definition: "Asteroides cuyas órbitas se acercan a la de la Tierra pero no la cruzan. Tienen un perihelio entre 1.017 y 1.3 AU." },
                { term: "IEO (Interior Earth Object)", definition: "Asteroides cuyas órbitas están completamente contenidas dentro de la órbita de la Tierra (afelio < 0.983 AU)." },
            ],
        },
        {
            term: "Incertidumbre Orbital (Parámetro U)",
            icon: <HelpCircle size={24} className="text-green-400 mr-3" />,
            definition: "Es un parámetro (a menudo llamado 'U parameter' o 'Condition Code') que va de 0 a 9, indicando qué tan bien determinada está la órbita de un asteroide. Un valor de 0 significa una órbita muy bien conocida con baja incertidumbre. Un valor de 9 indica una incertidumbre muy alta. Valores más altos significan que las predicciones de su posición futura son menos precisas.",
        },
        {
            term: "Potencialmente Peligroso (PHA)",
            icon: <AlertTriangle size={24} className="text-red-400 mr-3" />,
            definition: "Un Asteroide Potencialmente Peligroso (PHA) se define en base a dos criterios principales:",
            subItems: [
                { term: "Distancia Mínima de Intersección Orbital (MOID)", definition: "El asteroide debe tener una MOID con la Tierra de 0.05 unidades astronómicas (AU) o menos. Una unidad astronómica es la distancia promedio entre la Tierra y el Sol (aproximadamente 150 millones de km). 0.05 AU son unos 7.5 millones de km." },
                { term: "Magnitud Absoluta (H)", definition: "El asteroide debe tener una magnitud absoluta (H) de 22.0 o menos (es decir, más brillante). Esto generalmente corresponde a asteroides con un tamaño de aproximadamente 140 metros de diámetro o más." },
            ],
            note: "Ser clasificado como PHA no significa que el asteroide impactará la Tierra, solo que tiene el potencial de hacer aproximaciones amenazantes."
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="p-4 md:p-8"
        >
            <button 
                onClick={onBack} 
                className="btn-primary mb-8 inline-flex items-center"
            >
                <ArrowLeft size={20} className="mr-2"/> Volver a los Asteroides
            </button>
            <h1 className="text-3xl md:text-4xl orbitron font-bold cosmic-glow-text text-center mb-10">
                Glosario Cósmico
            </h1>
            <div className="space-y-8 max-w-4xl mx-auto">
                {glossaryItems.map(item => (
                    <motion.div 
                        key={item.term}
                        className="card-bg rounded-lg p-6 shadow-xl border border-purple-700/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * glossaryItems.indexOf(item) }}
                    >
                        <h2 className="text-2xl orbitron text-purple-300 mb-3 flex items-center">
                            {item.icon} {item.term}
                        </h2>
                        <p className="text-gray-300 leading-relaxed">{item.definition}</p>
                        {item.subItems && (
                            <ul className="list-disc list-inside mt-3 space-y-2 pl-4 text-gray-400">
                                {item.subItems.map(sub => (
                                    <li key={sub.term}>
                                        <span className="font-semibold text-purple-400">{sub.term}:</span> {sub.definition}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {item.note && <p className="text-xs text-gray-500 mt-3 italic">{item.note}</p>}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};


// --- Componente Principal App ---
function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main' o 'glossary'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [asteroids, setAsteroids] = useState([]);
  const [currentSortCriteria, setCurrentSortCriteria] = useState('closest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPotentiallyHazardous, setFilterPotentiallyHazardous] = useState(false);
  const [filterSentryObjects, setFilterSentryObjects] = useState(false);
  const [selectedOrbitClass, setSelectedOrbitClass] = useState('ALL');
  const [selectedOrbitUncertainty, setSelectedOrbitUncertainty] = useState('ALL');
  const [minDiameter, setMinDiameter] = useState('');
  const [maxDiameter, setMaxDiameter] = useState('');
  const [minMissDistance, setMinMissDistance] = useState('');
  const [maxMissDistance, setMaxMissDistance] = useState('');

  const API_URL = 'http://localhost:5000/api/asteroids';

  useEffect(() => {
    if (currentView === 'main') { // Solo cargar asteroides si estamos en la vista principal
        const fetchAsteroids = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const response = await fetch(API_URL);
            if (!response.ok) {
              let errorData;
              try { errorData = await response.json(); } catch (e) { errorData = { error: response.statusText }; }
              throw new Error(errorData.error || `Error del servidor: ${response.status}`);
            }
            const data = await response.json();
            setAsteroids(Array.isArray(data) ? data : []);
          } catch (err) {
            console.error("Error al obtener datos de asteroides:", err);
            setError(err.message || "No se pudieron cargar los datos.");
            setAsteroids([]);
          } finally {
            setIsLoading(false);
          }
        };
        fetchAsteroids();
    }
  }, [currentView]); // Recargar si la vista cambia a 'main' (podría ser opcional si no se espera que los datos cambien)

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const orbitClasses = useMemo(() => {
    if (!Array.isArray(asteroids)) return ['ALL'];
    const classes = new Set(asteroids.map(a => a.orbit_class_type).filter(Boolean));
    return ['ALL', ...Array.from(classes).sort()];
  }, [asteroids]);
  
  const getUncertaintyCategory = useCallback((uncertaintyValue) => {
    const u = parseInt(uncertaintyValue, 10);
    if (isNaN(u)) return 'UNKNOWN';
    if (u <= 2) return 'LOW';
    if (u <= 5) return 'MEDIUM';
    if (u <= 8) return 'HIGH';
    return 'VERY_HIGH';
  }, []);

  const filteredAndSortedAsteroids = useMemo(() => {
    // ... (lógica de filtrado y ordenamiento sin cambios) ...
    if (!Array.isArray(asteroids)) return [];
    let processed = [...asteroids];

    if (searchTerm.trim()) {
      processed = processed.filter(a => a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterPotentiallyHazardous) processed = processed.filter(a => a.is_potentially_hazardous_asteroid === true);
    if (filterSentryObjects) processed = processed.filter(a => a.is_sentry_object === true);
    if (selectedOrbitClass !== 'ALL') processed = processed.filter(a => a.orbit_class_type === selectedOrbitClass);
    if (selectedOrbitUncertainty !== 'ALL') {
      processed = processed.filter(a => getUncertaintyCategory(a.orbit_uncertainty) === selectedOrbitUncertainty);
    }

    const numMinDiameter = parseFloat(minDiameter);
    const numMaxDiameter = parseFloat(maxDiameter);
    const numMinMissDistance = parseFloat(minMissDistance);
    const numMaxMissDistance = parseFloat(maxMissDistance);

    if (!isNaN(numMinDiameter)) {
        processed = processed.filter(a => a.estimated_diameter_km?.max >= numMinDiameter);
    }
    if (!isNaN(numMaxDiameter)) {
        processed = processed.filter(a => a.estimated_diameter_km?.min <= numMaxDiameter);
    }
    if (!isNaN(numMinMissDistance)) {
        processed = processed.filter(a => a.close_approach_data?.[0]?.miss_distance_km >= numMinMissDistance);
    }
    if (!isNaN(numMaxMissDistance)) {
        processed = processed.filter(a => a.close_approach_data?.[0]?.miss_distance_km <= numMaxMissDistance);
    }
    
    switch (currentSortCriteria) {
      case 'closest': processed.sort((a, b) => (a.close_approach_data?.[0]?.miss_distance_km ?? Infinity) - (b.close_approach_data?.[0]?.miss_distance_km ?? Infinity)); break;
      case 'largest': processed.sort((a, b) => (b.estimated_diameter_km?.max ?? 0) - (a.estimated_diameter_km?.max ?? 0)); break;
      case 'fastest': processed.sort((a, b) => (b.close_approach_data?.[0]?.relative_velocity_kph ?? 0) - (a.close_approach_data?.[0]?.relative_velocity_kph ?? 0)); break;
      case 'mostMassive': processed.sort((a, b) => (a.absolute_magnitude_h ?? Infinity) - (b.absolute_magnitude_h ?? Infinity)); break;
      default: break;
    }
    return processed;
  }, [asteroids, searchTerm, currentSortCriteria, filterPotentiallyHazardous, filterSentryObjects, selectedOrbitClass, selectedOrbitUncertainty, minDiameter, maxDiameter, minMissDistance, maxMissDistance, getUncertaintyCategory]);

  const sortOptions = [
    { id: 'closest', label: 'Más Cercanos', icon: <Rocket size={20} className="mr-3" /> },
    { id: 'largest', label: 'Más Grandes', icon: <Maximize size={20} className="mr-3" /> },
    { id: 'fastest', label: 'Más Rápidos', icon: <Zap size={20} className="mr-3" /> },
    { id: 'mostMassive', label: 'Mayor Magnitud', icon: <Scale size={20} className="mr-3" /> },
  ];
  const menuVariants = { /* ... (sin cambios) ... */ };
  const backdropVariants = { /* ... (sin cambios) ... */ };

  const getActiveFilters = () => {
    const active = [];
    if (searchTerm.trim()) active.push({ key: 'searchTerm', label: `Búsqueda: "${searchTerm}"` });
    if (filterPotentiallyHazardous) active.push({ key: 'hazardous', label: 'Peligrosos' });
    if (filterSentryObjects) active.push({ key: 'sentry', label: 'Sentry' });
    if (selectedOrbitClass !== 'ALL') active.push({ key: 'orbitClass', label: `Clase: ${selectedOrbitClass}` });
    if (selectedOrbitUncertainty !== 'ALL') active.push({ key: 'orbitUncertainty', label: `Incertidumbre: ${selectedOrbitUncertainty}` });
    if (minDiameter) active.push({ key: 'minDiameter', label: `Diámetro Min: ${minDiameter} km` });
    if (maxDiameter) active.push({ key: 'maxDiameter', label: `Diámetro Max: ${maxDiameter} km` });
    if (minMissDistance) active.push({ key: 'minMissDistance', label: `Dist. Min: ${minMissDistance} km` });
    if (maxMissDistance) active.push({ key: 'maxMissDistance', label: `Dist. Max: ${maxMissDistance} km` });
    return active;
  };

  const handleClearFilter = (filterKey) => {
    // ... (lógica para limpiar filtros sin cambios) ...
    switch (filterKey) {
      case 'searchTerm': setSearchTerm(''); break;
      case 'hazardous': setFilterPotentiallyHazardous(false); break;
      case 'sentry': setFilterSentryObjects(false); break;
      case 'orbitClass': setSelectedOrbitClass('ALL'); break;
      case 'orbitUncertainty': setSelectedOrbitUncertainty('ALL'); break;
      case 'minDiameter': setMinDiameter(''); break;
      case 'maxDiameter': setMaxDiameter(''); break;
      case 'minMissDistance': setMinMissDistance(''); break;
      case 'maxMissDistance': setMaxMissDistance(''); break;
      default: break;
    }
  };

  const handleClearAllFilters = () => {
    // ... (lógica para limpiar todos los filtros sin cambios) ...
    setSearchTerm('');
    setFilterPotentiallyHazardous(false);
    setFilterSentryObjects(false);
    setSelectedOrbitClass('ALL');
    setSelectedOrbitUncertainty('ALL');
    setMinDiameter('');
    setMaxDiameter('');
    setMinMissDistance('');
    setMaxMissDistance('');
  };

  const MainContent = () => (
    <>
        <h2 className="text-2xl md:text-3xl orbitron font-semibold mb-2 text-center md:text-left text-purple-300">
            {sortOptions.find(s => s.id === currentSortCriteria)?.label || "Asteroides"} 
            <span className="text-lg text-gray-400"> ({filteredAndSortedAsteroids.length} {filteredAndSortedAsteroids.length === 1 ? "encontrado" : "encontrados"})</span>
        </h2>
        
        <ActiveFiltersDisplay 
            activeFilters={getActiveFilters()}
            onClearFilter={handleClearFilter}
            onClearAllFilters={handleClearAllFilters}
        />

        {filteredAndSortedAsteroids.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
            {filteredAndSortedAsteroids.map(asteroid => (
                <motion.div key={asteroid.id} layout initial={{ opacity: 0, scale: 0.8, y:50 }} animate={{ opacity: 1, scale: 1, y:0 }} exit={{ opacity: 0, scale: 0.8, y:-50 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                <AsteroidCard asteroid={asteroid} />
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
        ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-gray-400 text-lg mt-10 card-bg rounded-lg p-8">
            <AlertTriangle size={32} className="mx-auto mb-4 text-yellow-400" />
            No se encontraron asteroides con los criterios de filtro y búsqueda actuales.
        </motion.div>
        )}
    </>
  );


  return (
    <>
      <div className="min-h-screen flex flex-col relative z-10 bg-gradient-to-br from-[#05050A] via-[#080015] to-[#05050A]">
        <header> {/* ... (sin cambios significativos, igual que antes) ... */} 
            <div className="p-4 md:p-6 flex justify-between items-center sticky top-0 bg-black/70 backdrop-blur-lg z-50 border-b border-purple-900/40 shadow-md">
                <h1 className="text-2xl md:text-3xl orbitron font-bold cosmic-glow-text">
                    COSMOS <span className="text-purple-400">OBSERVER</span>
                </h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative hidden md:block">
                    <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-dark pl-10 pr-4 py-2 rounded-lg w-52 lg:w-64 focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300" aria-label="Buscar asteroides por nombre"/>
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button onClick={toggleMenu} className="p-2 rounded-md text-purple-300 hover:text-white hover:bg-purple-700/50 focus:text-white focus:bg-purple-700/60 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors z-50" aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isMenuOpen}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
        </header>

        <AnimatePresence>
          {isMenuOpen && (
            <> {/* ... (Menú lateral sin cambios en su estructura, solo en su contenido si es necesario) ... */}
              <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={toggleMenu} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden" aria-hidden="true" />
              <motion.nav
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-0 left-0 h-full w-72 md:w-80 bg-gradient-to-b from-[#0A001A] via-[#06000F] to-[#030008] shadow-2xl p-6 z-40 border-r-2 border-purple-700 flex flex-col overflow-y-auto"
                aria-label="Menú de navegación principal"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl orbitron font-semibold text-purple-300">Ordenar Por</h2>
                  <button onClick={toggleMenu} className="p-1 rounded hover:bg-purple-700/50 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Cerrar menú">
                     <X size={24} />
                  </button>
                </div>
                <div className="relative mb-6 md:hidden">
                    <input type="text" placeholder="Buscar asteroides..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-dark pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500 outline-none transition-all" aria-label="Buscar asteroides por nombre en móvil" />
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <ul className="space-y-1 mb-6">
                  {sortOptions.map((item) => (
                    <li key={item.id}>
                      <button onClick={() => { setCurrentSortCriteria(item.id); if (window.innerWidth < 768) toggleMenu(); }}
                        className={`w-full flex items-center text-left px-4 py-3 rounded-md transition-all duration-200 ease-in-out group ${currentSortCriteria === item.id ? 'bg-purple-600/70 text-white shadow-lg orbitron' : 'hover:bg-purple-500/30 hover:text-purple-200 text-gray-300 focus:bg-purple-500/40 focus:text-purple-100 focus:outline-none'}`}
                        aria-current={currentSortCriteria === item.id ? "page" : undefined}>
                        <span className={`transition-transform duration-200 ease-in-out ${currentSortCriteria === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>{item.icon}</span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-purple-800/50 pt-4 mb-4">
                    <h2 className="text-lg orbitron font-semibold text-purple-300 mb-3 flex items-center">
                        <ListFilter size={22} className="mr-2"/> Filtros Específicos
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between"><label className="text-gray-300 flex items-center"><AlertTriangle size={16} className="mr-2 text-red-400"/> Peligrosos</label><button onClick={() => setFilterPotentiallyHazardous(!filterPotentiallyHazardous)} className={`p-1 rounded-md transition-colors ${filterPotentiallyHazardous ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{filterPotentiallyHazardous ? <CheckSquare size={20} /> : <Square size={20} />}</button></div>
                        <div className="flex items-center justify-between"><label className="text-gray-300 flex items-center"><ShieldCheck size={16} className="mr-2 text-yellow-400"/> Sentry</label><button onClick={() => setFilterSentryObjects(!filterSentryObjects)} className={`p-1 rounded-md transition-colors ${filterSentryObjects ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{filterSentryObjects ? <CheckSquare size={20} /> : <Square size={20} />}</button></div>
                        <div><label htmlFor="orbitClass" className="block text-gray-300 mb-1 flex items-center"><Orbit size={16} className="mr-2 text-blue-400"/> Clase Orbital</label><select id="orbitClass" value={selectedOrbitClass} onChange={(e) => setSelectedOrbitClass(e.target.value)} className="input-dark w-full py-2 px-3 rounded-md">{orbitClasses.map(oc => <option key={oc} value={oc}>{oc === 'ALL' ? 'Todas' : oc}</option>)}</select></div>
                        <div><label htmlFor="orbitUncertainty" className="block text-gray-300 mb-1 flex items-center"><HelpCircle size={16} className="mr-2 text-green-400"/> Incertidumbre</label><select id="orbitUncertainty" value={selectedOrbitUncertainty} onChange={(e) => setSelectedOrbitUncertainty(e.target.value)} className="input-dark w-full py-2 px-3 rounded-md"><option value="ALL">Cualquiera</option><option value="LOW">Baja (0-2)</option><option value="MEDIUM">Media (3-5)</option><option value="HIGH">Alta (6-8)</option><option value="VERY_HIGH">Muy Alta (9)</option></select></div>
                    </div>
                </div>
                <div className="border-t border-purple-800/50 pt-4">
                    <h2 className="text-lg orbitron font-semibold text-purple-300 mb-3 flex items-center">
                        <FilterX size={22} className="mr-2"/> Filtros por Rango
                    </h2>
                    <div className="space-y-4 text-sm">
                        <div><label className="block text-gray-300 mb-1 flex items-center"><Ruler size={16} className="mr-2 text-teal-400"/> Diámetro Estimado (km)</label><div className="flex space-x-2"><input type="number" placeholder="Min" value={minDiameter} onChange={(e) => setMinDiameter(e.target.value)} className="input-dark w-1/2 py-1 px-2 rounded-md" min="0" step="0.01"/><input type="number" placeholder="Max" value={maxDiameter} onChange={(e) => setMaxDiameter(e.target.value)} className="input-dark w-1/2 py-1 px-2 rounded-md" min="0" step="0.01"/></div></div>
                        <div><label className="block text-gray-300 mb-1 flex items-center"><ArrowRightLeft size={16} className="mr-2 text-cyan-400"/> Dist. Aprox. (km)</label><div className="flex space-x-2"><input type="number" placeholder="Min" value={minMissDistance} onChange={(e) => setMinMissDistance(e.target.value)} className="input-dark w-1/2 py-1 px-2 rounded-md" min="0"/><input type="number" placeholder="Max" value={maxMissDistance} onChange={(e) => setMaxMissDistance(e.target.value)} className="input-dark w-1/2 py-1 px-2 rounded-md" min="0"/></div></div>
                    </div>
                </div>
                <div className="mt-auto pt-6 border-t border-purple-800/50">
                    <p className="text-xs text-gray-500 text-center">
                        Datos obtenidos de la API NeoWs de NASA <br/> vía backend local.
                    </p>
                    {/* Enlace al Glosario */}
                    <button 
                        onClick={() => {
                            setCurrentView('glossary');
                            if (isMenuOpen) toggleMenu(); // Cierra el menú si está abierto
                        }} 
                        className="text-xs text-purple-400 hover:text-purple-200 hover:underline mt-2 w-full text-center"
                    >
                        <BookOpen size={14} className="inline mr-1"/> Glosario Cósmico
                    </button>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <main className={`flex-grow p-4 md:p-8 transition-all duration-300 ease-in-out ${isMenuOpen && window.innerWidth >= 768 ? 'md:ml-80' : 'ml-0'}`}>
          {isLoading && currentView === 'main' ? ( // Solo mostrar carga si es la vista principal y está cargando
            <div className="flex flex-col justify-center items-center h-64 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full mb-4"/>
              <p className="text-xl text-purple-300 orbitron">Cargando datos cósmicos...</p>
            </div>
          ) : error && currentView === 'main' ? ( // Solo mostrar error si es la vista principal y hay error
            <ErrorDisplay error={error} apiUrl={API_URL} />
          ) : currentView === 'glossary' ? (
            <GlossaryPage onBack={() => setCurrentView('main')} />
          ) : (
            <MainContent />
          )}
        </main>
        <footer className="p-6 text-center text-sm text-gray-500 border-t border-purple-900/40 mt-auto"> 
            <p>&copy; {new Date().getFullYear()} Cosmic Observer. El universo es vasto y misterioso.</p>
            <p className="mt-1">Explorando el cosmos con datos de la NASA, servidos localmente.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
