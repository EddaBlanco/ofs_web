import re
import sys
from pathlib import Path

def extraer_parametros(nombre_archivo: str) -> dict:
    """Extrae los parámetros del nombre del archivo CSV"""

    print(f"\n[DEBUG] Nombre recibido: '{nombre_archivo}'")
    print(f"[DEBUG] Longitud: {len(nombre_archivo)}")
    print(f"[DEBUG] Caracteres: {[repr(c) for c in nombre_archivo[:50]]}")
    
    # Quitar la extensión .csv
    nombre_sin_ext = nombre_archivo
    if nombre_sin_ext.lower().endswith('.csv'):
        nombre_sin_ext = nombre_sin_ext[:-4]
    
    print(f"[DEBUG] Sin extensión: '{nombre_sin_ext}'")
    
    # Separar por guión bajo
    partes = nombre_sin_ext.split('_')

    print(f"[DEBUG] Número de partes: {len(partes)}")
    for i, p in enumerate(partes):
        print(f"[DEBUG] partes[{i}] = '{p}'")
    
    if len(partes) < 6:
        raise ValueError(f"Se esperaban al menos 6 partes, se obtuvieron {len(partes)}")
    
    # Formato: fecha_hora_localidad_azimut_elevacion_spectrum
    
    fecha = partes[0]                      
    hora_con_puntos = partes[1]            
    localizacion = partes[2]               
    azimut = int(partes[3])                
    elevacion = int(partes[4])             
    
    # Convertir hora: reemplazar puntos por dos puntos
    hora = hora_con_puntos.replace('.', ':')
    
    # Crear el ID (mismo que el nombre sin extensión)
    id_observacion = nombre_sin_ext
    
    # URL del CSV (asumiendo que está en assets/observaciones/)
    csv_url = f"assets/observaciones/{nombre_archivo}"
    
    return {
        "id": id_observacion,
        "fecha": fecha,
        "hora": hora,
        "localizacion": localizacion,
        "azimut": azimut,
        "elevacion": elevacion,
        "frecuencia_centro": 1414,  # Valor fijo o calculado
        "archivo_nombre": nombre_archivo,
        "csv_url": csv_url
    }

def mostrar_parametros(nombre_archivo: str):
    """Muestra los parámetros en consola con formato bonito"""
    
    parametros = extraer_parametros(nombre_archivo)
    
    print("\n" + "="*50)
    print(f"Archivo: {nombre_archivo}")
    print("="*50)
    print(f'  "id": "{parametros["id"]}",')
    print(f'  "fecha": "{parametros["fecha"]}",')
    print(f'  "hora": "{parametros["hora"]}",')
    print(f'  "localizacion": "{parametros["localizacion"]}",')
    print(f'  "azimut": {parametros["azimut"]},')
    print(f'  "elevacion": {parametros["elevacion"]},')
    print(f'  "frecuencia_centro": {parametros["frecuencia_centro"]},')
    print(f'  "archivo_nombre": "{parametros["archivo_nombre"]}",')
    print(f'  "csv_url": "{parametros["csv_url"]}"')
    print("="*50 + "\n")

# ==================== USO ====================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        nombre_csv = sys.argv[1]
        mostrar_parametros(nombre_csv)
    else:

        print("Por favor, proporciona el nombre del archivo CSV como argumento. Ejemplo:\npy organizador.py 2026-05-24_19.47.56.6_Anytown_200_40_spectrum.csv")

        #se ejecuta asi: py organizador.py "2026-05-24_19.47.56.6_Anytown_200_40_spectrum.csv"