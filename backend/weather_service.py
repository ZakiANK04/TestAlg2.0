import requests
import pandas as pd
import datetime

class WeatherService:
    def __init__(self, dataset_path: str):
        try:
            self.df = pd.read_csv(dataset_path)
            # Create a lookup for historical averages (Climatology)
            self.climatology = self.df.groupby(['region', 'month'])[['temperature_c', 'rainfall_mm']].mean().to_dict('index')
            print("   [Weather] Climatology loaded from dataset.")
        except Exception:
            self.climatology = {}
            print("   [Weather] Warning: Dataset not found. Relying on API/Defaults.")
        
        self.coord_cache = {} 

    def _get_coordinates(self, region_name: str):
        if region_name in self.coord_cache:
            return self.coord_cache[region_name]
        try:
            url = "https://geocoding-api.open-meteo.com/v1/search"
            params = {"name": region_name, "count": 1, "language": "en", "format": "json"}
            r = requests.get(url, params=params, timeout=3)
            data = r.json()
            if "results" in data and data["results"]:
                res = data["results"][0]
                coords = {'lat': res['latitude'], 'lon': res['longitude']}
                self.coord_cache[region_name] = coords
                return coords
        except:
            pass
        return None

    def _fetch_history(self, coords, year, month):
        start = f"{year}-{month:02d}-01"
        # Logic for end of month
        if month == 12: end = f"{year}-12-31"
        else: end = str(datetime.date(year, month + 1, 1) - datetime.timedelta(days=1))

        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": coords['lat'], "longitude": coords['lon'],
            "start_date": start, "end_date": end,
            "daily": ["temperature_2m_mean", "rain_sum"], "timezone": "auto"
        }
        try:
            r = requests.get(url, params=params, timeout=5)
            data = r.json()
            if 'daily' in data:
                temps = [t for t in data['daily']['temperature_2m_mean'] if t is not None]
                rains = [r for r in data['daily']['rain_sum'] if r is not None]
                if temps: return round(sum(temps)/len(temps), 2), round(sum(rains), 2)
        except:
            pass
        return None

    def get_weather(self, region: str, year: int, month: int):
        today = datetime.date.today()
        input_date = datetime.date(year, month, 1)
        is_future = input_date > (today + datetime.timedelta(days=30))
        
        # 1. Try Real API (if past/present)
        if not is_future:
            coords = self._get_coordinates(region)
            if coords:
                res = self._fetch_history(coords, year, month)
                if res: return res

        # 2. Fallback to Climatology (Dataset Averages)
        key = (region, month)
        if key in self.climatology:
            est = self.climatology[key]
            return round(est['temperature_c'], 2), round(est['rainfall_mm'], 2)
        
        # 3. Absolute Fallback
        return 20.0, 50.0