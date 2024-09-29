from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # 全てのオリジンからのリクエストを許可
# CORS(app, resources={r"/api/*": {"origins": "https://nextjs-flask-weather.onrender.com"}})  # CORS設定を更新


@app.route('/')
def home():
    return "Flask API is running!"


@app.route('/api/areainfo/<int:id>', methods=['GET'])
def areainfo(id):
    try:
        # 天気APIのURL
        weather_api_url = f"https://weather.tsukumijima.net/api/forecast/city/{id}"
        
        # APIリクエスト送信
        response = requests.get(weather_api_url)
        
        if response.status_code == 200:
            weather_data = response.json()

            # APIレスポンスをデバッグ出力
            print("APIから取得したデータ:", weather_data)

            # 'forecasts' キーが存在するか確認
            if 'forecasts' not in weather_data or len(weather_data['forecasts']) == 0:
                print(f"エラー: 'forecasts' キーが見つかりません")
                return jsonify({"error": "天気データが見つかりませんでした"}), 500

            # 当日と次の日の天気データ取得
            today_forecast = weather_data['forecasts'][0] if len(weather_data['forecasts']) > 0 else None
            tomorrow_forecast = weather_data['forecasts'][1] if len(weather_data['forecasts']) > 1 else None

            if today_forecast is None or tomorrow_forecast is None:
                print(f"エラー: 予報データが不足しています")
                return jsonify({"error": "天気データが見つかりませんでした"}), 500

            # 当日の天気情報取得
            today_telop = today_forecast['telop']
            today_temp_max = today_forecast['temperature']['max']['celsius'] if today_forecast['temperature']['max'] else "N/A"
            today_temp_min = today_forecast['temperature']['min']['celsius'] if today_forecast['temperature']['min'] and today_forecast['temperature']['min']['celsius'] is not None else "データなし"
            today_image = today_forecast['image']['url']
            today_rain_chance_avg = calculate_average_rain_chance(today_forecast['chanceOfRain'])

            # 次の日の天気情報取得
            tomorrow_telop = tomorrow_forecast['telop']
            tomorrow_temp_max = tomorrow_forecast['temperature']['max']['celsius'] if tomorrow_forecast['temperature']['max'] else "N/A"
            tomorrow_temp_min = tomorrow_forecast['temperature']['min']['celsius'] if tomorrow_forecast['temperature']['min'] else "N/A"
            tomorrow_image = tomorrow_forecast['image']['url']
            tomorrow_rain_chance_avg = calculate_average_rain_chance(tomorrow_forecast['chanceOfRain'])

            # 天気情報を辞書にまとめる
            weatherinfotoday = {
                "date": weather_data['forecasts'][0]['date'],
                "天気": today_telop,
                "最高気温": today_temp_max,
                "最低気温": today_temp_min,  # nullの場合 'データなし' を表示
                "降水確率": today_rain_chance_avg,
                "image_url": today_image
            }
            weatherinfotomorrow = {
                "date": weather_data['forecasts'][1]['date'],
                "天気": tomorrow_telop,
                "最高気温": tomorrow_temp_max,
                "最低気温": tomorrow_temp_min,
                "降水確率": tomorrow_rain_chance_avg,
                "image_url": tomorrow_image
            }
            
            return jsonify({
                "weatherinfotoday": weatherinfotoday,
                "weatherinfotomorrow": weatherinfotomorrow
            })
        else:
            print(f"APIリクエストに失敗しました。ステータスコード: {response.status_code}")
            return jsonify({"error": f"APIリクエストに失敗しました。ステータスコード: {response.status_code}"}), 500
    
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return jsonify({"error": f"サーバーエラーが発生しました: {str(e)}"}), 500



def calculate_average_rain_chance(chance_of_rain):
    # 各時間帯の降水確率を取得
    def parse_rain_chance(chance):
        # chanceがNone、空文字、"--"、または他の不正な値の場合は 0 にする
        try:
            return int(chance.replace('%', '')) if chance and chance not in ["", "--"] else 0
        except (ValueError, TypeError):
            return 0  # 予期しない値があった場合も 0 にする

    T00_06 = parse_rain_chance(chance_of_rain['T00_06'])
    T06_12 = parse_rain_chance(chance_of_rain['T06_12'])
    T12_18 = parse_rain_chance(chance_of_rain['T12_18'])
    T18_24 = parse_rain_chance(chance_of_rain['T18_24'])
    
    # 平均値を計算
    average_rain_chance = (T00_06 + T06_12 + T12_18 + T18_24) / 4
    return average_rain_chance



if __name__ == '__main__':
    app.run(debug=True)