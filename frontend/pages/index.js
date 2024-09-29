import { useState } from 'react';

export default function Home() {
  const [id, setId] = useState('');
  const [idResponse, setIdResponse] = useState(null);

  // 地域情報のリスト
  const regionOptions = [
    { id: '016010', name: '札幌' },
    { id: '040010', name: '仙台' },
    { id: '150010', name: '新潟' },
    { id: '170010', name: '金沢' },
    { id: '130010', name: '東京' },
    { id: '230010', name: '名古屋' },
    { id: '270000', name: '大阪' },
    { id: '340010', name: '広島' },
    { id: '390010', name: '高知' },
    { id: '400010', name: '福岡' },
    { id: '471010', name: '那覇' }
  ];

  // IDを指定してGETリクエストを送信
  const handleIdRequest = async (e) => {
    e.preventDefault();

    // 地域が選択されていない場合はリクエストを送らない
    if (!id) {
      setIdResponse(null);
      return;
    }

    try {
      const res = await fetch(`https://nextjs-flask-weather-backend.onrender.com/api/areainfo/${id}`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setIdResponse({
        today: data.weatherinfotoday,
        tomorrow: data.weatherinfotomorrow,
      });
    } catch (error) {
      console.error("エラーが発生しました:", error);
      setIdResponse(null);  // エラー時にidResponseをリセット
    }
  };

  return (
    <div>
      <h1>簡単！天気アプリ</h1>
      <h2>地域を選んでください</h2>
      <form onSubmit={handleIdRequest} style={{ display: 'flex', alignItems: 'center' }}>
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            width: '150px',
            height: '40px',
            fontSize: '18px',
            textAlign: 'center',
            padding: '5px',
            borderRadius: '10px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            appearance: 'none', // プルダウン矢印を非表示にする場合
            WebkitAppearance: 'none', // Safari用
            MozAppearance: 'none', // Firefox用
            cursor: 'pointer'
          }}
        >
          <option value="">-</option>  {/* 初期状態で地域を選択していない */}
          {regionOptions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        {/* 送信ボタンのスタイル */}
        <button
          type="submit"
          style={{
            marginLeft: '15px',  // 地域選択欄から右に15pxずらす
            backgroundColor: 'black',  // 背景色を黒にする
            color: 'white',  // テキストを白にする
            padding: '10px 20px',  // ボタンのパディングを設定
            borderRadius: '10px',  // 四隅に丸みをつける
            border: 'none',  // ボーダーをなくす
            cursor: 'pointer'  // カーソルをポインタに
          }}
        >
          送信
        </button>
      </form>

      {idResponse ? (
        <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
          {/* 今日の天気情報 */}
          <div style={{
            textAlign: 'center',
            borderRight: '1px solid #ccc',
            padding: '0 20px'
          }}>
            <h3>今日</h3>
            <p>{idResponse.today.date}</p>
            <img src={idResponse.today.image_url} alt="今日の天気画像" style={{ width: '100px', height: '100px' }} />
            <p>{idResponse.today.天気}</p>
            <p>最高: <span style={{ color: 'red' }}>{idResponse.today.最高気温}℃</span></p>
            <p>最低: <span style={{ color: 'blue' }}>{idResponse.today.最低気温 !== "N/A" ? `${idResponse.today.最低気温}℃` : "データなし"}</span></p>
            <p>降水確率: {idResponse.today.降水確率}%</p>
          </div>

          {/* 明日の天気情報 */}
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <h3>明日</h3>
            <p>{idResponse.tomorrow.date}</p>
            <img src={idResponse.tomorrow.image_url} alt="明日の天気画像" style={{ width: '100px', height: '100px' }} />
            <p>{idResponse.tomorrow.天気}</p>
            <p>最高: <span style={{ color: 'red' }}>{idResponse.tomorrow.最高気温}℃</span></p>
            <p>最低: <span style={{ color: 'blue' }}>{idResponse.tomorrow.最低気温 !== "N/A" ? `${idResponse.tomorrow.最低気温}℃` : "データなし"}</span></p>
            <p>降水確率: {idResponse.tomorrow.降水確率}%</p>
          </div>
        </div>
      ) : id ? (
        <p>天気データがありません。サーバーエラーが発生している可能性があります。</p>
      ) : (
        <p>地域を選択して天気情報を取得してください。</p>
      )}
    </div>
  );
}
