# ...existing code...
import requests
from collections import defaultdict
from datetime import datetime

api_key = '30d4741c779ba94c470ca1f63045390a'

user_input = input("Enter city: ")

try:
    current_resp = requests.get(
        "https://api.openweathermap.org/data/2.5/weather",
        params={"q": user_input, "units": "imperial", "appid": api_key},
        timeout=10
    )
    current_resp.raise_for_status()
except requests.RequestException:
    print("No City Found or network error")
else:
    current = current_resp.json()
    weather = current['weather'][0]['main']
    temp = round(current['main']['temp'])

    print(f"The weather in {user_input} is: {weather}")
    print(f"The temperature in {user_input} is: {temp}ºF")

    # 5-day forecast (OpenWeatherMap 5 day / 3 hour forecast)
    try:
        forecast_resp = requests.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={"q": user_input, "units": "imperial", "appid": api_key},
            timeout=10
        )
        forecast_resp.raise_for_status()
    except requests.RequestException:
        print("Could not fetch 5-day forecast.")
    else:
        forecast = forecast_resp.json()
        # Group forecast entries by date (YYYY-MM-DD)
        days = defaultdict(list)
        for entry in forecast.get("list", []):
            date = entry.get("dt_txt", "").split(" ")[0]
            if date:
                days[date].append(entry)

        sorted_dates = sorted(days.keys())
        today_iso = datetime.utcnow().date().isoformat()
        # Choose next 5 calendar days (prefer days after today)
        future_dates = [d for d in sorted_dates if d > today_iso][:5]
        if not future_dates:
            future_dates = sorted_dates[:5]

        if future_dates:
            print("\n5-day forecast:")
            for d in future_dates:
                temps = [round(item['main']['temp']) for item in days[d]]
                conditions = [item['weather'][0]['main'] for item in days[d]]
                most_common_condition = max(set(conditions), key=conditions.count)
                low = min(temps)
                high = max(temps)
                day_name = datetime.fromisoformat(d).strftime("%A")
                print(f"{day_name} {d}: {most_common_condition}, {low}ºF - {high}ºF")
        else:
            print("No forecast data available.")
