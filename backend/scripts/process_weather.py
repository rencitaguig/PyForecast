#!/usr/bin/env python3
"""
Fetch weather data for a city (via OpenWeather) and generate a plot using
Pandas, NumPy and MetPy. Saves PNG to backend/public/plots and prints the
relative filename on stdout as JSON: {"file":"plots/NAME.png"}

Usage:
  python process_weather.py --city London --units metric

"""
import os
import sys
import argparse
import json
from datetime import datetime

import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from metpy.calc import dewpoint_from_relative_humidity
from metpy.units import units


OPENWEATHER = os.environ.get('OPENWEATHER_API_KEY')


def fetch_coords_for_city(city_name):
    url = 'https://api.openweathermap.org/data/2.5/weather'
    r = requests.get(url, params={'q': city_name, 'appid': OPENWEATHER})
    r.raise_for_status()
    data = r.json()
    coord = data.get('coord', {})
    return coord.get('lat'), coord.get('lon')


def fetch_onecall(lat, lon, units='metric'):
    url = 'https://api.openweathermap.org/data/2.5/onecall'
    r = requests.get(url, params={'lat': lat, 'lon': lon, 'exclude': 'minutely,alerts', 'units': units, 'appid': OPENWEATHER})
    r.raise_for_status()
    return r.json()


def build_dataframe(onecall_data):
    hours = onecall_data.get('hourly', [])[:72]
    records = []
    for h in hours:
        records.append({
            'dt': datetime.utcfromtimestamp(h['dt']),
            'temp': h.get('temp'),
            'humidity': h.get('humidity'),
            'pop': h.get('pop', 0),
            'wind_speed': h.get('wind_speed', np.nan)
        })
    df = pd.DataFrame(records).set_index('dt')
    return df


def compute_dewpoint(df, temp_units='degC'):
    # temp_units: 'degC' or 'degF'
    temps = df['temp'].values
    rh = df['humidity'].values / 100.0
    if temp_units == 'degF':
        temps_q = temps * units.degF
        # convert to degC for MetPy dewpoint calc
        temps_q = temps_q.to(units.degC)
    else:
        temps_q = temps * units.degC

    rh_q = rh * units.dimensionless
    dew = dewpoint_from_relative_humidity(temps_q, rh_q)
    # return dewpoint in same units as temps_q
    dew_vals = dew.to(units.degC).magnitude if temps_q.units == units.degC else dew.magnitude
    return dew


def plot_df(df, dew, outpath, city_name, units_label='C'):
    plt.style.use('seaborn-darkgrid')
    fig, ax = plt.subplots(figsize=(10,4))

    ax.plot(df.index, df['temp'], label=f'Temp (°{units_label})', color='tab:red')
    ax.plot(df.index, dew, label=f'Dewpoint (°{units_label})', color='tab:blue')
    ax.set_ylabel(f'Temperature (°{units_label})')
    ax.set_xlabel('Time (UTC)')
    ax.tick_params(axis='x', rotation=25)

    # precipitation probability as bars on secondary axis
    ax2 = ax.twinx()
    ax2.bar(df.index, df['pop'] * 100, color='tab:cyan', alpha=0.3, label='Precip %')
    ax2.set_ylabel('Precipitation (%)')
    ax2.set_ylim(0, 100)

    ax.set_title(f'{city_name} — Next {len(df)} hours')
    lines, labels = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines + lines2, labels + labels2, loc='upper left')

    fig.tight_layout()
    os.makedirs(os.path.dirname(outpath), exist_ok=True)
    fig.savefig(outpath, dpi=150)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--city', required=True)
    parser.add_argument('--units', default='metric', choices=['metric', 'imperial'])
    parser.add_argument('--out', default=None)
    args = parser.parse_args()

    if OPENWEATHER is None:
        print(json.dumps({'error': 'OPENWEATHER_API_KEY not set in environment'}))
        sys.exit(1)

    lat, lon = fetch_coords_for_city(args.city)
    if lat is None or lon is None:
        print(json.dumps({'error': 'Could not resolve city coordinates'}))
        sys.exit(1)

    data = fetch_onecall(lat, lon, units=args.units)
    df = build_dataframe(data)

    # compute dewpoint with MetPy
    # dew is returned as Quantities
    dew_q = dewpoint_from_relative_humidity((df['temp'].values * units.degC) if args.units == 'metric' else (df['temp'].values * units.degF), (df['humidity'].values / 100.0) * units.dimensionless)
    # convert dew to plain numpy values in appropriate units
    if args.units == 'metric':
        dew_vals = dew_q.to(units.degC).magnitude
        units_label = 'C'
    else:
        dew_vals = dew_q.to(units.degF).magnitude
        units_label = 'F'

    # determine output path
    timestamp = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    safe_city = ''.join(c for c in args.city if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    filename = f"{safe_city}_{timestamp}.png"
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'plots')
    out_dir = os.path.abspath(out_dir)
    outpath = os.path.join(out_dir, filename)

    plot_df(df, dew_vals, outpath, args.city, units_label=units_label)

    # Print JSON with relative path
    rel_path = os.path.join('plots', filename).replace('\\', '/')
    print(json.dumps({'file': rel_path}))


if __name__ == '__main__':
    main()
