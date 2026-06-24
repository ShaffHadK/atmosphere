import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdDownload, MdFileDownload, MdEdit, MdDeleteOutline, MdInfoOutline, MdDateRange } from 'react-icons/md';
import GlassContainer from '../components/GlassContainer';
import { useNotification } from '../components/Notification';
import { getHistory, deleteRecord, getExportUrl, updateRecord } from '../api/weatherApi';

const LandingScreen = () => {
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      navigate(`/weather/${search.trim()}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecord(id);
      showNotification("Record deleted successfully!");
      fetchHistory();
    } catch (err) {
      showNotification("Failed to delete record.", false);
    }
  };

  const handleExportFull = () => {
    window.location.href = getExportUrl();
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const { id, city, start_date, end_date } = editItem;
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 14) {
      showNotification("Please select 14 days or less.", false);
      return;
    }
    if (start > end) {
      showNotification("Start date cannot be after end date.", false);
      return;
    }

    try {
      await updateRecord(id, {
        city,
        start_date,
        end_date,
        notes: "Updated via React Web"
      });
      showNotification("Record updated successfully!");
      setEditItem(null);
      fetchHistory();
    } catch (err) {
      showNotification("Failed to update record.", false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url(/assets/landing_scrn.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.4)',
        zIndex: -1
      }} />

      {/* Content */}
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '8px' }}>Atmosphere</h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px' }}>Your personal weather intelligence.</p>

        <GlassContainer padding="8px 20px" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <MdSearch size={28} color="white" style={{ marginRight: '10px' }} />
          <input 
            type="text"
            placeholder="City name or Postal Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              width: '100%'
            }}
          />
        </GlassContainer>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 600 }}>Recent Intel</h2>
          <MdDownload size={24} color="rgba(255,255,255,0.7)" style={{ cursor: 'pointer' }} onClick={handleExportFull} title="Export Full Database" />
        </div>

        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>
          ) : history.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>No recent searches. Enter a city to begin.</div>
          ) : (
            history.map(item => (
              <GlassContainer key={item.id} padding="10px 10px 10px 20px" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(`/saved/${item.id}`, { state: { record: item }})}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 600, textTransform: 'uppercase' }}>{item.city_name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: '4px' }}>
                    {item.start_date} to {item.end_date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Export Record" onClick={() => {/* Export Logic */}}>
                    <MdFileDownload size={22} color="#69f0ae" />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Edit" onClick={() => setEditItem({...item, city: item.city_name})}>
                    <MdEdit size={22} color="#40c4ff" />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete" onClick={() => handleDelete(item.id)}>
                    <MdDeleteOutline size={22} color="#ff5252" />
                  </button>
                </div>
              </GlassContainer>
            ))
          )}
        </div>

        <GlassContainer padding="16px">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <MdInfoOutline size={20} color="white" style={{ marginRight: '8px' }} />
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>About the Developer</span>
          </div>
          <div style={{ color: '#40c4ff', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Developed by Mohd Shaff Had Khan</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.4, marginBottom: '8px' }}>For PM Accelerator</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: 1.4 }}>Product Manager Accelerator is a premier program designed to help professionals transition into and excel in product management roles. We provide community, mentorship, and resources to build real-world AI products.</div>
        </GlassContainer>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <GlassContainer padding="25px" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Update Record</h2>
            <form onSubmit={handleEditSave}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>City Name</label>
                <input 
                  type="text" 
                  value={editItem.city}
                  onChange={e => setEditItem({...editItem, city: e.target.value})}
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.38)', color: 'white', padding: '8px 0', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Start Date</label>
                <input 
                  type="date" 
                  value={editItem.start_date}
                  onChange={e => setEditItem({...editItem, start_date: e.target.value})}
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.38)', color: 'white', padding: '8px 0', fontSize: '16px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>End Date</label>
                <input 
                  type="date" 
                  value={editItem.end_date}
                  onChange={e => setEditItem({...editItem, end_date: e.target.value})}
                  required
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.38)', color: 'white', padding: '8px 0', fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditItem(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
                <button type="submit" style={{ background: '#40c4ff', border: 'none', color: 'white', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </GlassContainer>
        </div>
      )}
    </div>
  );
};

export default LandingScreen;
