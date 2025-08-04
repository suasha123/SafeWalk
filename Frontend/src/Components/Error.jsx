import '../Style/Error.css'

export const ErrorPage = () => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-message">Page Not Found</h2>
        <p className="error-description">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="back-home-btn">
           Back to Home
        </a>
      </div>
    </div>
  );
};

