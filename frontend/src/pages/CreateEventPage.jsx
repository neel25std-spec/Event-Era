import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { createEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isConfigured } = useAuth();

  async function handleSubmit(formData) {
    setIsLoading(true);
    try {
      await createEvent(formData);
      toast.success('Event created successfully! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Failed to create event:', err);
      const msg =
        err.response?.data?.error || 'Failed to create event. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="create-page" id="create-event-page">
      <div className="create-page-header">
        <h1 className="create-page-title">Create an Event</h1>
        <p className="create-page-subtitle">
          Share a free event with your community. Fill in the details below and
          pin the location on the map.
        </p>
      </div>

      {isConfigured && !user && (
        <div className="create-page-auth-notice">
          <p>⚠️ You need to sign in to create events.</p>
        </div>
      )}

      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
