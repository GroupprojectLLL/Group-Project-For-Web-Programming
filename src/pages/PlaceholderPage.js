function PlaceholderPage({ title, description, actions = [], navigate }) {
  return (
    <main className="placeholder-page page-shell">
      <section className="blank-page-panel">
        <span className="eyebrow">In progress</span>
        <h1>{title}</h1>
        <p>{description || 'This page route is prepared for the next development iteration.'}</p>
        {actions.length > 0 && (
          <div className="placeholder-actions">
            {actions.map((action) => (
              <button className="text-button" onClick={() => navigate(action.page)} key={action.page}>
                {action.label}
              </button>
            ))}
          </div>
        )}
        <button className="primary-button" onClick={() => navigate('home')}>Back to home</button>
      </section>
    </main>
  );
}

export default PlaceholderPage;
