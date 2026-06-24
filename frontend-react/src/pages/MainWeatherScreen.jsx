import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBackIos, MdCalendarMonth, MdAir, MdWaterDrop, MdSpeed, MdPlayArrow, MdNavigation } from 'react-icons/md';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import GlassContainer from '../components/GlassContainer';
import { getLiveWeather, createRecord, deleteRecord } from '../api/weatherApi';
import { useNotification } from '../components/Notification';
import { getWeatherImage, getWeatherIcon, getWeatherDescription } from '../utils/weatherUtils';
import { format, parseISO } from 'date-fns';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MainWeatherScreen = () => {
  const { city } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLiveWeather(city);
        setData(res);
      } catch (err) {
        showNotification("Location not found or Server connection failed.", false);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [city]);

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' }}>Loading...</div>;
  }

  if (!data) return null;

  const current = data.current;
  const forecast = data.forecast_5_day;
  const hourly = data.hourly_forecast;
  const bgImage = getWeatherImage(current.weather_code);
  const CurrentIcon = getWeatherIcon(current.weather_code);

  const previewChartData = previewData ? previewData.dates.map((dateStr, i) => ({
    date: format(parseISO(dateStr), 'MMM d'),
    maxTemp: previewData.temperatures_max[i],
    minTemp: previewData.temperatures_min[i],
    precipitation: previewData.precipitation_sum[i],
  })) : [];

  const handlePreviewDates = async (e) => {
    e.preventDefault();
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 14) {
      showNotification("Please select a range of 14 days or less.", false);
      return;
    }
    if (start > end) {
      showNotification("Start date cannot be after end date.", false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startNormalized = new Date(start);
    startNormalized.setHours(0, 0, 0, 0);
    const endNormalized = new Date(end);
    endNormalized.setHours(0, 0, 0, 0);

    if (startNormalized < today && endNormalized > today) {
      showNotification("Cannot select a range spanning both past and future dates.", false);
      return;
    }

    setIsPreviewLoading(true);
    try {
      const pData = await createRecord({
        city: data.city_name,
        start_date: dateRange.start,
        end_date: dateRange.end,
        notes: "Saved from Live View"
      });
      setPreviewData(pData);
      setShowDatePicker(false);
    } catch (err) {
      showNotification(err.response?.data?.detail || "Failed to fetch preview.", false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleConfirmSave = () => {
    const record = previewData;
    showNotification("Record saved successfully!");
    setPreviewData(null);
    navigate(`/saved/${record.id}`, { state: { record }});
  };

  const handleCancel = async () => {
    if (previewData) {
      try {
        await deleteRecord(previewData.id);
      } catch (err) {
        console.error("Failed to delete draft record", err);
      }
    }
    setPreviewData(null);
  };

  const openYouTube = () => {
    const q = data.city_name.replace(/ /g, '+');
    window.open(`https://www.youtube.com/results?search_query=${q}+city+tour+weather`, '_blank');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.4)', zIndex: -1
      }} />

      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <MdArrowBackIos size={28} color="white" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {data.city_name}
          </div>
          <MdCalendarMonth size={28} color="white" style={{ cursor: 'pointer' }} onClick={() => setShowDatePicker(true)} />
        </div>

        {/* Current Weather */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <CurrentIcon size={100} color="white" />
          <div style={{ fontSize: '100px', fontWeight: 200, lineHeight: 1 }}>{current.temperature}&deg;C</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '10px' }}>
            {getWeatherDescription(current.weather_code)}
          </div>
        </div>

        {/* Stats Row */}
        <GlassContainer style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MdAir size={28} color="white" />
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '5px' }}>AQI</div>
            <div style={{ fontWeight: 'bold' }}>{current.aqi || '--'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MdWaterDrop size={28} color="white" />
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '5px' }}>PRECIP</div>
            <div style={{ fontWeight: 'bold' }}>{current.precipitation} mm</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MdSpeed size={28} color="white" />
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '5px' }}>GUSTS</div>
            <div style={{ fontWeight: 'bold' }}>{current.wind_gusts} km/h</div>
          </div>
        </GlassContainer>

        {/* 5-Day Forecast */}
        <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px' }}>5-DAY FORECAST</div>
        <div className="custom-scrollbar" style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px', marginBottom: '25px' }}>
          {forecast.dates.map((dateStr, i) => {
            const IconComp = getWeatherIcon(forecast.weather_code[i]);
            return (
              <GlassContainer key={dateStr} padding="20px 10px" style={{ minWidth: '120px', marginRight: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{format(parseISO(dateStr), 'EEE, d')}</div>
                <IconComp size={36} color="white" style={{ margin: '15px 0' }} />
                <div style={{ fontSize: '14px' }}>{forecast.max_temp[i]}&deg; / {forecast.min_temp[i]}&deg;</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <MdWaterDrop size={14} color="#40c4ff" />
                  <span style={{ color: '#40c4ff', fontSize: '14px', fontWeight: 600, marginLeft: '4px' }}>{forecast.precipitation_prob[i]}%</span>
                </div>
              </GlassContainer>
            );
          })}
        </div>

        {/* 24-Hour Forecast */}
        <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px' }}>24-HOUR FORECAST</div>
        <div className="custom-scrollbar" style={{ display: 'flex', overflowX: 'auto', paddingBottom: '15px', marginBottom: '25px' }}>
          {hourly.times.map((timeStr, i) => {
            const IconComp = getWeatherIcon(hourly.weather_code[i]);
            return (
              <GlassContainer key={timeStr} padding="15px 10px" style={{ minWidth: '90px', marginRight: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{format(parseISO(timeStr), 'h a')}</div>
                <IconComp size={28} color="white" style={{ margin: '10px 0' }} />
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{hourly.temperatures[i]}&deg;</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <MdWaterDrop size={12} color="#40c4ff" />
                  <span style={{ color: '#40c4ff', fontSize: '12px', fontWeight: 600, marginLeft: '4px' }}>{hourly.precipitation_prob[i]}%</span>
                </div>
              </GlassContainer>
            );
          })}
        </div>

        {/* Area Overview */}
        <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px' }}>AREA OVERVIEW</div>
        <div style={{ display: 'flex', height: '180px', marginBottom: '40px' }}>
          <GlassContainer style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '10px' }}>Wind</div>
            <MdNavigation size={40} color="white" style={{ transform: `rotate(${current.wind_direction}deg)`, marginBottom: '10px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{current.wind_direction}&deg;</div>
          </GlassContainer>
          <div style={{ flex: 2, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 15px 30px -5px rgba(0,0,0,0.2)' }}>
            <MapContainer center={[data.latitude, data.longitude]} zoom={11} style={{ height: '100%', width: '100%', background: 'transparent' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[data.latitude, data.longitude]} />
            </MapContainer>
          </div>
        </div>

        {/* Media */}
        <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '15px' }}>MEDIA</div>
        <GlassContainer padding="0" style={{ overflow: 'hidden', marginBottom: '40px', cursor: 'pointer' }} onClick={openYouTube}>
          <div style={{ position: 'relative', height: '160px', width: '100%' }}>
            <img src="/assets/yt_thumbnail.jpg" alt="YouTube Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', backgroundColor: 'rgba(255,82,82,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
              <MdPlayArrow size={40} color="white" />
            </div>
          </div>
        </GlassContainer>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <GlassContainer padding="25px" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Select Range</h2>
            <form onSubmit={handlePreviewDates}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Start Date</label>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.38)', color: 'white', padding: '8px 0', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>End Date</label>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.38)', color: 'white', padding: '8px 0', fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowDatePicker(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
                <button type="submit" disabled={isPreviewLoading} style={{ background: '#40c4ff', border: 'none', color: 'white', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>{isPreviewLoading ? 'Loading...' : 'Preview'}</button>
              </div>
            </form>
          </GlassContainer>
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <GlassContainer padding="25px" style={{ width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Preview Forecast</h2>
            <div style={{ color: 'white', marginBottom: '20px', fontSize: '14px', lineHeight: '1.6', textAlign: 'center' }}>
              <p><strong>{previewData.city_name}</strong> &middot; {previewData.start_date} to {previewData.end_date} ({previewData.dates.length} days)</p>
            </div>
            
            <div style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={previewChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMaxPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5252" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff5252" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMinPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40c4ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#40c4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)'}} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.7)'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Area type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#ff5252" fillOpacity={1} fill="url(#colorMaxPrev)" />
                  <Area type="monotone" dataKey="minTemp" name="Min Temp" stroke="#40c4ff" fillOpacity={1} fill="url(#colorMinPrev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button type="button" onClick={handleCancel} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', cursor: 'pointer', padding: '8px 24px' }}>Cancel</button>
              <button type="button" onClick={handleConfirmSave} style={{ background: '#40c4ff', border: 'none', color: 'white', borderRadius: '12px', padding: '8px 24px', cursor: 'pointer', fontWeight: 'bold' }}>Save Record</button>
            </div>
          </GlassContainer>
        </div>
      )}
    </div>
  );
};

export default MainWeatherScreen;
