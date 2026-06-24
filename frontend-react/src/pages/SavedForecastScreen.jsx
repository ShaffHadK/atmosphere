import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBackIos, MdFileDownload } from 'react-icons/md';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import GlassContainer from '../components/GlassContainer';

const SavedForecastScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  if (!state || !state.record) {
    return <div style={{ color: 'white', padding: '20px' }}>No record data provided.</div>;
  }

  const record = state.record;
  
  // Format data for Recharts
  const chartData = record.dates.map((dateStr, i) => ({
    date: format(parseISO(dateStr), 'MMM d'),
    maxTemp: record.temperatures_max[i],
    minTemp: record.temperatures_min[i],
    precipitation: record.precipitation_sum[i],
  }));

  const handleIndividualExport = () => {
    // Generate CSV string for this single record
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Max Temp (C),Min Temp (C),Precipitation (mm),Weather Code\n";
    record.dates.forEach((dateStr, i) => {
      csvContent += `${dateStr},${record.temperatures_max[i]},${record.temperatures_min[i]},${record.precipitation_sum[i]},${record.weather_codes[i]}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${record.city_name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#0F172A', zIndex: -1
      }} />

      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <MdArrowBackIos size={28} color="white" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '24px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {record.city_name}
          </div>
          <MdFileDownload size={28} color="#69f0ae" style={{ cursor: 'pointer' }} onClick={handleIndividualExport} title="Export CSV" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>
            Date: {record.start_date} to {record.end_date}
          </h2>
          {record.user_notes && (
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>"{record.user_notes}"</p>
          )}
        </div>

        {/* Chart */}
        <GlassContainer padding="30px 20px" style={{ width: '100%', height: '400px' }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Temperature Trend (&deg;C)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5252" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff5252" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#ff5252" fillOpacity={1} fill="url(#colorMax)" />
              <Area type="monotone" dataKey="minTemp" name="Min Temp" stroke="#40c4ff" fillOpacity={1} fill="url(#colorMin)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassContainer>

      </div>
    </div>
  );
};

export default SavedForecastScreen;
