import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { Row } from '../components/Row';
import { ShameEntry } from '../data/models';
import './ShameWall.css';

export const ShameWall: React.FC = () => {
  const { shameWall, addShameEntry, updateShameEntry, deleteShameEntry, people, getPerson } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ShameEntry | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const carouselRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    dateISO: '',
    personId: '',
    time: '',
    note: '',
  });

  const openModal = (entry?: ShameEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        dateISO: entry.dateISO,
        personId: entry.personId,
        time: entry.time,
        note: entry.note || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        dateISO: new Date().toISOString().split('T')[0],
        personId: people[0]?.id || '',
        time: '',
        note: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData = {
      ...formData,
      note: formData.note || undefined,
    };

    if (editingEntry) {
      updateShameEntry(editingEntry.id, entryData);
    } else {
      addShameEntry(entryData);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteShameEntry(id);
    }
  };

  const filteredEntries = selectedPerson === 'all' 
    ? shameWall 
    : shameWall.filter(e => e.personId === selectedPerson);

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const dateCompare = b.dateISO.localeCompare(a.dateISO);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="shame-wall-page">
      <div className="page-header">
        <h1>😴 Mural da Vergonha</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          + Novo Registro
        </button>
      </div>

      <div className="filters">
        <label>
          Filtrar por pessoa:
          <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
            <option value="all">Todos</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </label>
      </div>

      <Row title={`${sortedEntries.length} Registros`}>
        {sortedEntries.map(entry => (
          <Card key={entry.id}>
            <h3>😴 {getPerson(entry.personId)?.name}</h3>
            <p>📅 {new Date(entry.dateISO).toLocaleDateString('pt-BR')}</p>
            <p>🕐 {entry.time}</p>
            {entry.note && <p className="shame-note">{entry.note}</p>}
            
            <div className="card-actions">
              <button className="btn-secondary" onClick={() => openModal(entry)}>Editar</button>
              <button className="btn-danger" onClick={() => handleDelete(entry.id)}>Excluir</button>
            </div>
          </Card>
        ))}
      </Row>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? 'Editar Registro' : 'Novo Registro'}>
        <form onSubmit={handleSubmit} className="shame-form">
          <div className="form-group">
            <label>Pessoa</label>
            <select 
              value={formData.personId} 
              onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
              required
            >
              {people.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Data</label>
            <input 
              type="date" 
              value={formData.dateISO} 
              onChange={(e) => setFormData({ ...formData, dateISO: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label>Horário</label>
            <input 
              type="time" 
              value={formData.time} 
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label>Observação</label>
            <textarea 
              value={formData.note} 
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              placeholder="Ex: Dormiu antes do filme começar!"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingEntry ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="sleep-carousel-section">
        <div className="sleep-header">
          <div className="sleep-icon">🌙</div>
          <h2>Momentos de Sono</h2>
          <div className="sleep-decoration">✨ Zzz... ✨</div>
        </div>
        
        <div className="carousel-container">
          <button className="carousel-btn carousel-btn-left" onClick={() => scrollCarousel('left')} aria-label="Anterior">
            ‹
          </button>
          
          <div className="carousel-track" ref={carouselRef}>
            <div className="carousel-item">
              <div className="sleep-card">
                <div className="sleep-card-icon">💤</div>
                <p>Fotos em breve...</p>
              </div>
            </div>
            <div className="carousel-item">
              <div className="sleep-card">
                <div className="sleep-card-icon">😴</div>
                <p>Momentos inesquecíveis</p>
              </div>
            </div>
            <div className="carousel-item">
              <div className="sleep-card">
                <div className="sleep-card-icon">🛌</div>
                <p>Capturados aqui</p>
              </div>
            </div>
            <div className="carousel-item">
              <div className="sleep-card">
                <div className="sleep-card-icon">🌟</div>
                <p>Galeria de sonecas</p>
              </div>
            </div>
            <div className="carousel-item">
              <div className="sleep-card">
                <div className="sleep-card-icon">💫</div>
                <p>Em construção</p>
              </div>
            </div>
          </div>
          
          <button className="carousel-btn carousel-btn-right" onClick={() => scrollCarousel('right')} aria-label="Próximo">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
