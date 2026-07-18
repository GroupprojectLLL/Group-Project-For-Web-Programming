import { useEffect, useState } from 'react';
import Icon from '../components/Icon';

export const DEFAULT_SETTINGS = {
  language: 'English',
  region: 'Singapore',
  currency: 'SGD',
  orderUpdates: true,
  wishlistAlerts: true,
  recommendations: false,
  librarySort: 'Newest',
  reduceMotion: false,
};

function ToggleSetting({ checked, description, label, onChange }) {
  return (
    <label className="settings-option">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="settings-switch">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="settings-switch-track" aria-hidden="true"><span /></span>
      </span>
    </label>
  );
}

export default function SettingsPage({ settings, onSave }) {
  const [draft, setDraft] = useState(settings);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function updateSetting(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus('');
  }

  function saveSettings(event) {
    event.preventDefault();
    onSave(draft, 'Settings saved');
    setStatus('Your preferences have been saved on this device.');
  }

  function resetSettings() {
    setDraft(DEFAULT_SETTINGS);
    onSave(DEFAULT_SETTINGS, 'Settings reset to defaults');
    setStatus('Default preferences have been restored.');
  }

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading">
        <div>
          <span className="workspace-eyebrow">Account preferences</span>
          <h1>Settings</h1>
          <p>Choose how the store communicates with you and organises your digital library.</p>
        </div>
        <div className="settings-heading-state">
          <Icon name="sliders" size={19} />
          <span>Saved locally</span>
        </div>
      </section>

      <form className="settings-form" onSubmit={saveSettings}>
        <div className="settings-grid">
          <section className="settings-section settings-section-store" aria-labelledby="store-settings-title">
            <header className="settings-section-heading">
              <span className="settings-section-icon"><Icon name="sliders" size={18} /></span>
              <div>
                <h2 id="store-settings-title">Store preferences</h2>
                <p>Set the language, location, and currency used for your account.</p>
              </div>
            </header>
            <div className="settings-select-grid">
              <label className="workspace-field">
                <span>Language</span>
                <select value={draft.language} onChange={(event) => updateSetting('language', event.target.value)}>
                  <option>English</option>
                  <option>Chinese</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Region</span>
                <select value={draft.region} onChange={(event) => updateSetting('region', event.target.value)}>
                  <option>Singapore</option>
                  <option>Australia</option>
                  <option>United Kingdom</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Currency</span>
                <select value={draft.currency} onChange={(event) => updateSetting('currency', event.target.value)}>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </label>
            </div>
          </section>

          <section className="settings-section" aria-labelledby="notification-settings-title">
            <header className="settings-section-heading">
              <span className="settings-section-icon"><Icon name="mail" size={18} /></span>
              <div>
                <h2 id="notification-settings-title">Notifications</h2>
                <p>Control the account messages you would like to receive.</p>
              </div>
            </header>
            <div className="settings-option-list">
              <ToggleSetting
                checked={draft.orderUpdates}
                label="Order and refund updates"
                description="Receive purchase receipts and refund status changes."
                onChange={(value) => updateSetting('orderUpdates', value)}
              />
              <ToggleSetting
                checked={draft.wishlistAlerts}
                label="Wishlist price alerts"
                description="Hear when a saved product has a new offer."
                onChange={(value) => updateSetting('wishlistAlerts', value)}
              />
              <ToggleSetting
                checked={draft.recommendations}
                label="Recommendations"
                description="Receive occasional suggestions based on your library."
                onChange={(value) => updateSetting('recommendations', value)}
              />
            </div>
          </section>

          <section className="settings-section" aria-labelledby="experience-settings-title">
            <header className="settings-section-heading">
              <span className="settings-section-icon"><Icon name="play" size={18} /></span>
              <div>
                <h2 id="experience-settings-title">Library experience</h2>
                <p>Adjust how purchased products and interface motion are displayed.</p>
              </div>
            </header>
            <div className="settings-experience-controls">
              <label className="workspace-field">
                <span>Default library sort</span>
                <select aria-label="Default library sort" value={draft.librarySort} onChange={(event) => updateSetting('librarySort', event.target.value)}>
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
              </label>
              <ToggleSetting
                checked={draft.reduceMotion}
                label="Reduce interface motion"
                description="Minimise animated transitions throughout the store."
                onChange={(value) => updateSetting('reduceMotion', value)}
              />
            </div>
          </section>
        </div>

        <div className="settings-actions">
          <div className="settings-save-status" role="status" aria-live="polite">
            {status && <><Icon name="check" size={16} /><span>{status}</span></>}
          </div>
          <button className="settings-reset-button" type="button" onClick={resetSettings}>Reset defaults</button>
          <button className="primary-button settings-save-button" type="submit"><Icon name="check" size={17} />Save changes</button>
        </div>
      </form>
    </main>
  );
}
