import requests
import datetime
import os
from flask import Flask, jsonify
from flask_cors import CORS
import traceback # Para una mejor depuración de errores

# --- Configuración de la Aplicación Flask ---
app = Flask(__name__)
CORS(app) # Habilitar CORS para todas las rutas y orígenes

# --- Constantes y Configuración ---
NASA_API_KEY = os.environ.get("NASA_API_KEY", "eLFdjeQhl9Ip5Hh1g57BrOPCMAvEoUTQWaatBpg3") # Usa tu API key

# --- Funciones Auxiliares ---
def get_date_range_for_api():
    """Calcula el rango de fechas para la API (hoy y los próximos 7 días)."""
    today = datetime.date.today()
    end_date = today + datetime.timedelta(days=7)
    return today.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

def safe_float_conversion(value, default=None):
    """Intenta convertir un valor a float. Si falla, devuelve el valor por defecto."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        # print(f"Advertencia: No se pudo convertir '{value}' a float. Usando default: {default}")
        return default

def transform_asteroid_data_for_frontend(nasa_asteroid_data):
    """
    Transforma los datos de un asteroide de la API de la NASA al formato
    esperado por el frontend React, incluyendo muchos más campos para filtros.
    """
    transformed_asteroids = []
    
    asteroids_to_process = []
    if "near_earth_objects" in nasa_asteroid_data: # Estructura del "Feed"
        for date_str, asteroids_on_date in nasa_asteroid_data.get("near_earth_objects", {}).items():
            asteroids_to_process.extend(asteroids_on_date)
    elif isinstance(nasa_asteroid_data, dict) and 'id' in nasa_asteroid_data: # Un solo objeto (Lookup)
        asteroids_to_process = [nasa_asteroid_data]
    else:
        print(f"Formato de datos de NASA no reconocido para transformación: {type(nasa_asteroid_data)}")
        return []


    for asteroid in asteroids_to_process:
        try:
            if not asteroid.get('close_approach_data') or not asteroid['close_approach_data'][0]:
                # print(f"Asteroide {asteroid.get('id', 'N/A')} no tiene close_approach_data válida. Saltando.")
                continue

            approach_data = asteroid['close_approach_data'][0] 
            
            diameter_km_data = asteroid.get('estimated_diameter', {}).get('kilometers', {})
            est_diameter_min_km = safe_float_conversion(diameter_km_data.get('estimated_diameter_min'))
            est_diameter_max_km = safe_float_conversion(diameter_km_data.get('estimated_diameter_max'))

            velocity_kph = safe_float_conversion(approach_data.get('relative_velocity', {}).get('kilometers_per_hour'))
            miss_distance_km = safe_float_conversion(approach_data.get('miss_distance', {}).get('kilometers'))
            orbiting_body_first_approach = approach_data.get('orbiting_body', 'N/A')
            close_approach_date_full = approach_data.get('close_approach_date_full', 'N/A')
            
            absolute_magnitude = safe_float_conversion(asteroid.get('absolute_magnitude_h'))
            designation = asteroid.get('designation', asteroid.get('name', 'N/A'))
            nasa_jpl_url = asteroid.get('nasa_jpl_url', '#')
            is_sentry_object = asteroid.get('is_sentry_object', False)

            # Datos orbitales (ahora deberían estar presentes si detailed=true)
            orbital_data = asteroid.get('orbital_data', {}) # Obtener orbital_data, si no existe, será un dict vacío
            first_observation_date = orbital_data.get('first_observation_date', 'N/A')
            last_observation_date = orbital_data.get('last_observation_date', 'N/A')
            data_arc_in_days = safe_float_conversion(orbital_data.get('data_arc_in_days'), default=0)
            observations_used = safe_float_conversion(orbital_data.get('observations_used'), default=0)
            orbit_uncertainty = orbital_data.get('orbit_uncertainty', 'N/A') 
            minimum_orbit_intersection_au = safe_float_conversion(orbital_data.get('minimum_orbit_intersection'))
            
            orbital_period_days = safe_float_conversion(orbital_data.get('orbital_period'))
            eccentricity = safe_float_conversion(orbital_data.get('eccentricity'))
            semi_major_axis_au = safe_float_conversion(orbital_data.get('semi_major_axis'))
            inclination_deg = safe_float_conversion(orbital_data.get('inclination'))
            perihelion_distance_au = safe_float_conversion(orbital_data.get('perihelion_distance'))
            aphelion_distance_au = safe_float_conversion(orbital_data.get('aphelion_distance'))
            
            orbit_class_data = orbital_data.get('orbit_class', {})
            orbit_class_type = orbit_class_data.get('orbit_class_type', 'N/A')
            orbit_class_description = orbit_class_data.get('orbit_class_description', 'N/A')

            if est_diameter_min_km is not None and est_diameter_max_km is not None:
                transformed_asteroids.append({
                    "id": asteroid.get('id', 'N/A'),
                    "name": asteroid.get('name', 'Unknown Asteroid'),
                    "designation": designation,
                    "estimated_diameter_km": {
                        "min": est_diameter_min_km,
                        "max": est_diameter_max_km
                    },
                    "close_approach_data": [{ 
                        "relative_velocity_kph": velocity_kph,
                        "miss_distance_km": miss_distance_km,
                        "orbiting_body": orbiting_body_first_approach,
                        "close_approach_date_full": close_approach_date_full
                    }],
                    "is_potentially_hazardous_asteroid": asteroid.get('is_potentially_hazardous_asteroid', False),
                    "absolute_magnitude_h": absolute_magnitude,
                    "nasa_jpl_url": nasa_jpl_url,
                    "is_sentry_object": is_sentry_object,
                    "first_observation_date": first_observation_date,
                    "last_observation_date": last_observation_date,
                    "data_arc_in_days": data_arc_in_days,
                    "observations_used": observations_used,
                    "orbit_uncertainty": orbit_uncertainty,
                    "minimum_orbit_intersection_au": minimum_orbit_intersection_au,
                    "orbital_period_days": orbital_period_days,
                    "eccentricity": eccentricity,
                    "semi_major_axis_au": semi_major_axis_au,
                    "inclination_deg": inclination_deg,
                    "perihelion_distance_au": perihelion_distance_au,
                    "aphelion_distance_au": aphelion_distance_au,
                    "orbit_class_type": orbit_class_type,
                    "orbit_class_description": orbit_class_description
                })
            # else:
                # print(f"Asteroide {asteroid.get('id', 'N/A')} no tiene datos de diámetro. Saltando.")

        except Exception as e:
            print(f"Error crítico procesando asteroide {asteroid.get('id', 'N/A')}: {e}")
            traceback.print_exc()
            continue
            
    return transformed_asteroids

# --- Endpoint de la API ---
@app.route('/api/asteroids', methods=['GET'])
def get_asteroids():
    start_date, end_date = get_date_range_for_api()
    # MODIFICACIÓN CRÍTICA: Añadir &detailed=true para obtener orbital_data
    nasa_api_url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date}&end_date={end_date}&detailed=true&api_key={NASA_API_KEY}"
    
    print(f"Solicitando datos DETALLADOS a NASA API (Feed): {nasa_api_url}")

    try:
        response = requests.get(nasa_api_url, timeout=25) # Aumentado timeout un poco más
        response.raise_for_status()
        raw_nasa_data = response.json()
        
        frontend_ready_asteroids = transform_asteroid_data_for_frontend(raw_nasa_data)
        
        if not frontend_ready_asteroids:
            print("No se pudieron transformar asteroides o no se encontraron NEOs del Feed para el rango de fechas.")
            return jsonify([])

        return jsonify(frontend_ready_asteroids)

    except requests.exceptions.Timeout:
        print("Error: Timeout al conectar con la API de la NASA.")
        return jsonify({"error": "Timeout al conectar con la API de la NASA."}), 504 
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API de la NASA: {e}")
        return jsonify({"error": f"Error al conectar con la API de la NASA: {str(e)}"}), 502
    except Exception as e:
        print(f"Ocurrió un error inesperado en el servidor: {e}")
        traceback.print_exc()
        return jsonify({"error": "Ocurrió un error inesperado en el servidor."}), 500

# --- Ejecución del Servidor ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
